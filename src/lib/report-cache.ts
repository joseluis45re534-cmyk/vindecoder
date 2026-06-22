// Cache + rate-limit + entitlement, all backed by D1 (no Workers KV in this project).
// Decode results and full reports are cached SEPARATELY, keyed by normalized VIN.
//   - decode cache  → vin_decodes table
//   - full report   → reports table (also the entitlement/unlock record)
//   - rate limit     → rate_limits table

import { eq } from 'drizzle-orm';
import { getDb, type Env } from '@/db';
import { reports, vinDecodes, rateLimits } from '@/db/schema';
import type { VehicleSpecs, FullReport } from '@/lib/goodcar';

const DECODE_TTL_DAYS = 30;
function reportTtlDays(env: Partial<Env>): number {
  return Number(env.REPORT_CACHE_TTL_DAYS) || 30;
}

function db(env: Partial<Env>) {
  return env.DB ? getDb(env as { DB: D1Database }) : null;
}
type Db = NonNullable<ReturnType<typeof db>>;

function parseTs(s?: string | null): number {
  if (!s) return 0;
  const iso = s.includes('T') ? s : s.replace(' ', 'T') + 'Z';
  const t = Date.parse(iso);
  return Number.isNaN(t) ? 0 : t;
}
function ageDays(s?: string | null): number {
  const t = parseTs(s);
  return t ? (Date.now() - t) / 86_400_000 : Infinity;
}

// ---------- Decode cache ----------

export async function getCachedDecode(env: Partial<Env>, vin: string): Promise<VehicleSpecs | null> {
  const d = db(env);
  if (!d) return null;
  const rows = await d.select().from(vinDecodes).where(eq(vinDecodes.vin, vin)).limit(1);
  if (!rows.length || ageDays(rows[0].created_at) > DECODE_TTL_DAYS) return null;
  return rows[0].data as VehicleSpecs;
}

export async function setCachedDecode(env: Partial<Env>, vin: string, specs: VehicleSpecs): Promise<void> {
  const d = db(env);
  if (!d) return;
  await d
    .insert(vinDecodes)
    .values({ vin, data: specs })
    .onConflictDoUpdate({ target: vinDecodes.vin, set: { data: specs, created_at: new Date().toISOString() } });
}

// ---------- Full report cache + entitlement (reports table) ----------

async function reportRow(d: Db, vin: string) {
  const rows = await d.select().from(reports).where(eq(reports.vin, vin)).limit(1);
  return rows[0] || null;
}

/** True if this VIN has been paid for / unlocked. */
export async function isVinUnlocked(env: Partial<Env>, vin: string): Promise<boolean> {
  const d = db(env);
  if (!d) return false;
  const row = await reportRow(d, vin);
  return !!row?.is_unlocked;
}

/** Mark a VIN unlocked (called from the Stripe webhook on payment). */
export async function markVinUnlocked(env: Partial<Env>, vin: string, orderId?: string): Promise<void> {
  const d = db(env);
  if (!d) return;
  const row = await reportRow(d, vin);
  if (row) {
    await d.update(reports).set({ is_unlocked: true, order_id: orderId ?? row.order_id }).where(eq(reports.id, row.id));
  } else {
    await d.insert(reports).values({ id: crypto.randomUUID(), vin, is_unlocked: true, order_id: orderId, data: {} });
  }
}

export async function getCachedReport(env: Partial<Env>, vin: string): Promise<FullReport | null> {
  const d = db(env);
  if (!d) return null;
  const row = await reportRow(d, vin);
  if (!row || ageDays(row.created_at) > reportTtlDays(env)) return null;
  const data = row.data as Partial<FullReport> | null;
  return data && data.vin ? (data as FullReport) : null; // {} placeholder = not yet fetched
}

export async function setCachedReport(env: Partial<Env>, vin: string, report: FullReport): Promise<void> {
  const d = db(env);
  if (!d) return;
  const row = await reportRow(d, vin);
  const common = {
    data: report,
    make: report.specs.make ?? null,
    model: report.specs.model ?? null,
    year: report.specs.year ? Number(report.specs.year) || null : null,
    created_at: new Date().toISOString(),
  };
  if (row) await d.update(reports).set(common).where(eq(reports.id, row.id));
  else await d.insert(reports).values({ id: crypto.randomUUID(), vin, is_unlocked: true, ...common });
}

// ---------- Rate limit (per key, per hour) ----------

/** Returns true if the request is allowed. Degrades OPEN when no DB is bound. */
export async function allowRequest(env: Partial<Env>, key: string, perHour: number): Promise<boolean> {
  const d = db(env);
  if (!d) return true;
  const now = Date.now();
  const rows = await d.select().from(rateLimits).where(eq(rateLimits.key, key)).limit(1);
  const row = rows[0];

  if (!row) {
    await d.insert(rateLimits).values({ key, hits: 1, window_start: new Date(now).toISOString() }).onConflictDoNothing();
    return true;
  }
  if (now - parseTs(row.window_start) > 3_600_000) {
    await d.update(rateLimits).set({ hits: 1, window_start: new Date(now).toISOString() }).where(eq(rateLimits.key, key));
    return true;
  }
  if ((row.hits ?? 0) >= perHour) return false;
  await d.update(rateLimits).set({ hits: (row.hits ?? 0) + 1 }).where(eq(rateLimits.key, key));
  return true;
}
