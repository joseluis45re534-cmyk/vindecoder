import { NextRequest, NextResponse } from 'next/server';
import { getRequestContext } from '@cloudflare/next-on-pages';
import { jwtVerify } from 'jose';

export const runtime = 'edge';

async function isAdminAuthenticated(request: NextRequest): Promise<boolean> {
    try {
        const token = request.cookies.get('adminToken')?.value;
        if (!token) return false;
        const secret = new TextEncoder().encode(process.env.JWT_SECRET || 'dev-secret-key-change-in-production');
        const { payload } = await jwtVerify(token, secret);
        return payload.role === 'admin';
    } catch { return false; }
}

function getDb() {
    try {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { env } = getRequestContext() as any;
        if (env?.DB) return env.DB;
    } catch { /* ignore */ }
    return process.env.DB;
}

// GET /api/admin/chat/messages?session_id=xxx — full message history for a session
export async function GET(request: NextRequest) {
    if (!await isAdminAuthenticated(request)) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const session_id = searchParams.get('session_id');
    if (!session_id) return NextResponse.json({ error: 'session_id required' }, { status: 400 });

    try {
        const db = getDb();
        if (!db) return NextResponse.json({ messages: [] });

        const messages = await db.prepare(
            'SELECT id, sender, message, created_at FROM chat_messages WHERE session_id = ? ORDER BY created_at ASC'
        ).bind(session_id).all();

        return NextResponse.json({ messages: messages.results });
    } catch (error) {
        console.error('Admin get messages error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

// POST /api/admin/chat/messages — admin sends a reply
export async function POST(request: NextRequest) {
    if (!await isAdminAuthenticated(request)) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { session_id, message } = (await request.json()) as any;

        if (!session_id || !message?.trim()) {
            return NextResponse.json({ error: 'session_id and message required' }, { status: 400 });
        }

        const db = getDb();
        if (!db) return NextResponse.json({ success: true, mock: true });

        await db.prepare(
            'INSERT INTO chat_messages (session_id, sender, message) VALUES (?, ?, ?)'
        ).bind(session_id, 'admin', message.trim()).run();

        await db.prepare(
            'UPDATE chat_sessions SET last_message_at = CURRENT_TIMESTAMP WHERE id = ?'
        ).bind(session_id).run();

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Admin reply error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
