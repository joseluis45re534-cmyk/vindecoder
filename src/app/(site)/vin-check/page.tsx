import type { Metadata } from 'next';
import Link from 'next/link';
import { Car } from 'lucide-react';
import { BRANDS } from '@/lib/brands';
import { SITE_URL } from '@/lib/site';

export const runtime = 'edge';

export const metadata: Metadata = {
  title: 'VIN Check by Car Brand — All Makes',
  description:
    'Run a free VIN check by car brand. Decode and check the history of any Ford, Toyota, Honda, Chevrolet, BMW, and 30+ more makes for title brands, salvage, theft, liens, and odometer records.',
  alternates: { canonical: '/vin-check' },
};

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
            odometer readings from NMVTIS, NICB, and DMV data.
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
    </main>
  );
}
