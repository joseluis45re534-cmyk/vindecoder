import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ShieldCheck, FileText, Database, AlertTriangle, Gauge, Search } from 'lucide-react';
import { getBrand, BRANDS } from '@/lib/brands';
import { getStickerMake } from '@/lib/window-stickers';
import { SITE_URL, SITE_NAME } from '@/lib/site';
import SearchForm from '@/components/SearchForm';

export const runtime = 'edge';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ brand: string }>;
}): Promise<Metadata> {
  const { brand: slug } = await params;
  const brand = getBrand(slug);
  if (!brand) return { title: 'Brand not found' };
  const title = `${brand.name} VIN Check & Decoder — Free Preview`;
  // Keep under ~160 chars for all brand names (incl. "Mercedes-Benz").
  const description = `Free ${brand.name} VIN check — decode any ${brand.name} VIN or plate for title brands, salvage, theft, liens & odometer history from NMVTIS, NICB & DMV data.`;
  const url = `${SITE_URL}/vin-check/${brand.slug}`;
  return {
    title,
    description,
    alternates: { canonical: `/vin-check/${brand.slug}` },
    openGraph: {
      type: 'website',
      siteName: SITE_NAME,
      title,
      description,
      url,
      locale: 'en_US',
      images: [{ url: '/opengraph-image', width: 1200, height: 630, alt: `${brand.name} VIN check` }],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: ['/opengraph-image'],
    },
  };
}

