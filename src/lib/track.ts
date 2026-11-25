'use client';

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
  }
}

// Fire-and-forget first-party analytics. Posts to /api/track (writes the events
// table when D1 is bound) AND forwards to Google Analytics 4 (gtag) when it's
// loaded. Never throws, never blocks; `keepalive` lets the beacon survive a
// navigation (e.g. a redirect to Stripe right after checkout_started).
export type TrackEvent = 'pageview' | 'vin_search' | 'checkout_started' | 'purchase';

// Map our funnel names → GA4 recommended event names (Google Ads recognizes
// these and they can be marked as key events / conversions). `pageview` is
// handled by GoogleAnalytics.tsx, not forwarded here.
const GA_EVENT: Partial<Record<TrackEvent, string>> = {
  vin_search: 'vin_search',
  checkout_started: 'begin_checkout',
  purchase: 'purchase',
};

// Fields allowed through to Google Analytics; everything else (vin, reportId,
// email, session ids…) stays first-party.
const GA_SAFE_KEYS = ['value', 'currency', 'method'] as const;
function gaSafe(meta?: Record<string, unknown>): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  for (const k of GA_SAFE_KEYS) if (meta && k in meta) out[k] = meta[k];
  return out;
}

export function track(name: TrackEvent, meta?: Record<string, unknown>): void {
  try {
    if (typeof window === 'undefined') return;
    const body = JSON.stringify({
      name,
      path: window.location.pathname,
      referrer: document.referrer || undefined,
      meta,
    });
    void fetch('/api/track', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body,
      keepalive: true,
    }).catch(() => {});

    // Forward to GA4 (no-op if gtag isn't loaded / GA not configured). Only
    // non-identifying fields go to Google — never the VIN, report id or email.
    if (name !== 'pageview' && GA_EVENT[name]) {
      window.gtag?.('event', GA_EVENT[name] as string, gaSafe(meta));
    }
  } catch {
    /* analytics must never break the page */
  }
}

/** Send a one-off GA4 event (e.g. sign_up) — no first-party event row. */
export function gaEvent(name: string, params?: Record<string, unknown>): void {
  try {
    if (typeof window !== 'undefined') window.gtag?.('event', name, params || {});
  } catch {
    /* no-op */
  }
}
