import type { Metadata } from 'next';
import Link from 'next/link';
import { ShieldAlert, Search } from 'lucide-react';
import { SITE_URL, SITE_NAME } from '@/lib/site';
import JsonLd from '@/components/JsonLd';
import { breadcrumbLd, faqPageLd } from '@/lib/structured-data';

export const runtime = 'edge';

export const metadata: Metadata = {
  title: 'Most Stolen Cars in the U.S. (NICB Data) — CarVinLookup',
  description:
    'The vehicles that consistently top the NICB Hot Wheels most-stolen list, why they are targeted, and how to check if a used car was ever reported stolen.',
  alternates: { canonical: '/most-stolen-cars' },
  openGraph: {
    type: 'article',
    siteName: SITE_NAME,
    title: 'Most Stolen Cars in the U.S.',
    description: 'The most-stolen vehicles per NICB, why they are targeted, and how to check a VIN for theft.',
    url: `${SITE_URL}/most-stolen-cars`,
    locale: 'en_US',
    images: [{ url: '/opengraph-image.png', width: 1200, height: 630, alt: 'Most stolen cars' }],
  },
};

// Models that have consistently appeared in recent NICB "Hot Wheels" top-ten
// most-stolen reporting. Presented as a list (not with per-model theft counts,
// which shift yearly) with a live link to the current NICB report.
const MOST_STOLEN = [
  'Hyundai Elantra',
  'Hyundai Sonata',
  'Honda Accord',
  'Chevrolet Silverado 1500',
  'Honda Civic',
  'Kia Optima',
  'Ford F-150',
  'Toyota Camry',
  'Honda CR-V',
  'Nissan Altima',
];

const faq = [
  { q: 'What is the most stolen car in the U.S.?', a: 'In recent NICB Hot Wheels reporting, the Hyundai Elantra has ranked at or near the top, alongside other Hyundai and Kia models and full-size pickups. Exact rankings change each year — check the current NICB report for the latest.' },
  { q: 'Why are Hyundai and Kia models targeted?', a: 'A widely reported security vulnerability made certain Hyundai and Kia models easier to steal. The manufacturers have since issued software updates, and NICB has reported thefts of these models declining as a result.' },
  { q: 'How do I check if a used car was stolen?', a: 'Run the VIN. A history report flags theft records from the NICB, and you should also confirm the VIN plates match the title. See our stolen-vehicle check.' },
];

export default function MostStolenCarsPage() {
  const schema = [
    {
      '@context': 'https://schema.org',
      '@type': 'Article',
      headline: 'Most Stolen Cars in the U.S.',
      description: 'The vehicles that consistently rank among the most stolen per NICB, and how to check a VIN for theft.',
      author: { '@type': 'Organization', name: SITE_NAME, url: SITE_URL },
      publisher: { '@type': 'Organization', name: SITE_NAME, logo: { '@type': 'ImageObject', url: `${SITE_URL}/icon-512.png` } },
      mainEntityOfPage: { '@type': 'WebPage', '@id': `${SITE_URL}/most-stolen-cars` },
    },
    breadcrumbLd([
      { name: 'Home', url: SITE_URL },
      { name: 'Problems', url: `${SITE_URL}/problems` },
      { name: 'Most stolen cars', url: `${SITE_URL}/most-stolen-cars` },
    ]),
    faqPageLd(faq),
  ];

  return (
    <main className="min-h-screen bg-slate-50">
      <JsonLd data={schema} />

      <section className="relative overflow-hidden bg-gradient-to-br from-slate-950 via-blue-950 to-slate-900 pt-12 sm:pt-16 pb-16 px-4 sm:px-6 lg:px-8">
        <div aria-hidden="true" className="animate-float pointer-events-none absolute -top-40 left-1/2 w-[600px] h-[400px] rounded-full bg-blue-600/20 blur-3xl" />
        <div className="relative max-w-3xl mx-auto text-center">
          <nav aria-label="Breadcrumb" className="mb-6">
            <ol className="flex items-center justify-center gap-1.5 text-xs sm:text-sm text-blue-200/70">
              <li><Link href="/" className="hover:text-white">Home</Link></li>
              <li aria-hidden="true">/</li>
              <li><Link href="/problems" className="hover:text-white">Problems</Link></li>
              <li aria-hidden="true">/</li>
              <li className="text-blue-100 font-medium">Most stolen cars</li>
            </ol>
          </nav>
          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white mb-5 leading-tight">Most stolen cars in the U.S.</h1>
          <p className="text-base sm:text-lg text-slate-300 max-w-2xl mx-auto">
            The vehicles that consistently top the NICB most-stolen rankings — and how to check whether a specific car was ever reported stolen.
          </p>
        </div>
      </section>

      <article className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-14 prose-content">
        <p>
          Each year the National Insurance Crime Bureau (NICB) publishes its &ldquo;Hot Wheels&rdquo; report of the most stolen
          vehicles in the United States. The following models have consistently appeared among the ten most stolen in recent
          reporting. Rankings and theft counts shift year to year, so treat this as the pattern of high-risk models rather than
          a fixed order — the{' '}
          <a href="https://www.nicb.org/news/news-releases/nicb-releases-annual-hot-wheels-report-americas-top-ten-most-stolen-vehicles" rel="nofollow noopener" target="_blank">
            current NICB Hot Wheels report
          </a>{' '}
          has the latest figures.
        </p>

        <h2>Frequently among the most stolen (per NICB)</h2>
        <ol>
          {MOST_STOLEN.map((m) => (
            <li key={m}>{m}</li>
          ))}
        </ol>

        <h2>Why these vehicles?</h2>
        <p>
          Two patterns dominate the list. First, high-volume, long-running models like the Honda Accord and Civic are simply
          everywhere, and their parts are in constant demand. Second, certain Hyundai and Kia models were affected by a widely
          reported security vulnerability that made them easier to steal; the manufacturers have since issued software updates,
          and NICB has reported thefts of those models declining. Full-size pickups such as the Chevrolet Silverado 1500 and
          Ford F-150 remain perennial targets for their value and resale demand.
        </p>

        <h2>How to protect yourself when buying used</h2>
        <p>
          If you are buying a used car — especially one of these models — confirm it was never reported stolen and that its VIN
          has not been cloned. Run a <Link href="/stolen-vehicle-check">stolen vehicle check</Link>, match the VIN across the
          windshield, door jamb, and title, and read our guide on{' '}
          <Link href="/how-to/find-stolen-car">how to check if a car is stolen</Link>. The free{' '}
          <a href="https://www.nicb.org/vincheck" rel="nofollow noopener" target="_blank">NICB VINCheck</a> also screens for
          theft and salvage records.
        </p>
      </article>

      <section className="bg-white border-y border-slate-100 py-14 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-2xl font-extrabold text-slate-900 mb-8">Most stolen cars — FAQ</h2>
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
        <ShieldAlert className="w-8 h-8 text-blue-200 mx-auto mb-3" aria-hidden="true" />
        <h2 className="text-2xl sm:text-3xl font-extrabold text-white mb-3">Check a VIN for theft records</h2>
        <p className="text-blue-100 mb-6">Free preview · theft, title, lien &amp; odometer history.</p>
        <Link href="/#vin-search" className="inline-flex items-center gap-2 bg-white text-blue-700 font-bold px-7 py-3.5 rounded-full hover:scale-105 active:scale-100 transition-transform">
          <Search className="w-4 h-4" aria-hidden="true" /> Run a VIN check
        </Link>
      </section>
    </main>
  );
}
