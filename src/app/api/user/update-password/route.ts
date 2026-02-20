import { NextResponse } from "next/server";
import { getRequestContext } from "@cloudflare/next-on-pages";
import { getSession, hashPassword } from "@/lib/auth";

export const runtime = "edge";

export async function POST(request: Request) {
    try {
        const session = await getSession();
        if (!session) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await request.json() as { newPassword?: string };
        const newPassword = body.newPassword;

        if (!newPassword || newPassword.length < 6) {
            return NextResponse.json(
                { error: "Password must be at least 6 characters" },
                { status: 400 }
            );
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
                return NextResponse.json({ success: true, mock: true });
            }
            return NextResponse.json({ error: "DB binding not found" }, { status: 500 });
        }

        const hashedPassword = await hashPassword(newPassword);

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        await db
            .prepare("UPDATE users SET password_hash = ? WHERE id = ?")
            .bind(hashedPassword, session.userId)
            .run();

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Update Password Error:", error);
        return NextResponse.json(
            { error: "Failed to update password" },
            { status: 500 }
        );
    }
}
