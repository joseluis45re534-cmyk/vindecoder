// The shared batch engine for blog automation — used by both the scheduled cron
// route and the admin "Run now" button so their behavior can never diverge.

import { eq } from 'drizzle-orm';
import { getDb, type Env } from '@/db';
import { keywords, posts } from '@/db/schema';
import { generatePost } from '@/lib/content-pipeline';
import { getBlogSchedule, setBlogSchedule } from '@/lib/settings';

export interface RunResult {
  keyword: string;
  slug?: string;
  qualityScore?: number;
  status?: 'published' | 'in_review';
  error?: string;
}

export interface BatchSummary {
  generated: number;
  published: number;
  inReview: number;
  skipped: boolean;
  results: RunResult[];
}

const MAX_QTY = 10;

type Db = ReturnType<typeof getDb>;

// Ensure a unique slug (posts.slug is UNIQUE): base, base-2, base-3, …
async function uniqueSlug(db: Db, base: string): Promise<string> {
  const root = base || 'post';
  for (let n = 1; n <= 50; n++) {
    const candidate = n === 1 ? root : `${root}-${n}`;
    const exists = await db.select().from(posts).where(eq(posts.slug, candidate)).limit(1);
    if (!exists.length) return candidate;
  }
  return `${root}-${crypto.randomUUID().slice(0, 6)}`;
}

/**
 * Generate up to `qty` posts from the queued-keyword backlog, publishing those
 * that clear the quality threshold (per the saved schedule) and holding the rest
 * for review. Stamps `lastRunAt`. Throws only on missing prerequisites.
 */
export async function runBatch(env: Partial<Env>, opts: { qty?: number; force?: boolean } = {}): Promise<BatchSummary> {
  if (!env.ANTHROPIC_API_KEY) throw new Error('ANTHROPIC_API_KEY not set');
  if (!env.DB) throw new Error('D1 not bound');

  const db = getDb(env as { DB: D1Database });
  const sched = await getBlogSchedule(env);
  const qty = Math.max(1, Math.min(opts.qty ?? sched.qtyPerRun ?? 1, MAX_QTY));

  const queued = await db.select().from(keywords).where(eq(keywords.status, 'queued')).limit(qty);

  const results: RunResult[] = [];
  let published = 0;
  let inReview = 0;

  for (const kw of queued) {
    await db.update(keywords).set({ status: 'drafting' }).where(eq(keywords.id, kw.id));
    try {
      const draft = await generatePost(env, kw.term, kw.intent || 'informational');
      const slug = await uniqueSlug(db, draft.slug);
      const shouldPublish = sched.autoPublish && draft.qualityScore >= sched.minQualityToPublish;
      const status: 'published' | 'in_review' = shouldPublish ? 'published' : 'in_review';
      const id = crypto.randomUUID();

      await db.insert(posts).values({
        id,
        slug,
        title: draft.title,
        description: draft.description,
        keyword: kw.term,
        body: draft.body,
        status,
        ai_assisted: true,
        quality_score: draft.qualityScore,
        published_at: shouldPublish ? new Date().toISOString() : null,
      });
      await db.update(keywords).set({ status: 'done', post_id: id }).where(eq(keywords.id, kw.id));

      if (shouldPublish) published++;
      else inReview++;
      results.push({ keyword: kw.term, slug, qualityScore: draft.qualityScore, status });
    } catch (err) {
      // Re-queue so the keyword is retried next run.
      await db.update(keywords).set({ status: 'queued' }).where(eq(keywords.id, kw.id));
      results.push({ keyword: kw.term, error: String(err instanceof Error ? err.message : err) });
    }
  }

  await setBlogSchedule(env, { lastRunAt: new Date().toISOString() });

  return {
    generated: results.filter((r) => !r.error).length,
    published,
    inReview,
    skipped: queued.length === 0,
    results,
  };
}
