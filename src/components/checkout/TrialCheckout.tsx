'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { motion, useReducedMotion } from 'framer-motion';
import { Loader2, Lock, ShieldCheck } from 'lucide-react';
import { trialDisclosure } from '@/lib/stripe-billing';
import { track } from '@/lib/track';

// The trial CTA: a required consent checkbox gates a single "Start for $1 today"
// button that opens hosted Stripe Checkout, followed by the plain-text disclosure.
// Account-first: if the user isn't signed in, checkout returns 401 and we route
// them to register, then resume automatically here (via ?checkout=1).
export default function TrialCheckout({ reportId }: { reportId: string }) {
    const reduce = useReducedMotion();
    const search = useSearchParams();
    const [consent, setConsent] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const resumed = useRef(false);

    const doCheckout = useCallback(async () => {
        setLoading(true);
        setError('');
        track('checkout_started', { reportId }); // funnel: reached hosted checkout
        try {
            const res = await fetch('/api/checkout/stripe', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ planId: 'trial', reportId }),
            });
            if (res.status === 401) {
                // Not signed in — create an account, then come back and resume.
                const next = encodeURIComponent(`/report/${reportId}?checkout=1`);
                window.location.href = `/register?next=${next}`;
                return;
            }
            const data = (await res.json()) as { url?: string; error?: string };
            if (res.ok && data.url) window.location.href = data.url;
            else setError(data.error || 'Checkout failed');
        } catch {
            setError('Network error — please try again.');
        } finally {
            setLoading(false);
        }
    }, [reportId]);

    // Resume checkout once, automatically, after returning from register/sign-in.
    useEffect(() => {
        if (!resumed.current && search.get('checkout') === '1') {
            resumed.current = true;
            doCheckout();
        }
    }, [search, doCheckout]);

    const start = () => {
        if (consent && !loading) doCheckout();
    };

    const interactive = !reduce && consent;

    return (
        <div>
            <label className="flex items-start gap-2.5 mb-3 cursor-pointer text-xs text-slate-600 select-none">
                <input
                    type="checkbox"
                    checked={consent}
                    onChange={(e) => setConsent(e.target.checked)}
                    className="mt-0.5 h-4 w-4 accent-primary cursor-pointer rounded focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
                />
                <span>I understand and agree to the trial terms below.</span>
            </label>

            <motion.button
                type="button"
                onClick={start}
                disabled={!consent || loading}
                whileHover={interactive ? { scale: 1.02 } : undefined}
                whileTap={interactive ? { scale: 0.97 } : undefined}
                aria-label="Start your report for $1 today"
                className="w-full flex items-center justify-center gap-2 font-bold py-3.5 rounded-xl bg-accent text-white shadow-md shadow-accent/25 transition-[filter,opacity] hover:brightness-110 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus-visible:ring-2 focus-visible:ring-accent/60 focus-visible:ring-offset-2"
            >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" /> : <Lock className="w-4 h-4" aria-hidden="true" />}
                Start for $1 today
            </motion.button>

            {error && (
                <p className="text-xs text-red-600 text-center mt-2" role="alert">
                    {error}
                </p>
            )}

            <p className="text-[11px] leading-relaxed text-slate-500 mt-3 text-center">{trialDisclosure()}</p>
            <p className="flex items-center justify-center gap-1.5 text-[11px] text-slate-400 mt-2">
                <ShieldCheck className="w-3.5 h-3.5 text-security" aria-hidden="true" /> Secured by Stripe · cancel anytime
            </p>
        </div>
    );
}
