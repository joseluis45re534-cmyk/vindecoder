import type { Metadata } from 'next';
import { pageMetadata } from '@/lib/seo';
import Link from 'next/link';
import { Search } from 'lucide-react';
import { DAMAGE_TYPES, VEHICLE_TYPES } from '@/lib/auctions';
import { SITE_URL } from '@/lib/site';
import JsonLd from '@/components/JsonLd';
import { breadcrumbLd } from '@/lib/structured-data';
import SearchForm from '@/components/SearchForm';

export const runtime = 'edge';

export const metadata: Metadata = pageMetadata({
  title: 'Salvage Auction Guide: Damage Types Explained',
  description:
    'Buying at a salvage or online car auction? Understand every damage type and vehicle category, the risks, and how to check the VIN before you bid.',
  path: '/auctions',
});

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

      {/* The category pages are noindexed, so the hub carries their substance. */}
      <section className="bg-white border-t border-slate-100 py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-2xl font-extrabold text-slate-900 mb-3">Auction damage types explained</h2>
          <p className="text-slate-600 mb-8">
            What each damage label on an auction listing means, and what to check before you bid.
          </p>
          <div className="space-y-3 mb-14">
            {DAMAGE_TYPES.map((d) => (
              <details key={d.slug} className="group bg-slate-50 rounded-2xl border border-slate-100 open:bg-white open:shadow-md transition-all">
                <summary className="flex items-center justify-between cursor-pointer list-none px-6 py-4 font-bold text-slate-900">
                  {d.name}
                  <span className="ml-4 text-blue-600 transition-transform group-open:rotate-45 text-xl leading-none" aria-hidden="true">+</span>
                </summary>
                <div className="px-6 pb-5 text-slate-600 leading-relaxed">
                  <p>{d.body}</p>
                  <ul className="list-disc pl-5 mt-3 space-y-1 text-sm">
                    {d.checks.map((c) => <li key={c}>{c}</li>)}
                  </ul>
                </div>
              </details>
            ))}
          </div>

          <h2 className="text-2xl font-extrabold text-slate-900 mb-3">Vehicle types at auction</h2>
          <div className="space-y-3">
            {VEHICLE_TYPES.map((v) => (
              <details key={v.slug} className="group bg-slate-50 rounded-2xl border border-slate-100 open:bg-white open:shadow-md transition-all">
                <summary className="flex items-center justify-between cursor-pointer list-none px-6 py-4 font-bold text-slate-900">
                  {v.name}
                  <span className="ml-4 text-blue-600 transition-transform group-open:rotate-45 text-xl leading-none" aria-hidden="true">+</span>
                </summary>
                <div className="px-6 pb-5 text-slate-600 leading-relaxed">
                  <p>{v.body}</p>
                  <ul className="list-disc pl-5 mt-3 space-y-1 text-sm">
                    {v.checks.map((c) => <li key={c}>{c}</li>)}
                  </ul>
                </div>
              </details>
            ))}
          </div>
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
