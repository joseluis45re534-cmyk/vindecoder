import { NextRequest, NextResponse } from 'next/server';
import { getAuthUserServer } from '@/lib/auth-server';
import { getRequestContext } from '@cloudflare/next-on-pages';

export const runtime = 'edge';

// Mock Data Generator
const generateMockReport = (vin: string) => {
    // const recordsFound = Math.floor(Math.random() * 5) + 1;
    const isStolen = Math.random() < 0.05; // 5% chance
    const isWrittenOff = Math.random() < 0.1; // 10% chance
    const financeOwing = Math.random() < 0.15; // 15% chance

    return {
        vin,
        reportDate: new Date().toISOString(),
        vehicleDetails: {
            make: "TOYOTA",
            model: "CAMRY",
            year: 2020,
            bodyType: "SEDAN",
            colour: "WHITE",
            engineNumber: `ENGINE${Math.floor(Math.random() * 100000)}`,
            registration: {
                state: "NSW",
                expiry: new Date(Date.now() + 1000 * 60 * 60 * 24 * 180).toISOString(), // 6 months from now
                status: "CURRENT"
            }
        },
        ppsr: {
            stolen: isStolen ? "STOLEN RECORD FOUND" : "NO STOLEN RECORD",
            writtenOff: isWrittenOff ? "WRITTEN-OFF RECORD FOUND" : "NO WRITTEN-OFF RECORD",
            finance: financeOwing ? "FINANCE OWING" : "NO FINANCE INTEREST",
            encumbrance: []
        },
        nevdis: {
            stolen: isStolen ? "STOLEN" : "CLEAR",
            writtenOff: isWrittenOff ? "WRITTEN-OFF" : "CLEAR"
        },
        odometer: {
            status: "CONSISTENT",
            readings: [
                { date: "2023-01-15", reading: 45000, source: "Service Record" },
                { date: "2024-01-15", reading: 60000, source: "Service Record" }
            ]
        }
    };
};

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
                const mockReport = generateMockReport("MOCK-VIN-12345"); // Use a placeholder VIN or derive if possible, but request ID is number
                return NextResponse.json({
                    success: true,
                    report: mockReport,
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

        // 4. Generate Mock Data
        const reportData = generateMockReport(vinRequest.vin_number);
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
