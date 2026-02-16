import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';

export async function getAuthUser(request: NextRequest) {
    const token = request.cookies.get('auth-token')?.value;

    if (!token) {
        return null;
    }

    const payload = await verifyToken(token);
    return payload;
}

export function createAuthResponse(message: string, status: number = 401) {
    return NextResponse.json({ error: message }, { status });
}
