import { sql } from 'drizzle-orm';
import { getDb, type Env } from '@/db';
import { rateLimits } from '@/db/schema';

const HOUR_MS = 3_600_000;

/** SHA-256 hex of a string — counters are keyed by a hash, never a raw IP address. */
async function sha256(s: string): Promise<string> {
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(s));
  return Array.from(new Uint8Array(digest), (b) => b.toString(16).padStart(2, '0')).join('');
}

/**
 * Atomic per-key hourly limit. One UPSERT both counts the request and returns
 * the new count, so parallel requests can't all read the same old value and
 * slip past the cap (the read-then-write `allowRequest` in report-cache.ts
 * can; it stays in place only for /api/preview, which is billing core).
 * `scope` is stored in clear ("chat", "contact"…); `id` (an IP bucket) only as
 * a hash. Returns true if the request is allowed; degrades OPEN without D1.
 */
export async function allowRequestAtomic(
  env: Partial<Env>,
  scope: string,
  id: string,
  perHour: number,
): Promise<boolean> {
  if (!env.DB) return true;
  const d = getDb(env as { DB: D1Database });
  const key = `${scope}:${(await sha256(id)).slice(0, 32)}`;
  const now = new Date().toISOString();
  const cutoff = new Date(Date.now() - HOUR_MS).toISOString();
  const [row] = await d
    .insert(rateLimits)
    .values({ key, hits: 1, window_start: now })
    .onConflictDoUpdate({
      target: rateLimits.key,
      // SQLite evaluates SET against the OLD row, so both CASEs see the old window.
      set: {
        hits: sql`CASE WHEN ${rateLimits.window_start} < ${cutoff} THEN 1 ELSE ${rateLimits.hits} + 1 END`,
        window_start: sql`CASE WHEN ${rateLimits.window_start} < ${cutoff} THEN ${now} ELSE ${rateLimits.window_start} END`,
      },
    })
    .returning({ hits: rateLimits.hits });
  return (row?.hits ?? 1) <= perHour;
}
