export const runtime = "edge";

import { NextRequest, NextResponse } from "next/server";

// Mock Data Generator
const generateMockReport = (vin: string) => {
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
                expiry: new Date(Date.now() + 1000 * 60 * 60 * 24 * 180).toISOString(),
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
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const body = (await request.json()) as any;
        const { requestId, vin } = body;

        if (!requestId || !vin) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }

        // @ts-expect-error - DB is available in Cloudflare Pages context
        const db = process.env.DB || request.env?.DB;

        if (!db) {
            return NextResponse.json({ error: "Database not available" }, { status: 500 });
        }

        console.log(`[Admin] Manually triggering report generation for request ${requestId} (VIN: ${vin})`);

        // Generate the report data
        const reportData = generateMockReport(vin);

        // Save report to db
        await db.prepare('INSERT INTO vin_reports (vin_request_id, report_data) VALUES (?, ?)')
            .bind(requestId, JSON.stringify(reportData))
            .run();

        // Update the request status to completed
        await db.prepare('UPDATE vin_requests SET status = "completed" WHERE id = ?')
            .bind(requestId)
            .run();

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Failed to trigger report:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
