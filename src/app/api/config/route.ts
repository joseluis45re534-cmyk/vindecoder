export const runtime = "edge";

import { NextResponse } from "next/server";
import { getRequestContext } from "@cloudflare/next-on-pages";

export async function GET() {
    try {
        let kv;
        try {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const { env } = getRequestContext() as any;
            if (env) kv = env.CONFIG_KV;
        } catch {
            // Context not available in local dev
        }

        let reportPriceCent = 2999; // Default $29.99

        if (kv) {
            const settingsJson = await kv.get("admin_settings");
            if (settingsJson) {
                const settings = JSON.parse(settingsJson);
                if (settings.reportPriceCent) {
                    reportPriceCent = settings.reportPriceCent;
                }
            }
        }

        const reportPriceDollars = (reportPriceCent / 100).toFixed(2);

        return NextResponse.json({ reportPriceCent, reportPriceDollars });
    } catch (error) {
        console.error("Failed to fetch config:", error);
        // Return sensible defaults on error
        return NextResponse.json({ reportPriceCent: 2999, reportPriceDollars: "29.99" });
    }
}
