import type { Metadata } from 'next';
import Link from 'next/link';

export const runtime = 'edge';

export const metadata: Metadata = {
  title: 'Cookie Policy',
  description:
    'What cookies and local storage CarVinLookup uses — essential session cookies, privacy-friendly analytics, and how to control them.',
  alternates: { canonical: '/cookies' },
};

export default function CookiePage() {
  return (
    <main className="min-h-screen bg-white">
      <article className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16 prose-content">
        <h1 className="text-4xl font-extrabold text-slate-900 mb-6 tracking-tight">Cookie Policy</h1>
        <p>Last updated: {new Date().getFullYear()}</p>
        <p>
          This policy explains the cookies and similar storage technologies CarVinLookup uses, and how you can control them.
          For how we handle personal data generally, see our <Link href="/privacy">Privacy Policy</Link>.
        </p>

        <h2>What we use</h2>
        <ul>
          <li>
            <strong>Essential.</strong> A session cookie keeps administrators signed in to the admin panel. The site
            cannot function correctly without essential cookies, so they cannot be disabled.
          </li>
          <li>
            <strong>Local storage.</strong> Our support chat widget stores an anonymous conversation ID in your browser&apos;s
            local storage so your chat continues if you reload the page. It contains no personal information.
          </li>
          <li>
            <strong>Analytics.</strong> We use privacy-friendly, first-party analytics that record aggregate events
            (such as page views) without third-party tracking cookies or personally identifying information.
          </li>
          <li>
            <strong>Advertising &amp; measurement (when enabled).</strong> If we run advertising, we may add measurement
            tags (for example Google Analytics or Google Ads) to understand campaign performance. Where required by law,
            these load only after you consent.
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
          essential cookies may break parts of the site (such as admin sign-in). Where a consent banner is shown, you can
          change your choice at any time from that banner.
        </p>

        <h2>Questions</h2>
        <p>
          Email <a href="mailto:support@carvinlookup.us">support@carvinlookup.us</a> or use our{' '}
          <Link href="/contact">contact page</Link>.
        </p>
      </article>
    </main>
  );
}
