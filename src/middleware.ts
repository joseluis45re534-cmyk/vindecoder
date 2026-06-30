import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { verifySession, COOKIE_NAME, adminSecret } from '@/lib/auth';
import { updateSession } from '@/lib/supabase/middleware';

// Protect the admin panel (/admin, signed-cookie auth) and the customer
// dashboard (/account, Supabase Auth).
export const config = {
    matcher: ['/admin/:path*', '/account/:path*'],
};

export async function middleware(req: NextRequest) {
    const { pathname } = req.nextUrl;

    // ── Customer dashboard (Supabase) ──
    if (pathname.startsWith('/account')) {
        const { response, user } = await updateSession(req);
        if (!user) {
            const url = req.nextUrl.clone();
            url.pathname = '/login';
            url.searchParams.set('next', pathname);
            return NextResponse.redirect(url);
        }
        return response; // carries refreshed Supabase session cookies
    }

    // ── Admin panel (signed cookie) ──
    if (pathname === '/admin/login') {
        return NextResponse.next();
    }

    const token = req.cookies.get(COOKIE_NAME)?.value;
    const ok = await verifySession(token, adminSecret(process.env as { ADMIN_SESSION_SECRET?: string }));

    if (!ok) {
        const url = req.nextUrl.clone();
        url.pathname = '/admin/login';
        url.searchParams.set('next', pathname);
        return NextResponse.redirect(url);
    }

    return NextResponse.next();
}
