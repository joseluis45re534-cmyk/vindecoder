import type { Metadata } from 'next';
import Link from 'next/link';
import { HOW_TO_GUIDES, type HowToGuide } from '@/lib/how-to';
import { SITE_URL, SITE_NAME } from '@/lib/site';
import JsonLd from '@/components/JsonLd';
import { breadcrumbLd } from '@/lib/structured-data';

export const runtime = 'edge';

export const metadata: Metadata = {
  title: 'How-To Guides: VIN Checks & Buying a Used Car Safely',
  description:
    'Step-by-step how-to guides on checking a VIN, reading a history report, spotting fraud, valuing a car, and negotiating — everything you need to buy used with confidence.',
  alternates: { canonical: '/how-to' },
  openGraph: {
    type: 'website',
    siteName: SITE_NAME,
    title: 'How-To Guides — CarVinLookup',
    description: 'Step-by-step guides on VIN checks, history reports, used-car fraud, and buying safely.',
    url: `${SITE_URL}/how-to`,
    locale: 'en_US',
    images: [{ url: '/opengraph-image', width: 1200, height: 630, alt: 'CarVinLookup how-to guides' }],
  },
};

const CATEGORY_ORDER: HowToGuide['category'][] = ['VIN basics', 'Reports & records', 'Fraud & red flags', 'Buying safely'];

export default function HowToHub() {
  const byCategory = CATEGORY_ORDER.map((cat) => ({
    cat,
    guides: HOW_TO_GUIDES.filter((g) => g.category === cat),
  })).filter((group) => group.guides.length > 0);

  const schema = [
    {
      '@context': 'https://schema.org',
      '@type': 'CollectionPage',
      '@id': `${SITE_URL}/how-to`,
      name: 'How-To Guides',
      url: `${SITE_URL}/how-to`,
      description: 'Step-by-step guides on VIN checks, vehicle history reports, used-car fraud, and buying safely.',
      isPartOf: { '@id': `${SITE_URL}/#website` },
      hasPart: HOW_TO_GUIDES.map((g) => ({
        '@type': 'HowTo',
        name: g.title,
        url: `${SITE_URL}/how-to/${g.slug}`,
      })),
    },
    breadcrumbLd([
      { name: 'Home', url: SITE_URL },
      { name: 'How-to guides', url: `${SITE_URL}/how-to` },
    ]),
  ];

  return (
    <main className="min-h-screen bg-slate-50">
      <JsonLd data={schema} />

      <section className="bg-white border-b border-slate-100 py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-sm font-semibold text-blue-600 uppercase tracking-widest mb-3">How-To Guides</p>
          <h1 className="text-4xl sm:text-5xl font-extrabold text-slate-900 tracking-tight mb-4">
            Buy a used car the right way
          </h1>
          <p className="text-lg text-slate-500 max-w-2xl mx-auto">
            Clear, step-by-step guides to checking a VIN, reading a history report, spotting fraud, and negotiating a fair price.
          </p>
        </div>
      </section>

      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-14">
        {byCategory.map(({ cat, guides }) => (
          <div key={cat}>
            <h2 className="text-xl font-extrabold text-slate-900 mb-6">{cat}</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {guides.map((g) => (
                <Link
                  key={g.slug}
                  href={`/how-to/${g.slug}`}
                  className="block bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all p-6"
                >
                  <h3 className="text-lg font-bold text-slate-900 mb-2 leading-snug">{g.title}</h3>
                  <p className="text-slate-500 text-sm leading-relaxed mb-3">{g.description}</p>
                  <span className="text-sm font-bold text-blue-600 inline-flex items-center gap-1">
                    Read guide <span aria-hidden="true">→</span>
                  </span>
                </Link>
              ))}
            </div>
          </div>
        ))}
      </section>
    </main>
  );
}
