import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { getEnv, siteUrl } from '@/lib/cf';
import { getPlan, isTrialPlan } from '@/lib/pricing';
import { getPricing, getPaymentConfig } from '@/lib/settings';
import { trialPhaseOnePriceData } from '@/lib/stripe-billing';
import { createClient } from '@/lib/supabase/server';

export const runtime = 'edge';

export async function POST(request: Request) {
    const env = await getEnv();
    const body = (await request.json().catch(() => ({}))) as { planId?: string; reportId?: string };

    // ── ACCOUNT-FIRST: require a signed-in user, and bill THEIR account email.
    // This ties every purchase to an account (retention) and is what makes
    // per-user report entitlement work. We use the session email, never a
    // client-supplied one. Guarded so a missing Supabase config fails clearly.
    let email: string | undefined;
    try {
        if (process.env.NEXT_PUBLIC_SUPABASE_URL) {
            const supabase = await createClient();
            email = (await supabase.auth.getUser()).data.user?.email ?? undefined;
        }
    } catch {
        /* treated as not-signed-in below */
    }
    if (!email) {
        return NextResponse.json({ error: 'Please create an account to continue.', requiresAuth: true }, { status: 401 });
    }

    const plans = await getPricing(env);
    const plan = getPlan(body.planId || 'single', plans);
    if (!plan) {
        return NextResponse.json({ error: 'Unknown plan' }, { status: 400 });
    }

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
    const success = body.reportId
        ? `${base}/report/${body.reportId}?paid=1&session_id={CHECKOUT_SESSION_ID}`
        : `${base}/?paid=1&session_id={CHECKOUT_SESSION_ID}`;

    const metadata = { planId: plan.id, reportId: body.reportId || '', email };

    try {
        // Trial subscription ($1 today → $29/mo): charge the $1/3-day price
        // on-session; the webhook then converts the subscription into a
        // two-phase schedule (see src/lib/stripe-billing.ts).
        if (isTrialPlan(plan)) {
            const session = await stripe.checkout.sessions.create({
                mode: 'subscription',
                line_items: [{ price_data: trialPhaseOnePriceData(), quantity: 1 }],
                customer_email: email,
                success_url: success,
                cancel_url: `${base}/?canceled=1`,
                metadata,
                // Mirror metadata onto the subscription so the webhook can unlock
                // the right report from subscription/invoice events too.
                subscription_data: { metadata },
            });
            return NextResponse.json({ url: session.url, id: session.id });
        }

        const session = await stripe.checkout.sessions.create({
            mode: plan.interval === 'month' ? 'subscription' : 'payment',
            line_items: [
                {
                    price_data: {
                        currency: plan.currency,
                        product_data: { name: `${plan.name} — CarVinLookup` },
                        unit_amount: plan.priceCents,
                        ...(plan.interval === 'month' ? { recurring: { interval: 'month' as const } } : {}),
                    },
                    quantity: 1,
                },
            ],
            customer_email: email,
            success_url: success,
            cancel_url: `${base}/?canceled=1`,
            metadata,
        });

        return NextResponse.json({ url: session.url, id: session.id });
    } catch (err) {
        console.error('Stripe checkout error:', err);
        return NextResponse.json({ error: 'Failed to create checkout session' }, { status: 500 });
    }
}
