import { NextResponse } from 'next/server';

// export const runtime = 'edge';

export async function POST() {
    const response = NextResponse.json({ success: true });

    // Clear the auth token cookie
    response.cookies.set('auth-token', '', {
        httpOnly: true,
        secure: process.env.NODE_ENV !== 'development',
        sameSite: 'lax',
        maxAge: 0,
    });

    return response;
}
