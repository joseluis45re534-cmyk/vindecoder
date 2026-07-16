import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ShieldCheck, Search } from 'lucide-react';
import { getProblemPage } from '@/lib/problem-pages';
import { SITE_URL, SITE_NAME } from '@/lib/site';
import JsonLd from '@/components/JsonLd';
import { breadcrumbLd, faqPageLd } from '@/lib/structured-data';

export function problemMetadata(slug: string): Metadata {
  const p = getProblemPage(slug);
  if (!p) return { title: 'Not found' };
  const url = `${SITE_URL}/${p.slug}`;
  return {
    title: p.metaTitle,
    description: p.metaDescription,
    alternates: { canonical: `/${p.slug}` },
    openGraph: {
      type: 'article',
      siteName: SITE_NAME,
      title: p.metaTitle,
      description: p.metaDescription,
      url,
      locale: 'en_US',
      images: [{ url: '/opengraph-image.png', width: 1200, height: 630, alt: p.name }],
    },
    twitter: { card: 'summary_large_image', title: p.metaTitle, description: p.metaDescription, images: ['/opengraph-image.png'] },
  };
}

export function ProblemArticlePage({ slug }: { slug: string }) {
  const p = getProblemPage(slug);
  if (!p) notFound();

  const url = `${SITE_URL}/${p.slug}`;
  const schema = [
    {
      '@context': 'https://schema.org',
      '@type': 'Article',
      headline: p.metaTitle,
      description: p.metaDescription,
      author: { '@type': 'Organization', name: SITE_NAME, url: SITE_URL },
      publisher: { '@type': 'Organization', name: SITE_NAME, logo: { '@type': 'ImageObject', url: `${SITE_URL}/icon-512.png` } },
      mainEntityOfPage: { '@type': 'WebPage', '@id': url },
    },
    breadcrumbLd([
      { name: 'Home', url: SITE_URL },
      { name: 'Problems', url: `${SITE_URL}/problems` },
      { name: p.name, url },
    ]),
    faqPageLd(p.faq),
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
              <li><Link href="/problems" className="hover:text-white">Problems</Link></li>
              <li aria-hidden="true">/</li>
              <li className="text-blue-100 font-medium">{p.name}</li>
            </ol>
          </nav>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white mb-5 leading-tight">{p.metaTitle.replace(' — CarVinLookup', '')}</h1>
          <p className="text-base sm:text-lg text-slate-300 max-w-2xl mx-auto">{p.intro}</p>
        </div>
      </section>

      <article className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-14 prose-content">
        {p.sections.map((s) => (
          <section key={s.h2}>
            <h2>{s.h2}</h2>
            {s.paragraphs.map((para, i) => (
              <p key={i}>{para}</p>
            ))}
            {s.bullets && (
              <ul>
                {s.bullets.map((b) => (
                  <li key={b}>{b}</li>
                ))}
              </ul>
            )}
          </section>
        ))}
        <p>
          <Link href={p.cta.href} className="text-blue-600 font-semibold">{p.cta.label}</Link>, or read our{' '}
          <Link href="/glossary">glossary</Link> and <Link href="/data-sources">data sources</Link> for the full picture.
        </p>
      </article>

      <section className="bg-white border-y border-slate-100 py-14 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-2xl font-extrabold text-slate-900 mb-8">FAQ</h2>
          <div className="space-y-3">
            {p.faq.map(({ q, a }) => (
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

      <section className="bg-gradient-to-br from-blue-700 to-blue-900 py-14 px-4 text-center">
        <ShieldCheck className="w-8 h-8 text-blue-200 mx-auto mb-3" aria-hidden="true" />
        <h2 className="text-2xl sm:text-3xl font-extrabold text-white mb-3">Check the VIN before you buy</h2>
        <p className="text-blue-100 mb-6">Free preview · title, theft, lien &amp; odometer history.</p>
        <Link href={p.cta.href} className="inline-flex items-center gap-2 bg-white text-blue-700 font-bold px-7 py-3.5 rounded-full hover:scale-105 active:scale-100 transition-transform">
          <Search className="w-4 h-4" aria-hidden="true" /> {p.cta.label}
        </Link>
      </section>
    </main>
  );
}
