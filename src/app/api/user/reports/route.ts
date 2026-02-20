import { NextResponse } from "next/server";
import { getRequestContext } from "@cloudflare/next-on-pages";
import { getSession } from "@/lib/auth";

export const runtime = "edge";

export async function GET() {
    try {
        const session = await getSession();
        if (!session) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

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
            // Mock for local dev
            if (process.env.NODE_ENV === "development") {
                return NextResponse.json({
                    reports: [
                        { id: 1, vin_number: "MOCK1234567890VIN", status: "paid", created_at: new Date().toISOString() },
                        { id: 2, vin_number: "PENDING987654321", status: "pending", created_at: new Date().toISOString() },
                    ],
                });
            }
            return NextResponse.json({ error: "DB binding not found" }, { status: 500 });
        }

        // Fetch vin_requests for the user
        // We do a LEFT JOIN with vin_reports just in case we need report data, 
        // but for the list view, the request status and VIN are usually enough.
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { results } = await db
            .prepare(`
                SELECT r.id, r.vin_number, r.status, r.created_at, 
                       CASE WHEN rep.id IS NOT NULL THEN 1 ELSE 0 END as has_report
                FROM vin_requests r
                LEFT JOIN vin_reports rep ON r.id = rep.vin_request_id
                WHERE r.user_id = ?
                ORDER BY r.created_at DESC
            `)
            .bind(session.userId)
            .all();

        return NextResponse.json({ reports: results });
    } catch (error) {
        console.error("Fetch Reports Error:", error);
        return NextResponse.json(
            { error: "Failed to fetch reports" },
            { status: 500 }
        );
    }
}
