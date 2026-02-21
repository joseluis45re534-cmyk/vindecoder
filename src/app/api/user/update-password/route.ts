import { NextRequest, NextResponse } from "next/server";
import { getAuthUser } from "@/lib/auth-middleware";
import bcryptjs from "bcryptjs";

export const runtime = 'edge';

export async function POST(req: NextRequest) {
    try {
        const user = await getAuthUser(req);
        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        // Use type assertion to avoid `unknown` type errors during build
        const body = (await req.json()) as { currentPassword?: string; newPassword?: string };
        const { currentPassword, newPassword } = body;

        if (!currentPassword || !newPassword) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }

        if (newPassword.length < 8) {
            return NextResponse.json({ error: "New password must be at least 8 characters" }, { status: 400 });
        }

        // @ts-expect-error - DB is available in Cloudflare Pages context
        const db = process.env.DB || req.env?.DB;

        if (!db) {
            return NextResponse.json({ error: "Database not available" }, { status: 500 });
        }

        // 1. Fetch current user from DB to verify old password
        const dbUser = await db.prepare(
            "SELECT * FROM users WHERE id = ?"
        ).bind(user.userId).first();

        if (!dbUser) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        // 2. Verify current password
        // The password hash is stored dynamically based on the schema, but typically it is 'password_hash'
        const storedHash = (dbUser as Record<string, unknown>).password_hash as string;

        if (!storedHash) {
            return NextResponse.json({ error: "Invalid account state" }, { status: 500 });
        }

        const isValid = await bcryptjs.compare(currentPassword, storedHash);

        if (!isValid) {
            return NextResponse.json({ error: "Incorrect current password" }, { status: 401 });
        }

        // 3. Hash new password
        const salt = await bcryptjs.genSalt(10);
        const newHash = await bcryptjs.hash(newPassword, salt);

        // 4. Update password in DB
        await db.prepare(
            "UPDATE users SET password_hash = ? WHERE id = ?"
        ).bind(newHash, user.userId).run();

        return NextResponse.json({ message: "Password updated successfully" });
    } catch (error) {
        console.error("Update Password Error:", error);
        return NextResponse.json({ error: "Failed to update password" }, { status: 500 });
    }
}
