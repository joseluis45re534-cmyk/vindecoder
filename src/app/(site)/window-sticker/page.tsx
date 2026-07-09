import type { Metadata } from 'next';
import Link from 'next/link';
import { Search } from 'lucide-react';
import { STICKER_MAKES, stickerModelCount } from '@/lib/window-stickers';
import { SITE_URL, SITE_NAME } from '@/lib/site';
import JsonLd from '@/components/JsonLd';
import { breadcrumbLd } from '@/lib/structured-data';
import SearchForm from '@/components/SearchForm';

export const runtime = 'edge';

export const metadata: Metadata = {
  title: 'Window Sticker Lookup by VIN — Free Preview — CarVinLookup',
  description:
    'Look up the original window sticker (Monroney label) for any car by VIN — MSRP, factory options, fuel economy, and equipment as built. All makes and models.',
  alternates: { canonical: '/window-sticker' },
  openGraph: {
    type: 'website',
    siteName: SITE_NAME,
    title: 'Window Sticker Lookup by VIN',
    description: 'Get the original window sticker for any car by VIN — MSRP, options, and equipment as built.',
    url: `${SITE_URL}/window-sticker`,
    locale: 'en_US',
    images: [{ url: '/opengraph-image', width: 1200, height: 630, alt: 'Window sticker lookup by VIN' }],
  },
};

export default function WindowStickerHub() {
  const schema = [
    {
      '@context': 'https://schema.org',
      '@type': 'CollectionPage',
      '@id': `${SITE_URL}/window-sticker`,
      name: 'Window Sticker Lookup',
      url: `${SITE_URL}/window-sticker`,
      description: 'Look up the original window sticker for any car by VIN across all major makes and models.',
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
            Recreate the original window sticker (Monroney label) for any car — MSRP, factory options, fuel economy, and standard equipment, matched to the exact VIN.
          </p>
          <SearchForm />
          <p className="mt-5 text-sm text-slate-400">Free preview · {stickerModelCount()}+ models · All model years</p>
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

      <section className="bg-gradient-to-br from-blue-700 to-blue-900 py-14 px-4 text-center">
        <h2 className="text-2xl sm:text-3xl font-extrabold text-white mb-3">Get your window sticker</h2>
        <p className="text-blue-100 mb-6">Free preview · original sticker + full history by VIN.</p>
        <Link href="/#vin-search" className="inline-flex items-center gap-2 bg-white text-blue-700 font-bold px-7 py-3.5 rounded-full hover:scale-105 active:scale-100 transition-transform">
          <Search className="w-4 h-4" aria-hidden="true" /> Look up a VIN
        </Link>
      </section>
    </main>
  );
}
