'use client';

import { createBrowserClient } from '@supabase/ssr';

// Browser Supabase client (anon key). Reads the NEXT_PUBLIC_* values inlined at
// build time. Used by client components for sign-up / sign-in / sign-out.
export function createClient() {
    return createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    );
}
