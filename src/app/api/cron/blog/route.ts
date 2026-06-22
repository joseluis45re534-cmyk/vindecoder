import { NextResponse } from 'next/server';
import { getEnv } from '@/lib/cf';
import { getBlogSchedule } from '@/lib/settings';
import { isDue } from '@/lib/blog-schedule';
import { runBatch } from '@/lib/blog-runner';

export const runtime = 'edge';

// Scheduled automation heartbeat. An external trigger (Cloudflare Cron Trigger or
// a scheduler such as cron-job.org) calls this with:  Authorization: Bearer $CRON_SECRET
// The endpoint self-gates on the admin schedule, so posts only go out at the
// configured time and quantity. Append ?force=1 to run immediately regardless.
export async function POST(request: Request) {
  const env = await getEnv();

  const auth = request.headers.get('authorization') || '';
  if (!env.CRON_SECRET || auth !== `Bearer ${env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  if (!env.ANTHROPIC_API_KEY) return NextResponse.json({ error: 'ANTHROPIC_API_KEY not set' }, { status: 503 });
  if (!env.DB) return NextResponse.json({ error: 'D1 not bound' }, { status: 503 });

  const force = new URL(request.url).searchParams.get('force') === '1';
  const schedule = await getBlogSchedule(env);

  if (!force && (!schedule.enabled || !isDue(schedule, new Date()))) {
    return NextResponse.json({ ok: true, skipped: true, reason: schedule.enabled ? 'not due' : 'disabled' });
  }

  try {
    const summary = await runBatch(env, { qty: schedule.qtyPerRun });
    return NextResponse.json({ ok: true, ...summary });
  } catch (err) {
    return NextResponse.json({ error: String(err instanceof Error ? err.message : err) }, { status: 500 });
  }
}
