import { NextResponse } from 'next/server';
import { getEnv } from '@/lib/cf';
import { getFullReport, normalizeVin, isValidVin, goodcarBrandImageUrl, GoodCarNotFoundError } from '@/lib/goodcar';
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

  // Idempotent: a paid user re-viewing hits cache and never re-bills GoodCar.
  const cached = await getCachedReport(env, vin);
  if (cached) {
    // Backfill the branded fallback for reports cached before this field existed.
    if (!cached.brandImageUrl) cached.brandImageUrl = goodcarBrandImageUrl(cached.specs?.make);
    return NextResponse.json({ success: true, vin, report: cached, cached: true });
  }

  if (!env.GOODCAR_API_KEY) {
    return NextResponse.json({ error: 'Report service is temporarily unavailable.', retryable: true }, { status: 503 });
  }

  try {
    // PAID GoodCar report + best-effort exact-VIN photo (key-free), in parallel.
    // GoodCar's mainCarImage is frequently empty, so fall back to the verified
    // exact-VIN CDN photo when present — never a same-model stand-in.
    const [report, photoUrl] = await Promise.all([
      getFullReport(vin), // PAID — runs exactly once per VIN per TTL
      exactVinPhoto(vin),
    ]);
    if (!report.photoUrl && photoUrl) {
      report.photoUrl = photoUrl;
      report.photos = [photoUrl];
    }
    await setCachedReport(env, vin, report);
    return NextResponse.json({ success: true, vin, report });
  } catch (err) {
    if (err instanceof GoodCarNotFoundError) {
      return NextResponse.json({ error: 'No records found for this VIN.', notFound: true }, { status: 404 });
    }
    // The user has paid — never charge-and-show-nothing. Keep the entitlement and
    // ask the client to retry; the next call will re-attempt the fetch (no double-bill,
    // since a success caches and short-circuits).
    console.error('[report] fetch failed after entitlement:', err);
    return NextResponse.json({ error: "We're preparing your report — please retry in a moment.", retryable: true }, { status: 503 });
  }
}
