// VIN lookup activity log — one row per free preview and per paid report, for
// the admin activity view (/admin/activity). Every write is best-effort and
// null-safe: it degrades to a no-op when D1 isn't bound and NEVER throws, so an
// analytics failure can't break a customer's preview or report request.

import { getDb, type Env } from '@/db';
import { lookups } from '@/db/schema';

function db(env: Partial<Env>) {
  return env.DB ? getDb(env as { DB: D1Database }) : null;
}

// SHA-256 the IP so we can group/rate-analyze by visitor without ever storing a
// raw IP (edge-safe Web Crypto). Truncated — collision risk is irrelevant here.
async function hashIp(ip: string): Promise<string> {
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(ip));
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('')
    .slice(0, 32);
}

export interface LookupEntry {
  vin: string;
  type: 'preview' | 'report';
  email?: string | null; //        signed-in user (usually null for anonymous previews)
  make?: string | null;
  model?: string | null;
  year?: number | string | null;
  country?: string | null; //      cf-ipcountry
  ip?: string | null; //           raw IP — hashed before storage, never persisted raw
  recordsFound?: number | null;
  status?: 'ok' | 'cached' | 'not_found' | 'error';
  testMode?: boolean;
  requestId?: string | null;
}

export async function logLookup(env: Partial<Env>, entry: LookupEntry): Promise<void> {
  const d = db(env);
  if (!d) return;
  try {
    const yearNum = entry.year == null ? null : Number(entry.year) || null;
    await d.insert(lookups).values({
      id: crypto.randomUUID(),
      vin: entry.vin,
      type: entry.type,
      email: entry.email ?? null,
      make: entry.make ?? null,
      model: entry.model ?? null,
      year: yearNum,
      country: entry.country ?? null,
      ip_hash: entry.ip ? await hashIp(entry.ip) : null,
      records_found: entry.recordsFound ?? null,
      status: entry.status ?? 'ok',
      test_mode: entry.testMode ?? false,
      request_id: entry.requestId ?? null,
    });
  } catch (err) {
    // Analytics must never break the request path.
    console.error('[activity] logLookup failed:', err);
  }
}

/** Best-effort signed-in email for attribution. Guarded so a missing/broken
 *  Supabase config just yields null. Reads the session cookie only. */
export async function currentUserEmail(): Promise<string | null> {
  try {
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL) return null;
    const { createClient } = await import('@/lib/supabase/server');
    const supabase = await createClient();
    const { data } = await supabase.auth.getUser();
    return data.user?.email ?? null;
  } catch {
    return null;
  }
}
