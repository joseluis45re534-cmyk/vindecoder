// Shared entitlement gate for the paid full report — used by BOTH /api/report
// (JSON) and /api/report/pdf so the access check can never drift between them.
//
// Two accepted proofs: (1) the VIN is already unlocked in D1 (set by the Stripe
// webhook / a prior verified view), or (2) a valid, paid Stripe Checkout
// session_id whose metadata.reportId matches the VIN. Verifying persists the
// unlock so re-views skip Stripe.

import Stripe from 'stripe';
import type { getEnv } from '@/lib/cf';
import { getPaymentConfig } from '@/lib/settings';
import { isVinUnlocked, markVinUnlocked } from '@/lib/report-cache';

export async function verifyReportEntitlement(
    env: Awaited<ReturnType<typeof getEnv>>,
    vin: string,
    sessionId?: string,
): Promise<boolean> {
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
