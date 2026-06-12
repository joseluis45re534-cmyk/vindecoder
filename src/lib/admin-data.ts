import { getEnv } from '@/lib/cf';
import { getDb } from '@/db';
import { orders, users, events, posts } from '@/db/schema';
import { desc } from 'drizzle-orm';

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

export interface UserRow {
  id: string;
  email: string;
  name: string | null;
  role: string | null;
  created_at: string | null;
}

const DEMO_USERS: UserRow[] = [
  { id: 'u_001', email: 'marcus.t@example.com', name: 'Marcus T.', role: 'customer', created_at: '2026-06-10' },
  { id: 'u_002', email: 'alyssa.r@example.com', name: 'Alyssa R.', role: 'customer', created_at: '2026-06-10' },
  { id: 'u_003', email: 'dan.k@example.com', name: 'Dan K.', role: 'customer', created_at: '2026-06-09' },
  { id: 'u_admin', email: 'owner@carvinlookup.com', name: 'Owner', role: 'admin', created_at: '2026-05-01' },
];

export async function loadUsers(): Promise<{ rows: UserRow[]; live: boolean }> {
  try {
    const env = await getEnv();
    if (!env.DB) throw new Error('no db');
    const db = getDb(env as { DB: D1Database });
    const rows = await db.select().from(users).orderBy(desc(users.created_at)).limit(200);
    return { rows: rows as unknown as UserRow[], live: true };
  } catch {
    return { rows: DEMO_USERS, live: false };
  }
}

export interface DashboardStats {
  revenueCents: number;
  orders: number;
  users: number;
  pageviews: number;
  conversion: number;
  live: boolean;
  revenueSeries: number[];
}

export async function loadDashboard(): Promise<DashboardStats> {
  const { rows: orderRows, live } = await loadOrders();
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
    users: (await loadUsers()).rows.length,
    pageviews,
    conversion: pageviews ? (paid.length / pageviews) * 100 : 0,
    live,
    revenueSeries: [12, 19, 14, 23, 28, 22, 31, 35, 29, 38, 42, 47],
  };
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
