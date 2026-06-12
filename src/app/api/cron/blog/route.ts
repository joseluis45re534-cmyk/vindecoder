import { NextResponse } from 'next/server';
import { getEnv } from '@/lib/cf';
import { getDb } from '@/db';
import { keywords, posts } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { generatePost } from '@/lib/content-pipeline';

export const runtime = 'edge';

// Scheduled automation: pick the next queued keyword, generate a draft, run the
// quality gate, and store it as `in_review` (NOT auto-published — a human
// approves in the admin panel). Trigger from Cloudflare Cron Triggers with:
//   Authorization: Bearer $CRON_SECRET
export async function POST(request: Request) {
  const env = await getEnv();

  const auth = request.headers.get('authorization') || '';
  if (!env.CRON_SECRET || auth !== `Bearer ${env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  if (!env.ANTHROPIC_API_KEY) {
    return NextResponse.json({ error: 'ANTHROPIC_API_KEY not set' }, { status: 503 });
  }
  if (!env.DB) {
    return NextResponse.json({ error: 'D1 not bound' }, { status: 503 });
  }

  const db = getDb(env as { DB: D1Database });

  // Next queued keyword by priority.
  const queued = await db
    .select()
    .from(keywords)
    .where(eq(keywords.status, 'queued'))
    .limit(1);

  if (queued.length === 0) {
    return NextResponse.json({ ok: true, message: 'No queued keywords.' });
  }

  const kw = queued[0];
  await db.update(keywords).set({ status: 'drafting' }).where(eq(keywords.id, kw.id));

  try {
    const draft = await generatePost(env, kw.term, kw.intent || 'informational');
    const id = crypto.randomUUID();
    // Auto-publish only if it clears a high quality bar; otherwise hold for review.
    const status = draft.qualityScore >= 80 ? 'in_review' : 'draft';

    await db.insert(posts).values({
      id,
      slug: draft.slug,
      title: draft.title,
      description: draft.description,
      keyword: kw.term,
      body: draft.body,
      status,
      ai_assisted: true,
      quality_score: draft.qualityScore,
    });
    await db.update(keywords).set({ status: 'done', post_id: id }).where(eq(keywords.id, kw.id));

    return NextResponse.json({
      ok: true,
      keyword: kw.term,
      slug: draft.slug,
      qualityScore: draft.qualityScore,
      status,
    });
  } catch (err) {
    await db.update(keywords).set({ status: 'queued' }).where(eq(keywords.id, kw.id));
    return NextResponse.json({ error: String(err instanceof Error ? err.message : err) }, { status: 500 });
  }
}
