import { NextResponse } from 'next/server';
import { getEnv } from '@/lib/cf';
import {
  getFullReport,
  normalizeVin,
  isValidVin,
  VinCheckNotFoundError,
  VinCheckInsufficientBalanceError,
  VinCheckInProgressError,
  VinCheckProviderError,
  VinCheckRateLimitError,
  VinCheckTimeoutError,
} from '@/lib/vincheck';
import { goodcarBrandImageUrl } from '@/lib/goodcar'; // provider-agnostic make-logo fallback
import { getCachedReport, setCachedReport } from '@/lib/report-cache';
import { exactVinPhoto } from '@/lib/vehicle-api';
import { verifyReportEntitlement } from '@/lib/report-entitlement';

export const runtime = 'edge';

export async function POST(request: Request) {
  const env = await getEnv();
  const body = (await request.json().catch(() => ({}))) as { vin?: string; sessionId?: string };
  const vin = normalizeVin(body.vin || '');
  if (!isValidVin(vin)) return NextResponse.json({ error: 'Invalid VIN.' }, { status: 400 });

  // ── ENTITLEMENT GATE (shared with /api/report/pdf) ──
  if (!(await verifyReportEntitlement(env, vin, body.sessionId))) {
    return NextResponse.json({ error: 'Payment required to view this report.' }, { status: 402 });
  }

  // Idempotent: a paid user re-viewing hits our cache and never re-queries VinCheck.
  const cached = await getCachedReport(env, vin);
  if (cached) {
    if (!cached.brandImageUrl) cached.brandImageUrl = goodcarBrandImageUrl(cached.specs?.make);
    return NextResponse.json({ success: true, vin, report: cached, cached: true });
  }

  if (!env.VINCHECK_API_KEY) {
    return NextResponse.json({ error: 'Report service is temporarily unavailable.', retryable: true }, { status: 503 });
  }

  try {
    // PAID VinCheck report + best-effort exact-VIN photo (key-free), in parallel.
    // Idempotency-Key defaults to `report:{vin}` inside getFullReport, so retries
    // never double-charge and VinCheck's own 30-day VIN cache is honored.
    const [report, photoUrl] = await Promise.all([
      getFullReport(vin), // PAID — charged on success only; safe to retry (idempotent)
      exactVinPhoto(vin),
    ]);
    if (!report.photoUrl && photoUrl) {
      report.photoUrl = photoUrl;
      report.photos = [photoUrl];
    }
    report.brandImageUrl = goodcarBrandImageUrl(report.specs?.make);
    await setCachedReport(env, vin, report);
    return NextResponse.json({ success: true, vin, report });
  } catch (err) {
    if (err instanceof VinCheckNotFoundError) {
      return NextResponse.json({ error: 'No records found for this VIN.', notFound: true }, { status: 404 });
    }
    // ── CRITICAL: our prepaid VinCheck balance is exhausted, but the CUSTOMER has
    // already paid us. Never revoke entitlement and never show "no report". The
    // report was NOT charged (402 = not generated), so a retry after top-up bills
    // exactly once. Alert the operator loudly to top up.
    if (err instanceof VinCheckInsufficientBalanceError) {
      console.error('[vincheck] ⚠ INSUFFICIENT BALANCE — customer paid but report cannot be generated. Top up at vincheck.it.com admin. VIN:', vin, err);
      return NextResponse.json(
        { error: "Your report is being finalized — please retry in a few minutes.", retryable: true },
        { status: 503 },
      );
    }
    // 409 still-processing, 502 provider/generation, 429 rate-limit, timeout —
    // none are charged; keep entitlement and ask the client to retry.
    if (
      err instanceof VinCheckInProgressError ||
      err instanceof VinCheckProviderError ||
      err instanceof VinCheckRateLimitError ||
      err instanceof VinCheckTimeoutError
    ) {
      console.warn('[report] transient VinCheck error after entitlement — client will retry:', (err as Error).name);
      return NextResponse.json({ error: "We're preparing your report — please retry in a moment.", retryable: true }, { status: 503 });
    }
    // The user has paid — never charge-and-show-nothing. Keep entitlement; retry.
    console.error('[report] fetch failed after entitlement:', err);
    return NextResponse.json({ error: "We're preparing your report — please retry in a moment.", retryable: true }, { status: 503 });
  }
}
