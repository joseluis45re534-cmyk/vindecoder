import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Check, ShieldCheck, Search } from 'lucide-react';
import { getUsState, US_STATES } from '@/lib/us-states';
import { SITE_URL } from '@/lib/site';
import { pageMetadata, NOINDEX_FOLLOW } from '@/lib/seo';
import JsonLd from '@/components/JsonLd';
import { breadcrumbLd, faqPageLd } from '@/lib/structured-data';
import SearchForm from '@/components/SearchForm';

export const runtime = 'edge';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ state: string }>;
}): Promise<Metadata> {
  const { state } = await params;
  const s = getUsState(state);
  if (!s) return { title: 'State not found' };
  // Plate-to-VIN search ships with the ClearVin integration; until then the
  // page is honest about it and funnels to the VIN check (see SearchForm).
  return pageMetadata({
    title: `${s.name} License Plate Lookup`,
    description: `${s.name} plate-to-VIN search is launching soon. Until then, find the VIN on the car or its title and run a history check. Owner data stays private.`,
    path: `/license-plate-lookup/${s.slug}`,
    ogAlt: `${s.name} license plate lookup`,
    // 51 near-identical templates for a feature that isn't live: keep them for
    // users, out of the index until plate search ships with state-specific
    // content (CLAUDE.md "Phased indexing"). The hub stays indexed.
    robots: NOINDEX_FOLLOW,
  });
}

