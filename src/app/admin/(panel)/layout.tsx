import type { Metadata } from "next";
import Link from "next/link";
import {
  LayoutDashboard,
  CreditCard,
  Users,
  Tags,
  BarChart3,
  Newspaper,
  Settings,
  ShieldCheck,
  Inbox,
} from "lucide-react";
import AdminLogout from "@/components/admin/AdminLogout";
import AdminMobileNav from "@/components/admin/AdminMobileNav";

export const metadata: Metadata = {
  title: "Admin",
  robots: { index: false, follow: false },
};

const NAV = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/inbox", label: "Inbox", icon: Inbox },
  { href: "/admin/orders", label: "Payments", icon: CreditCard },
  { href: "/admin/pricing", label: "Pricing", icon: Tags },
  { href: "/admin/users", label: "Users", icon: Users },
  { href: "/admin/analytics", label: "Analytics", icon: BarChart3 },
  { href: "/admin/blog", label: "Blog", icon: Newspaper },
  { href: "/admin/settings", label: "Settings", icon: Settings },
];

export default function AdminLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <div className="min-h-screen bg-slate-100 flex">
      {/* Sidebar */}
      <aside className="hidden md:flex w-60 shrink-0 flex-col bg-slate-950 text-slate-300 fixed inset-y-0">
        <div className="h-16 flex items-center gap-2 px-5 border-b border-white/10">
          <span className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center">
            <ShieldCheck className="w-4 h-4 text-white" aria-hidden="true" />
          </span>
          <span className="font-extrabold text-white tracking-tight">CVL Admin</span>
        </div>
        <nav className="flex-1 p-3 space-y-1">
          {NAV.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium hover:bg-white/10 hover:text-white transition-colors"
            >
              <Icon className="w-4 h-4" aria-hidden="true" />
              {label}
            </Link>
          ))}
        </nav>
        <div className="p-3 border-t border-white/10">
          <AdminLogout />
        </div>
      </aside>

      {/* Content */}
      <div className="flex-1 md:ml-60">
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-4 sm:px-6 sticky top-0 z-30">
          <div className="flex items-center gap-2">
            <AdminMobileNav />
            <h1 className="font-bold text-slate-900">Admin Panel</h1>
          </div>
          <Link href="/" className="text-sm text-slate-500 hover:text-slate-900">View site →</Link>
        </header>
        <main className="p-4 sm:p-6">{children}</main>
      </div>
    </div>
  );
}
