import { NextResponse } from 'next/server';
import { getEnv } from '@/lib/cf';
import { requireAdmin } from '@/lib/auth';
import { getPaymentStatus, setPaymentConfig } from '@/lib/settings';

export const runtime = 'edge';

export async function GET(request: Request) {
  const env = await getEnv();
  if (!(await requireAdmin(request, env))) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  return NextResponse.json(await getPaymentStatus(env));
}

export async function POST(request: Request) {
  const env = await getEnv();
  if (!(await requireAdmin(request, env))) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = (await request.json().catch(() => ({}))) as Record<string, string>;
  // Only known keys; empty strings are ignored (leave existing value).
  const incoming = {
    stripeSecret: body.stripeSecret,
    stripeWebhookSecret: body.stripeWebhookSecret,
    stripePublishable: body.stripePublishable,
    paypalClientId: body.paypalClientId,
    paypalSecret: body.paypalSecret,
    paypalEnv: body.paypalEnv === 'live' ? 'live' : body.paypalEnv === 'sandbox' ? 'sandbox' : undefined,
  } as const;

  const ok = await setPaymentConfig(env, incoming);
  if (!ok) {
    return NextResponse.json(
      { error: 'Could not persist — D1 database not bound. Keys save once D1 is connected (or use Cloudflare secrets).', persisted: false },
      { status: 503 }
    );
  }
  return NextResponse.json({ ok: true, status: await getPaymentStatus(env) });
}
