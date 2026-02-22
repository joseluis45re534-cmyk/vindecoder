export const runtime = "edge";

import { NextRequest, NextResponse } from "next/server";
import { getRequestContext } from "@cloudflare/next-on-pages";

export async function GET(request: NextRequest) {
    try {
        let db;
        try {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const { env } = getRequestContext();
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            if (env) db = (env as any).DB;
        } catch (e) {
            console.warn("Context not available inline");
        }

        if (!db) {
            return NextResponse.json({ error: "Database not available" }, { status: 500 });
        }

        // 1. Total Users
        const usersResult = await db.prepare("SELECT count(id) as count FROM users").first();
        const totalUsers = usersResult?.count || 0;

        // 2. Total Requests
        const requestsResult = await db.prepare("SELECT count(id) as count FROM vin_requests").first();
        const totalRequests = requestsResult?.count || 0;

        // 3. Completed Reports (for MVP, 'paid' and 'completed' both mean processed)
        const completedResult = await db.prepare("SELECT count(id) as count FROM vin_requests WHERE status IN ('paid', 'completed')").first();
        const completedReports = completedResult?.count || 0;

        // 4. Pending Requests
        const pendingResult = await db.prepare("SELECT count(id) as count FROM vin_requests WHERE status = 'pending'").first();
        const pendingRequests = pendingResult?.count || 0;

        // 5. Total Revenue (In a real app, track price at time of purchase. Using 2999 cents as hardcoded here if amount table doesn't exist)
        // Since schema.sql doesn't have an `amount` column, we'll estimate $29.99 per completed report for the MVP dashboard.
        const totalRevenue = completedReports * 29.99;

        return NextResponse.json({
            totalUsers,
            totalRequests,
            completedReports,
            pendingRequests,
            totalRevenue
        });

    } catch (error) {
        console.error("Failed to fetch admin analytics:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
