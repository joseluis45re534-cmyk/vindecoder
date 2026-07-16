import type { Metadata } from 'next';
import Link from 'next/link';
import { Search } from 'lucide-react';
import LeaseCalculator from '@/components/calculators/LeaseCalculator';
import { SITE_URL, SITE_NAME } from '@/lib/site';
import JsonLd from '@/components/JsonLd';
import { breadcrumbLd, faqPageLd } from '@/lib/structured-data';

export const runtime = 'edge';

export const metadata: Metadata = {
  title: 'Car Lease Calculator: Estimate Your Monthly Lease Payment',
  description:
    'Free car lease calculator. Enter MSRP, negotiated price, residual, money factor, and term to estimate your monthly lease payment and total cost.',
  alternates: { canonical: '/lease-calculator' },
  openGraph: {
    type: 'website',
    siteName: SITE_NAME,
    title: 'Car Lease Calculator — CarVinLookup',
    description: 'Estimate your monthly lease payment and total lease cost.',
    url: `${SITE_URL}/lease-calculator`,
    locale: 'en_US',
    images: [{ url: '/opengraph-image.png', width: 1200, height: 630, alt: 'Car lease calculator' }],
  },
};

const faq = [
  { q: 'How is a lease payment calculated?', a: 'A lease payment has two parts: the depreciation fee (the negotiated price minus the residual value, divided by the term) and the finance or rent charge (the price plus residual, times the money factor). Sales tax is then applied.' },
  { q: 'What is a money factor?', a: 'The money factor is the lease equivalent of an interest rate. Multiply it by 2400 to approximate the APR — for example, a 0.0015 money factor is roughly 3.6% APR.' },
  { q: 'What is residual value?', a: 'The residual is the vehicle projected worth at the end of the lease, set as a percentage of MSRP. A higher residual means less depreciation to pay for and a lower monthly payment.' },
];

export default function LeaseCalculatorPage() {
  const schema = [
    {
      '@context': 'https://schema.org',
      '@type': 'WebApplication',
      name: 'Car Lease Calculator',
      url: `${SITE_URL}/lease-calculator`,
      applicationCategory: 'FinanceApplication',
      operatingSystem: 'Web',
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
      isPartOf: { '@id': `${SITE_URL}/#website` },
    },
    breadcrumbLd([
      { name: 'Home', url: SITE_URL },
      { name: 'Lease calculator', url: `${SITE_URL}/lease-calculator` },
    ]),
    faqPageLd(faq),
  ];

  return (
    <main className="min-h-screen bg-slate-50">
      <JsonLd data={schema} />

      <section className="bg-white border-b border-slate-100 py-14 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto text-center">
          <p className="text-sm font-semibold text-blue-600 uppercase tracking-widest mb-3">Calculator</p>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight mb-4">Car lease calculator</h1>
          <p className="text-lg text-slate-500">Estimate your monthly lease payment from MSRP, residual, and money factor.</p>
        </div>
      </section>

      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <LeaseCalculator />
      </section>

      <article className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 pb-8 prose-content">
        <h2>Leasing a used car? Check the VIN first</h2>
        <p>
          Lease deals hinge on the residual value — and a hidden accident or title brand quietly lowers what a car is really
          worth. Before you sign, run a <Link href="/#vin-search">VIN check</Link> to confirm the history. Compare financing
          with our <Link href="/auto-loan-calculator">auto loan calculator</Link> and{' '}
          <Link href="/depreciation-calculator">depreciation calculator</Link>.
        </p>
      </article>

      <section className="bg-white border-t border-slate-100 py-14 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-2xl font-extrabold text-slate-900 mb-8">Lease calculator — FAQ</h2>
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
        <h2 className="text-2xl sm:text-3xl font-extrabold text-white mb-3">Know the car before you lease</h2>
        <p className="text-blue-100 mb-6">Free preview · full history by VIN.</p>
        <Link href="/#vin-search" className="inline-flex items-center gap-2 bg-white text-blue-700 font-bold px-7 py-3.5 rounded-full hover:scale-105 active:scale-100 transition-transform">
          <Search className="w-4 h-4" aria-hidden="true" /> Run a VIN check
        </Link>
      </section>
    </main>
  );
}
