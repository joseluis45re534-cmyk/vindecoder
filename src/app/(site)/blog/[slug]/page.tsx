import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft, ShieldCheck } from 'lucide-react';
import { getPostBySlug, renderMarkdown } from '@/lib/blog';
import { SITE_URL, SITE_NAME } from '@/lib/site';

export const runtime = 'edge';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = getPostBySlug(slug);
  if (!post) return { title: 'Not found' };
  return {
    title: post.title,
    description: post.description,
    alternates: { canonical: `/blog/${post.slug}` },
    openGraph: {
      type: 'article',
      title: post.title,
      description: post.description,
      url: `${SITE_URL}/blog/${post.slug}`,
      publishedTime: post.date,
      modifiedTime: post.updated || post.date,
      images: [{ url: post.cover, alt: post.coverAlt }],
    },
  };
}

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = getPostBySlug(slug);
  if (!post) notFound();

  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'BlogPosting',
        headline: post.title,
        description: post.description,
        image: post.cover,
        datePublished: post.date,
        dateModified: post.updated || post.date,
        author: { '@type': 'Organization', name: post.author, url: SITE_URL },
        publisher: {
          '@type': 'Organization',
          name: SITE_NAME,
          logo: { '@type': 'ImageObject', url: `${SITE_URL}/opengraph-image` },
        },
        mainEntityOfPage: { '@type': 'WebPage', '@id': `${SITE_URL}/blog/${post.slug}` },
      },
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Home', item: SITE_URL },
          { '@type': 'ListItem', position: 2, name: 'Blog', item: `${SITE_URL}/blog` },
          { '@type': 'ListItem', position: 3, name: post.title, item: `${SITE_URL}/blog/${post.slug}` },
        ],
      },
    ],
  };

  return (
    <main className="min-h-screen bg-white">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <article className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <nav aria-label="Breadcrumb" className="mb-8">
          <ol className="flex items-center gap-1.5 text-sm text-slate-500">
            <li><Link href="/" className="hover:text-slate-900">Home</Link></li>
            <li aria-hidden="true">/</li>
            <li><Link href="/blog" className="hover:text-slate-900">Blog</Link></li>
            <li aria-hidden="true">/</li>
            <li className="text-slate-700 font-medium truncate max-w-[200px] sm:max-w-none">{post.title}</li>
          </ol>
        </nav>

        <Link href="/blog" className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-900 mb-8">
          <ArrowLeft className="w-4 h-4" /> All guides
        </Link>

        <div className="flex items-center gap-2 text-sm text-slate-400 mb-4">
          <time dateTime={post.date}>
            {new Date(post.date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
          </time>
          <span aria-hidden="true">·</span>
          <span>{post.readingMinutes} min read</span>
          {post.aiAssisted && (
            <>
              <span aria-hidden="true">·</span>
              <span className="text-slate-400">AI-assisted, human-reviewed</span>
            </>
          )}
        </div>

        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight leading-tight mb-6">
          {post.title}
        </h1>

        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={post.cover}
          alt={post.coverAlt}
          width={1200}
          height={630}
          className="w-full rounded-2xl mb-10 aspect-[16/9] object-cover"
        />

        <div
          className="prose-content"
          dangerouslySetInnerHTML={{ __html: renderMarkdown(post.body) }}
        />

        {/* Conversion CTA */}
        <div className="mt-12 bg-gradient-to-br from-blue-700 to-blue-900 rounded-2xl p-8 text-center">
          <ShieldCheck className="w-8 h-8 text-blue-200 mx-auto mb-3" aria-hidden="true" />
          <h2 className="text-2xl font-extrabold text-white mb-2">Run the VIN before you buy</h2>
          <p className="text-blue-100 mb-6">Title brands, theft records, liens, and odometer history in under a minute.</p>
          <Link
            href="/#vin-search"
            className="inline-flex bg-white text-blue-700 font-bold px-7 py-3 rounded-full hover:scale-105 transition-transform"
          >
            Check a VIN now
          </Link>
        </div>

        <p className="mt-8 text-xs text-slate-400">
          By {post.author}. CarVinLookup publishes educational guidance for used-car buyers; reports source data from NMVTIS, NICB, and state DMVs.
        </p>
      </article>
    </main>
  );
}
