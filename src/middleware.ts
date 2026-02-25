import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';
import { rateLimit } from '@/lib/rate-limit';

// API routes that should be rate-limited and their limits
const RATE_LIMITED_ROUTES: Record<string, { maxRequests: number; windowMs: number }> = {
    '/api/login': { maxRequests: 5, windowMs: 60_000 },        // 5 per minute
    '/api/signup': { maxRequests: 3, windowMs: 60_000 },       // 3 per minute
    '/api/save-vin': { maxRequests: 10, windowMs: 60_000 },    // 10 per minute
    '/api/create-checkout-session': { maxRequests: 5, windowMs: 60_000 }, // 5 per minute
    '/api/admin/login': { maxRequests: 3, windowMs: 60_000 },  // 3 per minute
};

export async function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;

    // --- Rate Limiting for sensitive API routes ---
    const rateLimitConfig = RATE_LIMITED_ROUTES[pathname];
    if (rateLimitConfig) {
        const ip = request.headers.get('cf-connecting-ip')
            || request.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
            || 'unknown';

        const result = rateLimit(ip, {
            maxRequests: rateLimitConfig.maxRequests,
            windowMs: rateLimitConfig.windowMs,
            prefix: pathname,
        });

        if (!result.allowed) {
            return NextResponse.json(
                { error: 'Too many requests. Please try again later.' },
                {
                    status: 429,
                    headers: {
                        'Retry-After': String(Math.ceil(result.resetIn / 1000)),
                        'X-RateLimit-Remaining': '0',
                    },
                }
            );
        }
    }

    // --- Exclude non-admin routes from auth checks ---
    if (pathname.startsWith('/_next') || pathname.startsWith('/api') || pathname === '/admin/login') {
        return NextResponse.next();
    }

    // --- Admin auth protection ---
    if (pathname.startsWith('/admin')) {
        const token = request.cookies.get('adminToken')?.value;

        if (!token) {
            const url = request.nextUrl.clone();
            url.pathname = '/admin/login';
            return NextResponse.redirect(url);
        }

        try {
            const secret = new TextEncoder().encode(process.env.JWT_SECRET || 'dev-secret-key-change-in-production');
            const { payload } = await jwtVerify(token, secret);

            if (payload.role !== 'admin') {
                throw new Error("Invalid role");
            }
        } catch (error) {
            console.error("Admin token verification failed:", error);
            const url = request.nextUrl.clone();
            url.pathname = '/admin/login';

            const response = NextResponse.redirect(url);
            response.cookies.delete('adminToken');
            return response;
        }
    }

    return NextResponse.next();
}

export const config = {
    matcher: ['/admin/:path*', '/api/:path*'],
};
