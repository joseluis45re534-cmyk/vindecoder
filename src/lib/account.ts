// Account data layer — purchases/reports for a customer, keyed by EMAIL.
// Identity now lives in Supabase Auth; this module only joins a verified email
// to the D1 orders/reports that belong to it. DB-touching (D1/Drizzle).

import { desc, eq, inArray } from 'drizzle-orm';
import { getDb, type Env } from '@/db';
import { orders, reports } from '@/db/schema';

function db(env: Partial<Env>) {
    return env.DB ? getDb(env as { DB: D1Database }) : null;
}

const norm = (email: string) => email.trim().toLowerCase();

// ---------- order recording (Stripe webhook) ----------

/** Record a paid order, keyed by the buyer's email. Idempotent on provider ref. */
export async function recordPaidOrder(
    env: Partial<Env>,
    params: {
        email?: string | null;
        reportVin: string;
        planId: string;
        provider: 'stripe' | 'paypal';
        providerRef?: string | null;
        amountCents: number;
    },
): Promise<void> {
    const d = db(env);
    if (!d) return;
    if (params.providerRef) {
        const existing = await d.select().from(orders).where(eq(orders.provider_ref, params.providerRef)).limit(1);
        if (existing.length) return;
    }
    await d.insert(orders).values({
        id: crypto.randomUUID(),
        user_id: null,
        email: params.email ? norm(params.email) : null,
        report_id: params.reportVin,
        plan_id: params.planId,
        provider: params.provider,
        provider_ref: params.providerRef ?? null,
        amount_cents: params.amountCents,
        status: 'paid',
    });
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

/** All reports purchased under this email — joined from their orders. */
export async function listReportsForEmail(env: Partial<Env>, email: string): Promise<UserReportSummary[]> {
    const d = db(env);
    if (!d) return [];
    const ords = await d.select().from(orders).where(eq(orders.email, norm(email))).orderBy(desc(orders.created_at));

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
