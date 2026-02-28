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

// PATCH /api/admin/chat/session/[id] — update session status
export async function PATCH(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    if (!await isAdminAuthenticated(request)) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const { id } = await params;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { status } = (await request.json()) as any;

        if (!['open', 'closed'].includes(status)) {
            return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
        }

        let db;
        try {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const { env } = getRequestContext() as any;
            if (env?.DB) db = env.DB;
        } catch { db = process.env.DB; }

        if (!db) return NextResponse.json({ success: true, mock: true });

        await db.prepare('UPDATE chat_sessions SET status = ? WHERE id = ?').bind(status, id).run();

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Admin close session error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
