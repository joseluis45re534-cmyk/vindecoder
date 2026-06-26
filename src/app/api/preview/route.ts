import { NextResponse } from 'next/server';
import { getEnv } from '@/lib/cf';
import {
  decodeVin,
  normalizeVin,
  isValidVin,
  goodcarBrandImageUrl,
  GoodCarNotFoundError,
  GoodCarAuthError,
  GoodCarRateLimitError,
  GoodCarTimeoutError,
} from '@/lib/goodcar';
import { getCachedDecode, setCachedDecode, allowRequest } from '@/lib/report-cache';
import { exactVinPhoto } from '@/lib/vehicle-api';

export const runtime = 'edge';

// ─────────────────────────────────────────────────────────────────────────────
// COST GUARD — this is the FREE, pre-payment preview. It must NEVER call the paid
// getFullReport(). That function is intentionally NOT imported here; the paid call
// lives only in /api/report behind the entitlement gate. Do not add it.
// ─────────────────────────────────────────────────────────────────────────────
export async function POST(request: Request) {
  const env = await getEnv();
  const body = (await request.json().catch(() => ({}))) as { vin?: string };
  const vin = normalizeVin(body.vin || '');

  if (!isValidVin(vin)) {
    return NextResponse.json({ error: 'Enter a valid 17-character VIN.' }, { status: 400 });
  }

  // Anti-scrape: rate-limit free decodes per IP.
  const ip =
    request.headers.get('cf-connecting-ip') ||
    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    'unknown';
  const perHour = Number(env.PREVIEW_RATE_LIMIT_PER_HOUR) || 20;
  if (!(await allowRequest(env, `preview:${ip}`, perHour))) {
    return NextResponse.json({ error: 'Too many lookups right now — please try again in a little while.' }, { status: 429 });
  }

  // Serve from cache to avoid re-billing repeat lookups.
  const cached = await getCachedDecode(env, vin);
  if (cached) {
    // Backfill the branded fallback for decodes cached before this field existed.
    if (!cached.brandImageUrl) cached.brandImageUrl = goodcarBrandImageUrl(cached.make);
    return NextResponse.json({ success: true, vin, specs: cached, cached: true });
  }

  if (!env.GOODCAR_API_KEY) {
    return NextResponse.json({ error: 'Vehicle lookup is temporarily unavailable.', configured: false }, { status: 503 });
  }

  try {
    // Decode + best-effort exact-VIN photo (key-free CDN) run in parallel, so the
    // photo never adds latency or fails the decode. undefined = no real photo of
    // this VIN exists (→ the page shows a neutral placeholder, never a stand-in).
    const [specs, photoUrl] = await Promise.all([
      decodeVin(vin), // CHEAP call (retries once on transient failure)
      exactVinPhoto(vin),
    ]);
    if (photoUrl) specs.photoUrl = photoUrl;
    // GoodCar make logo as the branded fallback image (the decoder doesn't return
    // it, but GoodCar serves it at a predictable per-make path).
    specs.brandImageUrl = goodcarBrandImageUrl(specs.make);
    await setCachedDecode(env, vin, specs);
    return NextResponse.json({ success: true, vin, specs });
  } catch (err) {
    if (err instanceof GoodCarNotFoundError) {
      return NextResponse.json({ error: "We couldn't find records for this VIN.", notFound: true }, { status: 404 });
    }
    if (err instanceof GoodCarAuthError) {
      console.error('[goodcar] auth/credit issue on preview:', err); // loud: likely key/credit problem
      return NextResponse.json({ error: 'Vehicle lookup is temporarily unavailable.' }, { status: 503 });
    }
    if (err instanceof GoodCarRateLimitError) {
      return NextResponse.json({ error: 'Busy right now — please try again shortly.' }, { status: 429 });
    }
    if (err instanceof GoodCarTimeoutError) {
      return NextResponse.json({ error: 'The lookup timed out — please retry.', retryable: true }, { status: 504 });
    }
    console.error('[preview] error:', err);
    return NextResponse.json({ error: 'Lookup failed — please retry.' }, { status: 500 });
  }
}
