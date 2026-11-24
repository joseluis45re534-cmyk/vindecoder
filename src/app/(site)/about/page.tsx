import type { Metadata } from 'next';
import { pageMetadata } from '@/lib/seo';
import Link from 'next/link';
import JsonLd from '@/components/JsonLd';
import { breadcrumbLd } from '@/lib/structured-data';
import { SITE_URL, SITE_NAME, SUPPORT_EMAIL, SITE_ADDRESS, CONTENT_REVISED, formatRevised } from '@/lib/site';
import { TRIAL_PLAN, formatPrice } from '@/lib/pricing';

export const runtime = 'edge';

export const metadata: Metadata = pageMetadata({
  title: 'About Us',
  description:
    'CarVinLookup runs instant U.S. vehicle history reports built on NMVTIS title data, helping buyers spot salvage, flood, theft, lien, and odometer problems.',
  path: '/about',
});

// Facts only: everything on this page is verifiable on the site itself
// (pricing.ts, /data-sources, /refund). Don't add team bios, customer counts,
// or press mentions unless they're real and citable.
export default function AboutPage() {
  const fee = formatPrice(TRIAL_PLAN.trialFeeCents ?? 100);
  const monthly = formatPrice(TRIAL_PLAN.recurringCents ?? 2900);
  const days = TRIAL_PLAN.trialDays ?? 3;
  const address = `${SITE_ADDRESS.line1}${SITE_ADDRESS.line2 ? `, ${SITE_ADDRESS.line2}` : ''}, ${SITE_ADDRESS.city}, ${SITE_ADDRESS.region} ${SITE_ADDRESS.postalCode}`;

  return (
    <main className="min-h-screen bg-white">
      <JsonLd
        data={[
          {
            '@context': 'https://schema.org',
            '@type': 'AboutPage',
            '@id': `${SITE_URL}/about`,
            url: `${SITE_URL}/about`,
            name: `About ${SITE_NAME}`,
            dateModified: CONTENT_REVISED,
            isPartOf: { '@id': `${SITE_URL}/#website` },
            mainEntity: { '@id': `${SITE_URL}/#organization` },
          },
          breadcrumbLd([
            { name: 'Home', url: SITE_URL },
            { name: 'About', url: `${SITE_URL}/about` },
          ]),
        ]}
      />
      <article className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16 prose-content">
        <h1 className="text-4xl font-extrabold text-slate-900 mb-6 tracking-tight">About CarVinLookup</h1>
        <p>
          CarVinLookup is a U.S. vehicle history report service. Enter a car&apos;s 17-character VIN and we show you a
          free preview of the vehicle — year, make, model, and engine — then the full history: title brands, salvage
          and flood records, a theft check, open liens, odometer readings, and open safety recalls. License-plate search
          is launching soon.
        </p>

        <h2>Why we built it</h2>
        <p>
          A clean-looking listing can hide a salvage title, a rolled-back odometer, or an open loan. Dealers check this
          history as a matter of routine; private buyers often don&apos;t, and they carry the risk. We built CarVinLookup
          so anyone can check a car&apos;s recorded history before handing over thousands of dollars.
        </p>

        <h2>Where our data comes from</h2>
        <p>
          Reports are built on the National Motor Vehicle Title Information System (NMVTIS), the U.S. Department of
          Justice database of title brands reported by state titling agencies, plus total-loss and salvage reports from
          insurers and salvage yards. We access NMVTIS through an approved NMVTIS data provider, and add salvage-auction
          records and NHTSA recall data. Our <Link href="/data-sources">data sources page</Link> explains what each source
          covers and where it falls short.
        </p>

        <h2>What a report can&apos;t tell you</h2>
        <p>
          A history report shows what was <em>reported</em>. Damage repaired privately, or events that never reached a
          database, won&apos;t appear — so a clean report is a good sign, not a guarantee. We always recommend an
          independent pre-purchase inspection, and we publish the{' '}
          <Link href="/data-sources#nmvtis-disclaimer">NMVTIS consumer disclaimer</Link> so you know the limits up front.
        </p>

        <h2>How we make money</h2>
        <p>
          The vehicle preview is free. Full report access costs {fee} today for a {days}-day trial, then {monthly} per
          month until you cancel — and you can cancel anytime from your account. See{' '}
          <Link href="/pricing">pricing</Link> and our <Link href="/refund">refund &amp; cancellation policy</Link>.
          We don&apos;t sell your personal information, and we never show vehicle owners&apos; personal information, which the
          federal Driver&apos;s Privacy Protection Act protects.
        </p>

        <h2>Our content standards</h2>
        <p>
          Our VIN-check pages cite primary sources — NMVTIS, NHTSA, the FTC, and the NICB — and show when they were last
          reviewed. We don&apos;t publish fake reviews or invented statistics. If you spot something wrong, email{' '}
          <a href={`mailto:${SUPPORT_EMAIL}`}>{SUPPORT_EMAIL}</a> and we&apos;ll correct it. Terms we use are defined in
          our <Link href="/glossary">VIN &amp; title glossary</Link>.
        </p>

        <h2>Company details</h2>
        <ul>
          <li><strong>Name:</strong> {SITE_NAME}</li>
          <li><strong>Address:</strong> {address}, United States</li>
          <li><strong>Support:</strong> <a href={`mailto:${SUPPORT_EMAIL}`}>{SUPPORT_EMAIL}</a> · <Link href="/contact">contact form</Link></li>
        </ul>

        <p>
          Ready to check a vehicle? <Link href="/#vin-search" className="text-blue-600 font-semibold">Run a VIN check</Link>,
          browse <Link href="/vin-check" className="text-blue-600 font-semibold">checks by brand</Link>, or{' '}
          <Link href="/compare" className="text-blue-600 font-semibold">compare report providers</Link>.
        </p>
        <p className="text-xs text-slate-400">Last reviewed <time dateTime={CONTENT_REVISED}>{formatRevised()}</time></p>
      </article>
    </main>
  );
}
