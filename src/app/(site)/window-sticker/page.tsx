import type { Metadata } from 'next';
import { pageMetadata } from '@/lib/seo';
import Link from 'next/link';
import { Search } from 'lucide-react';
import { STICKER_MAKES } from '@/lib/window-stickers';
import { SITE_URL } from '@/lib/site';
import JsonLd from '@/components/JsonLd';
import { breadcrumbLd } from '@/lib/structured-data';
import SearchForm from '@/components/SearchForm';

export const runtime = 'edge';

// Window-sticker data isn't in the report yet — it arrives with the ClearVin
// integration. Until then this hub is an honest explainer + VIN-check funnel:
// never promise a sticker the product can't deliver.
export const metadata: Metadata = pageMetadata({
  title: 'Window Sticker Lookup by VIN',
  description:
    'What a window sticker (Monroney label) shows — MSRP, options, fuel economy, and equipment — and how to get one by VIN. Sticker lookup is launching soon.',
  path: '/window-sticker',
  ogAlt: 'Window sticker lookup by VIN',
});

export default function WindowStickerHub() {
  const schema = [
    {
      '@context': 'https://schema.org',
      '@type': 'CollectionPage',
      '@id': `${SITE_URL}/window-sticker`,
      name: 'Window Sticker Lookup',
      url: `${SITE_URL}/window-sticker`,
      description: 'What a window sticker (Monroney label) shows and how to look one up by VIN, across all major makes.',
      isPartOf: { '@id': `${SITE_URL}/#website` },
    },
    breadcrumbLd([
      { name: 'Home', url: SITE_URL },
      { name: 'Window sticker', url: `${SITE_URL}/window-sticker` },
    ]),
  ];

  return (
    <main className="min-h-screen bg-slate-50">
      <JsonLd data={schema} />

      <section className="relative overflow-hidden bg-gradient-to-br from-slate-950 via-blue-950 to-slate-900 pt-12 sm:pt-16 pb-16 px-4 sm:px-6 lg:px-8">
        <div aria-hidden="true" className="animate-float pointer-events-none absolute -top-40 left-1/2 w-[600px] h-[400px] rounded-full bg-blue-600/20 blur-3xl" />
        <div className="relative max-w-3xl mx-auto text-center">
          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white mb-5 leading-tight">
            Window sticker lookup <span className="bg-gradient-to-r from-blue-400 to-sky-300 bg-clip-text text-transparent">by VIN</span>
          </h1>
          <p className="text-base sm:text-lg text-slate-300 mb-8 max-w-2xl mx-auto">
            A window sticker (Monroney label) lists a car&apos;s original MSRP, factory options, fuel economy, and standard
            equipment. Our VIN-based window sticker lookup is launching soon — today, the free VIN preview already decodes
            the year, make, model, and engine.
          </p>
          <SearchForm />
          <p className="mt-5 text-sm text-slate-400">Window sticker lookup launching soon · Free VIN preview available now</p>
        </div>
      </section>

      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <h2 className="text-xl font-extrabold text-slate-900 mb-6">Browse window stickers by make</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          {STICKER_MAKES.map((m) => (
            <Link
              key={m.slug}
              href={`/window-sticker/${m.slug}`}
              className="bg-white rounded-xl border border-slate-100 shadow-sm hover:shadow-md hover:border-blue-200 px-5 py-4 transition-all"
            >
              <span className="font-semibold text-slate-800">{m.name}</span>
              <span className="block text-xs text-slate-400 mt-0.5">{m.models.length} models</span>
            </Link>
          ))}
        </div>
      </section>

      <article className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 pb-16 prose-content">
        <h2>What is a window sticker?</h2>
        <p>
          A window sticker — officially the <strong>Monroney label</strong> — is the price and equipment label that
          federal law (the Automobile Information Disclosure Act of 1958) requires on the window of every new car sold
          in the United States. It is the clearest record of how a specific car left the factory.
        </p>
        <h2>What a window sticker shows</h2>
        <ul>
          <li><strong>Base MSRP</strong> and the price of each factory option or package</li>
          <li><strong>Standard and optional equipment</strong> — trim, engine, transmission, and features</li>
          <li><strong>Destination charge</strong> and the total MSRP</li>
          <li><strong>EPA fuel-economy and environment ratings</strong></li>
          <li><strong>Government crash-test ratings</strong>, when the model was tested</li>
          <li>Where the car and its major parts were assembled</li>
        </ul>
        <h2>Why it matters on a used car</h2>
        <p>
          Sellers often list a lower trim as a higher one, or claim options a car never had. The window sticker shows
          exactly what the car came with, which helps you check the listing and price it fairly. Pair it with a{' '}
          <Link href="/vin-decoder">VIN decode</Link> and a full history check — a perfect sticker says nothing about
          salvage, flood, or odometer problems.
        </p>
        <h2>How to get a window sticker by VIN</h2>
        <p>
          Ask the seller first — some keep the original. A dealer for that brand can sometimes print the build sheet
          from the VIN. Our own VIN-based window sticker lookup is launching soon. Until then, enter the VIN above for a
          free vehicle preview, and see our <Link href="/how-to/check-vin-number">guide to checking a VIN</Link>.
        </p>
      </article>

      <section className="bg-gradient-to-br from-blue-700 to-blue-900 py-14 px-4 text-center">
        <h2 className="text-2xl sm:text-3xl font-extrabold text-white mb-3">Check the VIN while you wait</h2>
        <p className="text-blue-100 mb-6">Free vehicle preview · full title, theft, lien &amp; odometer history.</p>
        <Link href="/#vin-search" className="inline-flex items-center gap-2 bg-white text-blue-700 font-bold px-7 py-3.5 rounded-full hover:scale-105 active:scale-100 transition-transform">
          <Search className="w-4 h-4" aria-hidden="true" /> Look up a VIN
        </Link>
      </section>
    </main>
  );
}
