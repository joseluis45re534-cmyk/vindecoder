import { NextResponse } from 'next/server';
import { getEnv } from '@/lib/cf';
import { requireAdmin } from '@/lib/auth';
import { getPricing, setPricing } from '@/lib/settings';
import type { Plan } from '@/lib/pricing';

export const runtime = 'edge';

export async function GET(request: Request) {
  const env = await getEnv();
  if (!(await requireAdmin(request, env))) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const plans = await getPricing(env);
  return NextResponse.json({ plans, persistable: !!env.DB });
}

export async function POST(request: Request) {
  const env = await getEnv();
  if (!(await requireAdmin(request, env))) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = (await request.json().catch(() => ({}))) as { plans?: Plan[] };
  if (!Array.isArray(body.plans) || body.plans.length === 0) {
    return NextResponse.json({ error: 'plans array required' }, { status: 400 });
  }

  // Validate + coerce price to integer cents.
  const clean: Plan[] = body.plans.map((p) => ({
    ...p,
    priceCents: Math.max(0, Math.round(Number(p.priceCents) || 0)),
    currency: 'usd',
    interval: p.interval === 'month' ? 'month' : 'one_time',
  }));

  const ok = await setPricing(env, clean);
  if (!ok) {
    return NextResponse.json(
      { error: 'Could not persist — D1 database not bound. Changes apply once D1 is connected.', persisted: false },
      { status: 503 }
    );
  }
  return NextResponse.json({ ok: true, plans: clean });
}
