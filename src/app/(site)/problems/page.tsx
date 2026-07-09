import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { PROBLEM_PAGES } from '@/lib/problem-pages';
import { SITE_URL, SITE_NAME } from '@/lib/site';
import JsonLd from '@/components/JsonLd';
import { breadcrumbLd } from '@/lib/structured-data';

export const runtime = 'edge';

export const metadata: Metadata = {
  title: 'Used-Car Problems: Stolen, Totaled & Flood-Damaged Cars',
  description:
    'The used-car problems that cost buyers the most — theft, total losses, flood damage, and hidden red flags — and how to check any VIN before you buy.',
  alternates: { canonical: '/problems' },
  openGraph: {
    type: 'website',
    siteName: SITE_NAME,
    title: 'Used-Car Problems — CarVinLookup',
    description: 'Stolen, totaled, and flood-damaged cars, and how to check a VIN before you buy.',
    url: `${SITE_URL}/problems`,
    locale: 'en_US',
    images: [{ url: '/opengraph-image', width: 1200, height: 630, alt: 'Used-car problems' }],
  },
};

const CARDS = [
  { href: '/most-stolen-cars', title: 'Most stolen cars', desc: 'The models that top the NICB most-stolen rankings — and how to check for theft.' },
  { href: '/most-totaled-cars', title: 'Most totaled cars', desc: 'What makes a car a total loss, and how to spot one before you buy.' },
  { href: '/most-flooded-cars', title: 'Most flooded cars', desc: 'How flood cars spread nationwide, and how to avoid buying one.' },
  { href: '/worst-cars-to-buy', title: 'Worst cars to buy', desc: 'The red flags that make any used car a bad buy.' },
];

export default function ProblemsHub() {
  const schema = [
    {
      '@context': 'https://schema.org',
      '@type': 'CollectionPage',
      '@id': `${SITE_URL}/problems`,
      name: 'Used-Car Problems',
      url: `${SITE_URL}/problems`,
      description: 'Guides to the biggest used-car problems and how to check a VIN before buying.',
      isPartOf: { '@id': `${SITE_URL}/#website` },
    },
    breadcrumbLd([
      { name: 'Home', url: SITE_URL },
      { name: 'Problems', url: `${SITE_URL}/problems` },
    ]),
  ];

  return (
    <main className="min-h-screen bg-slate-50">
      <JsonLd data={schema} />

      <section className="bg-white border-b border-slate-100 py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-sm font-semibold text-blue-600 uppercase tracking-widest mb-3">Problems</p>
          <h1 className="text-4xl sm:text-5xl font-extrabold text-slate-900 tracking-tight mb-4">Used-car problems to watch for</h1>
          <p className="text-lg text-slate-500 max-w-2xl mx-auto">
            Theft, total losses, flood damage, and hidden red flags cost used-car buyers the most. Learn the risks — then check any VIN before you buy.
          </p>
        </div>
      </section>

      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {CARDS.map((c) => (
            <Link
              key={c.href}
              href={c.href}
              className="group flex items-start justify-between bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-lg hover:-translate-y-0.5 transition-all p-6"
            >
              <div>
                <h2 className="text-lg font-bold text-slate-900 mb-1">{c.title}</h2>
                <p className="text-sm text-slate-500">{c.desc}</p>
              </div>
              <ArrowRight className="w-5 h-5 text-blue-600 shrink-0 mt-1 group-hover:translate-x-1 transition-transform" aria-hidden="true" />
            </Link>
          ))}
        </div>
      </section>
    </main>
  );
}
