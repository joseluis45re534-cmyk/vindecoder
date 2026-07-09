'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Menu, X } from 'lucide-react';

const LINKS = [
  { href: '/#how-it-works', label: 'How it works' },
  { href: '/vin-check', label: 'VIN check by brand' },
  { href: '/pricing', label: 'Pricing' },
  { href: '/how-to', label: 'How-to guides' },
  { href: '/blog', label: 'Blog' },
  { href: '/#faq', label: 'FAQ' },
];

interface Me {
  authenticated: boolean;
  name?: string | null;
}

export default function MobileMenu() {
  const [open, setOpen] = useState(false);
  const [me, setMe] = useState<Me | null>(null);

  // Lock body scroll while the menu is open.
  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [open]);

  // Resolve session state for the auth links.
  useEffect(() => {
    let alive = true;
    fetch('/api/account/me', { cache: 'no-store' })
      .then((r) => r.json())
      .then((d) => { if (alive) setMe(d as Me); })
      .catch(() => { if (alive) setMe({ authenticated: false }); });
    return () => { alive = false; };
  }, []);

  return (
    <div className="md:hidden">
      <button
        onClick={() => setOpen((v) => !v)}
        aria-label={open ? 'Close menu' : 'Open menu'}
        aria-expanded={open}
        className="w-10 h-10 flex items-center justify-center rounded-xl text-slate-700 hover:bg-slate-100 active:scale-90 transition-all"
      >
        <span className="relative w-6 h-6">
          <Menu
            className={`w-6 h-6 absolute inset-0 transition-all duration-300 ${open ? 'opacity-0 rotate-90 scale-50' : 'opacity-100'}`}
            aria-hidden="true"
          />
          <X
            className={`w-6 h-6 absolute inset-0 transition-all duration-300 ${open ? 'opacity-100' : 'opacity-0 -rotate-90 scale-50'}`}
            aria-hidden="true"
          />
        </span>
      </button>

      {/* Overlay */}
      <div
        onClick={() => setOpen(false)}
        className={`fixed inset-0 top-16 bg-slate-900/40 backdrop-blur-sm z-40 transition-opacity duration-300 ${
          open ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        aria-hidden="true"
      />

      {/* Panel */}
      <div
        className={`fixed left-0 right-0 top-16 z-50 bg-white border-b border-slate-200 shadow-xl origin-top transition-all duration-300 ${
          open ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4 pointer-events-none'
        }`}
      >
        <nav className="px-4 py-4 flex flex-col">
          {LINKS.map((l, i) => (
            <Link
              key={l.href}
              href={l.href}
              onClick={() => setOpen(false)}
              style={{ transitionDelay: open ? `${i * 40}ms` : '0ms' }}
              className={`py-3.5 px-2 text-base font-semibold text-slate-700 border-b border-slate-100 last:border-0 hover:text-blue-600 transition-all ${
                open ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-2'
              }`}
            >
              {l.label}
            </Link>
          ))}
          {me?.authenticated ? (
            <Link
              href="/account"
              onClick={() => setOpen(false)}
              className="py-3.5 px-2 text-base font-semibold text-slate-700 border-b border-slate-100 hover:text-blue-600 transition-colors truncate"
            >
              {me.name?.trim() ? `${me.name} · My account` : 'My account'}
            </Link>
          ) : (
            <div className="flex gap-3 mt-2">
              <Link
                href="/login"
                onClick={() => setOpen(false)}
                className="flex-1 text-center py-3 rounded-full border border-slate-200 text-base font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
              >
                Log in
              </Link>
              <Link
                href="/register"
                onClick={() => setOpen(false)}
                className="flex-1 text-center py-3 rounded-full bg-slate-900 text-white text-base font-semibold hover:bg-slate-800 transition-colors"
              >
                Sign up
              </Link>
            </div>
          )}
          <a
            href="/#vin-search"
            onClick={() => setOpen(false)}
            className="mt-4 bg-blue-600 hover:bg-blue-700 text-white text-center font-semibold px-5 py-3.5 rounded-full shadow-md shadow-blue-600/25 active:scale-[0.98] transition-all"
          >
            Run a VIN check
          </a>
        </nav>
      </div>
    </div>
  );
}
