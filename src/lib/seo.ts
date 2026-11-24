import type { Metadata } from 'next';
import { SITE_URL, SITE_NAME } from '@/lib/site';

// Page-level metadata builder. Next.js merges `openGraph`/`twitter` SHALLOWLY:
// a page that sets openGraph without `images` (or inherits the root layout's
// homepage og:title/og:url) ships the wrong preview. Every public page should
// build its metadata here so title, canonical, OG and Twitter stay in lockstep.

export const OG_IMAGE = { url: '/opengraph-image.png', width: 1200, height: 630 } as const;

export function pageMetadata(opts: {
  /** Page title WITHOUT the brand — the root template appends " | CarVinLookup". */
  title: string;
  /** ~140–160 chars. */
  description: string;
  /** Canonical path, e.g. '/pricing'. */
  path: string;
  /** Set when `title` already names the brand (e.g. "CarVinLookup vs. Carfax"). */
  absoluteTitle?: boolean;
  ogAlt?: string;
  type?: 'website' | 'article';
  robots?: Metadata['robots'];
}): Metadata {
  const { title, description, path, ogAlt, type = 'website', robots } = opts;
  // Google truncates titles past ~60 chars; rather than cut the page's own
  // words, drop the " | CarVinLookup" suffix when it would push past that.
  const absoluteTitle = opts.absoluteTitle || `${title} | ${SITE_NAME}`.length > 60;
  const fullTitle = absoluteTitle ? title : `${title} | ${SITE_NAME}`;
  const url = path === '/' ? `${SITE_URL}/` : `${SITE_URL}${path}`;
  return {
    title: absoluteTitle ? { absolute: title } : title,
    description,
    alternates: { canonical: path },
    openGraph: {
      type,
      siteName: SITE_NAME,
      locale: 'en_US',
      title: fullTitle,
      description,
      url,
      images: [{ ...OG_IMAGE, alt: ogAlt ?? title }],
    },
    twitter: { card: 'summary_large_image', title: fullTitle, description, images: [OG_IMAGE.url] },
    ...(robots ? { robots } : {}),
  };
}

/** Thin/templated tiers we keep live for users but out of Google's index
 *  until the domain has the authority to support them (see CLAUDE.md). */
export const NOINDEX_FOLLOW: Metadata['robots'] = { index: false, follow: true };
