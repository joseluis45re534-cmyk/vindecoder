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
import { SITE_URL } from '@/lib/site';

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
    return { ...data, articles: data.articles.filter((a) => !isOffTopic(a.slug)), ok: true };
  } catch (err) {
    console.error('[autoseo] listArticles failed:', (err as Error).message);
    return { articles: [], page, pageSize, total: 0, totalPages: 0, ok: false };
  }
}

/** Every published article (no bodies), newest first — for llms.txt. Pages
 *  through the list API; never throws (returns what it has so far). */
export async function listAllArticles(maxPages = 10): Promise<ArticleListItem[]> {
  const all: ArticleListItem[] = [];
  for (let page = 1; page <= maxPages; page++) {
    const res = await listArticles({ page, pageSize: 50 });
    all.push(...res.articles);
    if (!res.ok || page >= res.totalPages) break;
  }
  return all;
}

/** One article WITH body. Returns null on 404 (→ notFound). Throws on transient
 *  errors so a real page isn't turned into a 404 by an API blip. baseUrl is
 *  ALWAYS sent so canonical / breadcrumb / Article.url are built from our domain. */
export async function getArticle(slug: string): Promise<ArticleFull | null> {
  if (isOffTopic(slug)) return null;
  const q = new URLSearchParams({ baseUrl: BLOG_INDEX_URL });
  const data = await af<{ article: ArticleFull }>(`/articles/${encodeURIComponent(slug)}?${q.toString()}`, { notFoundOk: true });
  const article = data?.article ?? null;
  if (article?.related) article.related = article.related.filter((r) => !isOffTopic(r.slug));
  return article;
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
      if (isOffTopic(e.slug) || seen.has(e.slug)) return false;
      seen.add(e.slug);
      return true;
    });
  } catch (err) {
    console.error('[autoseo] getBlogSitemap failed:', (err as Error).message);
    return [];
  }
}
