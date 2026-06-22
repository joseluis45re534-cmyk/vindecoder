'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
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
  Menu,
  X,
} from 'lucide-react';
import AdminLogout from '@/components/admin/AdminLogout';

const NAV = [
  { href: '/admin', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/admin/inbox', label: 'Inbox', icon: Inbox },
  { href: '/admin/orders', label: 'Payments', icon: CreditCard },
  { href: '/admin/pricing', label: 'Pricing', icon: Tags },
  { href: '/admin/users', label: 'Users', icon: Users },
  { href: '/admin/analytics', label: 'Analytics', icon: BarChart3 },
  { href: '/admin/blog', label: 'Blog', icon: Newspaper },
  { href: '/admin/settings', label: 'Settings', icon: Settings },
];

export default function AdminMobileNav() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [open]);

  return (
    <div className="md:hidden">
      <button
        onClick={() => setOpen(true)}
        aria-label="Open admin menu"
        className="w-10 h-10 flex items-center justify-center rounded-xl text-slate-700 hover:bg-slate-100 active:scale-90 transition-all"
      >
        <Menu className="w-6 h-6" aria-hidden="true" />
      </button>

      {/* Overlay */}
      <div
        onClick={() => setOpen(false)}
        className={`fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 transition-opacity duration-300 ${
          open ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        aria-hidden="true"
      />

      {/* Drawer */}
      <aside
        className={`fixed inset-y-0 left-0 w-64 bg-slate-950 text-slate-300 z-50 flex flex-col transition-transform duration-300 ${
          open ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="h-16 flex items-center justify-between px-5 border-b border-white/10">
          <span className="flex items-center gap-2">
            <span className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center">
              <ShieldCheck className="w-4 h-4 text-white" aria-hidden="true" />
            </span>
            <span className="font-extrabold text-white tracking-tight">CVL Admin</span>
          </span>
          <button onClick={() => setOpen(false)} aria-label="Close menu" className="text-slate-400 hover:text-white active:scale-90 transition-all">
            <X className="w-6 h-6" aria-hidden="true" />
          </button>
        </div>
        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          {NAV.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              onClick={() => setOpen(false)}
              className="flex items-center gap-3 px-3 py-3 rounded-lg text-sm font-medium hover:bg-white/10 hover:text-white active:bg-white/20 transition-colors"
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
    </div>
  );
}
