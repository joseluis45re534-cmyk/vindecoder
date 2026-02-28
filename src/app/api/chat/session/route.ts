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

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function ensureTables(db: any) {
    await db.prepare(`CREATE TABLE IF NOT EXISTS chat_sessions (
        id TEXT PRIMARY KEY,
        visitor_name TEXT NOT NULL,
        visitor_email TEXT,
        status TEXT NOT NULL DEFAULT 'open',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        last_message_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`).run();

    await db.prepare(`CREATE TABLE IF NOT EXISTS chat_messages (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        session_id TEXT NOT NULL,
        sender TEXT NOT NULL,
        message TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (session_id) REFERENCES chat_sessions(id)
    )`).run();
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
        } catch { /* not on Cloudflare */ }

        if (!db) {
            // Local dev fallback — no DB available
            const id = generateId();
            return NextResponse.json({ session_id: id, visitor_name: visitor_name.trim() });
        }

        // Auto-create tables if they don't exist yet
        await ensureTables(db);

        const id = generateId();
        await db.prepare(
            'INSERT INTO chat_sessions (id, visitor_name, visitor_email) VALUES (?, ?, ?)'
        ).bind(id, visitor_name.trim(), visitor_email?.trim() || null).run();

        return NextResponse.json({ session_id: id, visitor_name: visitor_name.trim() });
    } catch (error) {
        console.error('Chat session error:', error);
        const msg = error instanceof Error ? error.message : String(error);
        return NextResponse.json({ error: msg || 'Internal server error' }, { status: 500 });
    }
}
