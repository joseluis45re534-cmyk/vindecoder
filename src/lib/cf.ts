import type { Env } from '@/db';

/**
 * Resolve the Cloudflare environment (bindings + secrets) inside route handlers.
 * Uses next-on-pages in production; falls back to process.env in `next dev`.
 */
export async function getEnv(): Promise<Partial<Env>> {
    try {
        const mod = await import('@cloudflare/next-on-pages');
        const ctx = mod.getRequestContext();
        return ctx.env as unknown as Env;
    } catch {
        // Local dev (next dev) — no Cloudflare context. Use process.env.
        return process.env as unknown as Partial<Env>;
    }
}

export function siteUrl(env: Partial<Env>): string {
    return (env.NEXT_PUBLIC_SITE_URL || process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000').replace(/\/$/, '');
}
