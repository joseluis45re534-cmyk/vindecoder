// Account data layer — user lookups, session→user resolution, purchase linking,
// and the report list that powers the dashboard. DB-touching (D1/Drizzle), so it
// must NOT be imported from middleware (use lib/user-auth.ts there instead).

import { and, desc, eq, inArray, isNull, or } from 'drizzle-orm';
import { getDb, type Env } from '@/db';
import { users, orders, reports } from '@/db/schema';
import { readUserCookie, verifyUserSession, userSessionSecret } from '@/lib/user-auth';

export type UserRow = typeof users.$inferSelect;

function db(env: Partial<Env>) {
    return env.DB ? getDb(env as { DB: D1Database }) : null;
}

const norm = (email: string) => email.trim().toLowerCase();

// ---------- user lookups ----------

export async function getUserById(env: Partial<Env>, id: string): Promise<UserRow | null> {
    const d = db(env);
    if (!d) return null;
    const rows = await d.select().from(users).where(eq(users.id, id)).limit(1);
    return rows[0] || null;
}

export async function getUserByEmail(env: Partial<Env>, email: string): Promise<UserRow | null> {
    const d = db(env);
    if (!d) return null;
    const rows = await d.select().from(users).where(eq(users.email, norm(email))).limit(1);
    return rows[0] || null;
}

export async function createUser(
    env: Partial<Env>,
    params: { email: string; name?: string | null; passwordHash: string },
): Promise<UserRow | null> {
    const d = db(env);
    if (!d) return null;
    const id = crypto.randomUUID();
    await d.insert(users).values({
        id,
        email: norm(params.email),
        name: params.name ?? null,
        password_hash: params.passwordHash,
        role: 'customer',
    });
    return getUserById(env, id);
}

/** Resolve the current user from the request's session cookie, or null. */
export async function getCurrentUser(request: Request, env: Partial<Env>): Promise<UserRow | null> {
    const userId = await verifyUserSession(readUserCookie(request), userSessionSecret(env));
    if (!userId) return null;
    return getUserById(env, userId);
}

// ---------- purchase linking ----------

/** Attach any pre-existing anonymous orders (matched by email) to this account. */
export async function linkOrdersToUser(env: Partial<Env>, userId: string, email: string): Promise<void> {
    const d = db(env);
    if (!d) return;
    await d
        .update(orders)
        .set({ user_id: userId })
        .where(and(eq(orders.email, norm(email)), isNull(orders.user_id)));
}

/** Record a paid order (called from the Stripe webhook). Links to a user if one
 *  already exists for the email; otherwise stays claimable on later signup. */
export async function recordPaidOrder(
    env: Partial<Env>,
    params: {
        email?: string | null;
        reportVin: string;
        planId: string;
        provider: 'stripe' | 'paypal';
        providerRef?: string | null;
        amountCents: number;
        stripeCustomerId?: string | null;
    },
): Promise<void> {
    const d = db(env);
    if (!d) return;
    const email = params.email ? norm(params.email) : null;
    const user = email ? await getUserByEmail(env, email) : null;
    // Idempotency: skip if we already recorded this provider ref.
    if (params.providerRef) {
        const existing = await d.select().from(orders).where(eq(orders.provider_ref, params.providerRef)).limit(1);
        if (existing.length) return;
    }
    await d.insert(orders).values({
        id: crypto.randomUUID(),
        user_id: user?.id ?? null,
        email,
        report_id: params.reportVin,
        plan_id: params.planId,
        provider: params.provider,
        provider_ref: params.providerRef ?? null,
        amount_cents: params.amountCents,
        status: 'paid',
    });
    // Backfill the user's Stripe customer id so the billing portal can find them.
    if (user && params.stripeCustomerId && !user.stripe_customer_id) {
        await d.update(users).set({ stripe_customer_id: params.stripeCustomerId }).where(eq(users.id, user.id));
    }
}

// ---------- dashboard report list ----------

export interface UserReportSummary {
    vin: string;
    make: string | null;
    model: string | null;
    year: number | null;
    isUnlocked: boolean;
    orderedAt: string | null;
    status: string | null;
}

/** All reports this user has purchased — joined from their orders. */
export async function listUserReports(env: Partial<Env>, user: UserRow): Promise<UserReportSummary[]> {
    const d = db(env);
    if (!d) return [];
    const ords = await d
        .select()
        .from(orders)
        .where(or(eq(orders.user_id, user.id), eq(orders.email, norm(user.email))))
        .orderBy(desc(orders.created_at));

    const vins = [...new Set(ords.map((o) => o.report_id).filter(Boolean))] as string[];
    if (!vins.length) return [];

    const reps = await d.select().from(reports).where(inArray(reports.vin, vins));
    const byVin = new Map(reps.map((r) => [r.vin, r]));

    return vins.map((vin) => {
        const r = byVin.get(vin);
        const o = ords.find((x) => x.report_id === vin);
        return {
            vin,
            make: r?.make ?? null,
            model: r?.model ?? null,
            year: r?.year ?? null,
            isUnlocked: Boolean(r?.is_unlocked),
            orderedAt: o?.created_at ?? null,
            status: o?.status ?? null,
        };
    });
}
