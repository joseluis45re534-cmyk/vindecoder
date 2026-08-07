'use client';

import Script from 'next/script';
import { usePathname } from 'next/navigation';
import { useEffect, useRef } from 'react';

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
  }
}

// GA4 measurement ID (G-XXXXXXX) — inlined at BUILD time, so it must be set as a
// Cloudflare Pages build-time env var. Optional Google Ads tag (AW-XXXXXXXXX) for
// remarketing / direct conversion linking. When neither is set this renders
// nothing — GA is fully opt-in via env.
const GA_ID = process.env.NEXT_PUBLIC_GA_ID;
const ADS_ID = process.env.NEXT_PUBLIC_GADS_ID;

export default function GoogleAnalytics() {
  const pathname = usePathname();
  const first = useRef(true);

  // App Router client navigations don't reload the page, so GA only sees the
  // first page_view automatically — fire one manually on each route change.
  useEffect(() => {
    if (!GA_ID || typeof window === 'undefined') return;
    if (first.current) {
      first.current = false; // the initial page_view is sent by gtag('config')
      return;
    }
    window.gtag?.('event', 'page_view', {
      page_path: pathname,
      page_location: window.location.href,
      page_title: document.title,
    });
  }, [pathname]);

  if (!GA_ID) return null;

  const config = [`gtag('config', '${GA_ID}');`];
  if (ADS_ID) config.push(`gtag('config', '${ADS_ID}');`);

  return (
    <>
      <Script src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`} strategy="afterInteractive" />
      <Script id="ga-init" strategy="afterInteractive">
        {`window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
window.gtag = gtag;
gtag('js', new Date());
${config.join('\n')}`}
      </Script>
    </>
  );
}
