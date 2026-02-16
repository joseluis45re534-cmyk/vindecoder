import { NextRequest, NextResponse } from 'next/server';
import { hashPassword } from '@/lib/auth';

export const runtime = 'edge';

export async function GET(request: NextRequest) {
    const results: any = {
        checks: {},
        env: {},
    };

    try {
        // Check 1: Runtime Environment
        results.env.NODE_ENV = process.env.NODE_ENV;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        results.env.Region = (request as any).cf?.region || 'unknown';

        // Check 2: JWT_SECRET
        if (process.env.JWT_SECRET) {
            results.checks.jwt_secret = 'Present';
        } else {
            results.checks.jwt_secret = 'MISSING';
        }

        // Check 3: Database Connection
        // @ts-expect-error - DB is available in Cloudflare Pages context
        const db = process.env.DB || request.env?.DB;

        if (db) {
            results.checks.db_connection = 'Found binding';
            try {
                // Try a simple query
                const { results: rows } = await db.prepare('SELECT 1 as val').all();
                results.checks.db_query = 'Success';
                results.checks.db_val = rows[0]?.val;
            } catch (e: any) {
                results.checks.db_query = `Failed: ${e.message}`;
            }
        } else {
            results.checks.db_connection = 'MISSING BINDING (DB)';
        }

        // Check 4: Crypto / bcryptjs
        try {
            const hash = await hashPassword('test');
            results.checks.crypto = 'Success (bcryptjs works)';
        } catch (e: any) {
            results.checks.crypto = `Failed: ${e.message}`;
        }

        return NextResponse.json(results);
    } catch (error: any) {
        return NextResponse.json({
            error: 'Debug failed',
            message: error.message,
            stack: error.stack,
        }, { status: 500 });
    }
}
