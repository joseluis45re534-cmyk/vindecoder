import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { verifySession, COOKIE_NAME, adminSecret } from '@/lib/auth';

// Protect the admin panel. Everything under /admin requires a valid session,
// except the login page and the login API.
export const config = {
    matcher: ['/admin/:path*'],
};

export async function middleware(req: NextRequest) {
    const { pathname } = req.nextUrl;

    if (pathname === '/admin/login') {
        return NextResponse.next();
    }

    const token = req.cookies.get(COOKIE_NAME)?.value;
    const secret = adminSecret(process.env as { ADMIN_SESSION_SECRET?: string });
    const ok = await verifySession(token, secret);

    if (!ok) {
        const url = req.nextUrl.clone();
        url.pathname = '/admin/login';
        url.searchParams.set('next', pathname);
        return NextResponse.redirect(url);
    }

    return NextResponse.next();
}
