export const runtime = "edge";

import { NextResponse } from "next/server";
import { getRequestContext } from "@cloudflare/next-on-pages";

export async function GET() {
    try {
        let db;
        try {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const { env } = getRequestContext();
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            if (env) db = (env as any).DB;
        } catch {
            console.warn("Context not available inline");
        }

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
