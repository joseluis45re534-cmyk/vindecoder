import { NextResponse } from 'next/server';
import { clearUserCookie } from '@/lib/user-auth';

export const runtime = 'edge';

export async function POST() {
    const res = NextResponse.json({ ok: true });
    res.headers.set('Set-Cookie', clearUserCookie());
    return res;
}
