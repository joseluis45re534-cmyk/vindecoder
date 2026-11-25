import type { Metadata } from 'next';
import Link from 'next/link';
import { pageMetadata } from '@/lib/seo';
import { formatRevised, SUPPORT_EMAIL } from '@/lib/site';

export const runtime = 'edge';

// Set by hand when this policy changes — never computed at render time.
const UPDATED = '2026-11-25';

export const metadata: Metadata = pageMetadata({
  title: 'Privacy Policy',
  description:
    'How CarVinLookup collects, uses, and protects your information when you run a vehicle history report.',
  path: '/privacy',
});

export default function PrivacyPage() {
  return (
    <main className="min-h-screen bg-white">
      <article className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16 prose-content">
        <h1 className="text-4xl font-extrabold text-slate-900 mb-6 tracking-tight">Privacy Policy</h1>
        <p>
          Last updated: <time dateTime={UPDATED}>{formatRevised(UPDATED)}</time>
        </p>
        <p>
          CarVinLookup respects your privacy. This policy explains what we collect and how we use it. By using the site you
          agree to the practices described here.
        </p>
        <h2>Information we collect</h2>
        <ul>
          <li>
            <strong>VIN lookups</strong> you enter to generate a report, and the email address you give to see a free
            vehicle preview (your browser also keeps that email in local storage so you don&apos;t have to retype it).
          </li>
          <li>
            <strong>Account &amp; billing details</strong> (email, your name if you add one, payment confirmation) when you
            create an account or purchase a report.
          </li>
          <li><strong>Messages you send us</strong> through the support chat or the contact form.</li>
          <li>
            <strong>Your IP address and approximate location</strong> (country). We use the IP address to rate-limit
            previews, the support chat, the contact form, and sign-in attempts, and we store it in hashed form with each
            VIN lookup.
          </li>
          <li>
            <strong>Usage data</strong>: the pages you view, the page you came from, your country, and the VIN for lookups,
            recorded by our own first-party analytics without cookies; Cloudflare Web Analytics also counts page views
            without cookies.
          </li>
        </ul>
        <h2>How we use it</h2>
        <p>To generate your reports, process payments, provide support, prevent fraud, and improve the service. We do not sell your personal information.</p>
        <h2>Service providers</h2>
        <ul>
          <li><strong>Stripe</strong> processes payments and subscriptions. We never store full card numbers on our servers.</li>
          <li><strong>Supabase</strong> runs account sign-in and email confirmation.</li>
          <li><strong>Cloudflare</strong> hosts the site, protects it from abuse, and provides cookieless web analytics.</li>
          <li>
            <strong>Anthropic</strong> powers the support chat assistant: your chat messages are sent to Anthropic&apos;s API
            to generate replies, and the conversation is stored in our database so our team can follow up.
          </li>
          <li>
            <strong>Our vehicle-data provider</strong> receives the VIN you enter in order to return that vehicle&apos;s
            records (see <Link href="/data-sources">Data Sources</Link>). Vehicle photos and make logos load from
            third-party image hosts (such as retail.photos.vin, goodcar.com, and auction sites); those hosts see your IP
            address and the image address, which can include the VIN.
          </li>
          <li>
            <strong>Google</strong> provides the &ldquo;Add as a preferred source&rdquo; button in our footer. Its script
            loads from news.google.com on every page, so Google receives your IP address and browser details, and it may
            read or set its own google.com cookies under Google&apos;s privacy policy.
          </li>
          <li>
            Separately, if we turn on <strong>Google Analytics or Google Ads</strong> measurement, it runs in Google&apos;s
            consent mode: it sets no cookies until you accept them in our cookie banner, but it may send cookieless
            measurement pings to Google before then.
          </li>
        </ul>
        <h2>Data sources</h2>
        <p>Vehicle records originate from NMVTIS, state titling agencies, insurers, salvage and auction sources, and NHTSA, and are governed by their respective terms.</p>
        <h2>Your choices</h2>
        <p>
          You can request access to or deletion of your account data by contacting{' '}
          <a href={`mailto:${SUPPORT_EMAIL}`}>{SUPPORT_EMAIL}</a>. See our <Link href="/cookies">Cookie Policy</Link> for the
          cookies and browser storage the site uses.
        </p>
      </article>
    </main>
  );
}
