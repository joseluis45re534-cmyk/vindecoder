import type { Metadata } from 'next';
import { pageMetadata } from '@/lib/seo';
import Link from 'next/link';
import { Car } from 'lucide-react';
import { BRANDS } from '@/lib/brands';
import { SITE_URL } from '@/lib/site';

export const runtime = 'edge';

export const metadata: Metadata = pageMetadata({
  title: 'VIN Check by Car Brand — All Makes',
  description:
    'Run a VIN check by car brand. Decode any Ford, Toyota, Honda, Chevrolet, BMW, or 30+ other makes and check title brands, salvage, theft, liens, and odometer.',
  path: '/vin-check',
});

export default function VinCheckHub() {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: 'VIN Check by Car Brand',
    url: `${SITE_URL}/vin-check`,
    isPartOf: { '@id': `${SITE_URL}/#website` },
    hasPart: BRANDS.map((b) => ({
      '@type': 'WebPage',
      name: `${b.name} VIN Check`,
      url: `${SITE_URL}/vin-check/${b.slug}`,
    })),
  };

  return (
    <main className="min-h-screen bg-slate-50">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <section className="bg-white border-b border-slate-100 py-14 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-sm font-semibold text-blue-600 uppercase tracking-widest mb-3">VIN check by brand</p>
          <h1 className="text-3xl sm:text-5xl font-extrabold text-slate-900 tracking-tight mb-4">
            Check any car brand by VIN
          </h1>
          <p className="text-lg text-slate-500 max-w-2xl mx-auto">
            Pick a make for a brand-specific VIN check — title brands, salvage &amp; flood history, theft records, liens, and
            odometer readings, built on NMVTIS title data.
          </p>
        </div>
      </section>

      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {BRANDS.map((b) => (
            <Link
              key={b.slug}
              href={`/vin-check/${b.slug}`}
              className="group bg-white rounded-2xl border border-slate-100 hover:border-blue-200 hover:shadow-lg card-lift p-5 flex items-center gap-3"
            >
              <span className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition-colors shrink-0">
                <Car className="w-5 h-5" aria-hidden="true" />
              </span>
              <span className="min-w-0">
                <span className="block font-bold text-slate-900 truncate">{b.name}</span>
                <span className="block text-xs text-slate-400">VIN check</span>
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* Answer-first explainer — gives the hub real, crawlable substance */}
      <section className="bg-white border-t border-slate-100 py-14 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto prose-content">
          <h2>What is a VIN check?</h2>
          <p>
            A VIN check looks up a car&apos;s 17-character Vehicle Identification Number in title, insurance, and salvage
            records to show its recorded history: title brands such as salvage or flood, total-loss and auction records,
            open liens, odometer readings, theft-related records, and open safety recalls. The VIN itself also decodes to
            the car&apos;s factory details, so you can confirm the year, make, model, and engine match the listing.
          </p>
          <h2>Why check by brand?</h2>
          <p>
            Every make uses the same 17-character VIN format, so the history check works the same way for a Ford or a
            Toyota. Our brand pages add what&apos;s specific to each make: the manufacturer codes its VINs usually start with,
            what to watch for on a used one, and its most popular models.
          </p>
          <h2>How to run a VIN check</h2>
          <ol>
            <li>Find the VIN on the lower-left of the windshield, the driver-side door jamb, or the title or registration.</li>
            <li>Enter it in the search box — the vehicle preview is free.</li>
            <li>Unlock the full report and compare it with what the seller told you.</li>
          </ol>
          <p>
            Looking for one specific problem? Try a <Link href="/salvage-check">salvage title check</Link>,{' '}
            <Link href="/flood-damage-check">flood damage check</Link>, <Link href="/odometer-check">odometer check</Link>,{' '}
            <Link href="/lien-check">lien check</Link>, or our <Link href="/vin-decoder">free VIN decoder</Link>.
          </p>
        </div>
      </section>
    </main>
  );
}
