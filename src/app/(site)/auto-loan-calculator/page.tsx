import type { Metadata } from 'next';
import Link from 'next/link';
import { Search } from 'lucide-react';
import PaymentCalculator from '@/components/PaymentCalculator';
import { SITE_URL, SITE_NAME } from '@/lib/site';
import JsonLd from '@/components/JsonLd';
import { breadcrumbLd, faqPageLd } from '@/lib/structured-data';

export const runtime = 'edge';

export const metadata: Metadata = {
  title: 'Auto Loan Calculator: Estimate Your Monthly Car Payment',
  description:
    'Free auto loan calculator. Enter the price, down payment, APR, and term to estimate your monthly car payment and total interest before you buy.',
  alternates: { canonical: '/auto-loan-calculator' },
  openGraph: {
    type: 'website',
    siteName: SITE_NAME,
    title: 'Auto Loan Calculator — CarVinLookup',
    description: 'Estimate your monthly car payment and total interest.',
    url: `${SITE_URL}/auto-loan-calculator`,
    locale: 'en_US',
    images: [{ url: '/opengraph-image', width: 1200, height: 630, alt: 'Auto loan calculator' }],
  },
};

const faq = [
  { q: 'How is a car loan payment calculated?', a: 'The monthly payment is based on the amount financed (price minus down payment), the APR, and the loan term. The formula amortizes the loan so each payment covers interest plus a share of principal.' },
  { q: 'Does a longer loan term lower my payment?', a: 'Yes, a longer term lowers the monthly payment but increases the total interest you pay. A shorter term costs more per month but less overall.' },
  { q: 'Why check a vehicle history before financing?', a: 'A salvage or branded title can make a car harder to finance and insure, and lowers resale value. Running the VIN first protects the money you are about to borrow.' },
];

export default function AutoLoanCalculatorPage() {
  const schema = [
    {
      '@context': 'https://schema.org',
      '@type': 'WebApplication',
      name: 'Auto Loan Calculator',
      url: `${SITE_URL}/auto-loan-calculator`,
      applicationCategory: 'FinanceApplication',
      operatingSystem: 'Web',
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
      isPartOf: { '@id': `${SITE_URL}/#website` },
    },
    breadcrumbLd([
      { name: 'Home', url: SITE_URL },
      { name: 'Auto loan calculator', url: `${SITE_URL}/auto-loan-calculator` },
    ]),
    faqPageLd(faq),
  ];

  return (
    <main className="min-h-screen bg-slate-50">
      <JsonLd data={schema} />

      <section className="bg-white border-b border-slate-100 py-14 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto text-center">
          <p className="text-sm font-semibold text-blue-600 uppercase tracking-widest mb-3">Calculator</p>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight mb-4">Auto loan calculator</h1>
          <p className="text-lg text-slate-500">Estimate your monthly car payment and total interest before you sign.</p>
        </div>
      </section>

      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <PaymentCalculator />
      </section>

      <article className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 pb-8 prose-content">
        <h2>Before you finance, check the VIN</h2>
        <p>
          A monthly payment is only a good deal on a car that is actually worth it. A salvage title, flood damage, or an
          odometer rollback can wipe out any savings — and make the car harder to insure and resell. Run a{' '}
          <Link href="/#vin-search">VIN check</Link> first, then use this calculator on a car you trust. See also our{' '}
          <Link href="/lease-calculator">lease calculator</Link> and{' '}
          <Link href="/depreciation-calculator">depreciation calculator</Link>.
        </p>
      </article>

      <section className="bg-white border-t border-slate-100 py-14 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-2xl font-extrabold text-slate-900 mb-8">Auto loan calculator — FAQ</h2>
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
        <h2 className="text-2xl sm:text-3xl font-extrabold text-white mb-3">Check the car before you finance it</h2>
        <p className="text-blue-100 mb-6">Free preview · full history by VIN.</p>
        <Link href="/#vin-search" className="inline-flex items-center gap-2 bg-white text-blue-700 font-bold px-7 py-3.5 rounded-full hover:scale-105 active:scale-100 transition-transform">
          <Search className="w-4 h-4" aria-hidden="true" /> Run a VIN check
        </Link>
      </section>
    </main>
  );
}
