import { NextRequest, NextResponse } from 'next/server';
import { getAuthUser } from '@/lib/auth-middleware';
import { validateVin } from '@/lib/vin-validation';

export const runtime = 'edge';

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

        const { vin } = await request.json();

        // Validate VIN
        const validation = validateVin(vin);
        if (!validation.isValid) {
            return NextResponse.json(
                { error: validation.error || 'Invalid VIN' },
                { status: 400 }
            );
        }

        // Get D1 database from context
        // @ts-expect-error - DB is available in Cloudflare Pages context
        const db = process.env.DB || request.env?.DB;

        if (!db) {
            // For local development, return mock response
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
