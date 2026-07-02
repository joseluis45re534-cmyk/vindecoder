import { NextResponse } from 'next/server';
import { getEnv } from '@/lib/cf';
import { createSession, sessionCookie, adminSecret, adminPassword, timingSafeEqual } from '@/lib/auth';
import { allowRequest } from '@/lib/report-cache';

export const runtime = 'edge';

export async function POST(request: Request) {
    const env = await getEnv();

    // Brute-force guard: cap admin login attempts per IP (degrades open w/o D1).
    const ip =
        request.headers.get('cf-connecting-ip') ||
        request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
        'unknown';
    if (!(await allowRequest(env, `admin-login:${ip}`, 10))) {
        return NextResponse.json({ error: 'Too many attempts — try again later.' }, { status: 429 });
    }

    const body = (await request.json().catch(() => ({}))) as { password?: string };

    // Constant-time compare against the configured password (fails closed in prod
    // when ADMIN_PASSWORD is unset — see adminPassword()).
    if (!body.password || !timingSafeEqual(body.password, adminPassword(env))) {
        return NextResponse.json({ error: 'Incorrect password' }, { status: 401 });
    }

    const token = await createSession(adminSecret(env));
    const res = NextResponse.json({ ok: true });
    res.headers.set('Set-Cookie', sessionCookie(token));
    return res;
}