export default async function StatePlatePage({
  params,
}: {
  params: Promise<{ state: string }>;
}) {
  const { state } = await params;
  const s = getUsState(state);
  if (!s) notFound();

  const url = `${SITE_URL}/license-plate-lookup/${s.slug}`;
  // 6 states either side alphabetically (wrapping) — every state page is linked
  // from 12 others instead of only the first 12 states getting all the links.
  const idx = US_STATES.findIndex((x) => x.slug === s.slug);
  const nearby = [-6, -5, -4, -3, -2, -1, 1, 2, 3, 4, 5, 6].map(
    (d) => US_STATES[(idx + d + US_STATES.length) % US_STATES.length],
  );

  const faq = [
    { q: `Can I look up a car by license plate in ${s.name}?`, a: `Plate-to-VIN search for ${s.name} (${s.abbr}) plates is launching soon. Right now, run the check with the 17-character VIN — it's on the windshield, the driver-side door jamb, and the title or registration — to get the full history: title brands, theft, liens, and odometer.` },
    { q: `Can I find the owner of a ${s.name} plate?`, a: `No. The federal Driver's Privacy Protection Act (DPPA) protects personal information tied to a motor-vehicle record. A lookup identifies the vehicle and its VIN, not the owner's name or address.` },
    { q: `Is a ${s.name} VIN check free?`, a: `You see a free preview of the vehicle's identity first. The full history report is a paid unlock, and it works for vehicles titled in ${s.name} and every other state.` },
  ];

  const schema = [
    {
      '@context': 'https://schema.org',
      '@type': 'WebPage',
      '@id': url,
      name: `${s.name} License Plate Lookup`,
      url,
      description: `${s.name} license plate lookup: plate-to-VIN search is launching soon; find the VIN and run a full history check now.`,
      isPartOf: { '@id': `${SITE_URL}/#website` },
      about: { '@id': `${SITE_URL}/#service` },
    },
    breadcrumbLd([
      { name: 'Home', url: SITE_URL },
      { name: 'License plate lookup', url: `${SITE_URL}/license-plate-lookup` },
      { name: s.name, url },
    ]),
    faqPageLd(faq),
  ];

  return (
    <main className="min-h-screen bg-slate-50">
      <JsonLd data={schema} />

      <section className="relative overflow-hidden bg-gradient-to-br from-slate-950 via-blue-950 to-slate-900 pt-12 sm:pt-16 pb-20 px-4 sm:px-6 lg:px-8">
        <div aria-hidden="true" className="animate-float pointer-events-none absolute -top-40 left-1/2 w-[600px] h-[400px] rounded-full bg-blue-600/20 blur-3xl" />
        <div className="relative max-w-3xl mx-auto text-center">
          <nav aria-label="Breadcrumb" className="mb-6">
            <ol className="flex items-center justify-center gap-1.5 text-xs sm:text-sm text-blue-200/70">
              <li><Link href="/" className="hover:text-white">Home</Link></li>
              <li aria-hidden="true">/</li>
              <li><Link href="/license-plate-lookup" className="hover:text-white">License plate lookup</Link></li>
              <li aria-hidden="true">/</li>
              <li className="text-blue-100 font-medium">{s.name}</li>
            </ol>
          </nav>
          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white mb-5 leading-tight">
            {s.name} <span className="bg-gradient-to-r from-blue-400 to-sky-300 bg-clip-text text-transparent">license plate lookup</span>
          </h1>
          <p className="text-base sm:text-lg text-slate-300 mb-8 max-w-2xl mx-auto">
            Plate-to-VIN search for {s.name} ({s.abbr}) plates is launching soon. Have the VIN? Run the full vehicle history now —
            title, theft, liens, and odometer.
          </p>
          <SearchForm />
          <p className="mt-5 text-sm text-slate-400">Plate search launching soon · VIN check available now</p>
        </div>
      </section>

      <article className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-14 prose-content">
        <h2>How a {s.name} license plate lookup works</h2>
        <p>
          A license plate is a pointer to a vehicle&apos;s records. A plate lookup resolves a {s.name} plate and the state to the
          17-character VIN, and from there you get the same history report you would by entering the VIN directly. Because plates
          are only unique within a state, the state matters. Our plate-to-VIN search is launching soon — until then, the VIN is
          the fastest route.
        </p>

        <h2>Where to find the VIN on a {s.name} car</h2>
        <p>
          You don&apos;t need a plate lookup to get the VIN. Look at the lower-left corner of the windshield from outside the car,
          or on the label inside the driver-side door jamb. It is also printed on the {s.name} title, the registration card, and
          the insurance card. If you are buying from a listing, ask the seller for the VIN before you go see the car — a seller
          who won&apos;t share it is a red flag.
        </p>

        <h2>What you can and cannot find</h2>
        <p>
          You can identify the vehicle (year, make, model) and unlock its title, theft, lien, and odometer history. You cannot
          get the owner&apos;s personal details: the federal <strong>Driver&apos;s Privacy Protection Act (DPPA)</strong> protects that
          information, and any service promising an owner&apos;s name and address from a plate is a red flag.
        </p>
      </article>

      <section className="bg-white border-y border-slate-100 py-14 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-2xl font-extrabold text-slate-900 mb-6">What the {s.name} report shows</h2>
          <ul className="space-y-3">
            {[
              'Vehicle identity — year, make, and model',
              `Plate-to-VIN for ${s.name} plates (launching soon)`,
              'Title brands: salvage, rebuilt, junk, and flood (NMVTIS)',
              'Theft check, open liens, and odometer history',
            ].map((r) => (
              <li key={r} className="flex items-start gap-3 text-slate-700">
                <Check className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" aria-hidden="true" />
                <span>{r}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <h2 className="text-2xl font-extrabold text-slate-900 mb-8">{s.name} plate lookup — FAQ</h2>
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

      <section className="bg-white border-t border-slate-100 py-14 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-2xl font-extrabold text-slate-900 mb-6">Look up a plate in another state</h2>
          <div className="flex flex-wrap gap-2.5">
            {nearby.map((x) => (
              <Link
                key={x.slug}
                href={`/license-plate-lookup/${x.slug}`}
                className="text-sm font-medium bg-slate-50 border border-slate-200 hover:border-blue-300 hover:text-blue-600 text-slate-600 px-4 py-2 rounded-full transition-colors"
              >
                {x.name}
              </Link>
            ))}
            <Link href="/license-plate-lookup" className="text-sm font-bold bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-full transition-colors">
              All states →
            </Link>
          </div>
        </div>
      </section>

      <section className="bg-gradient-to-br from-blue-700 to-blue-900 py-14 px-4 text-center">
        <ShieldCheck className="w-8 h-8 text-blue-200 mx-auto mb-3" aria-hidden="true" />
        <h2 className="text-2xl sm:text-3xl font-extrabold text-white mb-3">Check a {s.name} car by VIN</h2>
        <p className="text-blue-100 mb-6">Free preview · full history by VIN · plate search launching soon.</p>
        <Link href="/#vin-search" className="inline-flex items-center gap-2 bg-white text-blue-700 font-bold px-7 py-3.5 rounded-full hover:scale-105 active:scale-100 transition-transform">
          <Search className="w-4 h-4" aria-hidden="true" /> Check a VIN
        </Link>
      </section>
    </main>
  );
}
