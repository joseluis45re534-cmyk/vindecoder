// AutoSEO Content API adapter — the ONLY place the AutoSEO endpoints + key live.
// SERVER-ONLY: reads AUTOSEO_BLOG_API_KEY from the runtime env and sends it as a
// Bearer header. The key is never exposed to the browser, never NEXT_PUBLIC_,
// never put in a query string. Do not import this from a client component.
//
// Docs (exact, do not invent endpoints):
//   GET /articles?page&pageSize&tag&updatedSince   — list (no bodies)
//   GET /articles/<slug>?baseUrl=<blog index url>   — one article WITH body
//   GET /tags                                        — tag facets
//   GET /sitemap                                     — slugs + updatedAt

import { getEnv } from '@/lib/cf';
import { SITE_URL, SITE_NAME } from '@/lib/site';

const BASE = 'https://autoseo.it.com/api/content-api/v1';
export const BLOG_PATH = '/blog';
export const BLOG_INDEX_URL = `${SITE_URL}${BLOG_PATH}`;

export interface ArticleListItem {
  slug: string;
  title: string;
  metaTitle: string | null;
  metaDescription: string | null;
  excerpt: string;
  image: string | null;
  tags: string[];
  wordCount: number;
  readingTimeMinutes: number;
  publishedAt: string;
  updatedAt: string;
}

export interface ArticleHeading {
  level: number;
  text: string;
  id: string;
}

export interface ArticleSeo {
  canonical: string | null;
  ogImage: string | null;
  keywords: string[];
  noindex: boolean;
  faqs: { question: string; answer: string }[];
  jsonLd: string | null;
  jsonLdBlocks: unknown[];
}

export interface ArticleFull extends ArticleListItem {
  html: string;
  contentFormat: string;
  headings: ArticleHeading[];
  seo: ArticleSeo;
  related: ArticleListItem[];
}

export interface ArticleList {
  articles: ArticleListItem[];
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}

export class AutoSeoError extends Error {
  status?: number;
  constructor(message: string, status?: number) {
    super(message);
    this.name = 'AutoSeoError';
    this.status = status;
  }
}

// Off-topic guard. AutoSEO published driving-test / international-driving-permit
// articles to this blog — a different subject that has nothing to do with U.S.
// vehicle history reports. They dilute topical relevance (Google declines to
// index the blog) and link to pages that don't exist here, so they are never
// listed, linked, sitemapped, or served (404). The real fix is removing them —
// and the driving-test / IDP competitors behind them — in the AutoSEO project;
// this guard keeps carvinlookup.us clean regardless.
const OFF_TOPIC = /(^|-)(driving-tests?|international-dl|international-driving|idp|idpglobe)(-|$)/;

export function isOffTopic(slug: string): boolean {
  return OFF_TOPIC.test(slug);
}

// Consolidated posts -> their one canonical home (308 from /blog/[slug]).
// AutoSEO generated several posts per competitor / per topic that compete with
// each other and with our hand-written /compare and /{x}-alternative pages
// (keyword cannibalization). Each slug here is hidden from /blog, the sitemap,
// llms.txt, and "Read next", and permanently redirects. ClearVin became a data
// partner in Nov 2026, so its competitor comparison is retired too.
// To retire another post: add it here AND delete/unpublish it in AutoSEO.
export const CONSOLIDATED_POSTS: Record<string, string> = {
  'carvinlookup-vs-clearvin-comprehensive-comparison': '/compare',
  'carvinlookup-vs-autocheck-a-comprehensive': '/compare/carvinlookup-vs-autocheck',
  'autocheck-comparison-autocheck-vs-alternatives': '/autocheck-alternative',
  'free-autocheck-alternative-discover-comprehensive': '/autocheck-alternative',
  'carvinlookup-vs-vinaudit-a-comprehensive': '/compare/carvinlookup-vs-vinaudit',
  'vinaudit-comparison-choosing-the-right-option': '/vinaudit-alternative',
  'vincheckup-comparison-which-service-is-right': '/compare',
  'free-vincheckup-alternative-top-options': '/compare',
  'vehicle-vin-lookup-your-complete-guide-to-vin': '/blog/vehicle-vin-lookup-your-ultimate-guide-to-vin',
  // Fabricated facts about CarVinLookup (a mobile app, service records, made-up
  // prices, testimonials) — never serve these until rewritten in AutoSEO.
  'carvinlookup-vs-vincheckup-a-comprehensive': '/compare',
  'carvinlookup-vs-vindecoded-which-vin-decoder': '/compare',
  'carvinlookup-vs-vinfreecheck-the-ultimate': '/compare',
  'carvinlookup-vs-vininspect-the-ultimate-comparison': '/compare',
  // Unsourced competitor price tables (CLAUDE.md: never invent a competitor's
  // price/feature) — hidden until the tables are removed in AutoSEO.
  'comparing-vehicle-history-services-a-comprehensive': '/compare',
  'vin-search-your-ultimate-guide-to-vehicle': '/vin-check',
  'vincheckup-alternatives-discover-the-best-vehicle': '/compare',
  'car-history-report-by-vin-ultimate-guide': '/vin-check',
  'vehicle-vin-check-everything-you-need-to-know': '/vin-check',
  'vinfreecheck-alternatives-discover-the-best': '/compare',
  // Same intent as an existing hand-written page (cannibalization).
  'how-to-interpret-vehicle-history-reports': '/how-to/read-vin-report',
  'vehicle-vin-decoder-unlocking-your-car-s-hidden': '/vin-decoder',
  'decoder-vin-number-your-ultimate-guide-to-vehicle': '/vin-decoder',
  'mazda-vin-decoder-unlocking-your-vehicle-s-secrets': '/vin-check/mazda',
  'vin-decoder-mazda-unlocking-your-vehicle-s-history': '/vin-check/mazda',
};

