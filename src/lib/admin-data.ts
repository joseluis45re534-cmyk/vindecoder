import type { User } from '@supabase/supabase-js';
import { getEnv } from '@/lib/cf';
import { getDb, type Env } from '@/db';
import { orders, events, posts, lookups, contactMessages } from '@/db/schema';
import { desc, like, or, eq, and, sql, type SQL } from 'drizzle-orm';
import { createAdminClient } from '@/lib/supabase/admin';
import { mergePeople, type AccountInput, type ContactInput, type EmailAggregate, type PersonRow } from '@/lib/admin-people';

// Each loader tries D1; if the binding/table isn't there yet (local dev or
// pre-migration), it returns representative demo data so the panel renders.

export interface OrderRow {
  id: string;
  email: string | null;
  plan_id: string;
  provider: string;
  amount_cents: number;
  status: string;
  created_at: string | null;
}

const DEMO_ORDERS: OrderRow[] = [
  { id: 'cs_demo_8821', email: 'marcus.t@example.com', plan_id: 'bundle5', provider: 'stripe', amount_cents: 4999, status: 'paid', created_at: '2026-06-10 14:22' },
  { id: 'PAYID-DEMO77', email: 'alyssa.r@example.com', plan_id: 'single', provider: 'paypal', amount_cents: 2499, status: 'paid', created_at: '2026-06-10 09:05' },
  { id: 'cs_demo_8820', email: 'dan.k@example.com', plan_id: 'dealer', provider: 'stripe', amount_cents: 9900, status: 'paid', created_at: '2026-06-09 18:41' },
  { id: 'cs_demo_8814', email: 'guest@example.com', plan_id: 'single', provider: 'stripe', amount_cents: 2499, status: 'failed', created_at: '2026-06-09 12:10' },
  { id: 'cs_demo_8801', email: 'jen.w@example.com', plan_id: 'single', provider: 'stripe', amount_cents: 2499, status: 'refunded', created_at: '2026-06-08 21:33' },
];

export async function loadOrders(): Promise<{ rows: OrderRow[]; live: boolean }> {
  try {
    const env = await getEnv();
    if (!env.DB) throw new Error('no db');
    const db = getDb(env as { DB: D1Database });
    const rows = await db.select().from(orders).orderBy(desc(orders.created_at)).limit(100);
    return { rows: rows as unknown as OrderRow[], live: true };
  } catch {
    return { rows: DEMO_ORDERS, live: false };
  }
}

// ── People: every email we hold (/admin/users) ──
// Accounts live in Supabase Auth (sign-up, login, email confirmation). Visitors
// also leave emails without an account: the free-preview email form (logged on
// `lookups` with each VIN), checkout (`orders`) and the contact form
// (`contact_messages`). loadPeople() merges them into one row per address via
// src/lib/admin-people.ts. The D1 `users` table belongs to the retired custom
// auth and nothing writes to it any more — never list or count accounts from it.

export interface PeopleResult {
  rows: PersonRow[];
  accountsLoaded: boolean; // Confirmed / Unconfirmed / No account is real
  emailsLoaded: boolean; //   preview-form, order and contact-form emails are real
  notices: string[]; //       what couldn't be loaded, and why
}

const DEMO_PEOPLE: PersonRow[] = [
  { email: 'marcus.t@example.com', name: 'Marcus T.', account: { confirmed: true }, lookups: 3, paidOrders: 1, contactMessages: 0, firstSeen: '2026-06-10 13:55', lastActivity: '2026-06-10 14:20' },
  { email: 'dan.k@example.com', name: 'Dan K.', account: { confirmed: false }, lookups: 1, paidOrders: 0, contactMessages: 0, firstSeen: '2026-06-09 18:30', lastActivity: '2026-06-09 18:31' },
  { email: 'preview.lead@example.com', name: null, account: null, lookups: 2, paidOrders: 0, contactMessages: 1, firstSeen: '2026-06-08 09:12', lastActivity: '2026-06-09 10:40' },
];

const USERS_PER_PAGE = 1000;
const MAX_USER_PAGES = 5; // lists up to 5,000 accounts

type Loaded<T> = ({ ok: true } & T) | { ok: false; error: string };

