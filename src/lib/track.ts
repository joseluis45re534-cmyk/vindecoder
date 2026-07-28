'use client';

// Fire-and-forget first-party analytics. Posts to /api/track (writes the events
// table when D1 is bound). Never throws, never blocks; `keepalive` lets the beacon
// survive a navigation (e.g. a redirect to Stripe right after checkout_started).
export type TrackEvent = 'pageview' | 'vin_search' | 'checkout_started' | 'purchase';

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
  } catch {
    /* analytics must never break the page */
  }
}
