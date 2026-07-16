import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { FileText, DollarSign, Gauge, Wrench, ShieldCheck, Search } from 'lucide-react';
import { getStickerModel, getStickerMake } from '@/lib/window-stickers';
import { SITE_URL, SITE_NAME } from '@/lib/site';
import JsonLd from '@/components/JsonLd';
import { breadcrumbLd, faqPageLd } from '@/lib/structured-data';
import SearchForm from '@/components/SearchForm';

export const runtime = 'edge';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ make: string; model: string }>;
}): Promise<Metadata> {
  const { make, model } = await params;
  const found = getStickerModel(make, model);
  if (!found) return { title: 'Window sticker not found' };
  const label = `${found.make.name} ${found.model.name}`;
  const title = `${label} Window Sticker by VIN — CarVinLookup`;
  const description = `Get the original ${label} window sticker (Monroney label) by VIN — MSRP, factory options, fuel economy, and standard equipment as the car was built. Free preview.`;
  const url = `${SITE_URL}/window-sticker/${make}/${model}`;
  return {
    title,
    description,
    alternates: { canonical: `/window-sticker/${make}/${model}` },
    openGraph: {
      type: 'website',
      siteName: SITE_NAME,
      title,
      description,
      url,
      locale: 'en_US',
      images: [{ url: '/opengraph-image.png', width: 1200, height: 630, alt: `${label} window sticker` }],
    },
    twitter: { card: 'summary_large_image', title, description, images: ['/opengraph-image.png'] },
  };
}

