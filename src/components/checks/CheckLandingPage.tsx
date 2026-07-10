import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import {
  AlertTriangle, Droplets, FileText, Car, ShieldAlert, Gauge, Bell, ScanLine, CreditCard,
  Check, ShieldCheck, Search, type LucideIcon,
} from 'lucide-react';
import { getCheckPage, CHECK_PAGES, type CheckIconKey } from '@/lib/checks';
import { US_STATES } from '@/lib/us-states';
import { SITE_URL, SITE_NAME } from '@/lib/site';
import { TRIAL_PLAN, formatPrice } from '@/lib/pricing';
import JsonLd from '@/components/JsonLd';
import { breadcrumbLd, faqPageLd } from '@/lib/structured-data';
import SearchForm from '@/components/SearchForm';

const ICONS: Record<CheckIconKey, LucideIcon> = {
  salvage: AlertTriangle,
  flood: Droplets,
  lien: FileText,
  accident: Car,
  stolen: ShieldAlert,
  odometer: Gauge,
  recall: Bell,
  decoder: ScanLine,
  plate: CreditCard,
};

const fee = () => formatPrice(TRIAL_PLAN.trialFeeCents ?? 100);

export function checkMetadata(slug: string): Metadata {
  const c = getCheckPage(slug);
  if (!c) return { title: 'Check not found' };
  const url = `${SITE_URL}/${c.slug}`;
  return {
    title: c.metaTitle,
    description: c.metaDescription,
    alternates: { canonical: `/${c.slug}` },
    openGraph: {
      type: 'website',
      siteName: SITE_NAME,
      title: c.metaTitle,
      description: c.metaDescription,
      url,
      locale: 'en_US',
      images: [{ url: '/opengraph-image', width: 1200, height: 630, alt: c.h1 }],
    },
    twitter: { card: 'summary_large_image', title: c.metaTitle, description: c.metaDescription, images: ['/opengraph-image'] },
  };
}

export function CheckLandingPage({ slug }: { slug: string }) {
  const c = getCheckPage(slug);
  if (!c) notFound();

  const Icon = ICONS[c.icon];
  const url = `${SITE_URL}/${c.slug}`;
  const f = fee();
  const related = c.related
    .map((s) => CHECK_PAGES.find((x) => x.slug === s))
    .filter((x): x is NonNullable<typeof x> => Boolean(x));

  const schema = [
    {
      '@context': 'https://schema.org',
      '@type': 'WebPage',
      '@id': url,
      name: c.h1,
      url,
      description: c.metaDescription,
      isPartOf: { '@id': `${SITE_URL}/#website` },
      about: { '@id': `${SITE_URL}/#service` },
    },
    {
      '@context': 'https://schema.org',
      '@type': 'Service',
      name: c.h1,
      serviceType: c.name,
      provider: { '@id': `${SITE_URL}/#organization` },
      areaServed: { '@type': 'Country', name: 'United States' },
      description: c.whatItIs,
    },
    breadcrumbLd([
      { name: 'Home', url: SITE_URL },
      { name: c.name, url },
    ]),
    faqPageLd(c.faq),
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
              <li className="text-blue-100 font-medium">{c.name}</li>
            </ol>
          </nav>
          <span className="inline-flex w-14 h-14 rounded-2xl items-center justify-center mb-5 bg-blue-500/20 text-blue-300">
            <Icon className="w-7 h-7" aria-hidden="true" />
          </span>
          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white mb-5 leading-tight">{c.h1}</h1>
          <p className="text-base sm:text-lg text-slate-300 mb-8 max-w-2xl mx-auto">{c.intro}</p>
          <SearchForm />
          <p className="mt-5 text-sm text-slate-400">Free preview · Full report from {f} · All 50 states</p>
        </div>
      </section>

      {/* What it is */}
      <article className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-14 prose-content">
        <h2>What is a {c.name.toLowerCase()}?</h2>
        <p>{c.whatItIs}</p>
      </article>

      {/* What the report shows */}
      <section className="bg-white border-y border-slate-100 py-14 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-2xl font-extrabold text-slate-900 mb-6">What the report shows</h2>
          <ul className="space-y-3">
            {c.reportShows.map((r) => (
              <li key={r} className="flex items-start gap-3 text-slate-700">
                <Check className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" aria-hidden="true" />
                <span>{r}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Steps */}
      <section className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <h2 className="text-2xl font-extrabold text-slate-900 mb-6">How to run a {c.name.toLowerCase()}</h2>
        <ol className="space-y-6">
          {c.steps.map((s, i) => (
            <li key={s.name} className="flex gap-4">
              <span className="shrink-0 w-9 h-9 rounded-full bg-blue-600 text-white font-bold flex items-center justify-center">{i + 1}</span>
              <div>
                <h3 className="font-bold text-slate-900 mb-1">{s.name}</h3>
                <p className="text-slate-600 leading-relaxed">{s.text}</p>
              </div>
            </li>
          ))}
        </ol>
      </section>

      {/* Browse by state (license-plate lookup only) */}
      {c.slug === 'license-plate-lookup' && (
        <section className="bg-white border-t border-slate-100 py-14 px-4 sm:px-6 lg:px-8">
          <div className="max-w-5xl mx-auto">
            <h2 className="text-2xl font-extrabold text-slate-900 mb-6">License plate lookup by state</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2.5">
              {US_STATES.map((s) => (
                <Link
                  key={s.slug}
                  href={`/license-plate-lookup/${s.slug}`}
                  className="text-sm font-medium bg-slate-50 border border-slate-200 hover:border-blue-300 hover:text-blue-600 text-slate-600 px-4 py-2.5 rounded-xl transition-colors"
                >
                  {s.name}
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* FAQ */}
      <section className="bg-white border-t border-slate-100 py-14 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-2xl font-extrabold text-slate-900 mb-8">{c.name} — FAQ</h2>
          <div className="space-y-3">
            {c.faq.map(({ q, a }) => (
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

      {/* Related checks */}
      {related.length > 0 && (
        <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
          <h2 className="text-2xl font-extrabold text-slate-900 mb-6">Related checks</h2>
          <div className="flex flex-wrap gap-2.5">
            {related.map((x) => (
              <Link
                key={x.slug}
                href={`/${x.slug}`}
                className="text-sm font-medium bg-white border border-slate-200 hover:border-blue-300 hover:text-blue-600 text-slate-600 px-4 py-2 rounded-full transition-colors"
              >
                {x.name}
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* CTA */}
      <section className="bg-gradient-to-br from-blue-700 to-blue-900 py-14 px-4 text-center">
        <ShieldCheck className="w-8 h-8 text-blue-200 mx-auto mb-3" aria-hidden="true" />
        <h2 className="text-2xl sm:text-3xl font-extrabold text-white mb-3">{c.h1} now</h2>
        <p className="text-blue-100 mb-6">Free preview · full report in under a minute.</p>
        <Link href="/#vin-search" className="inline-flex items-center gap-2 bg-white text-blue-700 font-bold px-7 py-3.5 rounded-full hover:scale-105 active:scale-100 transition-transform">
          <Search className="w-4 h-4" aria-hidden="true" /> Check a VIN
        </Link>
      </section>
    </main>
  );
}
