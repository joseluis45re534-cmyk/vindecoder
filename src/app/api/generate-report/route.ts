import { NextRequest, NextResponse } from 'next/server';
import { getAuthUserServer } from '@/lib/auth-server';
import { getRequestContext } from '@cloudflare/next-on-pages';

export const runtime = 'edge';

import { fetchLiveVehicleData } from '@/lib/car-api';

export async function POST(request: NextRequest) {
    try {
        // 1. Verify Authentication
        const user = await getAuthUserServer();
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Parse Request
        let vinRequestId;
        try {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const body = (await request.json()) as any;
            vinRequestId = body.vinRequestId;
        } catch (e) {
            console.error("JSON Parse Error:", e);
            return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
        }

        if (!vinRequestId) {
            return NextResponse.json({ error: 'VIN Request ID is required' }, { status: 400 });
        }

        // DB Connection
        let db;
        try {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const { env } = getRequestContext();
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            if (env) db = (env as any).DB;
        } catch {
            // Context not available (likely local dev)
        }

        // --- LOCAL DEV FALLBACK ---
        if (!db) {
            if (process.env.NODE_ENV === 'development') {
                const liveData = await fetchLiveVehicleData("MOCK-VIN-12345");
                return NextResponse.json({
                    success: true,
                    report: liveData,
                    isNew: true
                });
            }

            return NextResponse.json({ error: 'Database Binding Missing' }, { status: 500 });
        }

        // 2. Verify VIN Request exists and is paid
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const vinRequest: any = await db.prepare(
            'SELECT * FROM vin_requests WHERE id = ? AND user_id = ?'
        ).bind(vinRequestId, user.userId).first();

        if (!vinRequest) {
            return NextResponse.json({ error: 'VIN Request not found' }, { status: 404 });
        }

        if (vinRequest.status !== 'paid') {
            return NextResponse.json({ error: 'Payment required to generate report' }, { status: 402 });
        }

        // 3. Check if report already exists
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const existingReport: any = await db.prepare(
            'SELECT * FROM vin_reports WHERE vin_request_id = ?'
        ).bind(vinRequestId).first();

        if (existingReport) {
            return NextResponse.json({
                success: true,
                report: JSON.parse(existingReport.report_data),
                isNew: false
            });
        }

        // 4. Generate Live Data
        const reportData = await fetchLiveVehicleData(vinRequest.vin_number);

        if (!reportData) {
            return NextResponse.json({ error: 'Failed to fetch vehicle history from registry.' }, { status: 502 });
        }

        const reportJson = JSON.stringify(reportData);

        // 5. Store in Database
        await db.prepare(
            'INSERT INTO vin_reports (vin_request_id, report_data) VALUES (?, ?)'
        ).bind(vinRequestId, reportJson).run();

        return NextResponse.json({
            success: true,
            report: reportData,
            isNew: true
        });

    } catch (error: unknown) {
        console.error('Report generation error:', error);
        return NextResponse.json({
            error: 'Internal Server Error',
        }, { status: 500 });
    }
}
