'use client';

import { useState } from 'react';
import { Loader2, Settings } from 'lucide-react';

// Opens the Stripe Customer Portal (cancel / manage). Resolves the customer from
// the Checkout session_id server-side (see api/billing/portal).
export default function ManageSubscriptionButton({
    sessionId,
    reportId,
}: {
    sessionId?: string;
    reportId: string;
}) {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const open = async () => {
        setLoading(true);
        setError('');
        try {
            const res = await fetch('/api/billing/portal', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ sessionId, reportId }),
            });
            const data = (await res.json()) as { url?: string; error?: string };
            if (res.ok && data.url) window.location.href = data.url;
            else setError(data.error || 'Could not open the billing portal.');
        } catch {
            setError('Network error — please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="text-center">
            <button
                type="button"
                onClick={open}
                disabled={loading}
                className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary hover:underline disabled:opacity-60 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 rounded"
            >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" /> : <Settings className="w-4 h-4" aria-hidden="true" />}
                Manage or cancel subscription
            </button>
            {error && (
                <p className="text-xs text-red-600 mt-1" role="alert">
                    {error}
                </p>
            )}
        </div>
    );
}
