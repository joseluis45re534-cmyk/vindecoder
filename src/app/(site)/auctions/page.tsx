import type { Metadata } from 'next';
import Link from 'next/link';
import { Search } from 'lucide-react';
import { DAMAGE_TYPES, VEHICLE_TYPES } from '@/lib/auctions';
import { SITE_URL, SITE_NAME } from '@/lib/site';
import JsonLd from '@/components/JsonLd';
import { breadcrumbLd } from '@/lib/structured-data';
import SearchForm from '@/components/SearchForm';

export const runtime = 'edge';

export const metadata: Metadata = {
  title: 'Salvage Auction Guide: Damage Types & What to Check',
  description:
    'Buying at a salvage or online car auction? Understand every damage type and vehicle category, the risks, and how to check the VIN before you bid.',
  alternates: { canonical: '/auctions' },
  openGraph: {
    type: 'website',
    siteName: SITE_NAME,
    title: 'Salvage Auction Guide — CarVinLookup',
    description: 'Understand auction damage types and vehicle categories, and check any VIN before you bid.',
    url: `${SITE_URL}/auctions`,
    locale: 'en_US',
    images: [{ url: '/opengraph-image.png', width: 1200, height: 630, alt: 'Salvage auction guide' }],
  },
};

export default function AuctionsHub() {
  const schema = [
    {
      '@context': 'https://schema.org',
      '@type': 'CollectionPage',
      '@id': `${SITE_URL}/auctions`,
      name: 'Salvage Auction Guide',
      url: `${SITE_URL}/auctions`,
      description: 'Educational guides to auction damage types and vehicle categories, with VIN-check guidance.',
      isPartOf: { '@id': `${SITE_URL}/#website` },
    },
    breadcrumbLd([
      { name: 'Home', url: SITE_URL },
      { name: 'Auctions', url: `${SITE_URL}/auctions` },
    ]),
  ];

  return (
    <main className="min-h-screen bg-slate-50">
      <JsonLd data={schema} />

      <section className="relative overflow-hidden bg-gradient-to-br from-slate-950 via-blue-950 to-slate-900 pt-12 sm:pt-16 pb-16 px-4 sm:px-6 lg:px-8">
        <div aria-hidden="true" className="animate-float pointer-events-none absolute -top-40 left-1/2 w-[600px] h-[400px] rounded-full bg-blue-600/20 blur-3xl" />
        <div className="relative max-w-3xl mx-auto text-center">
          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white mb-5 leading-tight">
            Salvage auction guide
          </h1>
          <p className="text-base sm:text-lg text-slate-300 mb-8 max-w-2xl mx-auto">
            Auction cars are sold as-is with limited disclosure. Learn what every damage type and vehicle category means — then check the VIN before you bid.
          </p>
          <SearchForm />
        </div>
      </section>

      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <h2 className="text-xl font-extrabold text-slate-900 mb-6">By damage type</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mb-14">
          {DAMAGE_TYPES.map((d) => (
            <Link
              key={d.slug}
              href={`/auctions/damage/${d.slug}`}
              className="bg-white rounded-xl border border-slate-100 shadow-sm hover:shadow-md hover:border-blue-200 px-5 py-4 transition-all"
            >
              <span className="font-semibold text-slate-800">{d.name}</span>
              <span className="block text-xs text-slate-400 mt-0.5">{d.short}</span>
            </Link>
          ))}
        </div>

        <h2 className="text-xl font-extrabold text-slate-900 mb-6">By vehicle type</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {VEHICLE_TYPES.map((v) => (
            <Link
              key={v.slug}
              href={`/auctions/type/${v.slug}`}
              className="bg-white rounded-xl border border-slate-100 shadow-sm hover:shadow-md hover:border-blue-200 px-5 py-4 transition-all"
            >
              <span className="font-semibold text-slate-800">{v.name}</span>
              <span className="block text-xs text-slate-400 mt-0.5">{v.short}</span>
            </Link>
          ))}
        </div>
      </section>

      <section className="bg-gradient-to-br from-blue-700 to-blue-900 py-14 px-4 text-center">
        <h2 className="text-2xl sm:text-3xl font-extrabold text-white mb-3">Check any auction VIN</h2>
        <p className="text-blue-100 mb-6">Title brands, theft, liens, and odometer history · free preview.</p>
        <Link href="/#vin-search" className="inline-flex items-center gap-2 bg-white text-blue-700 font-bold px-7 py-3.5 rounded-full hover:scale-105 active:scale-100 transition-transform">
          <Search className="w-4 h-4" aria-hidden="true" /> Run a VIN check
        </Link>
      </section>
    </main>
  );
}