async function loadAccounts(env: Partial<Env>): Promise<Loaded<{ accounts: AccountInput[]; total: number }>> {
  const supabase = createAdminClient(env);
  if (!supabase) {
    return { ok: false, error: 'Supabase isn’t configured here (NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY is missing), so account status can’t be shown.' };
  }
  try {
    const users: User[] = [];
    let total = 0;
    for (let page = 1; page <= MAX_USER_PAGES; page++) {
      const { data, error } = await supabase.auth.admin.listUsers({ page, perPage: USERS_PER_PAGE });
      if (error) throw error;
      users.push(...data.users);
      total = data.total;
      if (!data.nextPage) break;
    }
    const accounts = users.map((u): AccountInput => ({
      id: u.id,
      email: u.email,
      name: typeof u.user_metadata?.name === 'string' ? u.user_metadata.name.trim() || null : null,
      confirmed: Boolean(u.email_confirmed_at),
      createdAt: u.created_at,
      lastSignInAt: u.last_sign_in_at,
    }));
    return { ok: true, accounts, total: Math.max(total, accounts.length) };
  } catch (err) {
    console.error('[admin] loading Supabase accounts failed:', err);
    return { ok: false, error: `Couldn’t load accounts from Supabase: ${err instanceof Error ? err.message : String(err)}` };
  }
}

// Emails collected in D1, grouped per address (case-insensitive).
async function loadCollectedEmails(
  env: Partial<Env>,
): Promise<Loaded<{ lookups: EmailAggregate[]; orders: EmailAggregate[]; contacts: ContactInput[] }>> {
  if (!env.DB) {
    return { ok: false, error: 'D1 isn’t connected here, so emails from the free-preview form, checkout and the contact form can’t be shown.' };
  }
  try {
    const db = getDb(env as { DB: D1Database });
    const lookupEmail = sql<string>`lower(trim(${lookups.email}))`;
    const orderEmail = sql<string>`lower(trim(${orders.email}))`;
    const [lookupRows, orderRows, contacts] = await Promise.all([
      db
        .select({
          email: lookupEmail,
          n: sql<number>`count(*)`,
          first: sql<string | null>`min(${lookups.created_at})`,
          last: sql<string | null>`max(${lookups.created_at})`,
        })
        .from(lookups)
        .where(sql`trim(coalesce(${lookups.email}, '')) <> ''`)
        .groupBy(lookupEmail),
      db
        .select({
          email: orderEmail,
          n: sql<number>`sum(case when ${orders.status} = 'paid' then 1 else 0 end)`,
          first: sql<string | null>`min(${orders.created_at})`,
          last: sql<string | null>`max(${orders.created_at})`,
        })
        .from(orders)
        .where(sql`trim(coalesce(${orders.email}, '')) <> ''`)
        .groupBy(orderEmail),
      db
        .select({ email: contactMessages.email, name: contactMessages.name, createdAt: contactMessages.created_at })
        .from(contactMessages),
    ]);
    return { ok: true, lookups: lookupRows, orders: orderRows, contacts };
  } catch (err) {
    console.error('[admin] loading collected emails from D1 failed:', err);
    return { ok: false, error: `Couldn’t load collected emails from D1: ${err instanceof Error ? err.message : String(err)}` };
  }
}

export async function loadPeople(): Promise<PeopleResult> {
  const env = await getEnv();
  const [accounts, collected] = await Promise.all([loadAccounts(env), loadCollectedEmails(env)]);
  if (!accounts.ok && !collected.ok) {
    return { rows: DEMO_PEOPLE, accountsLoaded: false, emailsLoaded: false, notices: [accounts.error, collected.error, 'These rows are demo data.'] };
  }
  const rows = mergePeople({
    accounts: accounts.ok ? accounts.accounts : null,
    lookups: collected.ok ? collected.lookups : null,
    orders: collected.ok ? collected.orders : null,
    contacts: collected.ok ? collected.contacts : null,
  });
  const notices: string[] = [];
  if (!accounts.ok) notices.push(accounts.error);
  if (!collected.ok) notices.push(collected.error);
  return { rows, accountsLoaded: accounts.ok, emailsLoaded: collected.ok, notices };
}

export interface DashboardStats {
  revenueCents: number;
  orders: number;
  users: number | null; // Supabase accounts; null when they couldn't be loaded
  pageviews: number;
  conversion: number;
  live: boolean;
  revenueSeries: number[];
}

