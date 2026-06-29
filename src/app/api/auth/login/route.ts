import { NextResponse } from 'next/server';
import { getEnv } from '@/lib/cf';
import { verifyPassword, createUserSession, userCookie, userSessionSecret } from '@/lib/user-auth';
import { getUserByEmail, linkOrdersToUser } from '@/lib/account';
import { allowRequest } from '@/lib/report-cache';

export const runtime = 'edge';

function clientIp(request: Request): string {
    return (
        request.headers.get('cf-connecting-ip') ||
        request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
        'unknown'
    );
}

export async function POST(request: Request) {
    const env = await getEnv();

    if (!(await allowRequest(env, `auth:${clientIp(request)}`, 30))) {
        return NextResponse.json({ error: 'Too many attempts — please try again in a little while.' }, { status: 429 });
    }

    const body = (await request.json().catch(() => ({}))) as { email?: string; password?: string };
    const email = (body.email || '').trim().toLowerCase();
    const password = body.password || '';

    if (!email || !password) return NextResponse.json({ error: 'Enter your email and password.' }, { status: 400 });
    if (!env.DB) return NextResponse.json({ error: 'Sign-in is temporarily unavailable.' }, { status: 503 });

    const user = await getUserByEmail(env, email);
    const ok = user?.password_hash ? await verifyPassword(password, user.password_hash) : false;
    // Generic error — never reveal whether the email exists (anti-enumeration).
    if (!user || !ok) return NextResponse.json({ error: 'Incorrect email or password.' }, { status: 401 });

    await linkOrdersToUser(env, user.id, email);

    const token = await createUserSession(user.id, userSessionSecret(env));
    const res = NextResponse.json({ ok: true });
    res.headers.set('Set-Cookie', userCookie(token));
    return res;
}
