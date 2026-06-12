'use client';

import { useState } from 'react';
import { Loader2, CreditCard } from 'lucide-react';

export default function CheckoutButtons({
  planId,
  reportId,
  highlighted,
}: {
  planId: string;
  reportId?: string;
  highlighted?: boolean;
}) {
  const [loading, setLoading] = useState<'stripe' | 'paypal' | null>(null);
  const [error, setError] = useState('');

  const checkout = async (provider: 'stripe' | 'paypal') => {
    setLoading(provider);
    setError('');
    try {
      const res = await fetch(`/api/checkout/${provider}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ planId, reportId }),
      });
      const data = (await res.json()) as { url?: string; error?: string; configured?: boolean };
      if (res.ok && data.url) {
        window.location.href = data.url;
      } else {
        setError(data.error || 'Checkout failed');
      }
    } catch {
      setError('Network error');
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="space-y-2.5">
      <button
        onClick={() => checkout('stripe')}
        disabled={loading !== null}
        className={`w-full flex items-center justify-center gap-2 font-bold py-3 rounded-xl transition-all disabled:opacity-60 ${
          highlighted
            ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-md shadow-blue-600/25'
            : 'bg-slate-900 hover:bg-slate-800 text-white'
        }`}
      >
        {loading === 'stripe' ? <Loader2 className="w-4 h-4 animate-spin" /> : <CreditCard className="w-4 h-4" />}
        Pay with card
      </button>
      <button
        onClick={() => checkout('paypal')}
        disabled={loading !== null}
        className="w-full flex items-center justify-center gap-2 font-bold py-3 rounded-xl bg-[#ffc439] hover:bg-[#f0b72e] text-[#003087] transition-all disabled:opacity-60"
      >
        {loading === 'paypal' ? <Loader2 className="w-4 h-4 animate-spin" /> : <span className="font-extrabold italic">PayPal</span>}
      </button>
      {error && <p className="text-xs text-red-600 text-center">{error}</p>}
    </div>
  );
}
