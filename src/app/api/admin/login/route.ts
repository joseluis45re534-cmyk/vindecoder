export const runtime = "edge";

import { NextResponse } from "next/server";
import { SignJWT } from "jose";
import { getRequestContext } from "@cloudflare/next-on-pages";

export async function POST(req: Request) {
    try {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const body = (await req.json()) as any;
        const { email, password } = body;

        let ADMIN_EMAIL = process.env.ADMIN_EMAIL;
        let ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;

        try {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const { env } = getRequestContext() as any;
            if (env?.ADMIN_EMAIL) ADMIN_EMAIL = env.ADMIN_EMAIL;
            if (env?.ADMIN_PASSWORD) ADMIN_PASSWORD = env.ADMIN_PASSWORD;
        } catch {
            console.warn("Context not available inline");
        }

        if (!ADMIN_EMAIL || !ADMIN_PASSWORD) {
            console.error("Missing ADMIN_EMAIL or ADMIN_PASSWORD in environment variables");
            return NextResponse.json({ error: "Server configuration error" }, { status: 500 });
        }

        if (email !== ADMIN_EMAIL || password !== ADMIN_PASSWORD) {
            return NextResponse.json({ error: "Invalid admin credentials" }, { status: 401 });
        }

        // Generate JWT
        const secret = new TextEncoder().encode(process.env.JWT_SECRET || 'dev-secret-key-change-in-production');
        console.log("Signing Admin JWT using secret key...");
        const alg = "HS256";

        const token = await new SignJWT({ email, role: "admin" })
            .setProtectedHeader({ alg })
            .setIssuedAt()
            .setExpirationTime("24h")
            .sign(secret);

        const response = NextResponse.json({ success: true });

        // Set HTTP-only cookie
        response.cookies.set({
            name: "adminToken",
            value: token,
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
            path: "/",
            maxAge: 60 * 60 * 24, // 24 hours
        });

        return response;
    } catch (error) {
        console.error("Admin login error:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
