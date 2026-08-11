import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft, ShieldCheck } from 'lucide-react';
import JsonLd from '@/components/JsonLd';
import { getArticle } from '@/lib/autoseo';
import { SITE_URL } from '@/lib/site';

export const runtime = 'edge';
export const dynamic = 'force-dynamic'; // always-fresh; AutoSEO fetched per request

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  let a: Awaited<ReturnType<typeof getArticle>>;
  try {
    a = await getArticle(slug);
  } catch {
    // API error / missing key — don't crash metadata; keep the page out of the index.
    return { title: 'Guide', robots: { index: false, follow: true } };
  }
  if (!a) return { title: 'Not found', robots: { index: false, follow: false } };

  // Canonical comes straight from AutoSEO (built from our baseUrl). Only fall
  // back to composing it if the API returned null (shouldn't happen — we pass baseUrl).
  const canonical = a.seo.canonical || `${SITE_URL}/blog/${a.slug}`;
  const ogImage = a.seo.ogImage || a.image || undefined;

  return {
    // `absolute` so AutoSEO's SEO title is used verbatim (no "| CarVinLookup" suffix).
    title: { absolute: a.metaTitle || a.title },
    description: a.metaDescription || a.excerpt || undefined,
    alternates: { canonical },
    robots: a.seo.noindex ? { index: false, follow: true } : undefined,
    openGraph: {
      type: 'article',
      title: a.metaTitle || a.title,
      description: a.metaDescription || a.excerpt || undefined,
      url: canonical,
      publishedTime: a.publishedAt,
      modifiedTime: a.updatedAt || a.publishedAt,
      images: ogImage ? [{ url: ogImage, alt: a.title }] : undefined,
    },
    twitter: {
      card: 'summary_large_image',
      title: a.metaTitle || a.title,
      description: a.metaDescription || a.excerpt || undefined,
      images: ogImage ? [ogImage] : undefined,
    },
  };
}

function fmtDate(iso: string) {
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? '' : d.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
}

export default async function BlogArticlePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  let a: Awaited<ReturnType<typeof getArticle>>;
  try {
    a = await getArticle(slug);
  } catch (err) {
    // API error / missing key — degrade gracefully instead of a raw 500.
    console.error('[blog] article fetch failed:', (err as Error).message);
    return (
      <main className="min-h-screen bg-white">
        <div className="max-w-3xl mx-auto px-4 py-24 text-center">
          <h1 className="text-2xl font-bold text-slate-900">This guide is temporarily unavailable</h1>
          <p className="mt-3 text-slate-500">Please try again in a moment.</p>
          <Link href="/blog" className="mt-6 inline-flex items-center gap-1.5 text-sm font-semibold text-blue-600 hover:text-blue-700">
            <ArrowLeft className="w-4 h-4" /> All guides
          </Link>
        </div>
      </main>
    );
  }
  if (!a) notFound();

  return (
    <main className="min-h-screen bg-white">
      {/* Structured data straight from AutoSEO (Article + BreadcrumbList + FAQPage).
          Never write our own here — it would duplicate. */}
      {a.seo.jsonLdBlocks?.length ? (
        <JsonLd data={a.seo.jsonLdBlocks} />
      ) : a.seo.jsonLd ? (
        <div dangerouslySetInnerHTML={{ __html: a.seo.jsonLd }} />
      ) : null}

      <article className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <nav aria-label="Breadcrumb" className="mb-8">
          <ol className="flex items-center gap-1.5 text-sm text-slate-500">
            <li><Link href="/" className="hover:text-slate-900">Home</Link></li>
            <li aria-hidden="true">/</li>
            <li><Link href="/blog" className="hover:text-slate-900">Blog</Link></li>
            <li aria-hidden="true">/</li>
            <li className="text-slate-700 font-medium truncate max-w-[200px] sm:max-w-none">{a.title}</li>
          </ol>
        </nav>

        <Link href="/blog" className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-900 mb-8">
          <ArrowLeft className="w-4 h-4" /> All guides
        </Link>

        <div className="flex items-center gap-2 text-sm text-slate-400 mb-4">
          <time dateTime={a.publishedAt}>{fmtDate(a.publishedAt)}</time>
          {a.readingTimeMinutes ? (
            <>
              <span aria-hidden="true">·</span>
              <span>{a.readingTimeMinutes} min read</span>
            </>
          ) : null}
        </div>

        {/* The body carries no H1 — render the title exactly once, here. */}
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight leading-tight mb-6">
          {a.title}
        </h1>

        {a.image && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={a.image}
            alt={a.title}
            width={1200}
            height={630}
            className="w-full rounded-2xl mb-10 aspect-[16/9] object-cover"
          />
        )}

        {/* Table of contents from AutoSEO headings — ids already exist in the body. */}
        {a.headings?.length > 1 && (
          <nav aria-label="On this page" className="mb-10 rounded-2xl border border-slate-100 bg-slate-50 p-5">
            <p className="text-xs font-bold uppercase tracking-wide text-slate-400 mb-3">On this page</p>
            <ul className="space-y-1.5">
              {a.headings.map((h) => (
                <li key={h.id} style={{ paddingLeft: `${Math.max(0, h.level - 2) * 14}px` }}>
                  <a href={`#${h.id}`} className="text-sm text-slate-600 hover:text-blue-600">{h.text}</a>
                </li>
              ))}
            </ul>
          </nav>
        )}

        {/* Body HTML from AutoSEO — render as-is (already HTML, absolute image URLs). */}
        <div className="prose-content" dangerouslySetInnerHTML={{ __html: a.html }} />

        {/* Conversion CTA */}
        <div className="mt-12 bg-gradient-to-br from-blue-700 to-blue-900 rounded-2xl p-8 text-center">
          <ShieldCheck className="w-8 h-8 text-blue-200 mx-auto mb-3" aria-hidden="true" />
          <h2 className="text-2xl font-extrabold text-white mb-2">Run the VIN before you buy</h2>
          <p className="text-blue-100 mb-6">Title brands, theft records, liens, and odometer history in under a minute.</p>
          <Link href="/#vin-search" className="inline-flex bg-white text-blue-700 font-bold px-7 py-3 rounded-full hover:scale-105 transition-transform">
            Check a VIN now
          </Link>
        </div>

        {/* Read next — real internal links between our own articles. */}
        {a.related?.length > 0 && (
          <section className="mt-12" aria-label="Read next">
            <h2 className="text-xl font-extrabold text-slate-900 mb-5">Read next</h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {a.related.map((r) => (
                <Link key={r.slug} href={`/blog/${r.slug}`} className="block rounded-2xl border border-slate-100 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all overflow-hidden bg-white">
                  {r.image && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={r.image} alt={r.title} loading="lazy" className="w-full h-28 object-cover" />
                  )}
                  <div className="p-4">
                    <p className="text-sm font-bold text-slate-900 leading-snug line-clamp-3">{r.title}</p>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}
      </article>
    </main>
  );
}
