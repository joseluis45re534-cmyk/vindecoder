'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { LogOut, Loader2 } from 'lucide-react';

export default function LogoutButton() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);

    const logout = async () => {
        setLoading(true);
        try {
            await fetch('/api/auth/logout', { method: 'POST' });
            router.push('/');
            router.refresh();
        } finally {
            setLoading(false);
        }
    };

    return (
        <button
            type="button"
            onClick={logout}
            disabled={loading}
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-slate-500 hover:text-slate-800 disabled:opacity-60 transition-colors"
        >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" /> : <LogOut className="w-4 h-4" aria-hidden="true" />}
            Sign out
        </button>
    );
}