export async function loadDashboard(): Promise<DashboardStats> {
  const [{ rows: orderRows, live }, accounts] = await Promise.all([loadOrders(), getEnv().then(loadAccounts)]);
  const paid = orderRows.filter((o) => o.status === 'paid');
  const revenueCents = paid.reduce((s, o) => s + o.amount_cents, 0);
  let pageviews = 4820;
  try {
    const env = await getEnv();
    if (env.DB) {
      const db = getDb(env as { DB: D1Database });
      const ev = await db.select().from(events).limit(100000);
      pageviews = ev.filter((e) => e.name === 'pageview').length || pageviews;
    }
  } catch {
    /* demo fallback */
  }
  return {
    revenueCents,
    orders: paid.length,
    users: accounts.ok ? accounts.total : null,
    pageviews,
    conversion: pageviews ? (paid.length / pageviews) * 100 : 0,
    live,
    revenueSeries: [12, 19, 14, 23, 28, 22, 31, 35, 29, 38, 42, 47],
  };
}

// ── First-party analytics (events table) ──

export interface AnalyticsData {
  live: boolean;
  pageviews: number;
  vinSearches: number;
  checkoutsStarted: number;
  purchases: number;
  topPages: { path: string; views: number }[];
  sources: { name: string; pct: number }[];
}

function classifySource(referrer: string | null): string {
  if (!referrer) return 'Direct';
  let host = '';
  try { host = new URL(referrer).hostname.replace(/^www\./, ''); } catch { return 'Direct'; }
  if (!host || host.endsWith('carvinlookup.us')) return 'Direct';
  if (/google|bing|duckduckgo|yahoo|ecosia|baidu|yandex/.test(host)) return 'Organic search';
  if (/chatgpt|openai|perplexity|claude|gemini|bard|copilot|you\.com/.test(host)) return 'AI search';
  if (/facebook|instagram|twitter|t\.co|x\.com|reddit|tiktok|linkedin|youtube|pinterest/.test(host)) return 'Social';
  return 'Referral';
}

const DEMO_ANALYTICS: AnalyticsData = {
  live: false,
  pageviews: 4820, vinSearches: 1290, checkoutsStarted: 190, purchases: 96,
  topPages: [
    { path: '/', views: 2140 },
    { path: '/blog/salvage-title-vs-rebuilt-title', views: 612 },
    { path: '/pricing', views: 488 },
    { path: '/blog/how-to-read-a-vin-number', views: 421 },
    { path: '/blog/check-car-for-flood-damage', views: 305 },
  ],
  sources: [
    { name: 'Organic search', pct: 52 },
    { name: 'AI search', pct: 18 },
    { name: 'Direct', pct: 16 },
    { name: 'Referral', pct: 9 },
    { name: 'Social', pct: 5 },
  ],
};

export async function loadAnalytics(): Promise<AnalyticsData> {
  try {
    const env = await getEnv();
    if (!env.DB) throw new Error('no db');
    const db = getDb(env as { DB: D1Database });
    const rows = await db.select({ name: events.name, path: events.path, referrer: events.referrer }).from(events).limit(100000);
    if (!rows.length) return DEMO_ANALYTICS; // nothing tracked yet — keep demo so the page isn't blank

    const count = (n: string) => rows.filter((r) => r.name === n).length;

    const pageCounts = new Map<string, number>();
    const srcCounts = new Map<string, number>();
    for (const r of rows) {
      if (r.name !== 'pageview') continue;
      if (r.path) pageCounts.set(r.path, (pageCounts.get(r.path) || 0) + 1);
      const src = classifySource(r.referrer);
      srcCounts.set(src, (srcCounts.get(src) || 0) + 1);
    }
    const topPages = [...pageCounts.entries()].map(([path, views]) => ({ path, views })).sort((a, b) => b.views - a.views).slice(0, 6);
    const totalSrc = [...srcCounts.values()].reduce((a, b) => a + b, 0) || 1;
    const sources = [...srcCounts.entries()].map(([name, c]) => ({ name, pct: Math.round((c / totalSrc) * 100) })).sort((a, b) => b.pct - a.pct).slice(0, 6);

    return {
      live: true,
      pageviews: count('pageview'),
      vinSearches: count('vin_search'),
      checkoutsStarted: count('checkout_started'),
      purchases: count('purchase'),
      topPages,
      sources,
    };
  } catch {
    return DEMO_ANALYTICS;
  }
}

// ── VIN lookup activity log ──

export interface LookupRow {
  id: string;
  vin: string;
  type: string;
  email: string | null;
  make: string | null;
  model: string | null;
  year: number | null;
  country: string | null;
  records_found: number | null;
  status: string | null;
  test_mode: boolean | null;
  created_at: string | null;
}

