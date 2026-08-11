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

async function apiKey(): Promise<string | undefined> {
  const env = await getEnv();
  return env.AUTOSEO_BLOG_API_KEY;
}

export async function isConfigured(): Promise<boolean> {
  return Boolean(await apiKey());
}

// Core server fetch. 10-minute revalidate cache. `notFoundOk` returns null on 404
// (unknown/unpublished slug) instead of throwing.
async function af<T>(path: string, opts: { revalidate?: number; notFoundOk?: boolean } = {}): Promise<T | null> {
  const key = await apiKey();
  if (!key) throw new AutoSeoError('AUTOSEO_BLOG_API_KEY not configured');
  const res = await fetch(`${BASE}${path}`, {
    headers: { Authorization: `Bearer ${key}`, Accept: 'application/json' },
    // Server-side ISR cache (~10 min). The webhook route revalidates on publish.
    next: { revalidate: opts.revalidate ?? 600 },
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
    return { ...data, ok: true };
  } catch (err) {
    console.error('[autoseo] listArticles failed:', (err as Error).message);
    return { articles: [], page, pageSize, total: 0, totalPages: 0, ok: false };
  }
}

/** One article WITH body. Returns null on 404 (→ notFound). Throws on transient
 *  errors so a real page isn't turned into a 404 by an API blip. baseUrl is
 *  ALWAYS sent so canonical / breadcrumb / Article.url are built from our domain. */
export async function getArticle(slug: string): Promise<ArticleFull | null> {
  const q = new URLSearchParams({ baseUrl: BLOG_INDEX_URL });
  const data = await af<{ article: ArticleFull }>(`/articles/${encodeURIComponent(slug)}?${q.toString()}`, { notFoundOk: true });
  return data?.article ?? null;
}

export async function getTags(): Promise<{ tag: string; slug: string; count: number }[]> {
  try {
    const data = await af<{ tags: { tag: string; slug: string; count: number }[] }>(`/tags`, { revalidate: 3600 });
    return data?.tags ?? [];
  } catch {
    return [];
  }
}

/** Slugs + updatedAt for the sitemap. Never throws (sitemap must still render). */
export async function getBlogSitemap(): Promise<{ slug: string; updatedAt: string }[]> {
  try {
    const data = await af<{ entries: { slug: string; updatedAt: string }[]; count: number }>(`/sitemap`, { revalidate: 3600 });
    return data?.entries ?? [];
  } catch (err) {
    console.error('[autoseo] getBlogSitemap failed:', (err as Error).message);
    return [];
  }
}