export default async function BrandPage({
  params,
}: {
  params: Promise<{ brand: string }>;
}) {
  const { brand: slug } = await params;
  const brand = getBrand(slug);
  if (!brand) notFound();

  const others = BRANDS.filter((b) => b.slug !== brand.slug).slice(0, 20);
  const stickerModels = getStickerMake(slug)?.models ?? [];

  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'WebPage',
        '@id': `${SITE_URL}/vin-check/${brand.slug}`,
        name: `${brand.name} VIN Check & Decoder`,
        url: `${SITE_URL}/vin-check/${brand.slug}`,
        description: `Free ${brand.name} VIN check and decoder with title, theft, lien, and odometer history.`,
        isPartOf: { '@id': `${SITE_URL}/#website` },
        about: { '@type': 'Brand', name: brand.name },
      },
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Home', item: SITE_URL },
          { '@type': 'ListItem', position: 2, name: 'VIN Check by Brand', item: `${SITE_URL}/vin-check` },
          { '@type': 'ListItem', position: 3, name: `${brand.name} VIN Check`, item: `${SITE_URL}/vin-check/${brand.slug}` },
        ],
      },
      {
        '@type': 'Service',
        name: `${brand.name} Vehicle History Report`,
        serviceType: `${brand.name} VIN check`,
        provider: { '@id': `${SITE_URL}/#organization` },
        areaServed: { '@type': 'Country', name: 'United States' },
      },
    ],
  };

  return (
    <main className="min-h-screen bg-slate-50">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-slate-950 via-blue-950 to-slate-900 pt-12 sm:pt-16 pb-20 sm:pb-24 px-4 sm:px-6 lg:px-8">
        <div aria-hidden="true" className="animate-float pointer-events-none absolute -top-40 left-1/2 w-[600px] h-[400px] rounded-full bg-blue-600/20 blur-3xl" />
        <div className="relative max-w-3xl mx-auto text-center">
          <nav aria-label="Breadcrumb" className="mb-6">
            <ol className="flex items-center justify-center gap-1.5 text-xs sm:text-sm text-blue-200/70">
              <li><Link href="/" className="hover:text-white">Home</Link></li>
              <li aria-hidden="true">/</li>
              <li><Link href="/vin-check" className="hover:text-white">VIN check by brand</Link></li>
              <li aria-hidden="true">/</li>
              <li className="text-blue-100 font-medium">{brand.name}</li>
            </ol>
          </nav>
          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white mb-5 leading-tight">
            {brand.name} VIN Check
            <span className="block bg-gradient-to-r from-blue-400 to-sky-300 bg-clip-text text-transparent mt-1">& Decoder</span>
          </h1>
          <p className="text-base sm:text-lg text-slate-300 mb-8 max-w-2xl mx-auto">
            Decode any {brand.name} VIN or U.S. license plate for title brands, salvage &amp; flood history, theft records, open liens, recalls, and odometer readings — sourced from NMVTIS, NICB, and DMV records.
          </p>
          <SearchForm />
          <p className="mt-5 text-sm text-slate-400">Free preview · Instant report · All 50 states</p>
        </div>
      </section>

      <article className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-14 prose-content">
        <h2>About {brand.name} VINs</h2>
        <p>
          {brand.name} was founded in {brand.founded} ({brand.country}). {brand.blurb} Every {brand.name} sold in the United
          States carries a unique 17-character Vehicle Identification Number (VIN). {brand.name} VINs commonly begin with{' '}
          <strong>{brand.vinHints}</strong>, where the first three characters (the World Manufacturer Identifier) encode the
          country of origin and manufacturer. Decoding the VIN confirms the model year, plant, engine, and trim — and lets you
          pull the car&apos;s full history before you buy.
        </p>

        <h2>What to check on a used {brand.name}</h2>
        <p>
          {brand.name} models hold up well on the used market, but a few brand-specific issues are worth confirming before you
          commit. {brand.watchFor} Beyond the mechanicals, the records that matter most are the ones a seller can&apos;t see at a
          glance: a <strong>salvage or flood title</strong> applied in another state, an <strong>open lien</strong>, an{' '}
          <strong>odometer rollback</strong>, or a <strong>theft record</strong>. A VIN history report surfaces all of them.
        </p>

        <h2>What&apos;s included in a {brand.name} VIN report</h2>
        <ul>
          <li><strong>Title &amp; brand history</strong> — salvage, rebuilt, junk, and flood titles across all 50 states (NMVTIS).</li>
          <li><strong>Theft records</strong> — active theft reports filed with the NICB.</li>
          <li><strong>Lien check</strong> — outstanding loans recorded against the vehicle.</li>
          <li><strong>Odometer history</strong> — reported readings with rollback and tampering alerts.</li>
          <li><strong>Specs &amp; recalls</strong> — full {brand.name} decode plus open safety-recall lookups.</li>
        </ul>

        <h2>Popular {brand.name} models to VIN check</h2>
        <p>Check the history of a specific {brand.name} model:</p>
        {stickerModels.length > 0 ? (
          <ul>
            {stickerModels.map((m) => (
              <li key={m.slug}>
                <Link href={`/vin-check/${brand.slug}/${m.slug}`}>{brand.name} {m.name} VIN check</Link>
              </li>
            ))}
          </ul>
        ) : (
          <ul>
            {brand.models.map((m) => (
              <li key={m}>{brand.name} {m}</li>
            ))}
          </ul>
        )}

        <h2>How to check a {brand.name} VIN number</h2>
        <ol>
          <li>Find the 17-character VIN on the windshield, driver-side door jamb, title, or registration.</li>
          <li>Enter the VIN (or a U.S. license plate and state) in the search box above.</li>
          <li>Review the free preview, then unlock the full {brand.name} history report.</li>
        </ol>

        <h2>{brand.name} VIN data — sources</h2>
        <p>
          Reports combine the <strong>National Motor Vehicle Title Information System (NMVTIS)</strong>, the{' '}
          <strong>National Insurance Crime Bureau (NICB)</strong>, and <strong>state DMV</strong> title and registration
          databases, so a brand or odometer problem recorded in any state shows up — even if the car was retitled to hide it.
        </p>
      </article>

      {/* Feature cards */}
      <section className="bg-white py-14 px-4 sm:px-6 lg:px-8 border-y border-slate-100">
        <div className="max-w-5xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {[
            { icon: AlertTriangle, c: 'text-amber-600 bg-amber-50', t: 'Title brands', d: `Salvage, rebuilt & flood ${brand.name} titles.` },
            { icon: ShieldCheck, c: 'text-emerald-600 bg-emerald-50', t: 'Theft records', d: 'NICB theft & recovery data.' },
            { icon: Gauge, c: 'text-blue-600 bg-blue-50', t: 'Odometer', d: 'Rollback & tampering alerts.' },
            { icon: FileText, c: 'text-violet-600 bg-violet-50', t: 'Liens & specs', d: `Open liens + full ${brand.name} decode.` },
          ].map(({ icon: Icon, c, t, d }) => (
            <div key={t} className="bg-slate-50 rounded-2xl border border-slate-100 p-6 card-lift">
              <span className={`inline-flex w-11 h-11 rounded-xl items-center justify-center mb-4 ${c}`}>
                <Icon className="w-5 h-5" aria-hidden="true" />
              </span>
              <h3 className="font-bold text-slate-900 mb-1">{t}</h3>
              <p className="text-sm text-slate-500">{d}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Other brands */}
      <section className="py-14 px-4 sm:px-6 lg:px-8" aria-labelledby="other-brands">
        <div className="max-w-5xl mx-auto">
          <h2 id="other-brands" className="text-2xl font-extrabold text-slate-900 mb-6 flex items-center gap-2">
            <Database className="w-5 h-5 text-blue-600" aria-hidden="true" /> Check another brand
          </h2>
          <div className="flex flex-wrap gap-2.5">
            {others.map((b) => (
              <Link
                key={b.slug}
                href={`/vin-check/${b.slug}`}
                className="text-sm font-medium bg-white border border-slate-200 hover:border-blue-300 hover:text-blue-600 text-slate-600 px-4 py-2 rounded-full transition-colors"
              >
                {b.name}
              </Link>
            ))}
            <Link href="/vin-check" className="text-sm font-bold bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-full transition-colors">
              View all brands →
            </Link>
          </div>
        </div>
      </section>

      {/* FAQ (visible content; FAQPage schema intentionally omitted — Google restricts FAQ rich results to gov/health) */}
      <section className="bg-white py-14 px-4 sm:px-6 lg:px-8 border-t border-slate-100">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-2xl font-extrabold text-slate-900 mb-8">{brand.name} VIN check — FAQ</h2>
          <div className="space-y-4">
            {[
              { q: `Is the ${brand.name} VIN check free?`, a: `You get a free preview of the vehicle's identity. The full ${brand.name} history report — title brands, theft, liens, and odometer — is a paid unlock.` },
              { q: `Can I look up a ${brand.name} by license plate?`, a: `Yes. Enter a U.S. license plate and state and we'll resolve it to the VIN, then pull the full ${brand.name} report.` },
              { q: `Will it show salvage or flood titles?`, a: `Yes — title brands recorded in any state are pulled from NMVTIS, which catches cars retitled across state lines to hide a brand.` },
              { q: `Does it check ${brand.name} recalls?`, a: `Yes. The report flags open safety recalls so you can confirm the car was repaired before you buy.` },
            ].map(({ q, a }) => (
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

      {/* Final CTA */}
      <section className="bg-gradient-to-br from-blue-700 to-blue-900 py-14 px-4 text-center">
        <h2 className="text-2xl sm:text-3xl font-extrabold text-white mb-3">Run your {brand.name} VIN now</h2>
        <p className="text-blue-100 mb-6">Free preview · full report in under a minute.</p>
        <Link href="/#vin-search" className="inline-flex items-center gap-2 bg-white text-blue-700 font-bold px-7 py-3.5 rounded-full hover:scale-105 active:scale-100 transition-transform">
          <Search className="w-4 h-4" aria-hidden="true" /> Check a {brand.name} VIN
        </Link>
      </section>
    </main>
  );
}
