import { NextResponse } from 'next/server';
import { getEnv, siteUrl } from '@/lib/cf';
import { getPaymentConfig } from '@/lib/settings';
import { captureOrder } from '@/lib/paypal';

export const runtime = 'edge';

// PayPal redirects the buyer back here with ?token=<orderId> after approval.
export async function GET(request: Request) {
    const env = await getEnv();
    const base = siteUrl(env);
    const url = new URL(request.url);
    const orderId = url.searchParams.get('token');
    const reportId = url.searchParams.get('reportId');

    if (!orderId) {
        return NextResponse.redirect(`${base}/?canceled=1`);
    }

    try {
        const cfg = await getPaymentConfig(env);
        const result = await captureOrder(
            { clientId: cfg.paypalClientId, secret: cfg.paypalSecret, env: cfg.paypalEnv },
            orderId
        );
        const paid = result.status === 'COMPLETED';
        // TODO(persist): record order + unlock report in D1 once keys are live.
        const dest = reportId
            ? `${base}/report/${reportId}?paid=${paid ? '1' : '0'}`
            : `${base}/?paid=${paid ? '1' : '0'}`;
        return NextResponse.redirect(dest);
    } catch (err) {
        console.error('PayPal capture error:', err);
        return NextResponse.redirect(`${base}/?paid=0&error=capture`);
    }
}
