// Shared PER-USER entitlement gate for the paid full report — used by BOTH
// /api/report (JSON) and /api/report/pdf so the access check can never drift.
//
// A report is viewable only by the account that bought it. Two accepted proofs:
//   1. The logged-in Supabase user has a paid order for this VIN (D1 orders,
//      matched by the account email — the normal re-view / dashboard path).
//   2. A valid, paid Stripe Checkout session_id whose metadata.reportId matches
//      the VIN (the immediate post-payment redirect, before/if the webhook has
//      recorded the order). This path also records the order so the buyer owns
//      it for future re-views even if the webhook lags.
//
// There is deliberately NO anonymous/global unlock: knowing a VIN is not enough.

import Stripe from 'stripe';
import type { getEnv } from '@/lib/cf';
import { getPaymentConfig } from '@/lib/settings';
import { createClient } from '@/lib/supabase/server';
import { emailOwnsReport, recordPaidOrder } from '@/lib/account';

async function currentUserEmail(): Promise<string | null> {
    // Guard so a missing/broken Supabase config can't throw the whole gate — it
    // just means no logged-in user, and access falls to the session path.
    try {
        if (!process.env.NEXT_PUBLIC_SUPABASE_URL) return null;
        const supabase = await createClient();
        const {
            data: { user },
        } = await supabase.auth.getUser();
        return user?.email ?? null;
    } catch {
        return null;
    }
}

export async function verifyReportEntitlement(
    env: Awaited<ReturnType<typeof getEnv>>,
    vin: string,
    sessionId?: string,
): Promise<boolean> {
    // 1. The account that bought it owns it.
    const email = await currentUserEmail();
    if (email && (await emailOwnsReport(env, email, vin))) return true;

    // 2. Fresh purchase — prove it with a paid Stripe session for this VIN.
    if (!sessionId) return false;
    const cfg = await getPaymentConfig(env);
    if (!cfg.stripeSecret) return false;
    try {
        const stripe = new Stripe(cfg.stripeSecret, { httpClient: Stripe.createFetchHttpClient() });
        const session = await stripe.checkout.sessions.retrieve(sessionId);
        const paid = session.status === 'complete' || session.payment_status === 'paid';
        const matchesVin = String(session.metadata?.reportId || '').toUpperCase() === vin;
        if (paid && matchesVin) {
            // Persist the order (idempotent on session id) so the buyer owns this
            // report going forward, independent of webhook timing.
            await recordPaidOrder(env, {
                email: session.customer_details?.email || session.customer_email || email || null,
                reportVin: vin,
                planId: String(session.metadata?.planId || 'trial'),
                provider: 'stripe',
                providerRef: session.id,
                amountCents: session.amount_total ?? 0,
            });
            return true;
        }
    } catch (err) {
        console.error('[report] entitlement verify failed:', err);
    }
    return false;
}
