// Pure helpers for /admin/users: merge every email we hold into one row per
// address — Supabase accounts plus the emails collected in D1 (the free-preview
// email form, logged on `lookups` with each VIN; checkout `orders`; the contact
// form). No imports, so it can be checked outside Next.js.

export interface AccountInput {
  id: string;
  email: string | null | undefined;
  name: string | null;
  confirmed: boolean;
  createdAt: string | null | undefined; //    ISO (Supabase)
  lastSignInAt: string | null | undefined;
}

/** One GROUP BY row per email from a D1 table. Timestamps are D1 text. */
export interface EmailAggregate {
  email: string | null;
  n: number; //   lookups: rows; orders: paid orders
  first: string | null;
  last: string | null;
}

export interface ContactInput {
  email: string | null;
  name: string | null;
  createdAt: string | null;
}

export interface PersonRow {
  email: string;
  name: string | null; //                      account name, else latest contact-form name
  account: { confirmed: boolean } | null; //    null = no account (or accounts not loaded)
  lookups: number; //                           VIN previews/reports logged with this email
  paidOrders: number;
  contactMessages: number;
  firstSeen: string | null; //                  'YYYY-MM-DD HH:MM' UTC
  lastActivity: string | null;
}

export function normEmail(email: string | null | undefined): string {
  return (email ?? '').trim().toLowerCase();
}

// D1's CURRENT_TIMESTAMP is 'YYYY-MM-DD HH:MM:SS' in UTC with no zone; Supabase is ISO.
const D1_TIMESTAMP = /^\d{4}-\d{2}-\d{2} \d{2}:\d{2}(:\d{2}(\.\d+)?)?$/;

export function toMs(ts: string | null | undefined): number | null {
  if (!ts) return null;
  const t = Date.parse(D1_TIMESTAMP.test(ts) ? `${ts.replace(' ', 'T')}Z` : ts);
  return Number.isNaN(t) ? null : t;
}

export function fmtUtc(ms: number | null): string | null {
  return ms === null ? null : new Date(ms).toISOString().slice(0, 16).replace('T', ' ');
}

interface Draft {
  email: string;
  name: string | null;
  account: { confirmed: boolean } | null;
  lookups: number;
  paidOrders: number;
  contactMessages: number;
  first: number | null;
  last: number | null;
  contactName: string | null;
  contactNameAt: number;
}

/** One row per address (case-insensitive), newest first by when we first saw it. */
export function mergePeople(input: {
  accounts?: AccountInput[] | null;
  lookups?: EmailAggregate[] | null;
  orders?: EmailAggregate[] | null;
  contacts?: ContactInput[] | null;
}): PersonRow[] {
  const byEmail = new Map<string, Draft>();
  const get = (email: string): Draft => {
    let d = byEmail.get(email);
    if (!d) {
      d = { email, name: null, account: null, lookups: 0, paidOrders: 0, contactMessages: 0, first: null, last: null, contactName: null, contactNameAt: 0 };
      byEmail.set(email, d);
    }
    return d;
  };
  const seen = (d: Draft, ts: string | null | undefined) => {
    const t = toMs(ts);
    if (t === null) return;
    if (d.first === null || t < d.first) d.first = t;
    if (d.last === null || t > d.last) d.last = t;
  };

  for (const a of input.accounts ?? []) {
    const d = get(normEmail(a.email) || `(no email) ${a.id}`);
    d.account = { confirmed: a.confirmed };
    if (a.name) d.name = a.name;
    seen(d, a.createdAt);
    seen(d, a.lastSignInAt);
  }
  for (const l of input.lookups ?? []) {
    const email = normEmail(l.email);
    if (!email) continue;
    const d = get(email);
    d.lookups += Number(l.n) || 0;
    seen(d, l.first);
    seen(d, l.last);
  }
  for (const o of input.orders ?? []) {
    const email = normEmail(o.email);
    if (!email) continue;
    const d = get(email);
    d.paidOrders += Number(o.n) || 0;
    seen(d, o.first);
    seen(d, o.last);
  }
  for (const c of input.contacts ?? []) {
    const email = normEmail(c.email);
    if (!email) continue;
    const d = get(email);
    d.contactMessages += 1;
    seen(d, c.createdAt);
    const name = c.name?.trim();
    const at = toMs(c.createdAt) ?? 0;
    if (name && at >= d.contactNameAt) {
      d.contactName = name;
      d.contactNameAt = at;
    }
  }

  return [...byEmail.values()]
    .sort((a, b) => (b.first ?? 0) - (a.first ?? 0))
    .map((d) => ({
      email: d.email,
      name: d.name ?? d.contactName,
      account: d.account,
      lookups: d.lookups,
      paidOrders: d.paidOrders,
      contactMessages: d.contactMessages,
      firstSeen: fmtUtc(d.first),
      lastActivity: fmtUtc(d.last),
    }));
}
