'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { User } from 'lucide-react';

interface Me {
    authenticated: boolean;
    name?: string | null;
    email?: string;
}

// Auth-aware desktop nav: "Log in / Sign up" when signed out, the user's name
// when signed in. Reads /api/account/me (no-store), so it reflects the real
// session without making every page dynamic.
export default function AccountNav() {
    const [me, setMe] = useState<Me | null>(null);

    useEffect(() => {
        let alive = true;
        fetch('/api/account/me', { cache: 'no-store' })
            .then((r) => r.json())
            .then((d) => { if (alive) setMe(d as Me); })
            .catch(() => { if (alive) setMe({ authenticated: false }); });
        return () => { alive = false; };
    }, []);

    // Reserve space until the session is known — avoids a logged-in→logged-out flash.
    if (!me) {
        return <span className="hidden md:block w-16" aria-hidden="true" />;
    }

    if (me.authenticated) {
        const label = me.name?.trim() || 'Account';
        return (
            <Link
                href="/account"
                className="hidden md:inline-flex items-center gap-1.5 text-sm font-medium text-slate-700 hover:text-slate-900 transition-colors max-w-[170px]"
            >
                <User className="w-4 h-4 shrink-0" aria-hidden="true" />
                <span className="truncate">{label}</span>
            </Link>
        );
    }

    return (
        <div className="hidden md:flex items-center gap-3">
            <Link href="/login" className="text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors">
                Log in
            </Link>
            <Link href="/register" className="text-sm font-semibold text-primary hover:underline">
                Sign up
            </Link>
        </div>
    );
}
