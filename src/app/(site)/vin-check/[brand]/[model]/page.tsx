import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ShieldCheck, FileText, AlertTriangle, Gauge, Search } from 'lucide-react';
import { getBrand } from '@/lib/brands';
import { getStickerMake, getStickerModel } from '@/lib/window-stickers';
import { SITE_URL, SITE_NAME } from '@/lib/site';
import JsonLd from '@/components/JsonLd';
import { breadcrumbLd, faqPageLd } from '@/lib/structured-data';
import SearchForm from '@/components/SearchForm';

export const runtime = 'edge';

// Model-level VIN history pages nest under /vin-check/[brand]. They exist only
// where the parent brand page (BRANDS) AND the model (STICKER_MAKES catalog)
// both exist, so there are never orphan pages under a missing brand.
export async function generateMetadata({
  params,
}: {
  params: Promise<{ brand: string; model: string }>;
}): Promise<Metadata> {
  const { brand, model } = await params;
  const b = getBrand(brand);
  const found = getStickerModel(brand, model);
  if (!b || !found) return { title: 'Not found' };
  const label = `${b.name} ${found.model.name}`;
  const title = `${label} VIN Check & History Report`;
  const description = `Free ${label} VIN check — decode the VIN and check title brands, salvage, theft, liens, recalls, and odometer history from NMVTIS, NICB & DMV data.`;
  const url = `${SITE_URL}/vin-check/${brand}/${model}`;
  return {
    title,
    description,
    // Crawl-budget concentration on a young domain: this deep, templated model
    // tier is noindexed for now (follow:true keeps link equity flowing) so Google
    // spends its limited crawl on the higher-value brand/check/blog pages.
    // Re-enable once the domain has authority. Also removed from sitemap.ts.
    robots: { index: false, follow: true },
    alternates: { canonical: `/vin-check/${brand}/${model}` },
    openGraph: {
      type: 'website',
      siteName: SITE_NAME,
      title,
      description,
      url,
      locale: 'en_US',
      images: [{ url: '/opengraph-image.png', width: 1200, height: 630, alt: `${label} VIN check` }],
    },
    twitter: { card: 'summary_large_image', title, description, images: ['/opengraph-image.png'] },
  };
}

