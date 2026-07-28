'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { track } from '@/lib/track';

// Fires a `pageview` on every route change (App Router client navigation
// included). Excludes the admin panel — those aren't visitor pageviews.
export default function AnalyticsTracker() {
  const pathname = usePathname();
  useEffect(() => {
    if (!pathname || pathname.startsWith('/admin')) return;
    track('pageview');
  }, [pathname]);
  return null;
}
