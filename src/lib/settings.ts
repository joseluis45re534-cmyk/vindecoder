// Runtime settings stored in the D1 `settings` table, editable from the admin
// panel. Each helper merges DB-stored values over environment defaults so the
// admin UI can override pricing and payment credentials without a redeploy.
//
// SECURITY: payment secrets stored in D1 are write-only to the UI — the API
// never returns raw secret values, only a masked hint + "set" boolean. For
// production, Cloudflare Pages secrets (env) remain the recommended source;
// DB values are an override for operators who prefer UI configuration.

import { getDb, type Env } from '@/db';
import { settings } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { DEFAULT_PLANS, type Plan } from '@/lib/pricing';
import { getEnv } from '@/lib/cf';

async function readSetting<T>(env: Partial<Env>, key: string): Promise<T | null> {
  try {
    if (!env.DB) return null;
    const db = getDb(env as { DB: D1Database });
    const rows = await db.select().from(settings).where(eq(settings.key, key)).limit(1);
    if (rows.length === 0) return null;
    return rows[0].value as T;
  } catch {
    return null;
  }
}

export async function writeSetting(env: Partial<Env>, key: string, value: unknown): Promise<boolean> {
  try {
    if (!env.DB) return false;
    const db = getDb(env as { DB: D1Database });
    await db
      .insert(settings)
      .values({ key, value: value as object, updated_at: new Date().toISOString() })
      .onConflictDoUpdate({
        target: settings.key,
        set: { value: value as object, updated_at: new Date().toISOString() },
      });
    return true;
  } catch (err) {
    console.error('writeSetting failed:', err);
    return false;
  }
}

// ---------- Pricing ----------

export async function getPricing(env?: Partial<Env>): Promise<Plan[]> {
  const e = env || (await getEnv());
  const override = await readSetting<Plan[]>(e, 'pricing');
  if (override && Array.isArray(override) && override.length > 0) return override;
  return DEFAULT_PLANS;
}

export async function setPricing(env: Partial<Env>, plans: Plan[]): Promise<boolean> {
  return writeSetting(env, 'pricing', plans);
}

// ---------- Payment credentials ----------

export interface PaymentConfig {
  stripeSecret?: string;
  stripeWebhookSecret?: string;
  stripePublishable?: string;
  paypalClientId?: string;
  paypalSecret?: string;
  paypalEnv?: 'sandbox' | 'live';
}

interface StoredPayments {
  stripeSecret?: string;
  stripeWebhookSecret?: string;
  stripePublishable?: string;
  paypalClientId?: string;
  paypalSecret?: string;
  paypalEnv?: 'sandbox' | 'live';
}

// Resolve effective payment config: DB override wins, else env.
export async function getPaymentConfig(env: Partial<Env>): Promise<PaymentConfig> {
  const stored = (await readSetting<StoredPayments>(env, 'payments')) || {};
  return {
    stripeSecret: stored.stripeSecret || env.STRIPE_SECRET_KEY,
    stripeWebhookSecret: stored.stripeWebhookSecret || env.STRIPE_WEBHOOK_SECRET,
    stripePublishable: stored.stripePublishable || env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY,
    paypalClientId: stored.paypalClientId || env.PAYPAL_CLIENT_ID,
    paypalSecret: stored.paypalSecret || env.PAYPAL_SECRET,
    paypalEnv: stored.paypalEnv || (env.PAYPAL_ENV as 'sandbox' | 'live') || 'sandbox',
  };
}

function mask(v?: string): string | null {
  if (!v) return null;
  if (v.length <= 8) return '••••';
  return `${v.slice(0, 4)}••••${v.slice(-4)}`;
}

// Safe-for-UI status: never leaks the full secret, only a masked hint.
export async function getPaymentStatus(env: Partial<Env>) {
  const cfg = await getPaymentConfig(env);
  const stored = (await readSetting<StoredPayments>(env, 'payments')) || {};
  const source = (key: keyof StoredPayments, envVal?: string) =>
    stored[key] ? 'db' : envVal ? 'env' : 'unset';
  return {
    stripeSecret: { set: !!cfg.stripeSecret, hint: mask(cfg.stripeSecret), source: source('stripeSecret', env.STRIPE_SECRET_KEY) },
    stripeWebhookSecret: { set: !!cfg.stripeWebhookSecret, hint: mask(cfg.stripeWebhookSecret), source: source('stripeWebhookSecret', env.STRIPE_WEBHOOK_SECRET) },
    stripePublishable: { set: !!cfg.stripePublishable, hint: mask(cfg.stripePublishable), source: source('stripePublishable', env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY) },
    paypalClientId: { set: !!cfg.paypalClientId, hint: mask(cfg.paypalClientId), source: source('paypalClientId', env.PAYPAL_CLIENT_ID) },
    paypalSecret: { set: !!cfg.paypalSecret, hint: mask(cfg.paypalSecret), source: source('paypalSecret', env.PAYPAL_SECRET) },
    paypalEnv: { value: cfg.paypalEnv },
    persistable: !!env.DB,
  };
}

// Merge new (non-empty) values into stored payments. Empty string = leave as-is.
export async function setPaymentConfig(
  env: Partial<Env>,
  incoming: Partial<StoredPayments>
): Promise<boolean> {
  const stored = (await readSetting<StoredPayments>(env, 'payments')) || {};
  const next: StoredPayments = { ...stored };
  for (const [k, v] of Object.entries(incoming)) {
    if (v !== undefined && v !== '') (next as Record<string, unknown>)[k] = v;
  }
  return writeSetting(env, 'payments', next);
}
