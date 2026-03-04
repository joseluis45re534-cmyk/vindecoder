import { NextRequest, NextResponse } from 'next/server';
import { getRequestContext } from '@cloudflare/next-on-pages';
import { jwtVerify } from 'jose';

export const runtime = 'edge';

async function isAdminAuthenticated(request: NextRequest): Promise<boolean> {
    try {
        const token = request.cookies.get('adminToken')?.value;
        if (!token) return false;
        const secret = new TextEncoder().encode(process.env.JWT_SECRET);
        if (!secret.length) return false;
        const { payload } = await jwtVerify(token, secret);
        return payload.role === 'admin';
    } catch { return false; }
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export async function GET(request: NextRequest) {
    if (!await isAdminAuthenticated(request)) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        let db;
        try {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const { env } = getRequestContext();
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            if (env) db = (env as any).DB;
        } catch (e) {
            console.warn("Context not available", e);
        }

        if (!db) {
            if (process.env.NODE_ENV === 'development') {
                return NextResponse.json({ message: 'Local dev mode (mock DB)' });
            }
            return NextResponse.json({ error: 'DB binding not found' }, { status: 500 });
        }

        const statements = [
            `CREATE TABLE IF NOT EXISTS users (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                email TEXT UNIQUE NOT NULL,
                password_hash TEXT NOT NULL,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP
            )`,
            `CREATE TABLE IF NOT EXISTS vin_requests (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id INTEGER NOT NULL,
                vin_number TEXT NOT NULL,
                status TEXT NOT NULL DEFAULT 'pending',
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users(id)
            )`,
            `CREATE INDEX IF NOT EXISTS idx_vin_requests_user_id ON vin_requests(user_id)`,
            `CREATE INDEX IF NOT EXISTS idx_vin_requests_status ON vin_requests(status)`,
            `CREATE TABLE IF NOT EXISTS vin_reports (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                vin_request_id INTEGER NOT NULL,
                report_data TEXT NOT NULL,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (vin_request_id) REFERENCES vin_requests(id)
            )`,
            `CREATE INDEX IF NOT EXISTS idx_vin_reports_request_id ON vin_reports(vin_request_id)`,
            `CREATE TABLE IF NOT EXISTS chat_sessions (
                id TEXT PRIMARY KEY,
                visitor_name TEXT NOT NULL,
                visitor_email TEXT,
                status TEXT NOT NULL DEFAULT 'open',
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                last_message_at DATETIME DEFAULT CURRENT_TIMESTAMP
            )`,
            `CREATE TABLE IF NOT EXISTS chat_messages (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                session_id TEXT NOT NULL,
                sender TEXT NOT NULL,
                message TEXT NOT NULL,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (session_id) REFERENCES chat_sessions(id)
            )`,
            `CREATE INDEX IF NOT EXISTS idx_chat_messages_session ON chat_messages(session_id)`,
            `CREATE INDEX IF NOT EXISTS idx_chat_sessions_status ON chat_sessions(status)`
        ];

        const results = [];
        for (const sql of statements) {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            await db.prepare(sql).run();
            results.push({ sql: sql.substring(0, 50) + '...', success: true });
        }

        return NextResponse.json({ success: true, results });
    } catch (e: unknown) {
        const message = e instanceof Error ? e.message : 'Unknown error';
        return NextResponse.json({ error: message }, { status: 500 });
    }
}
