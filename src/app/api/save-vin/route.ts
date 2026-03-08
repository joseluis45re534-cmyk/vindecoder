import { NextRequest, NextResponse } from 'next/server';
import { getAuthUser } from '@/lib/auth-middleware';
import { validateVinOrRego } from '@/lib/vin-validation';
import { fetchLiveVehicleData } from '@/lib/car-api';
import { getRequestContext } from '@cloudflare/next-on-pages';

export const runtime = 'edge';

const MAX_PENDING_PER_USER = 5;

export async function POST(request: NextRequest) {
    try {
        // Check authentication
        const authUser = await getAuthUser(request);
        const currentUser = authUser || { userId: 0, email: 'guest@vindecoder.com.au' };

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { vin } = (await request.json()) as any;

        // Validate VIN
        const validation = validateVinOrRego(vin);
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
                        user_id: currentUser.userId,
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

        // Per-user VIN spam check: max pending requests for logged in users
        if (currentUser.userId !== 0) {
            const pendingCount = await db
                .prepare('SELECT COUNT(*) as cnt FROM vin_requests WHERE user_id = ? AND status = ?')
                .bind(currentUser.userId, 'pending')
                .first();

            if (pendingCount && (pendingCount as { cnt: number }).cnt >= MAX_PENDING_PER_USER) {
                return NextResponse.json(
                    { error: `You have reached the maximum of ${MAX_PENDING_PER_USER} pending VIN requests. Please complete or cancel existing ones first.` },
                    { status: 429 }
                );
            }
        }

        // Fetch basic preview data from live API before saving
        let previewDataJson = null;
        try {
            let apiUser = undefined;
            let apiPass = undefined;

            try {
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                const { env } = getRequestContext() as any;
                if (env?.CONFIG_KV) {
                    const settingsJson = await env.CONFIG_KV.get("admin_settings");
                    if (settingsJson) {
                        const settings = JSON.parse(settingsJson);
                        apiUser = settings.carRegApiUser;
                        apiPass = settings.carRegApiPass;
                    }
                }
            } catch {
                // Ignore KV errors
            }

            const liveData = await fetchLiveVehicleData(vin.toUpperCase(), 'NSW', apiUser, apiPass);
            if (liveData && liveData.vehicleInfo) {
                previewDataJson = JSON.stringify({
                    make: liveData.vehicleInfo.make,
                    model: liveData.vehicleInfo.model,
                    year: liveData.vehicleInfo.year,
                    image: liveData.images?.[0] || null,
                    stolen: liveData.stolenCheck?.status === 'stolen'
                });
            }
        } catch (apiErr) {
            console.error('Failed to fetch preview data:', apiErr);
            // Non-blocking: we still generate the db record even if preview fails
        }

        // Insert VIN request with preview data
        const result = await db
            .prepare(
                'INSERT INTO vin_requests (user_id, vin_number, status, preview_data) VALUES (?, ?, ?, ?)'
            )
            .bind(currentUser.userId, vin.toUpperCase(), 'pending', previewDataJson)
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
