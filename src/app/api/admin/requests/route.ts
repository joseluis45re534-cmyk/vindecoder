export const runtime = "edge";

import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
    try {
        // @ts-expect-error - DB is available in Cloudflare Pages context
        const db = process.env.DB || request.env?.DB;

        if (!db) {
            return NextResponse.json({ error: "Database not available" }, { status: 500 });
        }

        // Fetch requests and join with users table to get the email
        const { results } = await db.prepare(`
            SELECT 
                r.id, 
                r.vin_number, 
                r.status, 
                r.created_at, 
                u.email as user_email 
            FROM vin_requests r
            LEFT JOIN users u ON r.user_id = u.id
            ORDER BY r.created_at DESC
            LIMIT 50
        `).all();

        return NextResponse.json({ requests: results });
    } catch (error) {
        console.error("Failed to fetch admin requests:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
