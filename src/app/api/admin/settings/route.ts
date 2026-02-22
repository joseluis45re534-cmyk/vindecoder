export const runtime = "edge";

import { NextRequest, NextResponse } from "next/server";
import { getRequestContext } from "@cloudflare/next-on-pages";

export async function GET() {
    try {
        let kv;
        try {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const { env } = getRequestContext();
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            if (env) kv = (env as any).CONFIG_KV;
        } catch {
            console.warn("Context not available inline");
        }

        if (!kv) {
            console.warn("CONFIG_KV binding not found. Falling back to defaults.");
            return NextResponse.json({ settings: { reportPriceCent: 2999, stripePublicKey: "" } });
        }

        const settingsJson = await kv.get("admin_settings");
        let settings = { reportPriceCent: 2999, stripePublicKey: "" };

        if (settingsJson) {
            settings = JSON.parse(settingsJson);
        }

        return NextResponse.json({ settings });
    } catch (error) {
        console.error("Failed to fetch admin settings:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();

        let kv;
        try {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const { env } = getRequestContext();
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            if (env) kv = (env as any).CONFIG_KV;
        } catch {
            console.warn("Context not available inline");
        }

        if (!kv) {
            return NextResponse.json({ error: "KV store not configured on server" }, { status: 500 });
        }

        await kv.put("admin_settings", JSON.stringify(body));

        return NextResponse.json({ success: true, settings: body });
    } catch (error) {
        console.error("Failed to save admin settings:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
