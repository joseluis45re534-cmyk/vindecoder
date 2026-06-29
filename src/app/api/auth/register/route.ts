import { NextResponse } from 'next/server';
import { getEnv } from '@/lib/cf';
import { hashPassword, createUserSession, userCookie, userSessionSecret } from '@/lib/user-auth';
import { getUserByEmail, createUser, linkOrdersToUser } from '@/lib/account';
import { allowRequest } from '@/lib/report-cache';

export const runtime = 'edge';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

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

    const body = (await request.json().catch(() => ({}))) as { email?: string; password?: string; name?: string };
    const email = (body.email || '').trim().toLowerCase();
    const password = body.password || '';

    if (!EMAIL_RE.test(email)) return NextResponse.json({ error: 'Enter a valid email address.' }, { status: 400 });
    if (password.length < 8) return NextResponse.json({ error: 'Password must be at least 8 characters.' }, { status: 400 });
    if (!env.DB) return NextResponse.json({ error: 'Accounts are temporarily unavailable.' }, { status: 503 });

    if (await getUserByEmail(env, email)) {
        return NextResponse.json({ error: 'An account with this email already exists — try signing in.' }, { status: 409 });
    }

    const user = await createUser(env, { email, name: body.name?.trim() || null, passwordHash: await hashPassword(password) });
    if (!user) return NextResponse.json({ error: 'Could not create your account — please try again.' }, { status: 500 });

    await linkOrdersToUser(env, user.id, email); // claim any prior anonymous purchases

    const token = await createUserSession(user.id, userSessionSecret(env));
    const res = NextResponse.json({ ok: true, user: { email: user.email, name: user.name } });
    res.headers.set('Set-Cookie', userCookie(token));
    return res;
}
