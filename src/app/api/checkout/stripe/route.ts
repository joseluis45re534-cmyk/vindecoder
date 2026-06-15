import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { getEnv, siteUrl } from '@/lib/cf';
import { getPlan, isTrialPlan } from '@/lib/pricing';
import { getPricing, getPaymentConfig } from '@/lib/settings';
import { trialPhaseOnePriceData } from '@/lib/stripe-billing';

export const runtime = 'edge';

export async function POST(request: Request) {
    const env = await getEnv();
    const body = (await request.json().catch(() => ({}))) as { planId?: string; reportId?: string; email?: string };

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

    const metadata = { planId: plan.id, reportId: body.reportId || '' };

    try {
        // Trial subscription ($1 today → $29/mo): charge the $1/3-day price
        // on-session; the webhook then converts the subscription into a
        // two-phase schedule (see src/lib/stripe-billing.ts).
        if (isTrialPlan(plan)) {
            const session = await stripe.checkout.sessions.create({
                mode: 'subscription',
                line_items: [{ price_data: trialPhaseOnePriceData(), quantity: 1 }],
                customer_email: body.email,
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
            customer_email: body.email,
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
