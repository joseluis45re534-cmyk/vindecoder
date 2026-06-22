
import { drizzle } from 'drizzle-orm/d1';
import * as schema from './schema';

export interface Env {
    DB: D1Database;
    // Payments
    STRIPE_SECRET_KEY?: string;
    STRIPE_WEBHOOK_SECRET?: string;
    NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY?: string;
    PAYPAL_CLIENT_ID?: string;
    PAYPAL_SECRET?: string;
    PAYPAL_ENV?: 'sandbox' | 'live';
    // Admin + automation
    ADMIN_PASSWORD?: string;
    ADMIN_SESSION_SECRET?: string;
    ANTHROPIC_API_KEY?: string;
    CRON_SECRET?: string;
    NEXT_PUBLIC_SITE_URL?: string;
    // Vehicle data provider
    AUTODEV_API_KEY?: string;
    // GoodCar B2B API (VIN decode + vehicle history)
    GOODCAR_API_BASE?: string;
    GOODCAR_API_KEY?: string;
    GOODCAR_AUTH_HEADER?: string; // default "Authorization"
    GOODCAR_AUTH_PREFIX?: string; // default "Bearer"
    GOODCAR_TIMEOUT_MS?: string;
    PREVIEW_RATE_LIMIT_PER_HOUR?: string;
    REPORT_CACHE_TTL_DAYS?: string;
}

export const getDb = (env: Env) => {
    return drizzle(env.DB, { schema });
};

export type DB = ReturnType<typeof getDb>;
