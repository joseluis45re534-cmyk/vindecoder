import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { verifySession, COOKIE_NAME, adminSecret } from '@/lib/auth';
import { verifyUserSession, USER_COOKIE_NAME, userSessionSecret } from '@/lib/user-auth';

// Protect the admin panel (/admin) and the customer dashboard (/account).
// Both use stateless signed-cookie sessions verified here at the edge.
export const config = {
    matcher: ['/admin/:path*', '/account/:path*'],
};

export async function middleware(req: NextRequest) {
    const { pathname } = req.nextUrl;

    // ── Customer dashboard ──
    if (pathname.startsWith('/account')) {
        const token = req.cookies.get(USER_COOKIE_NAME)?.value;
        const userId = await verifyUserSession(token, userSessionSecret(process.env as { USER_SESSION_SECRET?: string; ADMIN_SESSION_SECRET?: string }));
        if (!userId) {
            const url = req.nextUrl.clone();
            url.pathname = '/login';
            url.searchParams.set('next', pathname);
            return NextResponse.redirect(url);
        }
        return NextResponse.next();
    }

    // ── Admin panel ──
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
