'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Cookie } from 'lucide-react';

// Cookie-consent gate for Google Analytics (Consent Mode v2). GA defaults to
// DENIED (see GoogleAnalytics.tsx); this banner lets the visitor grant/deny and
// stores the choice for a year. Only shown when GA is actually configured, and
// never on the admin panel. First-party, cookieless analytics keep running.
const COOKIE = 'cvl_consent';
const GA_ID = process.env.NEXT_PUBLIC_GA_ID;

type Choice = 'granted' | 'denied';

function readConsent(): Choice | null {
  if (typeof document === 'undefined') return null;
  const m = document.cookie.match(/(?:^|; )cvl_consent=(granted|denied)/);
  return m ? (m[1] as Choice) : null;
}

function persist(v: Choice) {
  const oneYear = 60 * 60 * 24 * 365;
  document.cookie = `${COOKIE}=${v}; path=/; max-age=${oneYear}; SameSite=Lax`;
}

export default function ConsentBanner() {
  const pathname = usePathname();
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (!GA_ID) return; // nothing to consent to
    if (pathname?.startsWith('/admin')) { setShow(false); return; }
    setShow(readConsent() === null);
  }, [pathname]);

  const choose = (v: Choice) => {
    persist(v);
    window.gtag?.('consent', 'update', {
      ad_storage: v,
      ad_user_data: v,
      ad_personalization: v,
      analytics_storage: v,
    });
    setShow(false);
  };

  if (!show) return null;

  return (
    <div className="fixed inset-x-0 bottom-0 z-[60] p-3 sm:p-4" role="dialog" aria-label="Cookie consent" aria-live="polite">
      <div className="mx-auto max-w-4xl bg-white border border-slate-200 shadow-xl shadow-slate-900/10 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center gap-4">
        <span className="hidden sm:inline-flex w-11 h-11 shrink-0 rounded-xl bg-blue-50 text-blue-600 items-center justify-center">
          <Cookie className="w-5 h-5" aria-hidden="true" />
        </span>
        <p className="text-sm text-slate-600 leading-relaxed flex-1">
          We use analytics cookies to understand traffic and improve CarVinLookup. You can accept or decline —
          essential site features work either way. See our{' '}
          <Link href="/cookies" className="font-semibold text-primary hover:underline">cookie policy</Link>.
        </p>
        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={() => choose('denied')}
            className="text-sm font-semibold text-slate-600 hover:text-slate-900 px-4 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-50"
          >
            Decline
          </button>
          <button
            type="button"
            onClick={() => choose('granted')}
            className="text-sm font-bold text-white bg-primary hover:brightness-110 px-5 py-2.5 rounded-xl"
          >
            Accept
          </button>
        </div>
      </div>
    </div>
  );
}
