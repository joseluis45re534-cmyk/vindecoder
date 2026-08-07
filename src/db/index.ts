
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
    // Customer account sessions (legacy D1 auth — superseded by Supabase)
    USER_SESSION_SECRET?: string;
    // Supabase Auth (identity + email confirmation). Public values are also
    // exposed via NEXT_PUBLIC_* for the browser client.
    NEXT_PUBLIC_SUPABASE_URL?: string;
    NEXT_PUBLIC_SUPABASE_ANON_KEY?: string;
    SUPABASE_SERVICE_ROLE_KEY?: string;
    ANTHROPIC_API_KEY?: string;
    ANTHROPIC_MODEL?: string;
    CRON_SECRET?: string;
    NEXT_PUBLIC_SITE_URL?: string;
    // Analytics (public — inlined into the client bundle at build time).
    NEXT_PUBLIC_GA_ID?: string; //   GA4 measurement ID, e.g. G-XXXXXXXXXX
    NEXT_PUBLIC_GADS_ID?: string; // optional Google Ads tag, e.g. AW-XXXXXXXXX
    // DataForSEO Labs API — SEO keyword discovery (Basic auth: login:password).
    // Server-side secret. Powers the automated keyword-research → blog pipeline.
    DATAFORSEO_LOGIN?: string;
    DATAFORSEO_PASSWORD?: string;
    DATAFORSEO_BASE?: string; // default https://api.dataforseo.com
    // Vehicle data provider
    AUTODEV_API_KEY?: string;
    // GoodCar B2B API (legacy VIN provider — superseded by VinCheck)
    GOODCAR_API_BASE?: string;
    GOODCAR_API_KEY?: string;
    GOODCAR_AUTH_HEADER?: string; // default "Authorization"
    GOODCAR_AUTH_PREFIX?: string; // default "Bearer"
    GOODCAR_TIMEOUT_MS?: string;
    // VinCheck Partner API v1 (active VIN preview + paid report provider).
    // Server-side secret — never exposed to the browser. Use the vc_test_ key in
    // dev/preview, the vc_live_ key in production.
    VINCHECK_API_KEY?: string;
    VINCHECK_API_BASE?: string; // default https://vincheck.it.com/api/v1
    VINCHECK_TIMEOUT_MS?: string;
    PREVIEW_RATE_LIMIT_PER_HOUR?: string;
    REPORT_CACHE_TTL_DAYS?: string;
}

export const getDb = (env: Env) => {
    return drizzle(env.DB, { schema });
};

export type DB = ReturnType<typeof getDb>;
