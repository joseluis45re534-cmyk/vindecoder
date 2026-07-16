import type { Metadata } from 'next';
import Link from 'next/link';
import { Search } from 'lucide-react';
import DepreciationCalculator from '@/components/calculators/DepreciationCalculator';
import { SITE_URL, SITE_NAME } from '@/lib/site';
import JsonLd from '@/components/JsonLd';
import { breadcrumbLd, faqPageLd } from '@/lib/structured-data';

export const runtime = 'edge';

export const metadata: Metadata = {
  title: 'Car Depreciation Calculator: Estimate Future Value',
  description:
    'Free car depreciation calculator. Estimate how much a vehicle will be worth in 1–10 years based on purchase price and yearly depreciation rate.',
  alternates: { canonical: '/depreciation-calculator' },
  openGraph: {
    type: 'website',
    siteName: SITE_NAME,
    title: 'Car Depreciation Calculator — CarVinLookup',
    description: 'Estimate a vehicle future value year by year.',
    url: `${SITE_URL}/depreciation-calculator`,
    locale: 'en_US',
    images: [{ url: '/opengraph-image.png', width: 1200, height: 630, alt: 'Car depreciation calculator' }],
  },
};

const faq = [
  { q: 'How fast do cars depreciate?', a: 'Most new cars lose the largest share of value in the first year, then depreciate more gradually each year after. This calculator lets you set a first-year rate and a separate rate for later years.' },
  { q: 'What affects a car depreciation?', a: 'Mileage, condition, brand reliability, and — importantly — title history. A salvage or branded title accelerates depreciation well beyond a clean-title equivalent.' },
  { q: 'How can I slow depreciation?', a: 'Buy a model with strong resale value, keep mileage reasonable, maintain it, and keep the title clean. Confirming a clean history with a VIN check protects resale value.' },
];

export default function DepreciationCalculatorPage() {
  const schema = [
    {
      '@context': 'https://schema.org',
      '@type': 'WebApplication',
      name: 'Car Depreciation Calculator',
      url: `${SITE_URL}/depreciation-calculator`,
      applicationCategory: 'FinanceApplication',
      operatingSystem: 'Web',
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
      isPartOf: { '@id': `${SITE_URL}/#website` },
    },
    breadcrumbLd([
      { name: 'Home', url: SITE_URL },
      { name: 'Depreciation calculator', url: `${SITE_URL}/depreciation-calculator` },
    ]),
    faqPageLd(faq),
  ];

  return (
    <main className="min-h-screen bg-slate-50">
      <JsonLd data={schema} />

      <section className="bg-white border-b border-slate-100 py-14 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto text-center">
          <p className="text-sm font-semibold text-blue-600 uppercase tracking-widest mb-3">Calculator</p>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight mb-4">Car depreciation calculator</h1>
          <p className="text-lg text-slate-500">See what a vehicle could be worth in the years ahead.</p>
        </div>
      </section>

      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <DepreciationCalculator />
      </section>

      <article className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 pb-8 prose-content">
        <h2>Title history drives resale value</h2>
        <p>
          Depreciation is not just about age and mileage. A salvage, rebuilt, or flood title can cut resale value far faster
          than normal wear. Before you buy, run a <Link href="/#vin-search">VIN check</Link> to confirm a clean history —
          it is the cheapest way to protect the value you are about to pay for. Also try our{' '}
          <Link href="/auto-loan-calculator">auto loan calculator</Link> and{' '}
          <Link href="/lease-calculator">lease calculator</Link>.
        </p>
      </article>

      <section className="bg-white border-t border-slate-100 py-14 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-2xl font-extrabold text-slate-900 mb-8">Depreciation calculator — FAQ</h2>
          <div className="space-y-3">
            {faq.map(({ q, a }) => (
              <details key={q} className="group bg-slate-50 rounded-2xl border border-slate-100 open:bg-white open:shadow-md transition-all">
                <summary className="flex items-center justify-between cursor-pointer list-none px-6 py-4 font-bold text-slate-900">
                  {q}
                  <span className="ml-4 text-blue-600 transition-transform group-open:rotate-45 text-xl leading-none" aria-hidden="true">+</span>
                </summary>
                <p className="px-6 pb-5 text-slate-500 leading-relaxed">{a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-gradient-to-br from-blue-700 to-blue-900 py-14 px-4 text-center">
        <h2 className="text-2xl sm:text-3xl font-extrabold text-white mb-3">Protect your resale value</h2>
        <p className="text-blue-100 mb-6">Free preview · full history by VIN.</p>
        <Link href="/#vin-search" className="inline-flex items-center gap-2 bg-white text-blue-700 font-bold px-7 py-3.5 rounded-full hover:scale-105 active:scale-100 transition-transform">
          <Search className="w-4 h-4" aria-hidden="true" /> Run a VIN check
        </Link>
      </section>
    </main>
  );
}
