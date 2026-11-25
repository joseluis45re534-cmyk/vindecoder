import type { Metadata } from 'next';
import { pageMetadata, NOINDEX_FOLLOW } from '@/lib/seo';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { listAllArticlesWithStatus } from '@/lib/autoseo';

export const runtime = 'edge';
export const dynamic = 'force-dynamic'; // always-fresh; AutoSEO fetched per request

function pageNumber(raw?: string): number {
  return Math.max(1, Math.floor(Number(raw)) || 1);
}

// Each paginated page is its own canonical (page 2 lists different posts than
// page 1 — canonicalizing it to /blog tells Google to ignore those posts' links).
export async function generateMetadata({ searchParams }: { searchParams: Promise<{ page?: string }> }): Promise<Metadata> {
  const page = pageNumber((await searchParams).page);
  // With no publishable posts (every AutoSEO post hidden), the index is an empty
  // shell: keep it out of search results until real posts exist (the sitemap
  // drops it too). An API outage (ok=false) does not flip this.
  const { articles, ok } = await listAllArticlesWithStatus();
  return pageMetadata({
    title: page > 1 ? `VIN & Used-Car Buying Guides – Page ${page}` : 'VIN & Used-Car Buying Guides',
    description:
      'Practical guides on VIN checks, salvage and flood titles, odometer fraud, and buying a used car safely in the United States.',
    path: page > 1 ? `/blog?page=${page}` : '/blog',
    ...(ok && articles.length === 0 ? { robots: NOINDEX_FOLLOW } : {}),
  });
}

function fmtDate(iso: string) {
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? '' : d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

export default async function BlogIndex({ searchParams }: { searchParams: Promise<{ page?: string }> }) {
  const page = pageNumber((await searchParams).page);
  // Filter hidden posts FIRST, then paginate locally — paginating the API and
  // filtering afterwards left pages short (or empty soft-404s).
  const { articles: all, ok } = await listAllArticlesWithStatus();
  const PER_PAGE = 12;
  const totalPages = Math.max(1, Math.ceil(all.length / PER_PAGE));
  // A page past the end is a real 404, not an empty 200 (a soft-404 to Google).
  if (ok && page > 1 && page > totalPages) notFound();
  const articles = all.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  return (
    <main className="min-h-screen bg-slate-50">
      <section className="bg-white border-b border-slate-100 py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-sm font-semibold text-blue-600 uppercase tracking-widest mb-3">CarVinLookup Blog</p>
          <h1 className="text-4xl sm:text-5xl font-extrabold text-slate-900 tracking-tight mb-4">
            Buy your next car with confidence
          </h1>
          <p className="text-lg text-slate-500 max-w-2xl mx-auto">
            Honest, practical guides to VIN checks, title brands, and avoiding expensive used-car mistakes.
          </p>
        </div>
      </section>

      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {articles.length === 0 ? (
          <div className="text-center text-slate-500 py-16">
            <p className="text-lg font-semibold text-slate-700">
              {ok ? 'New guides are on the way.' : 'Our guides are loading — please check back shortly.'}
            </p>
            {ok && (
              <p className="mt-2 text-sm">
                Meanwhile, our <Link href="/how-to" className="text-blue-600 hover:underline">step-by-step how-to guides</Link>{' '}
                cover VIN checks, title brands, and buying a used car safely.
              </p>
            )}
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {articles.map((p) => (
                <article key={p.slug} className="bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all overflow-hidden flex flex-col">
                  {p.image && (
                    <Link href={`/blog/${p.slug}`} className="block">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={p.image}
                        alt={p.title}
                        width={1200}
                        height={630}
                        loading="lazy"
                        className="w-full h-48 object-cover"
                      />
                    </Link>
                  )}
                  <div className="p-6 flex flex-col flex-1">
                    <div className="flex items-center gap-2 text-xs text-slate-400 mb-3">
                      <time dateTime={p.publishedAt}>{fmtDate(p.publishedAt)}</time>
                      {p.readingTimeMinutes ? (
                        <>
                          <span aria-hidden="true">·</span>
                          <span>{p.readingTimeMinutes} min read</span>
                        </>
                      ) : null}
                    </div>
                    <h2 className="text-xl font-bold text-slate-900 mb-2 leading-snug">
                      <Link href={`/blog/${p.slug}`} className="hover:text-blue-600 transition-colors">{p.title}</Link>
                    </h2>
                    <p className="text-slate-500 text-sm leading-relaxed flex-1">{p.excerpt}</p>
                    <Link href={`/blog/${p.slug}`} className="mt-4 text-sm font-bold text-blue-600 hover:text-blue-700 inline-flex items-center gap-1">
                      Read guide <span aria-hidden="true">→</span>
                    </Link>
                  </div>
                </article>
              ))}
            </div>

            {totalPages > 1 && (
              <nav className="mt-12 flex items-center justify-center gap-3" aria-label="Blog pagination">
                {page > 1 && (
                  <Link href={`/blog?page=${page - 1}`} rel="prev" className="px-4 py-2 rounded-lg border border-slate-200 bg-white text-sm font-semibold text-slate-700 hover:bg-slate-50">
                    ← Newer
                  </Link>
                )}
                <span className="text-sm text-slate-500">Page {page} of {totalPages}</span>
                {page < totalPages && (
                  <Link href={`/blog?page=${page + 1}`} rel="next" className="px-4 py-2 rounded-lg border border-slate-200 bg-white text-sm font-semibold text-slate-700 hover:bg-slate-50">
                    Older →
                  </Link>
                )}
              </nav>
            )}
          </>
        )}
      </section>
    </main>
  );
}
