import { NextResponse } from 'next/server';
import { getEnv, siteUrl } from '@/lib/cf';
import { getPlan } from '@/lib/pricing';
import { getPricing, getPaymentConfig } from '@/lib/settings';
import { createOrder, paypalConfigured } from '@/lib/paypal';

export const runtime = 'edge';

export async function POST(request: Request) {
    const env = await getEnv();
    const body = (await request.json().catch(() => ({}))) as { planId?: string; reportId?: string };

    const plans = await getPricing(env);
    const plan = getPlan(body.planId || 'single', plans);
    if (!plan) return NextResponse.json({ error: 'Unknown plan' }, { status: 400 });

    const cfg = await getPaymentConfig(env);
    const creds = { clientId: cfg.paypalClientId, secret: cfg.paypalSecret, env: cfg.paypalEnv };
    if (!paypalConfigured(creds)) {
        return NextResponse.json(
            { error: 'PayPal is not configured. Add credentials in Admin → Settings.', configured: false },
            { status: 503 }
        );
    }

    const base = siteUrl(env);
    try {
        const order = await createOrder(creds, {
            amountCents: plan.priceCents,
            currency: plan.currency,
            description: `${plan.name} — CarVinLookup`,
            returnUrl: `${base}/api/checkout/paypal/capture?reportId=${body.reportId || ''}`,
            cancelUrl: `${base}/?canceled=1`,
        });
        return NextResponse.json({ url: order.approveUrl, id: order.id });
    } catch (err) {
        console.error('PayPal create order error:', err);
        return NextResponse.json({ error: 'Failed to create PayPal order' }, { status: 500 });
    }
}
