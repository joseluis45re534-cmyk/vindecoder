import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Check, ShieldCheck, Search, ArrowRight } from 'lucide-react';
import { getComparisonBySlug, COMPETITORS, comparisonSlug } from '@/lib/comparisons';
import { SITE_URL, SITE_NAME } from '@/lib/site';
import { TRIAL_PLAN, formatPrice } from '@/lib/pricing';
import JsonLd from '@/components/JsonLd';
import { breadcrumbLd, faqPageLd } from '@/lib/structured-data';

export const runtime = 'edge';

const fee = () => formatPrice(TRIAL_PLAN.trialFeeCents ?? 100);

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const c = getComparisonBySlug(slug);
  if (!c) return { title: 'Comparison not found' };
  const title = `CarVinLookup vs. ${c.name}: Which Vehicle History Report?`;
  const description = `CarVinLookup vs. ${c.name} compared head-to-head — data sources, free preview, pricing model, and coverage — so you can pick the right vehicle history report.`;
  const url = `${SITE_URL}/compare/${comparisonSlug(c.slug)}`;
  return {
    title,
    description,
    alternates: { canonical: `/compare/${comparisonSlug(c.slug)}` },
    openGraph: {
      type: 'website',
      siteName: SITE_NAME,
      title,
      description,
      url,
      locale: 'en_US',
      images: [{ url: '/opengraph-image', width: 1200, height: 630, alt: `CarVinLookup vs ${c.name}` }],
    },
    twitter: { card: 'summary_large_image', title, description, images: ['/opengraph-image'] },
  };
}

const ROWS = [
  { feature: 'Free identity preview before paying', us: 'Yes — always', them: 'Varies by provider' },
  { feature: 'Title brands (salvage, rebuilt, flood)', us: 'Yes — NMVTIS, all 50 states', them: 'Typically yes' },
  { feature: 'Theft records', us: 'Yes — NICB', them: 'Varies' },
  { feature: 'Open lien check', us: 'Yes', them: 'Varies' },
  { feature: 'Odometer history', us: 'Yes', them: 'Typically yes' },
  { feature: 'Search by license plate', us: 'Yes — all 50 states', them: 'Varies' },
  { feature: 'Pricing model', us: `Low-cost start from a ${'{fee}'} trial`, them: 'Varies by provider' },
  { feature: 'Cancel anytime', us: 'Yes', them: 'Varies' },
];

