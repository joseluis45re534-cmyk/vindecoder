import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { getEnv } from '@/lib/cf';
import { getPaymentConfig } from '@/lib/settings';

export const runtime = 'edge';

export async function POST(request: Request) {
    const env = await getEnv();
    const cfg = await getPaymentConfig(env);
    if (!cfg.stripeSecret || !cfg.stripeWebhookSecret) {
        return NextResponse.json({ error: 'Stripe webhook not configured' }, { status: 503 });
    }

    const stripe = new Stripe(cfg.stripeSecret, {
        httpClient: Stripe.createFetchHttpClient(),
    });

    const sig = request.headers.get('stripe-signature') || '';
    const payload = await request.text();

    let event: Stripe.Event;
    try {
        // Async variant uses Web Crypto (required on edge/workers).
        event = await stripe.webhooks.constructEventAsync(payload, sig, cfg.stripeWebhookSecret);
    } catch (err) {
        console.error('Stripe signature verification failed:', err);
        return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
    }

    switch (event.type) {
        case 'checkout.session.completed': {
            const session = event.data.object as Stripe.Checkout.Session;
            // TODO(persist): mark order paid + unlock report using session.metadata in D1.
            console.log('✓ Paid:', session.id, session.metadata);
            break;
        }
        case 'charge.refunded':
            console.log('↩ Refund:', (event.data.object as Stripe.Charge).id);
            break;
        default:
            break;
    }

    return NextResponse.json({ received: true });
}