export function consolidatedDestination(slug: string): string | undefined {
  return Object.prototype.hasOwnProperty.call(CONSOLIDATED_POSTS, slug) ? CONSOLIDATED_POSTS[slug] : undefined;
}

/** Never listed, linked, or sitemapped: off-topic (404) or consolidated (308). */
function isHidden(slug: string): boolean {
  return isOffTopic(slug) || consolidatedDestination(slug) !== undefined;
}

// Present the article in our own editorial voice: drop AutoSEO's "Powered by
// AutoSEO — AI SEO content on autopilot" footer (a vendor link on every post),
// and credit the CarVinLookup Organization as author/publisher instead of a
// "Person" named after the domain.
const POWERED_BY = /<p[^>]*class="powered-by-autoseo"[^>]*>[\s\S]*?<\/p>/gi;
const ARTICLE_TYPES = new Set(['Article', 'BlogPosting', 'NewsArticle']);

function orgRef() {
  return { '@type': 'Organization', '@id': `${SITE_URL}/#organization`, name: SITE_NAME, url: SITE_URL };
}

function fixSchemaNode(node: unknown): unknown {
  if (Array.isArray(node)) return node.map(fixSchemaNode);
  if (!node || typeof node !== 'object') return node;
  const out: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(node as Record<string, unknown>)) out[k] = fixSchemaNode(v);
  const types = ([] as unknown[]).concat(out['@type']);
  if (types.some((t) => typeof t === 'string' && ARTICLE_TYPES.has(t))) {
    out.author = orgRef();
    out.publisher = { ...orgRef(), logo: { '@type': 'ImageObject', url: `${SITE_URL}/icon-512.png` } };
  }
  return out;
}

// Links inside the AutoSEO body HTML (its "Related articles" nav and in-text
// links) bypass the listing filters, so fix them here: drop list items that
// point at hidden posts, send links to retired posts straight to their
// canonical page, unlink self-references and links to off-topic (404) posts,
// and repoint the parked carvinlookup.com domain AutoSEO sometimes writes.
const OWN_POST = /^(?:https?:\/\/(?:www\.)?carvinlookup\.us)?\/blog\/([a-z0-9-]+)\/?$/i;
const postSlug = (href: string): string | undefined => OWN_POST.exec(href)?.[1];

function sanitizeLinks(html: string, selfSlug: string): string {
  return html
    .replace(/<li>\s*<a\b[^>]*href="([^"]+)"[^>]*>[\s\S]*?<\/a>\s*<\/li>/gi, (li, href: string) => {
      const slug = postSlug(href);
      return slug && isHidden(slug) ? '' : li;
    })
    .replace(/<a\b([^>]*?)href="([^"]+)"([^>]*)>([\s\S]*?)<\/a>/gi, (m, pre: string, href: string, post: string, text: string) => {
      if (/^https?:\/\/(?:www\.)?carvinlookup\.com\/?$/i.test(href)) return `<a${pre}href="${SITE_URL}/#vin-search"${post}>${text}</a>`;
      const slug = postSlug(href);
      if (!slug) return m;
      if (slug === selfSlug || isOffTopic(slug)) return text;
      const to = consolidatedDestination(slug);
      if (!to) return m;
      return to === `/blog/${selfSlug}` ? text : `<a${pre}href="${to}"${post}>${text}</a>`;
    });
}

// AutoSEO also emits its own Organization node named after the domain. The
// root layout already declares the #organization entity, so drop the duplicate.
function isDuplicateOrg(node: unknown): boolean {
  if (!node || typeof node !== 'object') return false;
  const n = node as Record<string, unknown>;
  const types = ([] as unknown[]).concat(n['@type']);
  return types.includes('Organization') && !n['@id'] && String(n.url ?? '').replace(/\/$/, '') === SITE_URL;
}

function sanitizeArticle(a: ArticleFull): ArticleFull {
  a.html = sanitizeLinks((a.html || '').replace(POWERED_BY, ''), a.slug);
  if (a.seo) {
    a.seo.jsonLdBlocks = (a.seo.jsonLdBlocks ?? []).map(fixSchemaNode).filter((n) => !isDuplicateOrg(n));
    if (a.seo.jsonLd) {
      a.seo.jsonLd = a.seo.jsonLd.replace(
        /"author"\s*:\s*\{[^{}]*"@type"\s*:\s*"Person"[^{}]*\}/g,
        `"author":${JSON.stringify(orgRef())}`,
      );
    }
  }
  return a;
}

