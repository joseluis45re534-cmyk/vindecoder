import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { getAuthUser } from '@/lib/auth-middleware';

export const runtime = 'edge';

// Initialize Stripe lazily to avoid top-level env access issues in some edge cases
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
        const user = await getAuthUser(request);
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { vinRequestId, vin } = (await request.json()) as any;

        if (!vinRequestId || !vin) {
            return NextResponse.json({ error: 'Missing VIN request ID or VIN' }, { status: 400 });
        }

        const stripeKey = process.env.STRIPE_SECRET_KEY;
        if (!stripeKey) {
            return NextResponse.json({ error: 'Stripe configuration missing' }, { status: 500 });
        }

        const stripe = getStripe(stripeKey);

        // Use request.url to construct absolute success/cancel URLs
        const origin = new URL(request.url).origin;

        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            line_items: [
                {
                    price_data: {
                        currency: 'aud',
                        product_data: {
                            name: `VIN History Report: ${vin}`,
                            description: 'Full vehicle history report including stolen status, finance check, and registration details.',
                        },
                        unit_amount: 2900, // $29.00 AUD
                    },
                    quantity: 1,
                },
            ],
            mode: 'payment',
            success_url: `${origin}/report?session_id={CHECKOUT_SESSION_ID}&vin=${vin}`,
            cancel_url: `${origin}/vin-check?vin=${vin}`,
            client_reference_id: vinRequestId.toString(),
            metadata: {
                vinRequestId: vinRequestId.toString(),
                vin: vin,
                userId: user.userId.toString(),
            },
            customer_email: user.email,
        });

        return NextResponse.json({ url: session.url, sessionId: session.id });
    } catch (error: unknown) {
        console.error('Stripe Checkout Error:', error);
        const message = error instanceof Error ? error.message : 'Unknown error';
        return NextResponse.json(
            { error: message || 'Failed to create checkout session' },
            { status: 500 }
        );
    }
}
