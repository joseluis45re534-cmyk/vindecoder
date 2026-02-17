import { NextRequest, NextResponse } from 'next/server';
import { verifyPassword, createToken } from '@/lib/auth';

export const runtime = 'edge';

export async function POST(request: NextRequest) {
    try {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { email, password } = (await request.json()) as any;

        // Validation
        if (!email || !password) {
            return NextResponse.json(
                { error: 'Email and password are required' },
                { status: 400 }
            );
        }

        // Get D1 database from context
        // @ts-expect-error - DB is available in Cloudflare Pages context
        const db = process.env.DB || request.env?.DB;

        if (!db) {
            // For local development, return mock response
            if (process.env.NODE_ENV === 'development') {
                const mockToken = await createToken(1, email);
                const response = NextResponse.json({
                    success: true,
                    user: { id: 1, email },
                });
                response.cookies.set('auth-token', mockToken, {
                    httpOnly: true,
                    secure: process.env.NODE_ENV !== 'development',
                    sameSite: 'lax',
                    maxAge: 60 * 60 * 24 * 7, // 7 days
                });
                return response;
            }
            return NextResponse.json(
                { error: 'Database not available' },
                { status: 500 }
            );
        }

        // Find user
        const user = await db
            .prepare('SELECT id, email, password_hash FROM users WHERE email = ?')
            .bind(email)
            .first();

        if (!user) {
            return NextResponse.json(
                { error: 'Invalid credentials' },
                { status: 401 }
            );
        }

        // Verify password
        const isValid = await verifyPassword(password, user.password_hash as string);

        if (!isValid) {
            return NextResponse.json(
                { error: 'Invalid credentials' },
                { status: 401 }
            );
        }

        // Create JWT token
        const token = await createToken(user.id as number, user.email as string);

        // Create response with cookie
        const response = NextResponse.json({
            success: true,
            user: { id: user.id, email: user.email },
        });

        response.cookies.set('auth-token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV !== 'development',
            sameSite: 'lax',
            maxAge: 60 * 60 * 24 * 7, // 7 days
        });

        return response;
    } catch (error) {
        console.error('Login error:', error);
        console.error('Error stack:', error instanceof Error ? error.stack : 'No stack');
        return NextResponse.json(
            { error: error instanceof Error ? error.message : 'Internal server error' },
            { status: 500 }
        );
    }
}