export default async function ModelVinCheckPage({
  params,
}: {
  params: Promise<{ brand: string; model: string }>;
}) {
  const { brand, model } = await params;
  const b = getBrand(brand);
  const make = getStickerMake(brand);
  const found = getStickerModel(brand, model);
  if (!b || !make || !found) notFound();

  const label = `${b.name} ${found.model.name}`;
  const url = `${SITE_URL}/vin-check/${brand}/${model}`;
  const siblings = make.models.filter((m) => m.slug !== found.model.slug).slice(0, 8);

  const faq = [
    { q: `Is the ${label} VIN check free?`, a: `You get a free preview of the ${label}'s identity — year, make, model, and VIN validation. The full history report (title brands, theft, liens, odometer) is a paid unlock.` },
    { q: `What should I check on a used ${label}?`, a: `Confirm the title is clean in every state, the odometer readings only increase, there are no open liens or theft records, and any safety recalls were repaired. ${b.watchFor}` },
    { q: `Can I check a ${label} by license plate?`, a: `Yes. Enter a U.S. license plate and state and it resolves to the VIN, then pulls the full ${label} report across all 50 states.` },
  ];

  const schema = [
    {
      '@context': 'https://schema.org',
      '@type': 'WebPage',
      '@id': url,
      name: `${label} VIN Check & History`,
      url,
      description: `Free ${label} VIN check with title, theft, lien, recall, and odometer history.`,
      isPartOf: { '@id': `${SITE_URL}/#website` },
      about: { '@type': 'Product', name: label, brand: { '@type': 'Brand', name: b.name } },
    },
    breadcrumbLd([
      { name: 'Home', url: SITE_URL },
      { name: 'VIN Check by Brand', url: `${SITE_URL}/vin-check` },
      { name: b.name, url: `${SITE_URL}/vin-check/${brand}` },
      { name: found.model.name, url },
    ]),
    {
      '@context': 'https://schema.org',
      '@type': 'Service',
      name: `${label} Vehicle History Report`,
      serviceType: `${label} VIN check`,
      provider: { '@id': `${SITE_URL}/#organization` },
      areaServed: { '@type': 'Country', name: 'United States' },
    },
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
              <li><Link href="/vin-check" className="hover:text-white">VIN check</Link></li>
              <li aria-hidden="true">/</li>
              <li><Link href={`/vin-check/${brand}`} className="hover:text-white">{b.name}</Link></li>
              <li aria-hidden="true">/</li>
              <li className="text-blue-100 font-medium">{found.model.name}</li>
            </ol>
          </nav>
          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white mb-5 leading-tight">
            {label} <span className="bg-gradient-to-r from-blue-400 to-sky-300 bg-clip-text text-transparent">VIN check</span>
          </h1>
          <p className="text-base sm:text-lg text-slate-300 mb-8 max-w-2xl mx-auto">
            Decode any {label} VIN or U.S. license plate and check title brands, salvage &amp; flood history, theft records, liens, recalls, and odometer readings.
          </p>
          <SearchForm />
          <p className="mt-5 text-sm text-slate-400">Free preview · Instant report · All 50 states</p>
        </div>
      </section>

      <article className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-14 prose-content">
        <h2>Checking a used {label}</h2>
        <p>
          The {label} is a popular used buy, which means a wide range of conditions on the market — from clean, well-kept
          examples to cars hiding a branded title or an odometer problem. Before you commit, decode the VIN to confirm the car
          is genuinely a {label}, then pull its history to see what happened to this specific vehicle.
        </p>

        <h2>What to watch for on a {b.name}</h2>
        <p>{b.watchFor} Beyond the mechanicals, the records that matter most are the ones a seller cannot see at a glance: a <strong>salvage or flood title</strong> applied in another state, an <strong>open lien</strong>, an <strong>odometer rollback</strong>, or a <strong>theft record</strong>.</p>

        <h2>What is included in a {label} report</h2>
        <ul>
          <li><strong>Title &amp; brand history</strong> — salvage, rebuilt, junk, and flood titles across all 50 states (NMVTIS).</li>
          <li><strong>Theft records</strong> — active theft reports filed with the NICB.</li>
          <li><strong>Lien check</strong> — outstanding loans recorded against the vehicle.</li>
          <li><strong>Odometer history</strong> — reported readings with rollback and tampering alerts.</li>
          <li><strong>Recalls &amp; specs</strong> — open safety recalls plus the full {label} decode.</li>
        </ul>

        <h2>How to check a {label} VIN</h2>
        <ol>
          <li>Find the 17-character VIN on the windshield, driver-side door jamb, title, or registration.</li>
          <li>Enter the VIN (or a U.S. license plate and state) in the search box above.</li>
          <li>Review the free preview, then unlock the full {label} history report.</li>
        </ol>

        <p>
          You can also pull the original <Link href={`/window-sticker/${brand}/${model}`}>{label} window sticker</Link> by VIN,
          or check <Link href={`/vin-check/${brand}`}>other {b.name} models</Link>.
        </p>
      </article>

      {/* Feature cards */}
      <section className="bg-white py-14 px-4 sm:px-6 lg:px-8 border-y border-slate-100">
        <div className="max-w-5xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {[
            { icon: AlertTriangle, c: 'text-amber-600 bg-amber-50', t: 'Title brands', d: `Salvage, rebuilt & flood ${b.name} titles.` },
            { icon: ShieldCheck, c: 'text-emerald-600 bg-emerald-50', t: 'Theft records', d: 'NICB theft & recovery data.' },
            { icon: Gauge, c: 'text-blue-600 bg-blue-50', t: 'Odometer', d: 'Rollback & tampering alerts.' },
            { icon: FileText, c: 'text-violet-600 bg-violet-50', t: 'Liens & recalls', d: `Open liens + ${found.model.name} recalls.` },
          ].map(({ icon: Icon, c, t, d }) => (
            <div key={t} className="bg-slate-50 rounded-2xl border border-slate-100 p-6">
              <span className={`inline-flex w-11 h-11 rounded-xl items-center justify-center mb-4 ${c}`}>
                <Icon className="w-5 h-5" aria-hidden="true" />
              </span>
              <h3 className="font-bold text-slate-900 mb-1">{t}</h3>
              <p className="text-sm text-slate-500">{d}</p>
            </div>
          ))}
        </div>
      </section>

      {/* FAQ */}
      <section className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <h2 className="text-2xl font-extrabold text-slate-900 mb-8">{label} VIN check — FAQ</h2>
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
      </section>

      {/* Sibling models */}
      <section className="bg-white border-t border-slate-100 py-14 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-2xl font-extrabold text-slate-900 mb-6">Other {b.name} models</h2>
          <div className="flex flex-wrap gap-2.5">
            {siblings.map((m) => (
              <Link
                key={m.slug}
                href={`/vin-check/${brand}/${m.slug}`}
                className="text-sm font-medium bg-slate-50 border border-slate-200 hover:border-blue-300 hover:text-blue-600 text-slate-600 px-4 py-2 rounded-full transition-colors"
              >
                {b.name} {m.name}
              </Link>
            ))}
            <Link href={`/vin-check/${brand}`} className="text-sm font-bold bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-full transition-colors">
              All {b.name} models →
            </Link>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-gradient-to-br from-blue-700 to-blue-900 py-14 px-4 text-center">
        <h2 className="text-2xl sm:text-3xl font-extrabold text-white mb-3">Run your {label} VIN now</h2>
        <p className="text-blue-100 mb-6">Free preview · full report in under a minute.</p>
        <Link href="/#vin-search" className="inline-flex items-center gap-2 bg-white text-blue-700 font-bold px-7 py-3.5 rounded-full hover:scale-105 active:scale-100 transition-transform">
          <Search className="w-4 h-4" aria-hidden="true" /> Check a {label} VIN
        </Link>
      </section>
    </main>
  );
}
