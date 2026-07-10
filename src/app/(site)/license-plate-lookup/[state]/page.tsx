import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Check, ShieldCheck, Search } from 'lucide-react';
import { getUsState, US_STATES } from '@/lib/us-states';
import { SITE_URL, SITE_NAME } from '@/lib/site';
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
  const title = `${s.name} License Plate Lookup — Find a Car by Plate`;
  const description = `${s.name} license plate lookup: resolve a ${s.abbr} plate to the VIN, then check title brands, theft, liens, and odometer history. Owner data stays private (DPPA).`;
  const url = `${SITE_URL}/license-plate-lookup/${s.slug}`;
  return {
    title,
    description,
    alternates: { canonical: `/license-plate-lookup/${s.slug}` },
    openGraph: {
      type: 'website',
      siteName: SITE_NAME,
      title,
      description,
      url,
      locale: 'en_US',
      images: [{ url: '/opengraph-image', width: 1200, height: 630, alt: `${s.name} license plate lookup` }],
    },
    twitter: { card: 'summary_large_image', title, description, images: ['/opengraph-image'] },
  };
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
  const others = US_STATES.filter((x) => x.slug !== s.slug);
  const nearby = others.slice(0, 12);

  const faq = [
    { q: `Can I look up a car by license plate in ${s.name}?`, a: `Yes. Enter a ${s.name} (${s.abbr}) license plate and select the state to resolve the vehicle's VIN, then run the full history report — title brands, theft, liens, and odometer.` },
    { q: `Can I find the owner of a ${s.name} plate?`, a: `No. The federal Driver's Privacy Protection Act (DPPA) protects personal information tied to a motor-vehicle record. A lookup identifies the vehicle and its VIN, not the owner's name or address.` },
    { q: `Is the ${s.name} plate lookup free?`, a: `You see a free preview of the vehicle's identity first. The full history report is a paid unlock. It works for plates from all 50 states, including ${s.name}.` },
  ];

  const schema = [
    {
      '@context': 'https://schema.org',
      '@type': 'WebPage',
      '@id': url,
      name: `${s.name} License Plate Lookup`,
      url,
      description: `Look up a ${s.name} license plate and resolve it to the VIN for a full vehicle history report.`,
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
            Only have the plate? Resolve a {s.name} ({s.abbr}) plate to the VIN and pull the full vehicle history — title, theft, liens, and odometer.
          </p>
          <SearchForm />
          <p className="mt-5 text-sm text-slate-400">Free preview · {s.name} &amp; all 50 states</p>
        </div>
      </section>

      <article className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-14 prose-content">
        <h2>How a {s.name} license plate lookup works</h2>
        <p>
          A license plate is a pointer to a vehicle's records. Enter a {s.name} plate and the state, and the lookup resolves it
          to the 17-character VIN. From there you can run a full history report — the same records you would get by entering the
          VIN directly. Because plates are only unique within a state, selecting <strong>{s.name}</strong> matters.
        </p>

        <h2>What you can and cannot find</h2>
        <p>
          You can identify the vehicle (year, make, model) and unlock its title, theft, lien, and odometer history. You cannot
          get the owner's personal details: the federal <strong>Driver's Privacy Protection Act (DPPA)</strong> protects that
          information, and any service promising an owner's name and address from a plate is a red flag.
        </p>
      </article>

      <section className="bg-white border-y border-slate-100 py-14 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-2xl font-extrabold text-slate-900 mb-6">What the {s.name} report shows</h2>
          <ul className="space-y-3">
            {[
              'Vehicle identity — year, make, and model',
              `The VIN resolved from the ${s.name} plate`,
              'Title brands: salvage, rebuilt, junk, and flood (NMVTIS)',
              'Theft records (NICB), open liens, and odometer history',
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
        <h2 className="text-2xl sm:text-3xl font-extrabold text-white mb-3">Look up a {s.name} plate now</h2>
        <p className="text-blue-100 mb-6">Free preview · full history by plate or VIN.</p>
        <Link href="/#vin-search" className="inline-flex items-center gap-2 bg-white text-blue-700 font-bold px-7 py-3.5 rounded-full hover:scale-105 active:scale-100 transition-transform">
          <Search className="w-4 h-4" aria-hidden="true" /> Look up a plate
        </Link>
      </section>
    </main>
  );
}
