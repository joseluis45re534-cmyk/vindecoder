import { NextRequest, NextResponse } from 'next/server';
import { getRequestContext } from '@cloudflare/next-on-pages';

export const runtime = 'edge';

// GET /api/chat/messages?session_id=xxx&since=ISO_TIMESTAMP
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const session_id = searchParams.get('session_id');
        const since = searchParams.get('since');

        if (!session_id) {
            return NextResponse.json({ error: 'session_id required' }, { status: 400 });
        }

        let db;
        try {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const { env } = getRequestContext() as any;
            if (env?.DB) db = env.DB;
        } catch { db = process.env.DB; }

        if (!db) {
            return NextResponse.json({ messages: [], session: null });
        }

        // Get session info
        const session = await db.prepare(
            'SELECT id, visitor_name, status FROM chat_sessions WHERE id = ?'
        ).bind(session_id).first();

        if (!session) {
            return NextResponse.json({ error: 'Session not found' }, { status: 404 });
        }

        // Get messages (optionally only those newer than `since`)
        let messages;
        if (since) {
            messages = await db.prepare(
                'SELECT id, sender, message, created_at FROM chat_messages WHERE session_id = ? AND created_at > ? ORDER BY created_at ASC'
            ).bind(session_id, since).all();
        } else {
            messages = await db.prepare(
                'SELECT id, sender, message, created_at FROM chat_messages WHERE session_id = ? ORDER BY created_at ASC'
            ).bind(session_id).all();
        }

        return NextResponse.json({ messages: messages.results, session });
    } catch (error) {
        console.error('Chat get messages error:', error);
        const msg = error instanceof Error ? error.message : String(error);
        return NextResponse.json({ error: msg }, { status: 500 });
    }
}

// POST /api/chat/messages — visitor sends a message
export async function POST(request: NextRequest) {
    try {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { session_id, message } = (await request.json()) as any;

        if (!session_id || !message?.trim()) {
            return NextResponse.json({ error: 'session_id and message are required' }, { status: 400 });
        }

        if (message.trim().length > 2000) {
            return NextResponse.json({ error: 'Message is too long (max 2000 characters)' }, { status: 400 });
        }

        let db;
        try {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const { env } = getRequestContext() as any;
            if (env?.DB) db = env.DB;
        } catch { db = process.env.DB; }

        if (!db) {
            return NextResponse.json({ success: true, mock: true });
        }

        // Verify session exists and is open
        const session = await db.prepare(
            'SELECT id, status FROM chat_sessions WHERE id = ?'
        ).bind(session_id).first();

        if (!session) {
            return NextResponse.json({ error: 'Session not found' }, { status: 404 });
        }
        if ((session as { status: string }).status === 'closed') {
            return NextResponse.json({ error: 'Chat session is closed' }, { status: 403 });
        }

        await db.prepare(
            'INSERT INTO chat_messages (session_id, sender, message) VALUES (?, ?, ?)'
        ).bind(session_id, 'visitor', message.trim()).run();

        // Update last_message_at
        await db.prepare(
            'UPDATE chat_sessions SET last_message_at = CURRENT_TIMESTAMP WHERE id = ?'
        ).bind(session_id).run();

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Chat send message error:', error);
        const msg = error instanceof Error ? error.message : String(error);
        return NextResponse.json({ error: msg }, { status: 500 });
    }
}