async function apiKey(): Promise<string | undefined> {
  const env = await getEnv();
  return env.AUTOSEO_BLOG_API_KEY;
}

export async function isConfigured(): Promise<boolean> {
  return Boolean(await apiKey());
}

// Core server fetch. Plain fetch (NO `cache` / `next.revalidate` option — the
// Cloudflare Workers runtime throws "The 'cache' field ... is not implemented"
// for those, which is what broke every AutoSEO call). Pages are always-fresh,
// which makes instant-publish trivial. `notFoundOk` returns null on 404.
async function af<T>(path: string, opts: { notFoundOk?: boolean } = {}): Promise<T | null> {
  const key = await apiKey();
  if (!key) throw new AutoSeoError('AUTOSEO_BLOG_API_KEY not configured');
  const res = await fetch(`${BASE}${path}`, {
    headers: { Authorization: `Bearer ${key}`, Accept: 'application/json' },
  });
  if (res.status === 404 && opts.notFoundOk) return null;
  if (!res.ok) throw new AutoSeoError(`AutoSEO ${res.status} for ${path}`, res.status);
  return (await res.json()) as T;
}

/** Article list for the index. Never throws — returns an empty list on failure
 *  so /blog renders (empty/notice) instead of 500-ing on a bad API minute. */
export async function listArticles(opts: { page?: number; pageSize?: number; tag?: string; updatedSince?: string } = {}): Promise<ArticleList & { ok: boolean }> {
  const page = Math.max(1, opts.page ?? 1);
  const pageSize = Math.min(50, Math.max(1, opts.pageSize ?? 12));
  const q = new URLSearchParams({ page: String(page), pageSize: String(pageSize) });
  if (opts.tag) q.set('tag', opts.tag);
  if (opts.updatedSince) q.set('updatedSince', opts.updatedSince);
  try {
    const data = await af<ArticleList>(`/articles?${q.toString()}`);
    if (!data) throw new AutoSeoError('empty');
    return { ...data, articles: data.articles.filter((a) => !isHidden(a.slug)), ok: true };
  } catch (err) {
    console.error('[autoseo] listArticles failed:', (err as Error).message);
    return { articles: [], page, pageSize, total: 0, totalPages: 0, ok: false };
  }
}

/** Every published, visible article (no bodies), newest first, plus whether
 *  every API call succeeded. Never throws. */
export async function listAllArticlesWithStatus(maxPages = 10): Promise<{ articles: ArticleListItem[]; ok: boolean }> {
  const all: ArticleListItem[] = [];
  const seen = new Set<string>();
  let ok = true;
  for (let page = 1; page <= maxPages; page++) {
    const res = await listArticles({ page, pageSize: 50 });
    ok = ok && res.ok;
    for (const a of res.articles) if (!seen.has(a.slug)) { seen.add(a.slug); all.push(a); }
    if (!res.ok || page >= res.totalPages) break;
  }
  return { articles: all, ok };
}

/** Every published, visible article (no bodies) — for llms.txt. */
export async function listAllArticles(maxPages = 10): Promise<ArticleListItem[]> {
  return (await listAllArticlesWithStatus(maxPages)).articles;
}

/** One article WITH body. Returns null on 404 (→ notFound). Throws on transient
 *  errors so a real page isn't turned into a 404 by an API blip. baseUrl is
 *  ALWAYS sent so canonical / breadcrumb / Article.url are built from our domain. */
export async function getArticle(slug: string): Promise<ArticleFull | null> {
  if (isOffTopic(slug)) return null;
  const q = new URLSearchParams({ baseUrl: BLOG_INDEX_URL });
  const data = await af<{ article: ArticleFull }>(`/articles/${encodeURIComponent(slug)}?${q.toString()}`, { notFoundOk: true });
  const article = data?.article ?? null;
  if (!article) return null;
  if (article.related) article.related = article.related.filter((r) => !isHidden(r.slug));
  return sanitizeArticle(article);
}

export async function getTags(): Promise<{ tag: string; slug: string; count: number }[]> {
  try {
    const data = await af<{ tags: { tag: string; slug: string; count: number }[] }>(`/tags`);
    return data?.tags ?? [];
  } catch {
    return [];
  }
}

/** Slugs + updatedAt for the sitemap — off-topic posts dropped, and de-duplicated
 *  (the API has returned the same slug twice). Never throws (sitemap must still render). */
export async function getBlogSitemap(): Promise<{ slug: string; updatedAt: string }[]> {
  try {
    const data = await af<{ entries: { slug: string; updatedAt: string }[]; count: number }>(`/sitemap`);
    const seen = new Set<string>();
    return (data?.entries ?? []).filter((e) => {
      if (isHidden(e.slug) || seen.has(e.slug)) return false;
      seen.add(e.slug);
      return true;
    });
  } catch (err) {
    console.error('[autoseo] getBlogSitemap failed:', (err as Error).message);
    return [];
  }
}
