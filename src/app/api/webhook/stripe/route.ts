import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';

export const runtime = 'edge';

const getStripe = (key?: string) => {
    if (!key) throw new Error('Missing STRIPE_SECRET_KEY');
    return new Stripe(key, {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        apiVersion: '2025-01-27.acacia' as any,
        httpClient: Stripe.createFetchHttpClient(),
    });
};

export async function POST(request: NextRequest) {
    try {
        const signature = request.headers.get('stripe-signature');
        if (!signature) {
            return NextResponse.json({ error: 'Missing stripe-signature' }, { status: 400 });
        }

        const body = await request.text();
        const stripeKey = process.env.STRIPE_SECRET_KEY;
        const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

        if (!stripeKey || !webhookSecret) {
            console.error('Missing Stripe secrets');
            return NextResponse.json({ error: 'Configuration error' }, { status: 500 });
        }

        const stripe = getStripe(stripeKey);

        let event: Stripe.Event;

        try {
            // Verify signature using the raw body
            event = await stripe.webhooks.constructEventAsync(body, signature, webhookSecret);
        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : 'Unknown error';
            console.error('Webhook signature verification failed:', message);
            return NextResponse.json({ error: 'Webhook Error: ' + message }, { status: 400 });
        }

        // Handle the event
        if (event.type === 'checkout.session.completed') {
            const session = event.data.object as Stripe.Checkout.Session;
            const vinRequestId = session.client_reference_id;

            if (vinRequestId) {
                // Update database
                // @ts-expect-error - DB available in Cloudflare context
                const db = process.env.DB || request.env?.DB;

                if (db) {
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    await db.prepare('UPDATE vin_requests SET status = ? WHERE id = ?')
                        .bind('paid', vinRequestId)
                        .run();
                    console.log(`Updated VIN Request ${vinRequestId} to paid`);
                } else {
                    console.error('Database binding missing in webhook');
                    // We return 500 so Stripe retries
                    return NextResponse.json({ error: 'DB connection failed' }, { status: 500 });
                }
            }
        }

        return NextResponse.json({ received: true });
    } catch (error: unknown) {
        console.error('Webhook handler error:', error);
        return NextResponse.json(
            { error: 'Webhook handler failed' },
            { status: 500 }
        );
    }
}
