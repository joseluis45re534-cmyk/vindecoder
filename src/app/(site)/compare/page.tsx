import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { COMPETITORS, comparisonSlug } from '@/lib/comparisons';
import { SITE_URL, SITE_NAME } from '@/lib/site';
import JsonLd from '@/components/JsonLd';
import { breadcrumbLd } from '@/lib/structured-data';

export const runtime = 'edge';

export const metadata: Metadata = {
  title: 'Compare Vehicle History Report Providers — CarVinLookup',
  description:
    'Compare CarVinLookup with Carfax, AutoCheck, Bumper, EpicVIN, ClearVin and more. Head-to-head comparisons and alternatives so you pick the right VIN report.',
  alternates: { canonical: '/compare' },
  openGraph: {
    type: 'website',
    siteName: SITE_NAME,
    title: 'Compare Vehicle History Report Providers',
    description: 'CarVinLookup vs. the major vehicle history report providers — compared side by side.',
    url: `${SITE_URL}/compare`,
    locale: 'en_US',
    images: [{ url: '/opengraph-image', width: 1200, height: 630, alt: 'Compare VIN report providers' }],
  },
};

export default function CompareHub() {
  const schema = [
    {
      '@context': 'https://schema.org',
      '@type': 'CollectionPage',
      '@id': `${SITE_URL}/compare`,
      name: 'Compare Vehicle History Report Providers',
      url: `${SITE_URL}/compare`,
      description: 'Head-to-head comparisons and alternatives to major vehicle history report providers.',
      isPartOf: { '@id': `${SITE_URL}/#website` },
    },
    breadcrumbLd([
      { name: 'Home', url: SITE_URL },
      { name: 'Compare', url: `${SITE_URL}/compare` },
    ]),
  ];

  return (
    <main className="min-h-screen bg-slate-50">
      <JsonLd data={schema} />

      <section className="bg-white border-b border-slate-100 py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-sm font-semibold text-blue-600 uppercase tracking-widest mb-3">Compare</p>
          <h1 className="text-4xl sm:text-5xl font-extrabold text-slate-900 tracking-tight mb-4">
            Compare vehicle history reports
          </h1>
          <p className="text-lg text-slate-500 max-w-2xl mx-auto">
            See how CarVinLookup stacks up against the major providers — data sources, free preview, pricing model, and coverage.
          </p>
        </div>
      </section>

      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <h2 className="text-xl font-extrabold text-slate-900 mb-6">Head-to-head comparisons</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-14">
          {COMPETITORS.map((c) => (
            <Link
              key={c.slug}
              href={`/compare/${comparisonSlug(c.slug)}`}
              className="group flex items-center justify-between bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-lg hover:-translate-y-0.5 transition-all p-6"
            >
              <div>
                <p className="font-bold text-slate-900">CarVinLookup vs. {c.name}</p>
                <p className="text-sm text-slate-500 mt-1">Data, pricing model &amp; coverage compared.</p>
              </div>
              <ArrowRight className="w-5 h-5 text-blue-600 group-hover:translate-x-1 transition-transform" aria-hidden="true" />
            </Link>
          ))}
        </div>

        <h2 className="text-xl font-extrabold text-slate-900 mb-6">Provider alternatives</h2>
        <div className="flex flex-wrap gap-2.5">
          {COMPETITORS.map((c) => (
            <Link
              key={c.slug}
              href={`/${c.slug}-alternative`}
              className="text-sm font-medium bg-white border border-slate-200 hover:border-blue-300 hover:text-blue-600 text-slate-600 px-4 py-2 rounded-full transition-colors"
            >
              {c.name} alternative
            </Link>
          ))}
        </div>
      </section>
    </main>
  );
}
