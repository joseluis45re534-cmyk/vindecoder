import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { getEnv } from '@/lib/cf';
import { getPaymentConfig } from '@/lib/settings';
import { convertToTrialSchedule } from '@/lib/stripe-billing';
import { markVinUnlocked } from '@/lib/report-cache';

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
            console.log('✓ Checkout completed:', session.id, session.metadata);

            // Entitlement: unlock the paid VIN so /api/report serves it (and so
            // re-views skip Stripe verification). reportId carries the VIN.
            const reportVin = String(session.metadata?.reportId || '').toUpperCase();
            if (reportVin) {
                try {
                    await markVinUnlocked(env, reportVin, session.id);
                    console.log('✓ Report unlocked:', reportVin);
                } catch (err) {
                    console.error('Failed to unlock report (will rely on session_id fallback):', err);
                }
            }

            // Trial subscription: convert the just-paid $1/3-day subscription into a
            // two-phase schedule so it flips to $29/month after the window instead of
            // re-billing $1. Idempotent, so retries are safe.
            if (session.mode === 'subscription' && session.subscription) {
                const subId =
                    typeof session.subscription === 'string' ? session.subscription : session.subscription.id;
                try {
                    await convertToTrialSchedule(stripe, subId);
                    console.log('✓ Trial schedule attached:', subId);
                } catch (err) {
                    // Return 500 so Stripe retries — leaving it un-converted would
                    // re-bill $1 every 3 days instead of $29/month.
                    console.error('Trial schedule conversion failed (will retry):', err);
                    return NextResponse.json({ error: 'schedule_conversion_failed' }, { status: 500 });
                }
            }
            break;
        }
        case 'invoice.payment_failed': {
            const invoice = event.data.object as Stripe.Invoice;
            // Stripe Smart Retries / dunning re-attempt automatically.
            // TODO(persist): flag the order past_due and gate report access in D1.
            console.warn('⚠ Payment failed:', invoice.id, invoice.customer);
            break;
        }
        case 'customer.subscription.deleted': {
            const sub = event.data.object as Stripe.Subscription;
            // TODO(persist): revoke report access for this subscription in D1.
            console.log('✗ Subscription canceled:', sub.id, sub.metadata);
            break;
        }
        case 'charge.refunded':
            // TODO(persist): revoke access for the refunded order in D1.
            console.log('↩ Refund:', (event.data.object as Stripe.Charge).id);
            break;
        default:
            break;
    }

    return NextResponse.json({ received: true });
}
