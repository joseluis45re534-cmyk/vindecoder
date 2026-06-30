import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { getEnv, siteUrl } from '@/lib/cf';
import { getPaymentConfig } from '@/lib/settings';
import { createClient } from '@/lib/supabase/server';

export const runtime = 'edge';

// Stripe Customer Portal — the "cancel anytime / manage subscription" path.
// The client only holds the Checkout `session_id`, so we resolve the customer
// from it, then mint a portal session. The portal itself (and cancellation)
// must be enabled once in the Stripe Dashboard → Settings → Billing.
export async function POST(request: Request) {
    const env = await getEnv();
    const body = (await request.json().catch(() => ({}))) as { sessionId?: string; reportId?: string };

    const cfg = await getPaymentConfig(env);
    if (!cfg.stripeSecret) {
        return NextResponse.json(
            { error: 'Stripe is not configured. Add a secret key in Admin → Settings.', configured: false },
            { status: 503 }
        );
    }

    const stripe = new Stripe(cfg.stripeSecret, {
        httpClient: Stripe.createFetchHttpClient(),
    });

    const base = siteUrl(env);
    const returnUrl = body.reportId ? `${base}/report/${body.reportId}` : `${base}/account`;

    try {
        // Resolve the Stripe customer: from the checkout session (fresh purchase
        // flow) or, when absent, from the logged-in user's stored customer id
        // (dashboard flow).
        let customer: string | undefined;
        if (body.sessionId) {
            const session = await stripe.checkout.sessions.retrieve(body.sessionId);
            customer = typeof session.customer === 'string' ? session.customer : session.customer?.id;
        }
        if (!customer) {
            // Dashboard flow: resolve the Stripe customer from the logged-in
            // Supabase user's email.
            const supabase = await createClient();
            const {
                data: { user },
            } = await supabase.auth.getUser();
            if (user?.email) {
                const customers = await stripe.customers.list({ email: user.email, limit: 1 });
                customer = customers.data[0]?.id;
            }
        }
        if (!customer) {
            return NextResponse.json({ error: 'No subscription found to manage.' }, { status: 400 });
        }

        const portal = await stripe.billingPortal.sessions.create({ customer, return_url: returnUrl });
        return NextResponse.json({ url: portal.url });
    } catch (err) {
        console.error('Stripe portal error:', err);
        return NextResponse.json({ error: 'Failed to open billing portal' }, { status: 500 });
    }
}
