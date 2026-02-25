import { NextRequest, NextResponse } from 'next/server';
import { getAuthUser } from '@/lib/auth-middleware';
import { validateVin } from '@/lib/vin-validation';
import { getRequestContext } from '@cloudflare/next-on-pages';

export const runtime = 'edge';

const MAX_PENDING_PER_USER = 5;

export async function POST(request: NextRequest) {
    try {
        // Check authentication
        const user = await getAuthUser(request);

        if (!user) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { vin } = (await request.json()) as any;

        // Validate VIN
        const validation = validateVin(vin);
        if (!validation.isValid) {
            return NextResponse.json(
                { error: validation.error || 'Invalid VIN' },
                { status: 400 }
            );
        }

        // Get D1 database from context
        let db;
        try {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const { env } = getRequestContext() as any;
            if (env?.DB) db = env.DB;
        } catch {
            db = process.env.DB;
        }

        if (!db) {
            if (process.env.NODE_ENV === 'development') {
                return NextResponse.json({
                    success: true,
                    vinRequest: {
                        id: Math.floor(Math.random() * 1000),
                        user_id: user.userId,
                        vin_number: vin.toUpperCase(),
                        status: 'pending',
                        created_at: new Date().toISOString(),
                    },
                });
            }
            return NextResponse.json(
                { error: 'Database not available' },
                { status: 500 }
            );
        }

        // Per-user VIN spam check: max pending requests
        const pendingCount = await db
            .prepare('SELECT COUNT(*) as cnt FROM vin_requests WHERE user_id = ? AND status = ?')
            .bind(user.userId, 'pending')
            .first();

        if (pendingCount && (pendingCount as { cnt: number }).cnt >= MAX_PENDING_PER_USER) {
            return NextResponse.json(
                { error: `You have reached the maximum of ${MAX_PENDING_PER_USER} pending VIN requests. Please complete or cancel existing ones first.` },
                { status: 429 }
            );
        }

        // Insert VIN request
        const result = await db
            .prepare(
                'INSERT INTO vin_requests (user_id, vin_number, status) VALUES (?, ?, ?)'
            )
            .bind(user.userId, vin.toUpperCase(), 'pending')
            .run();

        const vinRequestId = result.meta.last_row_id;

        // Fetch the created record
        const vinRequest = await db
            .prepare('SELECT * FROM vin_requests WHERE id = ?')
            .bind(vinRequestId)
            .first();

        return NextResponse.json({
            success: true,
            vinRequest,
        });
    } catch (error) {
        console.error('Save VIN error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