export default async function StickerModelPage({
  params,
}: {
  params: Promise<{ make: string; model: string }>;
}) {
  const { make, model } = await params;
  const found = getStickerModel(make, model);
  if (!found) notFound();

  const label = `${found.make.name} ${found.model.name}`;
  const url = `${SITE_URL}/window-sticker/${make}/${model}`;
  const siblings = found.make.models.filter((m) => m.slug !== found.model.slug).slice(0, 8);

  const faq = [
    { q: `How do I get a ${label} window sticker?`, a: `Enter the ${label}'s 17-character VIN in the search box. CarVinLookup pulls the original window sticker data recorded for that specific VIN, so the MSRP, options, and equipment match the exact car as it was built.` },
    { q: `What is on a ${label} window sticker?`, a: `A Monroney window sticker lists the as-built MSRP, standard and optional equipment, EPA fuel-economy estimates, warranty information, and the vehicle's build and destination details.` },
    { q: `Is the window sticker lookup free?`, a: `You see a free identity preview confirming the ${label} first. The full window sticker and history report is a paid unlock.` },
  ];

  const schema = [
    {
      '@context': 'https://schema.org',
      '@type': 'WebPage',
      '@id': url,
      name: `${label} Window Sticker`,
      url,
      description: `Look up the original ${label} window sticker by VIN.`,
      isPartOf: { '@id': `${SITE_URL}/#website` },
      about: { '@type': 'Product', name: label, brand: { '@type': 'Brand', name: found.make.name } },
    },
    breadcrumbLd([
      { name: 'Home', url: SITE_URL },
      { name: 'Window sticker', url: `${SITE_URL}/window-sticker` },
      { name: found.make.name, url: `${SITE_URL}/window-sticker/${make}` },
      { name: found.model.name, url },
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
              <li><Link href="/window-sticker" className="hover:text-white">Window sticker</Link></li>
              <li aria-hidden="true">/</li>
              <li><Link href={`/window-sticker/${make}`} className="hover:text-white">{found.make.name}</Link></li>
              <li aria-hidden="true">/</li>
              <li className="text-blue-100 font-medium">{found.model.name}</li>
            </ol>
          </nav>
          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white mb-5 leading-tight">
            {label} <span className="bg-gradient-to-r from-blue-400 to-sky-300 bg-clip-text text-transparent">window sticker</span>
          </h1>
          <p className="text-base sm:text-lg text-slate-300 mb-8 max-w-2xl mx-auto">
            Look up the original {label} window sticker (Monroney label) by VIN — the factory MSRP, options, and equipment for that exact car.
          </p>
          <SearchForm />
          <p className="mt-5 text-sm text-slate-400">Free preview · By VIN · All model years</p>
        </div>
      </section>

      {/* What's on it */}
      <article className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-14 prose-content">
        <h2>What is on a {label} window sticker?</h2>
        <p>
          The window sticker — officially the Monroney label — is the information sheet the manufacturer attaches to a new
          vehicle. Pulling it by VIN recreates the exact build of a specific {label}, which is invaluable when you are buying
          used and want to know what the car originally came with. A {label} window sticker typically shows:
        </p>
      </article>

      <section className="bg-white border-y border-slate-100 py-14 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {[
            { icon: DollarSign, c: 'text-emerald-600 bg-emerald-50', t: 'Original MSRP', d: `The as-built price of the ${label}, including options.` },
            { icon: FileText, c: 'text-violet-600 bg-violet-50', t: 'Equipment', d: 'Standard and optional equipment and packages.' },
            { icon: Gauge, c: 'text-blue-600 bg-blue-50', t: 'Fuel economy', d: 'EPA city, highway, and combined estimates.' },
            { icon: Wrench, c: 'text-amber-600 bg-amber-50', t: 'Build details', d: 'Warranty, and assembly/destination information.' },
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

      {/* How to get it */}
      <section className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <h2 className="text-2xl font-extrabold text-slate-900 mb-6">How to get a {label} window sticker by VIN</h2>
        <ol className="space-y-6">
          {[
            { n: 'Find the VIN', t: `Locate the ${label}'s 17-character VIN on the windshield, driver door jamb, title, or registration.` },
            { n: 'Enter it above', t: 'Type the VIN into the search box to confirm the exact vehicle in a free preview.' },
            { n: 'Unlock the sticker & history', t: 'Get the original window sticker for that VIN alongside title, theft, lien, and odometer history.' },
          ].map((s, i) => (
            <li key={s.n} className="flex gap-4">
              <span className="shrink-0 w-9 h-9 rounded-full bg-blue-600 text-white font-bold flex items-center justify-center">{i + 1}</span>
              <div>
                <h3 className="font-bold text-slate-900 mb-1">{s.n}</h3>
                <p className="text-slate-600 leading-relaxed">{s.t}</p>
              </div>
            </li>
          ))}
        </ol>
      </section>

      {/* FAQ */}
      <section className="bg-white border-t border-slate-100 py-14 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-2xl font-extrabold text-slate-900 mb-8">{label} window sticker — FAQ</h2>
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

      {/* Other models */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <h2 className="text-2xl font-extrabold text-slate-900 mb-6">Other {found.make.name} window stickers</h2>
        <div className="flex flex-wrap gap-2.5">
          {siblings.map((m) => (
            <Link
              key={m.slug}
              href={`/window-sticker/${make}/${m.slug}`}
              className="text-sm font-medium bg-white border border-slate-200 hover:border-blue-300 hover:text-blue-600 text-slate-600 px-4 py-2 rounded-full transition-colors"
            >
              {found.make.name} {m.name}
            </Link>
          ))}
          <Link href={`/window-sticker/${make}`} className="text-sm font-bold bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-full transition-colors">
            All {found.make.name} models →
          </Link>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-gradient-to-br from-blue-700 to-blue-900 py-14 px-4 text-center">
        <ShieldCheck className="w-8 h-8 text-blue-200 mx-auto mb-3" aria-hidden="true" />
        <h2 className="text-2xl sm:text-3xl font-extrabold text-white mb-3">Get the {label} window sticker</h2>
        <p className="text-blue-100 mb-6">Free preview · original sticker + full history by VIN.</p>
        <Link href="/#vin-search" className="inline-flex items-center gap-2 bg-white text-blue-700 font-bold px-7 py-3.5 rounded-full hover:scale-105 active:scale-100 transition-transform">
          <Search className="w-4 h-4" aria-hidden="true" /> Look up a VIN
        </Link>
      </section>
    </main>
  );
}
