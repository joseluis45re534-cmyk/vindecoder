import type { Metadata } from 'next';
import Link from 'next/link';
import { listArticles } from '@/lib/autoseo';

export const runtime = 'edge';
// ISR: refresh the index every ~10 min; the AutoSEO webhook revalidates on publish.
export const revalidate = 600;

export const metadata: Metadata = {
  title: 'VIN & Used-Car Buying Guides',
  description:
    'Practical guides on VIN checks, salvage and flood titles, odometer fraud, and buying a used car safely in the United States.',
  alternates: { canonical: '/blog' },
};

function fmtDate(iso: string) {
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? '' : d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

export default async function BlogIndex({ searchParams }: { searchParams: Promise<{ page?: string }> }) {
  const sp = await searchParams;
  const page = Math.max(1, Number(sp.page) || 1);
  const { articles, totalPages, ok } = await listArticles({ page, pageSize: 12 });

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
            <p className="mt-2 text-sm">
              {ok ? 'Check back soon for VIN and used-car buying guides.' : ''}
            </p>
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
