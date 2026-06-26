import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { getEnv } from '@/lib/cf';
import { getPaymentConfig } from '@/lib/settings';
import { getFullReport, normalizeVin, isValidVin, goodcarBrandImageUrl, GoodCarNotFoundError } from '@/lib/goodcar';
import { getCachedReport, setCachedReport, isVinUnlocked, markVinUnlocked } from '@/lib/report-cache';
import { exactVinPhoto } from '@/lib/vehicle-api';

export const runtime = 'edge';

// Confirm the caller is entitled to this VIN BEFORE any paid GoodCar call.
// Two accepted proofs: (1) the VIN is already unlocked in D1 (set by the Stripe
// webhook), or (2) a valid, paid Stripe Checkout session_id whose metadata.reportId
// matches the VIN (the fresh-payment redirect path). Verifying persists the unlock.
async function verifyEntitlement(env: Awaited<ReturnType<typeof getEnv>>, vin: string, sessionId?: string): Promise<boolean> {
  if (await isVinUnlocked(env, vin)) return true;
  if (!sessionId) return false;

  const cfg = await getPaymentConfig(env);
  if (!cfg.stripeSecret) return false;
  try {
    const stripe = new Stripe(cfg.stripeSecret, { httpClient: Stripe.createFetchHttpClient() });
    const session = await stripe.checkout.sessions.retrieve(sessionId);
    const paid = session.status === 'complete' || session.payment_status === 'paid';
    const matchesVin = String(session.metadata?.reportId || '').toUpperCase() === vin;
    if (paid && matchesVin) {
      await markVinUnlocked(env, vin, session.id); // persist so re-views skip Stripe + GoodCar
      return true;
    }
  } catch (err) {
    console.error('[report] entitlement verify failed:', err);
  }
  return false;
}

export async function POST(request: Request) {
  const env = await getEnv();
  const body = (await request.json().catch(() => ({}))) as { vin?: string; sessionId?: string };
  const vin = normalizeVin(body.vin || '');
  if (!isValidVin(vin)) return NextResponse.json({ error: 'Invalid VIN.' }, { status: 400 });

  // ── ENTITLEMENT GATE ──
  if (!(await verifyEntitlement(env, vin, body.sessionId))) {
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
