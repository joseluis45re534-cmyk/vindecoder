import { NextResponse } from 'next/server';
import { getEnv } from '@/lib/cf';
import {
  decodeVin, // VinCheck FREE preview (records_found counts + vehicle + market value)
  normalizeVin,
  isValidVin,
  VinCheckNotFoundError,
  VinCheckAuthError,
  VinCheckInsufficientBalanceError,
  VinCheckRateLimitError,
  VinCheckTimeoutError,
} from '@/lib/vincheck';
import { goodcarBrandImageUrl } from '@/lib/goodcar'; // provider-agnostic make-logo fallback
import { getCachedDecode, setCachedDecode, allowRequest } from '@/lib/report-cache';
import { exactVinPhoto } from '@/lib/vehicle-api';
import { logLookup } from '@/lib/activity-log';

// Total records surfaced in a preview (drives the admin activity log's count).
function previewRecordTotal(rf?: { titleRecords: number; accidentOrDamage: number; odometerReadings: number; auctionRecords: number; recalls: number; photos: number }): number | null {
  return rf ? rf.titleRecords + rf.accidentOrDamage + rf.odometerReadings + rf.auctionRecords + rf.recalls + rf.photos : null;
}

export const runtime = 'edge';

// ─────────────────────────────────────────────────────────────────────────────
// COST GUARD — this is the FREE, pre-payment preview (VinCheck /vins/{vin}/preview,
// never charged). It must NEVER call the paid getFullReport(); that lives only in
// /api/report behind the entitlement gate. Do not import it here.
// ─────────────────────────────────────────────────────────────────────────────
export async function POST(request: Request) {
  const env = await getEnv();
  const body = (await request.json().catch(() => ({}))) as { vin?: string };
  const vin = normalizeVin(body.vin || '');

  if (!isValidVin(vin)) {
    return NextResponse.json({ error: 'Enter a valid 17-character VIN.' }, { status: 400 });
  }

  // Anti-scrape: rate-limit free previews per IP.
  const ip =
    request.headers.get('cf-connecting-ip') ||
    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    'unknown';
  const country = request.headers.get('cf-ipcountry') || null;
  const perHour = Number(env.PREVIEW_RATE_LIMIT_PER_HOUR) || 20;
  if (!(await allowRequest(env, `preview:${ip}`, perHour))) {
    return NextResponse.json({ error: 'Too many lookups right now — please try again in a little while.' }, { status: 429 });
  }

  // Serve from cache to avoid re-querying repeat lookups.
  const cached = await getCachedDecode(env, vin);
  if (cached) {
    if (!cached.brandImageUrl) cached.brandImageUrl = goodcarBrandImageUrl(cached.make);
    const c = cached as typeof cached & { recordsFound?: Parameters<typeof previewRecordTotal>[0]; testMode?: boolean };
    await logLookup(env, {
      vin, type: 'preview', status: 'cached', country, ip,
      make: cached.make, model: cached.model, year: cached.year,
      recordsFound: previewRecordTotal(c.recordsFound), testMode: c.testMode,
    });
    return NextResponse.json({ success: true, vin, specs: cached, cached: true });
  }

  if (!env.VINCHECK_API_KEY) {
    return NextResponse.json({ error: 'Vehicle lookup is temporarily unavailable.', configured: false }, { status: 503 });
  }

  try {
    // Preview + best-effort exact-VIN photo (key-free CDN) run in parallel, so the
    // photo never adds latency or fails the preview. undefined = no verified photo
    // of this exact VIN (→ the page shows a neutral placeholder, never a stand-in).
    const [preview, photoUrl] = await Promise.all([
      decodeVin(vin), // FREE — VinCheck preview (retries once on transient failure)
      exactVinPhoto(vin),
    ]);
    if (photoUrl && !preview.photoUrl) preview.photoUrl = photoUrl;
    preview.brandImageUrl = goodcarBrandImageUrl(preview.make);
    // preview is a superset of VehicleSpecs (adds recordsFound + marketValue),
    // both cached and returned so the paywall teaser can show the record counts.
    await setCachedDecode(env, vin, preview);
    await logLookup(env, {
      vin, type: 'preview', status: 'ok', country, ip, testMode: preview.testMode,
      make: preview.make, model: preview.model, year: preview.year,
      recordsFound: previewRecordTotal(preview.recordsFound),
    });
    return NextResponse.json({ success: true, vin, specs: preview });
  } catch (err) {
    if (err instanceof VinCheckNotFoundError) {
      await logLookup(env, { vin, type: 'preview', status: 'not_found', country, ip });
      return NextResponse.json({ error: "We couldn't find records for this VIN.", notFound: true }, { status: 404 });
    }
    if (err instanceof VinCheckAuthError) {
      console.error('[vincheck] auth issue on preview (check VINCHECK_API_KEY):', err);
      return NextResponse.json({ error: 'Vehicle lookup is temporarily unavailable.' }, { status: 503 });
    }
    if (err instanceof VinCheckInsufficientBalanceError) {
      // Preview is free, so this is unexpected — surface as temporary outage.
      console.error('[vincheck] insufficient balance on FREE preview (unexpected):', err);
      return NextResponse.json({ error: 'Vehicle lookup is temporarily unavailable.' }, { status: 503 });
    }
    if (err instanceof VinCheckRateLimitError) {
      return NextResponse.json({ error: 'Busy right now — please try again shortly.' }, { status: 429 });
    }
    if (err instanceof VinCheckTimeoutError) {
      return NextResponse.json({ error: 'The lookup timed out — please retry.', retryable: true }, { status: 504 });
    }
    console.error('[preview] error:', err);
    return NextResponse.json({ error: 'Lookup failed — please retry.' }, { status: 500 });
  }
}
