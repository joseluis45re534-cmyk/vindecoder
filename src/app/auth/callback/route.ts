import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export const runtime = 'edge';

// Email-confirmation / OAuth callback — exchanges the code for a session, then
// redirects into the app. Supabase appends ?code=... to the emailRedirectTo URL.
export async function GET(request: Request) {
    const { searchParams, origin } = new URL(request.url);
    const code = searchParams.get('code');
    const next = searchParams.get('next') || '/account';

    if (code) {
        const supabase = await createClient();
        const { error } = await supabase.auth.exchangeCodeForSession(code);
        if (!error) {
            return NextResponse.redirect(`${origin}${next}`);
        }
    }
    return NextResponse.redirect(`${origin}/login?error=confirm`);
}
