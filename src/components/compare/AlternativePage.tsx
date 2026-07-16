import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Check, X, ShieldCheck, Search } from 'lucide-react';
import { getCompetitor, comparisonSlug, OUR_ADVANTAGES, COMPETITORS } from '@/lib/comparisons';
import { SITE_URL, SITE_NAME } from '@/lib/site';
import { TRIAL_PLAN, formatPrice } from '@/lib/pricing';
import JsonLd from '@/components/JsonLd';
import { breadcrumbLd, faqPageLd } from '@/lib/structured-data';
import SearchForm from '@/components/SearchForm';

const fee = () => formatPrice(TRIAL_PLAN.trialFeeCents ?? 100);

/** Static Metadata for a /{slug}-alternative page. */
export function altMetadata(slug: string): Metadata {
  const c = getCompetitor(slug);
  if (!c) return { title: 'Alternative not found' };
  const title = `The Best ${c.name} Alternative — CarVinLookup`;
  const description = `Looking for a ${c.name} alternative? CarVinLookup runs U.S. vehicle history reports from NMVTIS, NICB & DMV data — free preview, then full access from a ${fee()} trial.`;
  const url = `${SITE_URL}/${c.slug}-alternative`;
  return {
    title,
    description,
    alternates: { canonical: `/${c.slug}-alternative` },
    openGraph: {
      type: 'website',
      siteName: SITE_NAME,
      title,
      description,
      url,
      locale: 'en_US',
      images: [{ url: '/opengraph-image.png', width: 1200, height: 630, alt: `${c.name} alternative` }],
    },
    twitter: { card: 'summary_large_image', title, description, images: ['/opengraph-image.png'] },
  };
}

const COMPARE_ROWS = [
  { feature: 'Free preview before paying', us: true, them: 'varies' as const },
  { feature: 'Title brands (NMVTIS)', us: true, them: true },
  { feature: 'Theft records (NICB)', us: true, them: 'varies' as const },
  { feature: 'Lien check', us: true, them: 'varies' as const },
  { feature: 'Odometer history', us: true, them: true },
  { feature: 'VIN or U.S. license plate', us: true, them: 'varies' as const },
  { feature: 'Low-cost trial start', us: true, them: 'varies' as const },
  { feature: 'Cancel anytime', us: true, them: 'varies' as const },
];

function Cell({ value }: { value: boolean | 'varies' }) {
  if (value === true) return <Check className="w-5 h-5 text-emerald-600 mx-auto" aria-label="Yes" />;
  if (value === 'varies') return <span className="text-slate-400 text-sm">Varies</span>;
  return <X className="w-5 h-5 text-slate-300 mx-auto" aria-label="No" />;
}

