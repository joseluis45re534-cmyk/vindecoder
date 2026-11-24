'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Search, Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';

// VINs go straight to /report/[vin]: that page fetches the free preview from the
// report provider itself, so there is no extra pre-check that could reject a
// valid VIN (the old /api/check-vin round-trip depended on a separate decoder
// and blocked real VINs whenever it failed).
//
// License-plate search is NOT live yet — it ships with the ClearVin integration.
// Until then a plate gets an honest "coming soon" message instead of a fake
// result, so nobody hands over an email for a lookup we can't run.
const PLATE_SEARCH_LIVE = false;

const VIN_RE = /^[A-HJ-NPR-Z0-9]{17}$/;

type Notice = { kind: 'error' | 'plate'; text: string } | null;

export default function SearchForm() {
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const [notice, setNotice] = useState<Notice>(null);
    const router = useRouter();

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        setNotice(null);

        const clean = input.replace(/[^A-Z0-9]/gi, '').toUpperCase();

        if (clean.length === 17) {
            if (!VIN_RE.test(clean)) {
                setNotice({ kind: 'error', text: 'VINs never contain the letters I, O, or Q — double-check those characters (they are usually 1 or 0).' });
                return;
            }
            setLoading(true);
            router.push(`/report/${clean}`);
            return;
        }

        if (clean.length > 0 && clean.length <= 8) {
            if (!PLATE_SEARCH_LIVE) {
                setNotice({
                    kind: 'plate',
                    text: 'License-plate search is launching soon. For now, enter the 17-character VIN — it is on the lower-left corner of the windshield, the driver-side door jamb, and the title or registration.',
                });
                return;
            }
            // TODO(ClearVin): plate + state lookup (needs a state selector). Build
            // this branch BEFORE flipping PLATE_SEARCH_LIVE.
        }

        setNotice({ kind: 'error', text: 'Please enter a valid 17-character VIN.' });
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
                    placeholder="Enter a 17-character VIN"
                    aria-label="17-character VIN"
                    className="flex-1 min-w-0 bg-transparent pl-11 sm:pl-12 pr-2 py-3 sm:py-3.5 text-base sm:text-lg text-slate-900 placeholder:text-slate-400 focus:outline-none font-medium tracking-wide"
                    disabled={loading}
                    autoComplete="off"
                    spellCheck={false}
                    maxLength={24}
                    aria-invalid={notice?.kind === 'error' || undefined}
                    aria-describedby={notice ? 'vin-notice' : undefined}
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
            {/* Always-mounted live region so screen readers announce changes. */}
            <div id="vin-notice" role={notice?.kind === 'error' ? 'alert' : 'status'} aria-live={notice?.kind === 'error' ? 'assertive' : 'polite'}>
            {notice && (
                <p
                    className={
                        notice.kind === 'plate'
                            ? 'mt-4 text-sky-100 bg-sky-500/20 border border-sky-300/30 px-4 py-2.5 rounded-xl text-sm inline-block backdrop-blur text-left'
                            : 'mt-4 text-red-200 bg-red-500/20 border border-red-400/30 px-4 py-2 rounded-xl text-sm inline-block backdrop-blur'
                    }
                >
                    {notice.text}{' '}
                    {notice.kind === 'plate' && (
                        <Link href="/how-to/check-vin-number" className="underline font-semibold hover:text-white">
                            Where to find your VIN
                        </Link>
                    )}
                </p>
            )}
            </div>
        </div>
    );
}
