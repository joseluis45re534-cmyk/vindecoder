// src/app/dashboard/layout.tsx
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import Link from "next/link";
import { LayoutDashboard, Settings } from "lucide-react";

export const runtime = "edge";

export default async function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const session = await getSession();

    if (!session) {
        redirect("/login?redirect=/dashboard");
    }

    return (
        <div className="flex min-h-[calc(100vh-4rem)] flex-col md:flex-row">
            {/* Sidebar */}
            <aside className="w-full md:w-64 border-r border-border/50 bg-muted/20 p-6 flex flex-col gap-2">
                <div className="mb-4">
                    <h2 className="text-lg font-bold tracking-tight">Dashboard</h2>
                    <p className="text-sm text-muted-foreground">{session.email}</p>
                </div>

                <nav className="flex flex-col gap-1">
                    <Link
                        href="/dashboard"
                        className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium hover:bg-muted transition-colors active:bg-muted"
                    >
                        <LayoutDashboard className="h-4 w-4" />
                        My Reports
                    </Link>
                    <Link
                        href="/dashboard/settings"
                        className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium hover:bg-muted transition-colors active:bg-muted"
                    >
                        <Settings className="h-4 w-4" />
                        Account Settings
                    </Link>
                </nav>
            </aside>

            {/* Main Content */}
            <main className="flex-1 p-6 md:p-8 overflow-y-auto w-full max-w-[1200px] mx-auto">
                {children}
            </main>
        </div>
    );
}