export function AlternativePage({ slug }: { slug: string }) {
  const c = getCompetitor(slug);
  if (!c) notFound();

  const others = COMPETITORS.filter((x) => x.slug !== c.slug).slice(0, 6);
  const url = `${SITE_URL}/${c.slug}-alternative`;
  const f = fee();

  const faq = [
    { q: `Is CarVinLookup a good ${c.name} alternative?`, a: `Yes. CarVinLookup covers the core records that matter on a used car — title brands, theft, liens, and odometer history — sourced from NMVTIS, NICB, and state DMVs, with a free identity preview before you pay and full access from a ${f} trial.` },
    { q: `How much does CarVinLookup cost compared to ${c.name}?`, a: `Full report access starts from a ${f} trial and then continues monthly unless you cancel. You always see a free preview first, so you confirm the vehicle before spending anything.` },
    { q: `Can I check a car by license plate?`, a: `Yes. Enter a U.S. license plate and state and CarVinLookup resolves it to the VIN, then runs the full report — in all 50 states.` },
  ];

  const schema = [
    {
      '@context': 'https://schema.org',
      '@type': 'WebPage',
      '@id': url,
      name: `The Best ${c.name} Alternative`,
      url,
      description: `Why CarVinLookup is a strong ${c.name} alternative for U.S. vehicle history reports.`,
      isPartOf: { '@id': `${SITE_URL}/#website` },
      about: { '@id': `${SITE_URL}/#service` },
    },
    breadcrumbLd([
      { name: 'Home', url: SITE_URL },
      { name: 'Compare', url: `${SITE_URL}/compare` },
      { name: `${c.name} alternative`, url },
    ]),
    faqPageLd(faq),
  ];

  return (
    <main className="min-h-screen bg-slate-50">
      <JsonLd data={schema} />

      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-slate-950 via-blue-950 to-slate-900 pt-12 sm:pt-16 pb-20 px-4 sm:px-6 lg:px-8">
        <div aria-hidden="true" className="animate-float pointer-events-none absolute -top-40 left-1/2 w-[600px] h-[400px] rounded-full bg-blue-600/20 blur-3xl" />
        <div className="relative max-w-3xl mx-auto text-center">
          <nav aria-label="Breadcrumb" className="mb-6">
            <ol className="flex items-center justify-center gap-1.5 text-xs sm:text-sm text-blue-200/70">
              <li><Link href="/" className="hover:text-white">Home</Link></li>
              <li aria-hidden="true">/</li>
              <li><Link href="/compare" className="hover:text-white">Compare</Link></li>
              <li aria-hidden="true">/</li>
              <li className="text-blue-100 font-medium">{c.name} alternative</li>
            </ol>
          </nav>
          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white mb-5 leading-tight">
            The best <span className="bg-gradient-to-r from-blue-400 to-sky-300 bg-clip-text text-transparent">{c.name} alternative</span>
          </h1>
          <p className="text-base sm:text-lg text-slate-300 mb-8 max-w-2xl mx-auto">
            {c.known} CarVinLookup gives you the records that actually decide a used-car purchase — with a free preview before you pay a cent.
          </p>
          <SearchForm />
          <p className="mt-5 text-sm text-slate-400">Free preview · Full report from {f} · All 50 states</p>
        </div>
      </section>

      {/* Comparison table */}
      <section className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <h2 className="text-2xl font-extrabold text-slate-900 mb-6 text-center">CarVinLookup vs. {c.name}</h2>
        <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-sm">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50">
                <th className="text-left font-semibold text-slate-700 px-4 py-3">Feature</th>
                <th className="font-semibold text-blue-700 px-4 py-3">CarVinLookup</th>
                <th className="font-semibold text-slate-600 px-4 py-3">{c.name}</th>
              </tr>
            </thead>
            <tbody>
              {COMPARE_ROWS.map((row) => (
                <tr key={row.feature} className="border-b border-slate-100 last:border-0">
                  <td className="px-4 py-3 text-slate-700">{row.feature}</td>
                  <td className="px-4 py-3 text-center"><Cell value={row.us} /></td>
                  <td className="px-4 py-3 text-center"><Cell value={row.them} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="text-xs text-slate-400 mt-3 text-center">
          &ldquo;Varies&rdquo; reflects that provider plans and features change. Always confirm current details on {c.name}&rsquo;s official site.
        </p>
      </section>

      {/* Our advantages */}
      <section className="bg-white border-y border-slate-100 py-14 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-2xl font-extrabold text-slate-900 mb-8 text-center">Why buyers choose CarVinLookup</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {OUR_ADVANTAGES.map((a) => (
              <div key={a.label} className="bg-slate-50 rounded-2xl border border-slate-100 p-6">
                <span className="inline-flex w-10 h-10 rounded-xl items-center justify-center mb-4 text-emerald-600 bg-emerald-50">
                  <Check className="w-5 h-5" aria-hidden="true" />
                </span>
                <h3 className="font-bold text-slate-900 mb-1">{a.label}</h3>
                <p className="text-sm text-slate-500">{a.detail.replace('{fee}', f)}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Switch angle + honest balance */}
      <section className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-14 prose-content">
        <h2>Switching from {c.name}</h2>
        <p>{c.switchAngle}</p>
        <h2>Where {c.name} might still fit</h2>
        <p>{c.bestFor} We think most U.S. used-car buyers are best served by seeing a free preview first and paying a low trial price only when they are ready to unlock the full history.</p>
      </section>

      {/* FAQ */}
      <section className="bg-white border-t border-slate-100 py-14 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-2xl font-extrabold text-slate-900 mb-8">{c.name} alternative — FAQ</h2>
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

      {/* Other alternatives */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <h2 className="text-2xl font-extrabold text-slate-900 mb-6">Compare other providers</h2>
        <div className="flex flex-wrap gap-2.5">
          {others.map((x) => (
            <Link
              key={x.slug}
              href={`/${x.slug}-alternative`}
              className="text-sm font-medium bg-white border border-slate-200 hover:border-blue-300 hover:text-blue-600 text-slate-600 px-4 py-2 rounded-full transition-colors"
            >
              {x.name} alternative
            </Link>
          ))}
          <Link href={`/compare/${comparisonSlug(c.slug)}`} className="text-sm font-bold bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-full transition-colors">
            CarVinLookup vs. {c.name} →
          </Link>
        </div>
      </section>

      {/* Final CTA */}
      <section className="bg-gradient-to-br from-blue-700 to-blue-900 py-14 px-4 text-center">
        <ShieldCheck className="w-8 h-8 text-blue-200 mx-auto mb-3" aria-hidden="true" />
        <h2 className="text-2xl sm:text-3xl font-extrabold text-white mb-3">Run your VIN now</h2>
        <p className="text-blue-100 mb-6">Free preview · full report in under a minute.</p>
        <Link href="/#vin-search" className="inline-flex items-center gap-2 bg-white text-blue-700 font-bold px-7 py-3.5 rounded-full hover:scale-105 active:scale-100 transition-transform">
          <Search className="w-4 h-4" aria-hidden="true" /> Check a VIN
        </Link>
      </section>
    </main>
  );
}
