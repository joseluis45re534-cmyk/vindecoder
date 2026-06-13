
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
}

export const getDb = (env: Env) => {
    return drizzle(env.DB, { schema });
};

export type DB = ReturnType<typeof getDb>;
