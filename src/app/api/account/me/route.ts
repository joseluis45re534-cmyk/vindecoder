import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export const runtime = 'edge';

// Lightweight "who am I" for the header nav. Backend-agnostic shape:
// { authenticated, name }. Degrades to logged-out if Supabase isn't configured.
export async function GET() {
    const headers = { 'Cache-Control': 'no-store' };
    try {
        if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
            return NextResponse.json({ authenticated: false }, { headers });
        }
        const supabase = await createClient();
        const {
            data: { user },
        } = await supabase.auth.getUser();
        const body = user
            ? { authenticated: true, name: (user.user_metadata?.name as string) || null, email: user.email }
            : { authenticated: false };
        return NextResponse.json(body, { headers });
    } catch {
        return NextResponse.json({ authenticated: false }, { headers });
    }
}
