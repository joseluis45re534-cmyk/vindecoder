import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Check, ShieldCheck, Search } from 'lucide-react';
import { getDamageType, getVehicleType, DAMAGE_TYPES, VEHICLE_TYPES, type AuctionCategory } from '@/lib/auctions';
import { SITE_URL, SITE_NAME } from '@/lib/site';
import JsonLd from '@/components/JsonLd';
import { breadcrumbLd } from '@/lib/structured-data';
import SearchForm from '@/components/SearchForm';

type Kind = 'damage' | 'type';

function resolve(kind: Kind, slug: string): AuctionCategory | undefined {
  return kind === 'damage' ? getDamageType(slug) : getVehicleType(slug);
}

function pathFor(kind: Kind, slug: string): string {
  return `/auctions/${kind === 'damage' ? 'damage' : 'type'}/${slug}`;
}

export function auctionMetadata(kind: Kind, slug: string): Metadata {
  const cat = resolve(kind, slug);
  if (!cat) return { title: 'Auction category not found' };
  const isDamage = kind === 'damage';
  const title = isDamage
    ? `${cat.name} at Auction: What to Check Before You Buy`
    : `${cat.name} at Auction: VIN Check Guide`;
  const description = isDamage
    ? `What ${cat.name.toLowerCase()} means on an auction vehicle, the risks, and what to check with the VIN before you bid. ${cat.short}`
    : `Buying ${cat.name.toLowerCase()} at auction? What to check, common brands, and how to run the VIN history first. ${cat.short}`;
  const url = `${SITE_URL}${pathFor(kind, slug)}`;
  return {
    title,
    description,
    alternates: { canonical: pathFor(kind, slug) },
    openGraph: {
      type: 'article',
      siteName: SITE_NAME,
      title,
      description,
      url,
      locale: 'en_US',
      images: [{ url: '/opengraph-image', width: 1200, height: 630, alt: cat.name }],
    },
    twitter: { card: 'summary_large_image', title, description, images: ['/opengraph-image'] },
  };
}

export function AuctionCategoryPage({ kind, slug }: { kind: Kind; slug: string }) {
  const cat = resolve(kind, slug);
  if (!cat) notFound();

  const isDamage = kind === 'damage';
  const url = `${SITE_URL}${pathFor(kind, slug)}`;
  const siblings = (isDamage ? DAMAGE_TYPES : VEHICLE_TYPES).filter((c) => c.slug !== slug).slice(0, 10);
  const hubLabel = isDamage ? 'Damage types' : 'Vehicle types';
  const h1 = isDamage ? `${cat.name} at auction` : `${cat.name} at auction`;

  const schema = [
    {
      '@context': 'https://schema.org',
      '@type': 'WebPage',
      '@id': url,
      name: h1,
      url,
      description: cat.body,
      isPartOf: { '@id': `${SITE_URL}/#website` },
      about: { '@id': `${SITE_URL}/#service` },
    },
    breadcrumbLd([
      { name: 'Home', url: SITE_URL },
      { name: 'Auctions', url: `${SITE_URL}/auctions` },
      { name: cat.name, url },
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
              <li><Link href="/auctions" className="hover:text-white">Auctions</Link></li>
              <li aria-hidden="true">/</li>
              <li className="text-blue-100 font-medium">{cat.name}</li>
            </ol>
          </nav>
          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white mb-5 leading-tight">{h1}</h1>
          <p className="text-base sm:text-lg text-slate-300 mb-8 max-w-2xl mx-auto">{cat.body}</p>
          <SearchForm />
          <p className="mt-5 text-sm text-slate-400">Check any auction VIN before you bid · Free preview</p>
        </div>
      </section>

      <article className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-14 prose-content">
        <h2>What {isDamage ? cat.name.toLowerCase() : `buying ${cat.name.toLowerCase()}`} means at auction</h2>
        <p>{cat.body}</p>
        <p>
          Auction cars are often sold as-is with limited disclosure, so the VIN history is your best protection. Before you
          bid, run the VIN to check for {isDamage ? 'a matching title brand, prior' : ''} salvage, theft, lien, and odometer
          records — the details a listing photo will not show you.
        </p>
      </article>

      <section className="bg-white border-y border-slate-100 py-14 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-2xl font-extrabold text-slate-900 mb-6">What to check</h2>
          <ul className="space-y-3">
            {cat.checks.map((c) => (
              <li key={c} className="flex items-start gap-3 text-slate-700">
                <Check className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" aria-hidden="true" />
                <span>{c}</span>
              </li>
            ))}
            <li className="flex items-start gap-3 text-slate-700">
              <Check className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" aria-hidden="true" />
              <span>The full VIN history — <Link href="/#vin-search" className="text-blue-600 font-medium hover:underline">run it here</Link> before you bid.</span>
            </li>
          </ul>
        </div>
      </section>

      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <h2 className="text-2xl font-extrabold text-slate-900 mb-6">Other {hubLabel.toLowerCase()}</h2>
        <div className="flex flex-wrap gap-2.5">
          {siblings.map((c) => (
            <Link
              key={c.slug}
              href={pathFor(kind, c.slug)}
              className="text-sm font-medium bg-white border border-slate-200 hover:border-blue-300 hover:text-blue-600 text-slate-600 px-4 py-2 rounded-full transition-colors"
            >
              {c.name}
            </Link>
          ))}
          <Link href="/auctions" className="text-sm font-bold bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-full transition-colors">
            All auction guides →
          </Link>
        </div>
      </section>

      <section className="bg-gradient-to-br from-blue-700 to-blue-900 py-14 px-4 text-center">
        <ShieldCheck className="w-8 h-8 text-blue-200 mx-auto mb-3" aria-hidden="true" />
        <h2 className="text-2xl sm:text-3xl font-extrabold text-white mb-3">Check the VIN before you bid</h2>
        <p className="text-blue-100 mb-6">Title brands, theft, liens, and odometer history · free preview.</p>
        <Link href="/#vin-search" className="inline-flex items-center gap-2 bg-white text-blue-700 font-bold px-7 py-3.5 rounded-full hover:scale-105 active:scale-100 transition-transform">
          <Search className="w-4 h-4" aria-hidden="true" /> Run a VIN check
        </Link>
      </section>
    </main>
  );
}
