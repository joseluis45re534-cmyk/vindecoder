import type { Metadata } from 'next';
import { pageMetadata } from '@/lib/seo';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { COMPETITORS, comparisonSlug } from '@/lib/comparisons';
import { SITE_URL, CONTENT_REVISED, formatRevised } from '@/lib/site';
import { reportPriceLine } from '@/lib/pricing';
import JsonLd from '@/components/JsonLd';
import { breadcrumbLd } from '@/lib/structured-data';

export const runtime = 'edge';

export const metadata: Metadata = pageMetadata({
  title: 'Compare Vehicle History Report Providers',
  description:
    'Compare CarVinLookup with Carfax, AutoCheck, Bumper, EpicVIN, and more. Head-to-head comparisons and alternatives so you pick the right VIN report.',
  path: '/compare',
});

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

      <section className="bg-white border-t border-slate-100 py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto prose-content">
          <h2>How vehicle history reports differ</h2>
          <p>
            Many U.S. vehicle history reports — including those from the Justice Department&apos;s approved NMVTIS data
            providers — start from the same backbone: title and brand data from state titling agencies, plus total-loss and
            junk/salvage reports from insurers and salvage yards, collected in NMVTIS. Others build their reports from their
            own data sources. Each provider then adds its own extra records. The differences that matter to a buyer are:
          </p>
          <ul>
            <li><strong>Data sources:</strong> whether the report includes NMVTIS data, plus any insurance, auction, or service records a provider adds.</li>
            <li><strong>Preview before paying:</strong> whether you can confirm the vehicle before you buy anything.</li>
            <li><strong>Pricing model:</strong> a one-off report versus a subscription, and how easy it is to cancel.</li>
            <li><strong>Coverage:</strong> U.S. VINs only, or imported and overseas vehicles too.</li>
            <li><strong>Honesty about limits:</strong> no report sees every event, so look for clear disclaimers.</li>
          </ul>
          <p>
            CarVinLookup shows a free vehicle preview first; unlocking a vehicle&apos;s full report costs {reportPriceLine()}{' '}
            (billed per vehicle). See our <Link href="/data-sources">data sources</Link> and{' '}
            <Link href="/pricing">pricing</Link>. Competitors change their prices, so check each provider&apos;s own site
            for current rates.
          </p>
          <p className="text-xs text-slate-400">Last reviewed <time dateTime={CONTENT_REVISED}>{formatRevised()}</time></p>
        </div>
      </section>
    </main>
  );
}
