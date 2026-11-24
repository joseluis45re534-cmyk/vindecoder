import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Database, Search } from 'lucide-react';
import { getBrand, BRANDS } from '@/lib/brands';
import { getStickerMake } from '@/lib/window-stickers';
import { SITE_URL, CONTENT_REVISED, formatRevised } from '@/lib/site';
import { BRAND_WMIS, BRAND_WMIS_RETRIEVED } from '@/lib/brand-wmis';
import { BRAND_RECALLS, BRAND_RECALLS_RETRIEVED, BRAND_RECALLS_YEARS } from '@/lib/brand-recalls';
import { pageMetadata } from '@/lib/seo';
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
  return pageMetadata({
    title: `${brand.name} VIN Check & Decoder — Free Preview`,
    // Keep under ~160 chars for all brand names (incl. "Mercedes-Benz").
    description: `${brand.name} VIN check — decode any ${brand.name} VIN and check title brands, salvage, theft, liens, and odometer history with NMVTIS title data.`,
    path: `/vin-check/${brand.slug}`,
    ogAlt: `${brand.name} VIN check`,
  });
}

export default async function BrandPage({
  params,
}: {
  params: Promise<{ brand: string }>;
}) {
  const { brand: slug } = await params;
  const brand = getBrand(slug);
  if (!brand) notFound();

  // 10 brands either side (wrapping) so every brand page is linked from 20
  // others — previously the first 20 brands got every link and the rest none.
  const bi = BRANDS.findIndex((b) => b.slug === brand.slug);
  const others = Array.from({ length: Math.min(20, BRANDS.length - 1) }, (_, k) => {
    const d = k < 10 ? k - 10 : k - 9; // -10..-1, 1..10
    return BRANDS[(bi + d + BRANDS.length) % BRANDS.length];
  }).filter((b, i, arr) => b.slug !== brand.slug && arr.findIndex((x) => x.slug === b.slug) === i);

  // Verified NHTSA vPIC manufacturer codes (scripts/fetch-brand-wmis.mjs).
  // Codes used only by this make first, then North American plants (what U.S.
  // buyers mostly see), then the rest.
  const NA = ['United States', 'Canada', 'Mexico'];
  const rank = (c: string) => (NA.includes(c) ? NA.indexOf(c) : NA.length);
  const wmis = [...(BRAND_WMIS[brand.slug] ?? [])].sort(
    (a, b) =>
      Number(a.sharedWith.length > 0) - Number(b.sharedWith.length > 0) ||
      rank(a.country) - rank(b.country) ||
      a.country.localeCompare(b.country) ||
      a.wmi.localeCompare(b.wmi),
  );
  const exclusive = wmis.filter((w) => w.sharedWith.length === 0);
  const examples = (exclusive.length ? exclusive : wmis).slice(0, 3).map((w) => w.wmi);
  const countries = [...new Set(wmis.map((w) => w.country))];
  const listJoin = (a: string[]) => (a.length < 2 ? a.join('') : `${a.slice(0, -1).join(', ')} and ${a[a.length - 1]}`);
  const WMI_ROWS = 15;
  // Verified NHTSA recall campaigns for popular models (scripts/fetch-brand-recalls.mjs).
  const recalls = [...(BRAND_RECALLS[brand.slug] ?? [])].sort((a, b) => b.campaigns - a.campaigns);
  const { first: recallFrom, last: recallTo } = BRAND_RECALLS_YEARS;

  const faq = [
    { q: `Is the ${brand.name} VIN check free?`, a: `You get a free preview of the vehicle's identity. The full ${brand.name} history report — title brands, a theft check, liens, and odometer readings — is a paid unlock.` },
    ...(examples.length
      ? [{ q: `What do ${brand.name} VINs start with?`, a: `${brand.name} VINs begin with a three-character manufacturer code (WMI) such as ${examples.join(', ')}. NHTSA lists ${wmis.length} codes for ${brand.name}${countries.length ? `, covering vehicles built in ${listJoin(countries)}` : ''}.` }]
      : []),
    ...(recalls.length
      ? [{ q: `How many recalls does the ${brand.name} ${recalls[0].model} have?`, a: `NHTSA lists ${recalls[0].campaigns} recall campaign${recalls[0].campaigns === 1 ? '' : 's'} for the ${brand.name} ${recalls[0].model} across model years ${recallFrom}–${recallTo}${recalls[0].topComponent ? `, most often in NHTSA's "${recalls[0].topComponent}" component category` : ''}. That counts campaigns, not affected cars — check a specific car's open recalls with its VIN.` }]
      : []),
    { q: `Where is the VIN on a ${brand.name}?`, a: `Look at the lower-left corner of the windshield (visible from outside), the label on the driver-side door jamb, and the title, registration, or insurance card. All of them should show the same 17 characters.` },
  ];
  const stickerModels = getStickerMake(slug)?.models ?? [];

  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'WebPage',
        '@id': `${SITE_URL}/vin-check/${brand.slug}`,
        name: `${brand.name} VIN Check & Decoder`,
        url: `${SITE_URL}/vin-check/${brand.slug}`,
        description: `${brand.name} VIN check and decoder: a free vehicle preview, then a paid full report with title brands, liens, odometer readings, and a theft check.`,
        isPartOf: { '@id': `${SITE_URL}/#website` },
        about: { '@type': 'Brand', name: brand.name },
        dateModified: CONTENT_REVISED,
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
      // Mirrors the visible FAQ below. Google limits FAQ rich results to
      // gov/health sites, but Bing and AI answer engines still read FAQPage to
      // extract Q&A — so it's worth emitting when the answers are on the page.
      {
        '@type': 'FAQPage',
        mainEntity: faq.map(({ q, a }) => ({
          '@type': 'Question',
          name: q,
          acceptedAnswer: { '@type': 'Answer', text: a },
        })),
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
            {brand.blurb} Decode any {brand.name} VIN, then check its title, liens, and odometer history.
          </p>
          <SearchForm />
          <p className="mt-5 text-sm text-slate-400">Free preview · Full report online · All 50 states</p>
        </div>
      </section>

      <article className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-14 prose-content">
        <h2>About {brand.name} VINs</h2>
        <p>
          {brand.name} was founded in {brand.founded} ({brand.country}). {brand.blurb} Every {brand.name} sold in the United
          States carries a unique 17-character Vehicle Identification Number (VIN).{' '}
          {examples.length > 0 ? (
            <>
              NHTSA lists {wmis.length} manufacturer code{wmis.length === 1 ? '' : 's'} for {brand.name} — for example{' '}
              <strong>{examples.join(', ')}</strong> — where the first three characters (the World Manufacturer Identifier)
              encode the manufacturer and the country the vehicle was built in.
            </>
          ) : (
            <>The first three characters (the World Manufacturer Identifier) encode the manufacturer and country of origin.</>
          )} Decoding the VIN confirms the model year, plant, engine, and trim — and lets you
          pull the car&apos;s full history before you buy.
        </p>

        {wmis.length > 0 && (
          <>
            <h2>{brand.name} VIN prefixes (WMI codes)</h2>
            <p>
              The first three characters of a VIN — the World Manufacturer Identifier — show who built the vehicle and in
              which country. NHTSA&apos;s vPIC database lists these codes for {brand.name}
              {countries.length > 0 ? `, covering vehicles built in ${listJoin(countries)}` : ''}:
            </p>
            <div className="not-prose overflow-x-auto my-6">
              <table className="w-full text-sm border border-slate-200 rounded-xl overflow-hidden">
                <thead className="bg-slate-50 text-slate-500 text-left">
                  <tr>
                    <th scope="col" className="px-4 py-2.5 font-semibold">WMI</th>
                    <th scope="col" className="px-4 py-2.5 font-semibold">Built in</th>
                    <th scope="col" className="px-4 py-2.5 font-semibold">Vehicle type</th>
                    <th scope="col" className="px-4 py-2.5 font-semibold">Also registered to</th>
                  </tr>
                </thead>
                <tbody>
                  {wmis.slice(0, WMI_ROWS).map((w) => (
                    <tr key={w.wmi} className="border-t border-slate-100">
                      <td className="px-4 py-2 font-mono font-bold text-slate-900">{w.wmi}</td>
                      <td className="px-4 py-2 text-slate-700">{w.country}</td>
                      <td className="px-4 py-2 text-slate-700">{w.vehicleType}</td>
                      <td className="px-4 py-2 text-slate-500">{w.sharedWith.length ? w.sharedWith.join(', ') : '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {wmis.length > WMI_ROWS && <p>…plus {wmis.length - WMI_ROWS} more {brand.name} codes in vPIC.</p>}
            <p className="text-sm text-slate-500">
              A code registered to several makes belongs to their parent manufacturer — positions 4–8 of the VIN identify the
              actual model. Source:{' '}
              <a href="https://vpic.nhtsa.dot.gov/decoder/" target="_blank" rel="noopener noreferrer">NHTSA vPIC</a>, retrieved{' '}
              {formatRevised(BRAND_WMIS_RETRIEVED)}. Try a VIN in the <Link href="/vin-decoder">free VIN decoder</Link>.
            </p>
          </>
        )}

        {recalls.length > 0 && (
          <>
            <h2>NHTSA safety recalls for popular {brand.name} models</h2>
            <p>
              Unique recall campaigns NHTSA lists for model years {recallFrom}–{recallTo}. The count shows how often a model
              was recalled, not whether a particular car was repaired — check any VIN free at{' '}
              <a href="https://www.nhtsa.gov/recalls" target="_blank" rel="noopener noreferrer">nhtsa.gov/recalls</a> or with our{' '}
              <Link href="/recalls">recall check</Link>.
            </p>
            <div className="not-prose overflow-x-auto my-6">
              <table className="w-full text-sm border border-slate-200 rounded-xl overflow-hidden">
                <thead className="bg-slate-50 text-slate-500 text-left">
                  <tr>
                    <th scope="col" className="px-4 py-2.5 font-semibold">Model</th>
                    <th scope="col" className="px-4 py-2.5 font-semibold">Recall campaigns ({recallFrom}–{recallTo})</th>
                    <th scope="col" className="px-4 py-2.5 font-semibold">Most-recalled component</th>
                    <th scope="col" className="px-4 py-2.5 font-semibold">Latest campaign</th>
                  </tr>
                </thead>
                <tbody>
                  {recalls.map((r) => (
                    <tr key={r.model} className="border-t border-slate-100">
                      <td className="px-4 py-2 font-semibold text-slate-900">{brand.name} {r.model}</td>
                      <td className="px-4 py-2 text-slate-700">{r.campaigns}</td>
                      <td className="px-4 py-2 text-slate-700">{r.topComponent || '—'}</td>
                      <td className="px-4 py-2 text-slate-500">{r.latest ? formatRevised(r.latest) : '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="text-sm text-slate-500">
              Source: NHTSA recalls data, retrieved {formatRevised(BRAND_RECALLS_RETRIEVED)}. Models NHTSA files under several
              names (for example hybrid or trim variants) are left out rather than estimated, so this is not a ranking of every
              {' '}{brand.name} model.
            </p>
          </>
        )}

        <h2>What to check on a used {brand.name}</h2>
        <p>
          {brand.watchFor} Then check the records a seller can&apos;t show you at a glance: a salvage or flood brand from
          another state, an open lien, the odometer readings, and the theft check.
        </p>

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

        <h2>How to check a {brand.name} VIN</h2>
        <p>
          Find the 17-character VIN on the windshield, the driver-side door jamb, or the title, and enter it above for a free
          vehicle preview. The full report covers NMVTIS title brands, salvage and flood records, liens, odometer readings, a
          theft check, and recalls — see <Link href="/how-to/check-vin-number">how to check a VIN</Link> and our{' '}
          <Link href="/data-sources">data sources</Link>.
        </p>
      </article>

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

      {/* FAQ — visible Q&A, mirrored in the FAQPage node of the JSON-LD graph above */}
      <section className="bg-white py-14 px-4 sm:px-6 lg:px-8 border-t border-slate-100">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-2xl font-extrabold text-slate-900 mb-8">{brand.name} VIN check — FAQ</h2>
          <div className="space-y-4">
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

      {/* Final CTA */}
      <section className="bg-gradient-to-br from-blue-700 to-blue-900 py-14 px-4 text-center">
        <h2 className="text-2xl sm:text-3xl font-extrabold text-white mb-3">Run your {brand.name} VIN now</h2>
        <p className="text-blue-100 mb-6">Free preview · full report online right after checkout.</p>
        <Link href="/#vin-search" className="inline-flex items-center gap-2 bg-white text-blue-700 font-bold px-7 py-3.5 rounded-full hover:scale-105 active:scale-100 transition-transform">
          <Search className="w-4 h-4" aria-hidden="true" /> Check a {brand.name} VIN
        </Link>
      </section>
    </main>
  );
}