const DEMO_LOOKUPS: LookupRow[] = [
  { id: 'lk_1', vin: '1FTFW1RG5NFA12345', type: 'report', email: 'marcus.t@example.com', make: 'Ford', model: 'F-150', year: 2022, country: 'US', records_found: 52, status: 'ok', test_mode: false, created_at: '2026-07-27 10:14' },
  { id: 'lk_2', vin: 'JTHCE1BL2E5024076', type: 'preview', email: null, make: 'Lexus', model: 'GS', year: 2014, country: 'US', records_found: 13, status: 'ok', test_mode: false, created_at: '2026-07-27 10:02' },
  { id: 'lk_3', vin: '5YJ3E1EA7KF000000', type: 'preview', email: null, make: 'Tesla', model: 'Model 3', year: 2019, country: 'CA', records_found: 0, status: 'not_found', test_mode: false, created_at: '2026-07-27 09:48' },
  { id: 'lk_4', vin: '1HGCM82633A004352', type: 'preview', email: 'jen.w@example.com', make: 'Honda', model: 'Accord', year: 2003, country: 'US', records_found: 8, status: 'cached', test_mode: false, created_at: '2026-07-27 09:31' },
];

export interface LookupFilters { q?: string; type?: string; page?: number }

export interface LookupResult {
  rows: LookupRow[];
  live: boolean;
  total: number;
  page: number;
  pageSize: number;
  previews: number;
  reports: number;
}

export async function loadLookups(filters: LookupFilters = {}): Promise<LookupResult> {
  const pageSize = 50;
  const page = Math.max(1, filters.page || 1);
  const typeFilter = filters.type === 'preview' || filters.type === 'report' ? filters.type : undefined;
  const q = filters.q?.trim();

  try {
    const env = await getEnv();
    if (!env.DB) throw new Error('no db');
    const db = getDb(env as { DB: D1Database });
    const conds: SQL[] = [];
    if (q) {
      const pat = `%${q}%`;
      conds.push(or(like(lookups.vin, pat), like(lookups.email, pat)) as SQL);
    }
    if (typeFilter) conds.push(eq(lookups.type, typeFilter));
    const where = conds.length ? and(...conds) : undefined;

    const rows = await db.select().from(lookups).where(where).orderBy(desc(lookups.created_at)).limit(pageSize).offset((page - 1) * pageSize);
    const [{ c: total }] = await db.select({ c: sql<number>`count(*)` }).from(lookups).where(where);
    const [{ c: previews }] = await db.select({ c: sql<number>`count(*)` }).from(lookups).where(eq(lookups.type, 'preview'));
    const [{ c: reports }] = await db.select({ c: sql<number>`count(*)` }).from(lookups).where(eq(lookups.type, 'report'));
    return { rows: rows as unknown as LookupRow[], live: true, total: Number(total) || 0, page, pageSize, previews: Number(previews) || 0, reports: Number(reports) || 0 };
  } catch {
    let rows = DEMO_LOOKUPS;
    if (q) { const lq = q.toLowerCase(); rows = rows.filter((r) => r.vin.toLowerCase().includes(lq) || (r.email || '').toLowerCase().includes(lq)); }
    if (typeFilter) rows = rows.filter((r) => r.type === typeFilter);
    return {
      rows, live: false, total: rows.length, page: 1, pageSize,
      previews: DEMO_LOOKUPS.filter((r) => r.type === 'preview').length,
      reports: DEMO_LOOKUPS.filter((r) => r.type === 'report').length,
    };
  }
}

export interface PostRow {
  id: string;
  slug: string;
  title: string;
  keyword: string | null;
  status: string | null;
  quality_score: number | null;
  published_at: string | null;
  created_at: string | null;
}

export async function loadPosts(): Promise<{ rows: PostRow[]; live: boolean }> {
  try {
    const env = await getEnv();
    if (!env.DB) throw new Error('no db');
    const db = getDb(env as { DB: D1Database });
    const rows = await db.select().from(posts).orderBy(desc(posts.created_at)).limit(200);
    return { rows: rows as unknown as PostRow[], live: true };
  } catch {
    const { DEMO_POSTS } = await import('@/lib/blog');
    return {
      rows: DEMO_POSTS.map((p) => ({
        id: p.slug,
        slug: p.slug,
        title: p.title,
        keyword: p.keyword,
        status: 'published',
        quality_score: p.qualityScore,
        published_at: p.date,
        created_at: p.date,
      })),
      live: false,
    };
  }
}
