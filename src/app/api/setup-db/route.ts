import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'edge';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export async function GET(request: NextRequest) {
    try {
        // @ts-expect-error - DB is available in Cloudflare Pages context
        const db = process.env.DB || request.env?.DB;

        if (!db) {
            // Mock for local dev
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
            `CREATE INDEX IF NOT EXISTS idx_vin_requests_status ON vin_requests(status)`
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
        return NextResponse.json({ error: message, stack: (e as Error).stack }, { status: 500 });
    }
}
