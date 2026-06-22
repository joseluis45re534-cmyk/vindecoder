import { NextResponse } from 'next/server';
import { getEnv } from '@/lib/cf';
import { requireAdmin } from '@/lib/auth';
import { runBatch } from '@/lib/blog-runner';

export const runtime = 'edge';

// Manual "Run now" — generate + publish a batch immediately, bypassing the
// schedule's timing (but still honoring the auto-publish/quality settings).
export async function POST(request: Request) {
  const env = await getEnv();
  if (!(await requireAdmin(request, env))) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  if (!env.ANTHROPIC_API_KEY) {
    return NextResponse.json({ error: 'ANTHROPIC_API_KEY not set — add it in Settings.' }, { status: 503 });
  }
  if (!env.DB) {
    return NextResponse.json({ error: 'D1 database not bound.' }, { status: 503 });
  }

  const body = (await request.json().catch(() => ({}))) as { qty?: number };
  try {
    const summary = await runBatch(env, { qty: body.qty, force: true });
    if (summary.skipped) {
      return NextResponse.json({ ok: true, ...summary, message: 'No queued keywords to run.' });
    }
    return NextResponse.json({ ok: true, ...summary });
  } catch (err) {
    return NextResponse.json({ error: String(err instanceof Error ? err.message : err) }, { status: 500 });
  }
}
