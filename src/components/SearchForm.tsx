
'use client';

import { useState } from 'react';
import { Search, Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';

export default function SearchForm() {
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const router = useRouter();

    const validateInput = (value: string) => {
        const clean = value.replace(/[^A-Z0-9]/gi, '').toUpperCase();
        if (clean.length === 17 && !/[IOQ]/.test(clean)) return { type: 'VIN', value: clean };
        if (clean.length > 0 && clean.length <= 8) return { type: 'PLATE', value: clean };
        return null;
    };

    const handleSearch = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        const valid = validateInput(input);
        if (!valid) {
            setError('Please enter a valid 17-character VIN or U.S. license plate.');
            return;
        }

        setLoading(true);

        try {
            const response = await fetch('/api/check-vin', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ [valid.type.toLowerCase()]: valid.value }),
            });
            const data = await response.json() as any;

            if (data.success && data.reportId) {
                router.push(`/report/${data.reportId}`);
            } else {
                setError(data.error || 'Failed to generate report.');
            }
        } catch (err) {
            setError('An unexpected error occurred.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="w-full max-w-xl mx-auto">
            <form
                onSubmit={handleSearch}
                className="relative bg-white rounded-full p-1.5 sm:p-2 shadow-2xl shadow-blue-950/40 ring-1 ring-white/20 flex items-center transition-shadow focus-within:shadow-blue-500/30 focus-within:ring-blue-400/40"
            >
                <Search className="absolute left-4 sm:left-6 text-slate-400 w-5 h-5 pointer-events-none" aria-hidden="true" />
                <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value.toUpperCase())}
                    placeholder="Enter VIN or plate"
                    aria-label="VIN or U.S. license plate"
                    className="flex-1 min-w-0 bg-transparent pl-11 sm:pl-12 pr-2 py-3 sm:py-3.5 text-base sm:text-lg text-slate-900 placeholder:text-slate-400 focus:outline-none font-medium tracking-wide"
                    disabled={loading}
                    autoComplete="off"
                    spellCheck={false}
                />
                <button
                    type="submit"
                    disabled={loading || !input}
                    className="shrink-0 bg-orange-600 hover:bg-orange-500 text-white rounded-full px-5 sm:px-7 py-3 sm:py-3.5 font-bold disabled:opacity-50 disabled:hover:bg-orange-600 transition-all active:scale-95 flex items-center justify-center min-w-[88px] sm:min-w-[130px] shadow-md shadow-orange-600/30"
                >
                    {loading ? (
                        <Loader2 className="w-5 h-5 animate-spin" aria-label="Searching" />
                    ) : (
                        <>
                            <span className="sm:hidden">Check</span>
                            <span className="hidden sm:inline">Check VIN</span>
                        </>
                    )}
                </button>
            </form>
            {error && (
                <p className="mt-4 text-red-200 bg-red-500/20 border border-red-400/30 px-4 py-2 rounded-xl text-sm inline-block backdrop-blur">
                    {error}
                </p>
            )}
        </div>
    );
}
