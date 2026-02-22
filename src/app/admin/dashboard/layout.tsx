export const runtime = "edge";

import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { jwtVerify } from "jose";
import Link from "next/link";
import { LayoutDashboard, Settings, LogOut, FileText } from "lucide-react";
import { ModeToggle } from "@/components/theme-toggle";

export default async function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    // Double check authentication
    const cookieStore = await cookies();
    const token = cookieStore.get("adminToken")?.value;

    if (!token) {
        redirect("/admin/login");
    }

    try {
        const secret = new TextEncoder().encode(process.env.JWT_SECRET || 'dev-secret-key-change-in-production');
        await jwtVerify(token, secret);
    } catch {
        // Ignored
        redirect("/admin/login");
    }

    const navItems = [
        { name: "Overview", href: "/admin/dashboard", icon: LayoutDashboard },
        { name: "All Requests", href: "/admin/dashboard/requests", icon: FileText },
        { name: "System Settings", href: "/admin/dashboard/settings", icon: Settings },
    ];

    return (
        <div className="flex h-screen bg-slate-50 dark:bg-slate-950 overflow-hidden">
            {/* Sidebar */}
            <aside className="w-64 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 flex flex-col">
                <div className="h-16 flex items-center px-6 border-b border-slate-200 dark:border-slate-800">
                    <span className="text-xl font-bold text-primary">Admin Control</span>
                </div>

                <nav className="flex-1 px-4 py-6 space-y-2">
                    {navItems.map((item) => (
                        <Link
                            key={item.name}
                            href={item.href}
                            className="flex items-center gap-3 px-4 py-3 rounded-lg text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-primary dark:hover:text-primary transition-colors font-medium"
                        >
                            <item.icon className="w-5 h-5" />
                            {item.name}
                        </Link>
                    ))}
                </nav>

                <div className="p-4 border-t border-slate-200 dark:border-slate-800 flex justify-between items-center">
                    <ModeToggle />
                    <form action={async () => {
                        "use server";
                        const c = await cookies();
                        c.delete("adminToken");
                        redirect("/admin/login");
                    }}>
                        <button type="submit" className="p-2 text-slate-500 hover:text-red-500 rounded-lg hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors">
                            <LogOut className="w-5 h-5" />
                            <span className="sr-only">Logout</span>
                        </button>
                    </form>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 overflow-y-auto">
                <div className="p-8">
                    {children}
                </div>
            </main>
        </div>
    );
}
