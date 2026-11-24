import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ChevronRight, Search } from 'lucide-react';
import { getStickerMake, STICKER_MAKES } from '@/lib/window-stickers';
import { SITE_URL } from '@/lib/site';
import { pageMetadata, NOINDEX_FOLLOW } from '@/lib/seo';
import JsonLd from '@/components/JsonLd';
import { breadcrumbLd } from '@/lib/structured-data';
import SearchForm from '@/components/SearchForm';

export const runtime = 'edge';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ make: string }>;
}): Promise<Metadata> {
  const { make } = await params;
  const m = getStickerMake(make);
  if (!m) return { title: 'Make not found' };
  return pageMetadata({
    title: `${m.name} Window Sticker Lookup by VIN`,
    description: `What's on a ${m.name} window sticker (Monroney label) and how to get one by VIN. Sticker lookup is launching soon — decode a ${m.name} VIN free today.`,
    path: `/window-sticker/${m.slug}`,
    ogAlt: `${m.name} window sticker`,
    // Thin templated tier (~100 words/page): kept live for users, out of the
    // index until sticker data ships and the domain can support it (CLAUDE.md).
    robots: NOINDEX_FOLLOW,
  });
}

export default async function StickerMakePage({
  params,
}: {
  params: Promise<{ make: string }>;
}) {
  const { make } = await params;
  const m = getStickerMake(make);
  if (!m) notFound();

  const url = `${SITE_URL}/window-sticker/${m.slug}`;
  const otherMakes = STICKER_MAKES.filter((x) => x.slug !== m.slug).slice(0, 16);

  const schema = [
    {
      '@context': 'https://schema.org',
      '@type': 'CollectionPage',
      '@id': url,
      name: `${m.name} Window Stickers`,
      url,
      description: `${m.name} window stickers by model — what each shows and how to get one by VIN.`,
      isPartOf: { '@id': `${SITE_URL}/#website` },
    },
    breadcrumbLd([
      { name: 'Home', url: SITE_URL },
      { name: 'Window sticker', url: `${SITE_URL}/window-sticker` },
      { name: m.name, url },
    ]),
  ];

  return (
    <main className="min-h-screen bg-slate-50">
      <JsonLd data={schema} />

      <section className="relative overflow-hidden bg-gradient-to-br from-slate-950 via-blue-950 to-slate-900 pt-12 sm:pt-16 pb-16 px-4 sm:px-6 lg:px-8">
        <div aria-hidden="true" className="animate-float pointer-events-none absolute -top-40 left-1/2 w-[600px] h-[400px] rounded-full bg-blue-600/20 blur-3xl" />
        <div className="relative max-w-3xl mx-auto text-center">
          <nav aria-label="Breadcrumb" className="mb-6">
            <ol className="flex items-center justify-center gap-1.5 text-xs sm:text-sm text-blue-200/70">
              <li><Link href="/" className="hover:text-white">Home</Link></li>
              <li aria-hidden="true">/</li>
              <li><Link href="/window-sticker" className="hover:text-white">Window sticker</Link></li>
              <li aria-hidden="true">/</li>
              <li className="text-blue-100 font-medium">{m.name}</li>
            </ol>
          </nav>
          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white mb-5 leading-tight">
            {m.name} window sticker lookup
          </h1>
          <p className="text-base sm:text-lg text-slate-300 mb-8 max-w-2xl mx-auto">
            Window sticker lookup by VIN is launching soon. Enter a {m.name} VIN now for a free vehicle preview and the full title, theft, lien, and odometer history.
          </p>
          <SearchForm />
        </div>
      </section>

      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <h2 className="text-xl font-extrabold text-slate-900 mb-6">{m.name} models</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {m.models.map((model) => (
            <Link
              key={model.slug}
              href={`/window-sticker/${m.slug}/${model.slug}`}
              className="group flex items-center justify-between bg-white rounded-xl border border-slate-100 shadow-sm hover:shadow-md hover:border-blue-200 px-5 py-4 transition-all"
            >
              <span className="font-semibold text-slate-800">{m.name} {model.name}</span>
              <ChevronRight className="w-4 h-4 text-blue-600 group-hover:translate-x-1 transition-transform" aria-hidden="true" />
            </Link>
          ))}
        </div>

        <h2 className="text-xl font-extrabold text-slate-900 mt-14 mb-6">Other makes</h2>
        <div className="flex flex-wrap gap-2.5">
          {otherMakes.map((x) => (
            <Link
              key={x.slug}
              href={`/window-sticker/${x.slug}`}
              className="text-sm font-medium bg-white border border-slate-200 hover:border-blue-300 hover:text-blue-600 text-slate-600 px-4 py-2 rounded-full transition-colors"
            >
              {x.name}
            </Link>
          ))}
          <Link href="/window-sticker" className="text-sm font-bold bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-full transition-colors">
            All makes →
          </Link>
        </div>
      </section>

      <section className="bg-gradient-to-br from-blue-700 to-blue-900 py-14 px-4 text-center">
        <h2 className="text-2xl sm:text-3xl font-extrabold text-white mb-3">Check any {m.name} VIN</h2>
        <p className="text-blue-100 mb-6">Free preview · full history by VIN · window stickers launching soon.</p>
        <Link href="/#vin-search" className="inline-flex items-center gap-2 bg-white text-blue-700 font-bold px-7 py-3.5 rounded-full hover:scale-105 active:scale-100 transition-transform">
          <Search className="w-4 h-4" aria-hidden="true" /> Look up a VIN
        </Link>
      </section>
    </main>
  );
}
