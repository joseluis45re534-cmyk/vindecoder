import type { Metadata } from 'next';
import Link from 'next/link';
import { allPosts } from '@/lib/blog';

export const runtime = 'edge';

export const metadata: Metadata = {
  title: 'VIN & Used-Car Buying Guides',
  description:
    'Practical guides on VIN checks, salvage and flood titles, odometer fraud, and buying a used car safely in the United States — from the CarVinLookup editorial team.',
  alternates: { canonical: '/blog' },
};

export default function BlogIndex() {
  const posts = allPosts();

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
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {posts.map((p) => (
            <article key={p.slug} className="bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all overflow-hidden flex flex-col">
              <Link href={`/blog/${p.slug}`} className="block">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={p.cover}
                  alt={p.coverAlt}
                  width={1200}
                  height={630}
                  loading="lazy"
                  className="w-full h-48 object-cover"
                />
              </Link>
              <div className="p-6 flex flex-col flex-1">
                <div className="flex items-center gap-2 text-xs text-slate-400 mb-3">
                  <time dateTime={p.date}>
                    {new Date(p.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </time>
                  <span aria-hidden="true">·</span>
                  <span>{p.readingMinutes} min read</span>
                </div>
                <h2 className="text-xl font-bold text-slate-900 mb-2 leading-snug">
                  <Link href={`/blog/${p.slug}`} className="hover:text-blue-600 transition-colors">
                    {p.title}
                  </Link>
                </h2>
                <p className="text-slate-500 text-sm leading-relaxed flex-1">{p.description}</p>
                <Link href={`/blog/${p.slug}`} className="mt-4 text-sm font-bold text-blue-600 hover:text-blue-700 inline-flex items-center gap-1">
                  Read guide <span aria-hidden="true">→</span>
                </Link>
              </div>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
