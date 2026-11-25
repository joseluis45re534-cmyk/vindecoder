import { createClient } from '@supabase/supabase-js';
import type { Env } from '@/db';

// Service-role Supabase client. It bypasses Row Level Security and can read every
// account, so it is SERVER-ONLY: import it only from server code (admin pages,
// route handlers). SUPABASE_SERVICE_ROLE_KEY is a runtime secret (never
// NEXT_PUBLIC_), so it is never inlined into a browser bundle.
// Returns null when Supabase isn't configured (e.g. local dev without keys).
export function createAdminClient(env: Partial<Env>) {
    const url = env.NEXT_PUBLIC_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!url || !key) return null;
    return createClient(url, key, {
        auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
    });
}
