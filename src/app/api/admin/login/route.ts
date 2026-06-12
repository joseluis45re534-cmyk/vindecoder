import { NextResponse } from 'next/server';
import { getEnv } from '@/lib/cf';
import { createSession, sessionCookie, adminSecret, adminPassword } from '@/lib/auth';

export const runtime = 'edge';

export async function POST(request: Request) {
    const env = await getEnv();
    const body = (await request.json().catch(() => ({}))) as { password?: string };

    if (!body.password || body.password !== adminPassword(env)) {
        return NextResponse.json({ error: 'Incorrect password' }, { status: 401 });
    }

    const token = await createSession(adminSecret(env));
    const res = NextResponse.json({ ok: true });
    res.headers.set('Set-Cookie', sessionCookie(token));
    return res;
}
