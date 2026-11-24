import type { Metadata } from 'next';
import { pageMetadata } from '@/lib/seo';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import {
  AlertTriangle, Droplets, FileText, Car, ShieldAlert, Gauge, Bell, ScanLine, CreditCard,
  Check, ShieldCheck, Search, ExternalLink, BookOpen, type LucideIcon,
} from 'lucide-react';
import { getCheckPage, CHECK_PAGES, type CheckIconKey } from '@/lib/checks';
import { getGuide } from '@/lib/how-to';
import { US_STATES } from '@/lib/us-states';
import { SITE_URL, CONTENT_REVISED, formatRevised } from '@/lib/site';
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

// "VIN decoder" keeps its acronym; "Accident check" -> "an accident check".
const lowerFirst = (s: string) => (/^[A-Z]{2}/.test(s) ? s : s.charAt(0).toLowerCase() + s.slice(1));
const withArticle = (s: string) => `${/^[aeiou]/i.test(s) ? 'an' : 'a'} ${lowerFirst(s)}`;

export function checkMetadata(slug: string): Metadata {
  const c = getCheckPage(slug);
  if (!c) return { title: 'Check not found' };
  return pageMetadata({ title: c.metaTitle, description: c.metaDescription, path: `/${c.slug}`, ogAlt: c.h1 });
}

export function CheckLandingPage({ slug }: { slug: string }) {
  const c = getCheckPage(slug);
  if (!c) notFound();

  const Icon = ICONS[c.icon];
  const url = `${SITE_URL}/${c.slug}`;
  const f = fee();
  // Link every other check (not just 3) so each check page is reachable from
  // all the others — the cluster's strongest internal-linking signal.
  const related = [
    ...c.related.map((s) => CHECK_PAGES.find((x) => x.slug === s)),
    ...CHECK_PAGES.filter((x) => x.slug !== c.slug && !c.related.includes(x.slug)),
  ].filter((x): x is NonNullable<typeof x> => Boolean(x));
  const guides = c.guides.map((g) => getGuide(g)).filter((g): g is NonNullable<typeof g> => Boolean(g));
  const verb = c.icon === 'decoder' || c.icon === 'plate' ? 'use' : 'run';

  const schema = [
    {
      '@context': 'https://schema.org',
      '@type': 'WebPage',
      '@id': url,
      name: c.h1,
      url,
      description: c.metaDescription,
      dateModified: CONTENT_REVISED,
      lastReviewed: CONTENT_REVISED,
      isPartOf: { '@id': `${SITE_URL}/#website` },
      about: { '@id': `${SITE_URL}/#service` },
      publisher: { '@id': `${SITE_URL}/#organization` },
      ...(c.sources.length ? { citation: c.sources.map((s) => s.href) } : {}),
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

      {/* Quick answer + explainer — server-rendered so answer engines can quote it */}
      <article className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-14 prose-content">
        <div className="not-prose bg-white border border-blue-100 rounded-2xl p-6 shadow-sm mb-10">
          <p className="text-xs font-bold uppercase tracking-widest text-blue-600 mb-2">Quick answer</p>
          <p className="text-slate-700 leading-relaxed">{c.answer}</p>
          <p className="text-xs text-slate-400 mt-4">
            Last reviewed <time dateTime={CONTENT_REVISED}>{formatRevised()}</time> by the CarVinLookup team
          </p>
        </div>

        <h2>{`What is ${withArticle(c.name)}?`}</h2>
        <p>{c.whatItIs}</p>

        {c.sections.map((sec) => (
          <section key={sec.h2}>
            <h2>{sec.h2}</h2>
            {sec.body.map((para) => (
              <p key={para.slice(0, 40)}>{para}</p>
            ))}
          </section>
        ))}
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
          <p className="text-sm text-slate-500 mt-6">
            See <Link href="/data-sources" className="text-blue-600 font-semibold hover:underline">where the data comes from</Link> and{' '}
            <Link href="/pricing" className="text-blue-600 font-semibold hover:underline">report pricing</Link>.
          </p>
        </div>
      </section>

      {/* Steps */}
      <section className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <h2 className="text-2xl font-extrabold text-slate-900 mb-6">{`How to ${verb} ${withArticle(c.name)}`}</h2>
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

      {/* Sources — verified, live authority links */}
      {c.sources.length > 0 && (
        <section className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 pt-14">
          <h2 className="text-2xl font-extrabold text-slate-900 mb-4">Sources &amp; further reading</h2>
          <ul className="space-y-2.5">
            {c.sources.map((s) => (
              <li key={s.href}>
                <a href={s.href} target="_blank" rel="noopener noreferrer" className="inline-flex items-start gap-2 text-blue-600 hover:underline">
                  <ExternalLink className="w-4 h-4 mt-0.5 shrink-0" aria-hidden="true" />
                  {s.label}
                </a>
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* Guides & resources */}
      {(guides.length > 0 || c.resources.length > 0) && (
        <section className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 pt-14">
          <h2 className="text-2xl font-extrabold text-slate-900 mb-4">Guides &amp; resources</h2>
          <ul className="grid sm:grid-cols-2 gap-3">
            {guides.map((g) => (
              <li key={g.slug}>
                <Link href={`/how-to/${g.slug}`} className="flex items-start gap-2.5 bg-white border border-slate-100 rounded-xl px-4 py-3 hover:border-blue-200 hover:shadow-sm transition-all text-slate-700">
                  <BookOpen className="w-4 h-4 text-blue-600 mt-0.5 shrink-0" aria-hidden="true" />
                  <span className="text-sm font-semibold">{g.title}</span>
                </Link>
              </li>
            ))}
            {c.resources.map((r) => (
              <li key={r.href + r.label}>
                <Link href={r.href} className="flex items-start gap-2.5 bg-white border border-slate-100 rounded-xl px-4 py-3 hover:border-blue-200 hover:shadow-sm transition-all text-slate-700">
                  <BookOpen className="w-4 h-4 text-blue-600 mt-0.5 shrink-0" aria-hidden="true" />
                  <span className="text-sm font-semibold">{r.label}</span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* All other checks */}
      {related.length > 0 && (
        <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
          <h2 className="text-2xl font-extrabold text-slate-900 mb-6">More VIN checks</h2>
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
        <p className="text-blue-100 mb-6">Free vehicle preview · full report online in moments.</p>
        <Link href="/#vin-search" className="inline-flex items-center gap-2 bg-white text-blue-700 font-bold px-7 py-3.5 rounded-full hover:scale-105 active:scale-100 transition-transform">
          <Search className="w-4 h-4" aria-hidden="true" /> Check a VIN
        </Link>
      </section>
    </main>
  );
}
