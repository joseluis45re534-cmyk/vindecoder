import { NextResponse } from 'next/server';
import { getEnv } from '@/lib/cf';
import { normalizeVin, isValidVin, getFullReport, goodcarBrandImageUrl, GoodCarNotFoundError } from '@/lib/goodcar';
import { getCachedReport, setCachedReport } from '@/lib/report-cache';
import { exactVinPhoto } from '@/lib/vehicle-api';
import { verifyReportEntitlement } from '@/lib/report-entitlement';

export const runtime = 'edge';

// Branded PDF of the paid full report. Same entitlement gate as /api/report —
// serving the PDF to an unentitled caller would be a paywall bypass.
export async function GET(request: Request) {
  const env = await getEnv();
  const url = new URL(request.url);
  const vin = normalizeVin(url.searchParams.get('vin') || '');
  const sessionId = url.searchParams.get('session_id') || undefined;
  if (!isValidVin(vin)) return NextResponse.json({ error: 'Invalid VIN.' }, { status: 400 });

  // ── ENTITLEMENT GATE (shared with /api/report) ──
  if (!(await verifyReportEntitlement(env, vin, sessionId))) {
    return NextResponse.json({ error: 'Payment required to download this report.' }, { status: 402 });
  }

  // Prefer the cached report (populated when the user viewed it). Fetch + cache
  // only if missing (e.g. cache expired) — same paid path as /api/report.
  let report = await getCachedReport(env, vin);
  if (!report) {
    if (!env.GOODCAR_API_KEY) {
      return NextResponse.json({ error: 'Report service is temporarily unavailable.' }, { status: 503 });
    }
    try {
      const [full, photoUrl] = await Promise.all([getFullReport(vin), exactVinPhoto(vin)]);
      if (!full.photoUrl && photoUrl) {
        full.photoUrl = photoUrl;
        full.photos = [photoUrl];
      }
      await setCachedReport(env, vin, full);
      report = full;
    } catch (err) {
      if (err instanceof GoodCarNotFoundError) {
        return NextResponse.json({ error: 'No records found for this VIN.' }, { status: 404 });
      }
      console.error('[report/pdf] fetch failed:', err);
      return NextResponse.json({ error: 'Could not prepare the report — please retry.' }, { status: 503 });
    }
  }
  if (!report.brandImageUrl) report.brandImageUrl = goodcarBrandImageUrl(report.specs?.make);

  try {
    // Dynamic import so pdf-lib (heavy) loads only when a PDF is actually
    // requested — keeps it out of the shared edge bundle's hot path.
    const { buildReportPdf } = await import('@/lib/report-pdf');
    const bytes = await buildReportPdf(report, new Date().toISOString());
    // Uint8Array is a valid edge/Workers response body; cast past the strict
    // BodyInit generic.
    return new Response(bytes as unknown as BodyInit, {
      headers: {
        'content-type': 'application/pdf',
        'content-disposition': `attachment; filename="carvinlookup-${vin}.pdf"`,
        'cache-control': 'private, no-store',
      },
    });
  } catch (err) {
    console.error('[report/pdf] build failed:', err);
    return NextResponse.json({ error: 'Could not generate the PDF.' }, { status: 500 });
  }
}
