import { NextRequest, NextResponse } from "next/server";
import { getAuthUser } from "@/lib/auth-middleware";

export const runtime = 'edge';

export async function GET(req: NextRequest) {
    try {
        const user = await getAuthUser(req);
        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        // @ts-expect-error - DB is available in Cloudflare Pages context
        const db = process.env.DB || req.env?.DB;

        if (!db) {
            return NextResponse.json({ error: "Database not available" }, { status: 500 });
        }

        const { results: reports } = await db.prepare(
            `SELECT 
                vr.id, 
                vr.vin, 
                vr.status, 
                vr.created_at,
                rep.pdf_url
             FROM vin_requests vr
             LEFT JOIN vin_reports rep ON vr.vin = rep.vin
             WHERE vr.user_id = ?
             ORDER BY vr.created_at DESC`
        ).bind(user.userId).all();

        return NextResponse.json({ reports });
    } catch (error) {
        console.error("Dashboard Reports Error:", error);
        return NextResponse.json({ error: "Failed to fetch reports" }, { status: 500 });
    }
}