export default async function ComparePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const c = getComparisonBySlug(slug);
  if (!c) notFound();

  const url = `${SITE_URL}/compare/${comparisonSlug(c.slug)}`;
  const f = fee();
  const others = COMPETITORS.filter((x) => x.slug !== c.slug).slice(0, 6);

  const faq = [
    { q: `Is CarVinLookup better than ${c.name}?`, a: `For a typical U.S. used-car purchase, CarVinLookup gives you the core records that matter — title brands, theft, liens, and odometer — from NMVTIS, NICB, and state DMVs, with a free preview and a low ${f} start. ${c.name} ${c.bestFor.charAt(0).toLowerCase() + c.bestFor.slice(1)}` },
    { q: `Do CarVinLookup and ${c.name} use the same data?`, a: `Both rely on official title and records data. CarVinLookup specifically combines NMVTIS title brands, NICB theft records, and state DMV data, and always shows a free identity preview before you pay.` },
    { q: `Which is cheaper?`, a: `CarVinLookup starts from a ${f} trial and shows a free preview first, so you never pay before confirming the vehicle. Competitor pricing changes — check ${c.name}'s site for current rates.` },
  ];

  const schema = [
    breadcrumbLd([
      { name: 'Home', url: SITE_URL },
      { name: 'Compare', url: `${SITE_URL}/compare` },
      { name: `CarVinLookup vs. ${c.name}`, url },
    ]),
    faqPageLd(faq),
  ];

  return (
    <main className="min-h-screen bg-slate-50">
      <JsonLd data={schema} />

      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-slate-950 via-blue-950 to-slate-900 pt-12 sm:pt-16 pb-16 px-4 sm:px-6 lg:px-8">
        <div aria-hidden="true" className="animate-float pointer-events-none absolute -top-40 left-1/2 w-[600px] h-[400px] rounded-full bg-blue-600/20 blur-3xl" />
        <div className="relative max-w-3xl mx-auto text-center">
          <nav aria-label="Breadcrumb" className="mb-6">
            <ol className="flex items-center justify-center gap-1.5 text-xs sm:text-sm text-blue-200/70">
              <li><Link href="/" className="hover:text-white">Home</Link></li>
              <li aria-hidden="true">/</li>
              <li><Link href="/compare" className="hover:text-white">Compare</Link></li>
              <li aria-hidden="true">/</li>
              <li className="text-blue-100 font-medium">vs. {c.name}</li>
            </ol>
          </nav>
          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white mb-5 leading-tight">
            CarVinLookup <span className="text-slate-400 font-bold">vs.</span> {c.name}
          </h1>
          <p className="text-base sm:text-lg text-slate-300 max-w-2xl mx-auto">
            A head-to-head look at data sources, free preview, pricing model, and coverage — so you pick the right vehicle history report.
          </p>
        </div>
      </section>

      {/* Verdict */}
      <section className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8">
        <div className="bg-white rounded-2xl border border-slate-200 shadow-lg p-6 sm:p-8">
          <p className="text-xs font-bold uppercase tracking-wide text-blue-600 mb-2">The short answer</p>
          <p className="text-slate-700 leading-relaxed">
            {c.known} <strong className="text-slate-900">CarVinLookup</strong> is built for U.S. used-car buyers who want the records that decide a purchase — title brands, theft, liens, and odometer — from NMVTIS, NICB, and DMV data, with a free preview before paying and full access from a {f} trial.
          </p>
        </div>
      </section>

      {/* Table */}
      <section className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <h2 className="text-2xl font-extrabold text-slate-900 mb-6 text-center">Feature-by-feature</h2>
        <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-sm">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50">
                <th className="text-left font-semibold text-slate-700 px-4 py-3">Feature</th>
                <th className="text-left font-semibold text-blue-700 px-4 py-3">CarVinLookup</th>
                <th className="text-left font-semibold text-slate-600 px-4 py-3">{c.name}</th>
              </tr>
            </thead>
            <tbody>
              {ROWS.map((row) => (
                <tr key={row.feature} className="border-b border-slate-100 last:border-0 align-top">
                  <td className="px-4 py-3 text-slate-700 font-medium">{row.feature}</td>
                  <td className="px-4 py-3 text-slate-700">{row.us.replace('{fee}', f)}</td>
                  <td className="px-4 py-3 text-slate-500">{row.them}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="text-xs text-slate-400 mt-3 text-center">
          Provider plans and features change. Confirm current {c.name} details on their official site.
        </p>
      </section>

      {/* Who should pick which */}
      <section className="bg-white border-y border-slate-100 py-14 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="rounded-2xl border-2 border-blue-200 bg-blue-50/40 p-6">
            <h3 className="font-extrabold text-slate-900 mb-3 flex items-center gap-2">
              <Check className="w-5 h-5 text-blue-600" aria-hidden="true" /> Choose CarVinLookup if…
            </h3>
            <ul className="space-y-2 text-sm text-slate-600">
              <li>You want to confirm the car with a free preview before paying.</li>
              <li>You want NMVTIS, NICB, and DMV records in one clear report.</li>
              <li>You are buying a U.S. car and want a low-cost start and the ability to cancel anytime.</li>
            </ul>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-6">
            <h3 className="font-extrabold text-slate-900 mb-3">Consider {c.name} if…</h3>
            <p className="text-sm text-slate-600">{c.bestFor}</p>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <h2 className="text-2xl font-extrabold text-slate-900 mb-6">FAQ</h2>
        <div className="space-y-3">
          {faq.map(({ q, a }) => (
            <details key={q} className="group bg-white rounded-2xl border border-slate-100 open:shadow-md transition-all">
              <summary className="flex items-center justify-between cursor-pointer list-none px-6 py-4 font-bold text-slate-900">
                {q}
                <span className="ml-4 text-blue-600 transition-transform group-open:rotate-45 text-xl leading-none" aria-hidden="true">+</span>
              </summary>
              <p className="px-6 pb-5 text-slate-500 leading-relaxed">{a}</p>
            </details>
          ))}
        </div>
        <div className="mt-8">
          <Link href={`/${c.slug}-alternative`} className="inline-flex items-center gap-1.5 text-sm font-bold text-blue-600 hover:text-blue-700">
            Read: the best {c.name} alternative <ArrowRight className="w-4 h-4" aria-hidden="true" />
          </Link>
        </div>
      </section>

      {/* Other comparisons */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pb-14">
        <h2 className="text-xl font-extrabold text-slate-900 mb-5">Other comparisons</h2>
        <div className="flex flex-wrap gap-2.5">
          {others.map((x) => (
            <Link
              key={x.slug}
              href={`/compare/${comparisonSlug(x.slug)}`}
              className="text-sm font-medium bg-white border border-slate-200 hover:border-blue-300 hover:text-blue-600 text-slate-600 px-4 py-2 rounded-full transition-colors"
            >
              vs. {x.name}
            </Link>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="bg-gradient-to-br from-blue-700 to-blue-900 py-14 px-4 text-center">
        <ShieldCheck className="w-8 h-8 text-blue-200 mx-auto mb-3" aria-hidden="true" />
        <h2 className="text-2xl sm:text-3xl font-extrabold text-white mb-3">Check a VIN now</h2>
        <p className="text-blue-100 mb-6">Free preview · full report from {f}.</p>
        <Link href="/#vin-search" className="inline-flex items-center gap-2 bg-white text-blue-700 font-bold px-7 py-3.5 rounded-full hover:scale-105 active:scale-100 transition-transform">
          <Search className="w-4 h-4" aria-hidden="true" /> Run a VIN check
        </Link>
      </section>
    </main>
  );
}
