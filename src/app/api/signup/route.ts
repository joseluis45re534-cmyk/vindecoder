import { NextRequest, NextResponse } from 'next/server';
import { hashPassword, createToken } from '@/lib/auth';

export const runtime = 'edge';

export async function POST(request: NextRequest) {
    try {
        const { email, password } = await request.json();

        // Validation
        if (!email || !password) {
            return NextResponse.json(
                { error: 'Email and password are required' },
                { status: 400 }
            );
        }

        if (password.length < 8) {
            return NextResponse.json(
                { error: 'Password must be at least 8 characters' },
                { status: 400 }
            );
        }

        // Email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return NextResponse.json(
                { error: 'Invalid email format' },
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

        // Check if user already exists
        const existingUser = await db
            .prepare('SELECT id FROM users WHERE email = ?')
            .bind(email)
            .first();

        if (existingUser) {
            return NextResponse.json(
                { error: 'User already exists' },
                { status: 409 }
            );
        }

        // Hash password
        const passwordHash = await hashPassword(password);

        // Insert user
        const result = await db
            .prepare('INSERT INTO users (email, password_hash) VALUES (?, ?)')
            .bind(email, passwordHash)
            .run();

        const userId = result.meta.last_row_id;

        // Create JWT token
        const token = await createToken(userId, email);

        // Create response with cookie
        const response = NextResponse.json({
            success: true,
            user: { id: userId, email },
        });

        response.cookies.set('auth-token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV !== 'development',
            sameSite: 'lax',
            maxAge: 60 * 60 * 24 * 7, // 7 days
        });

        return response;
    } catch (error) {
        console.error('Signup error:', error);
        return NextResponse.json(
            { error: error instanceof Error ? error.message : 'Unknown error', stack: error instanceof Error ? error.stack : undefined },
            { status: 500 }
        );
    }
}
