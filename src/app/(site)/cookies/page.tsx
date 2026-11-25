import type { Metadata } from 'next';
import { pageMetadata } from '@/lib/seo';
import Link from 'next/link';
import { formatRevised, SUPPORT_EMAIL } from '@/lib/site';

export const runtime = 'edge';

// Set by hand when this policy changes — never computed at render time.
const UPDATED = '2026-11-25';

export const metadata: Metadata = pageMetadata({
  title: 'Cookie Policy',
  description:
    'What cookies and local storage CarVinLookup uses — essential session cookies, privacy-friendly analytics, and how to control them.',
  path: '/cookies',
});

export default function CookiePage() {
  return (
    <main className="min-h-screen bg-white">
      <article className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16 prose-content">
        <h1 className="text-4xl font-extrabold text-slate-900 mb-6 tracking-tight">Cookie Policy</h1>
        <p>
          Last updated: <time dateTime={UPDATED}>{formatRevised(UPDATED)}</time>
        </p>
        <p>
          This policy explains the cookies and similar storage technologies CarVinLookup uses, and how you can control them.
          For how we handle personal data generally, see our <Link href="/privacy">Privacy Policy</Link>.
        </p>

        <h2>What we use</h2>
        <ul>
          <li>
            <strong>Essential.</strong> Sign-in cookies keep you signed in to your account — needed to buy a report,
            re-open reports you paid for, and manage your subscription — and a separate session cookie keeps
            administrators signed in to the admin panel. The site cannot function correctly without essential cookies, so
            they cannot be disabled.
          </li>
          <li>
            <strong>Your cookie choice.</strong> When we run Google measurement and show a cookie banner, a{' '}
            <code>cvl_consent</code> cookie remembers whether you accepted or declined optional cookies, for one year.
          </li>
          <li>
            <strong>Local storage.</strong> Our support chat widget stores anonymous visitor and conversation IDs so your
            chat continues if you reload the page. When you enter your email for a free vehicle preview, it is saved in
            local storage so you don&apos;t have to retype it; clearing your browser&apos;s site data removes it.
          </li>
          <li>
            <strong>Analytics.</strong> Our own first-party analytics records individual events — the page, the referring
            page, your country, and the VIN for lookups — and Cloudflare Web Analytics, from our hosting provider, counts
            page views too. Neither uses cookies.
          </li>
          <li>
            <strong>Google &ldquo;Add as a preferred source&rdquo; button.</strong> This footer button loads a script from
            Google on every page. Google may read or set its own google.com cookies, governed by Google&apos;s privacy
            policy; you can block third-party cookies in your browser settings.
          </li>
          <li>
            <strong>Advertising &amp; measurement (when enabled).</strong> If we run advertising, we may add measurement
            tags (for example Google Analytics or Google Ads). They run in Google&apos;s consent mode: no cookies until you
            accept in our banner, though the tag may send cookieless measurement pings to Google before then.
          </li>
        </ul>

        <h2>Payment provider</h2>
        <p>
          During checkout, our payment processor (Stripe) may set its own cookies to process payments securely and
          prevent fraud. These are governed by Stripe&apos;s own cookie and privacy policies.
        </p>

        <h2>Controlling cookies</h2>
        <p>
          You can block or delete cookies through your browser settings, and clear local storage the same way. Disabling
          essential cookies may break parts of the site (such as signing in). To change a cookie-banner choice, delete the{' '}
          <code>cvl_consent</code> cookie (or clear this site&apos;s data) and the banner will appear again.
        </p>

        <h2>Questions</h2>
        <p>
          Email <a href={`mailto:${SUPPORT_EMAIL}`}>{SUPPORT_EMAIL}</a> or use our{' '}
          <Link href="/contact">contact page</Link>.
        </p>
      </article>
    </main>
  );
}
