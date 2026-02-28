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

// GET /api/admin/chat/sessions — list all sessions
export async function GET(request: NextRequest) {
    if (!await isAdminAuthenticated(request)) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        let db;
        try {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const { env } = getRequestContext() as any;
            if (env?.DB) db = env.DB;
        } catch { db = process.env.DB; }

        if (!db) return NextResponse.json({ sessions: [] });

        const result = await db.prepare(
            `SELECT s.id, s.visitor_name, s.visitor_email, s.status, s.created_at, s.last_message_at,
                (SELECT message FROM chat_messages WHERE session_id = s.id ORDER BY created_at DESC LIMIT 1) as last_message
             FROM chat_sessions s
             ORDER BY s.last_message_at DESC`
        ).all();

        return NextResponse.json({ sessions: result.results });
    } catch (error) {
        console.error('Admin chat sessions error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
