import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft, CheckCircle2, ShieldCheck, Search } from 'lucide-react';
import { getGuide, HOW_TO_GUIDES } from '@/lib/how-to';
import { SITE_URL, SITE_NAME } from '@/lib/site';
import JsonLd from '@/components/JsonLd';
import { howToLd, breadcrumbLd, faqPageLd } from '@/lib/structured-data';

export const runtime = 'edge';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const guide = getGuide(slug);
  if (!guide) return { title: 'Guide not found' };
  const url = `${SITE_URL}/how-to/${guide.slug}`;
  return {
    title: guide.title,
    description: guide.description,
    alternates: { canonical: `/how-to/${guide.slug}` },
    openGraph: {
      type: 'article',
      siteName: SITE_NAME,
      title: guide.title,
      description: guide.description,
      url,
      locale: 'en_US',
      images: [{ url: '/opengraph-image.png', width: 1200, height: 630, alt: guide.title }],
    },
    twitter: {
      card: 'summary_large_image',
      title: guide.title,
      description: guide.description,
      images: ['/opengraph-image.png'],
    },
  };
}

export default async function HowToGuidePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const guide = getGuide(slug);
  if (!guide) notFound();

  const url = `${SITE_URL}/how-to/${guide.slug}`;
  const related = guide.related
    .map((s) => HOW_TO_GUIDES.find((g) => g.slug === s))
    .filter((g): g is NonNullable<typeof g> => Boolean(g));

  const schema = [
    howToLd({ name: guide.title, description: guide.description, url, steps: guide.steps, totalTime: guide.totalTime }),
    breadcrumbLd([
      { name: 'Home', url: SITE_URL },
      { name: 'How-to guides', url: `${SITE_URL}/how-to` },
      { name: guide.title, url },
    ]),
    faqPageLd(guide.faq),
  ];

  return (
    <main className="min-h-screen bg-slate-50">
      <JsonLd data={schema} />

      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-slate-950 via-blue-950 to-slate-900 pt-12 sm:pt-16 pb-16 sm:pb-20 px-4 sm:px-6 lg:px-8">
        <div aria-hidden="true" className="animate-float pointer-events-none absolute -top-40 left-1/2 w-[600px] h-[400px] rounded-full bg-blue-600/20 blur-3xl" />
        <div className="relative max-w-3xl mx-auto">
          <nav aria-label="Breadcrumb" className="mb-6">
            <ol className="flex items-center gap-1.5 text-xs sm:text-sm text-blue-200/70">
              <li><Link href="/" className="hover:text-white">Home</Link></li>
              <li aria-hidden="true">/</li>
              <li><Link href="/how-to" className="hover:text-white">How-to</Link></li>
              <li aria-hidden="true">/</li>
              <li className="text-blue-100 font-medium truncate max-w-[200px] sm:max-w-none">{guide.title}</li>
            </ol>
          </nav>
          <p className="text-xs font-semibold uppercase tracking-widest text-blue-300 mb-3">{guide.category}</p>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white mb-4 leading-tight">{guide.title}</h1>
          <p className="text-base sm:text-lg text-slate-300 max-w-2xl">{guide.intro}</p>
          <p className="mt-5 text-sm text-slate-400">{guide.readingMinutes} min read · Step-by-step</p>
        </div>
      </section>

      <article className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Key takeaways */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 mb-10">
          <h2 className="text-sm font-bold uppercase tracking-wide text-slate-500 mb-4">Key takeaways</h2>
          <ul className="space-y-2.5">
            {guide.takeaways.map((t) => (
              <li key={t} className="flex items-start gap-2.5 text-slate-700">
                <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" aria-hidden="true" />
                <span>{t}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Steps */}
        <h2 className="text-2xl font-extrabold text-slate-900 mb-6">Step by step</h2>
        <ol className="space-y-6 mb-12">
          {guide.steps.map((s, i) => (
            <li key={s.name} className="flex gap-4">
              <span className="shrink-0 w-9 h-9 rounded-full bg-blue-600 text-white font-bold flex items-center justify-center">{i + 1}</span>
              <div>
                <h3 className="font-bold text-slate-900 mb-1">{s.name}</h3>
                <p className="text-slate-600 leading-relaxed">{s.text}</p>
              </div>
            </li>
          ))}
        </ol>

        {/* CTA */}
        <div className="bg-gradient-to-br from-blue-700 to-blue-900 rounded-2xl p-8 text-center mb-12">
          <ShieldCheck className="w-8 h-8 text-blue-200 mx-auto mb-3" aria-hidden="true" />
          <h2 className="text-2xl font-extrabold text-white mb-2">Check the VIN before you buy</h2>
          <p className="text-blue-100 mb-6">Title brands, theft records, liens, and odometer history in under a minute.</p>
          <Link href="/#vin-search" className="inline-flex items-center gap-2 bg-white text-blue-700 font-bold px-7 py-3 rounded-full hover:scale-105 transition-transform">
            <Search className="w-4 h-4" aria-hidden="true" /> Check a VIN now
          </Link>
        </div>

        {/* FAQ */}
        <h2 className="text-2xl font-extrabold text-slate-900 mb-6">Frequently asked questions</h2>
        <div className="space-y-3 mb-12">
          {guide.faq.map(({ q, a }) => (
            <details key={q} className="group bg-white rounded-2xl border border-slate-100 open:shadow-md transition-all">
              <summary className="flex items-center justify-between cursor-pointer list-none px-6 py-4 font-bold text-slate-900">
                {q}
                <span className="ml-4 text-blue-600 transition-transform group-open:rotate-45 text-xl leading-none" aria-hidden="true">+</span>
              </summary>
              <p className="px-6 pb-5 text-slate-500 leading-relaxed">{a}</p>
            </details>
          ))}
        </div>

        {/* Related */}
        {related.length > 0 && (
          <section aria-labelledby="related">
            <h2 id="related" className="text-2xl font-extrabold text-slate-900 mb-6">Related guides</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {related.map((g) => (
                <Link
                  key={g.slug}
                  href={`/how-to/${g.slug}`}
                  className="block bg-white rounded-2xl border border-slate-100 hover:border-blue-300 hover:shadow-md p-5 transition-all"
                >
                  <p className="text-xs font-semibold uppercase tracking-wide text-blue-600 mb-1.5">{g.category}</p>
                  <p className="font-bold text-slate-900 leading-snug">{g.title}</p>
                </Link>
              ))}
            </div>
          </section>
        )}

        <Link href="/how-to" className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-900 mt-10">
          <ArrowLeft className="w-4 h-4" /> All how-to guides
        </Link>
      </article>
    </main>
  );
}
