import { NextRequest, NextResponse } from 'next/server';
import { getRequestContext } from '@cloudflare/next-on-pages';

export const runtime = 'edge';

function generateId(): string {
    const arr = new Uint8Array(16);
    crypto.getRandomValues(arr);
    arr[6] = (arr[6] & 0x0f) | 0x40;
    arr[8] = (arr[8] & 0x3f) | 0x80;
    return [...arr].map((b, i) =>
        [4, 6, 8, 10].includes(i) ? '-' + b.toString(16).padStart(2, '0') : b.toString(16).padStart(2, '0')
    ).join('');
}

export async function POST(request: NextRequest) {
    try {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { visitor_name, visitor_email } = (await request.json()) as any;

        if (!visitor_name?.trim()) {
            return NextResponse.json({ error: 'Name is required' }, { status: 400 });
        }

        let db;
        try {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const { env } = getRequestContext() as any;
            if (env?.DB) db = env.DB;
        } catch { db = process.env.DB; }

        if (!db) {
            // Local dev fallback
            const id = generateId();
            return NextResponse.json({ session_id: id, visitor_name });
        }

        const id = generateId();
        await db.prepare(
            'INSERT INTO chat_sessions (id, visitor_name, visitor_email) VALUES (?, ?, ?)'
        ).bind(id, visitor_name.trim(), visitor_email?.trim() || null).run();

        return NextResponse.json({ session_id: id, visitor_name: visitor_name.trim() });
    } catch (error) {
        console.error('Chat session error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
