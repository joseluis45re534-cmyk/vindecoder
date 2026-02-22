import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

export async function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;

    // Protect /admin routes (except /admin/login)
    if (pathname.startsWith('/admin') && pathname !== '/admin/login') {
        const token = request.cookies.get('adminToken')?.value;

        if (!token) {
            const url = request.nextUrl.clone();
            url.pathname = '/admin/login';
            return NextResponse.redirect(url);
        }

        try {
            const secret = new TextEncoder().encode(process.env.JWT_SECRET || 'dev-secret-key-change-in-production');
            const { payload } = await jwtVerify(token, secret);

            // Ensure this is actually an admin token
            if (payload.role !== 'admin') {
                throw new Error("Invalid role");
            }
        } catch (error) {
            console.error("Admin token verification failed:", error);
            const url = request.nextUrl.clone();
            url.pathname = '/admin/login';

            // Clear the invalid cookie
            const response = NextResponse.redirect(url);
            response.cookies.delete('adminToken');
            return response;
        }
    }

    return NextResponse.next();
}

export const config = {
    matcher: ['/admin/:path*'],
};
