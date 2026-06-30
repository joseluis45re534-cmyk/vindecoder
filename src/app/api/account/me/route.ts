import { NextResponse } from 'next/server';
import { getEnv } from '@/lib/cf';
import { getCurrentUser } from '@/lib/account';

export const runtime = 'edge';

// Lightweight "who am I" for the header nav. Backend-agnostic: the header reads
// only { authenticated, name } — swapping the auth provider only changes this body.
export async function GET(request: Request) {
    const env = await getEnv();
    const user = await getCurrentUser(request, env);
    const body = user
        ? { authenticated: true, name: user.name, email: user.email }
        : { authenticated: false };
    return NextResponse.json(body, { headers: { 'Cache-Control': 'no-store' } });
}
