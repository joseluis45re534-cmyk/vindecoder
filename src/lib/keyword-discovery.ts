// Automated keyword discovery: mine new search terms in our SEO categories via
// DataForSEO, filter by opportunity (volume vs difficulty vs intent), dedupe
// against what we already target, and drop them into the `keywords` table as
// `candidate` rows for admin review. Approved candidates → `queued` → the
// existing blog-runner drafts posts for them. This is how we rank with content
// instead of buying backlinks.

import { getDb, type Env } from '@/db';
import { keywords, posts } from '@/db/schema';
import { keywordIdeas, keywordSuggestions, isConfigured, type DiscoveredKeyword } from '@/lib/dataforseo';
import { BRANDS } from '@/lib/brands';
import { CHECK_PAGES } from '@/lib/checks';
import { HOW_TO_GUIDES } from '@/lib/how-to';
import { COMPETITORS } from '@/lib/comparisons';
import { PROBLEM_PAGES } from '@/lib/problem-pages';

export type Cluster = 'brands' | 'checks' | 'how-to' | 'problems';
export const ALL_CLUSTERS: Cluster[] = ['brands', 'checks', 'how-to', 'problems'];

const lc = (s: string) => s.trim().toLowerCase();
const uniq = (a: string[]) => [...new Set(a.map(lc).filter(Boolean))];

// Curated seed phrases per cluster, derived from our source-of-truth data. Kept
// focused (one DataForSEO "ideas" call per cluster returns terms related to the
// whole group) plus one long-tail "suggestions" call on the strongest seed.
export function seedsForCluster(cluster: Cluster): { seeds: string[]; longTailSeed: string } {
  switch (cluster) {
    case 'brands': {
      const brandSeeds = BRANDS.slice(0, 10).map((b) => `${lc(b.name)} vin check`);
      return {
        seeds: uniq(['vin check', 'vin number lookup', 'vehicle history report', 'car history report', ...brandSeeds]),
        longTailSeed: 'vin check',
      };
    }
    case 'checks': {
      const checkSeeds = CHECK_PAGES.map((c) => lc(c.name));
      return { seeds: uniq(checkSeeds), longTailSeed: 'salvage title check' };
    }
    case 'how-to': {
      const guideSeeds = HOW_TO_GUIDES.map((g) => lc(g.keyword)).filter(Boolean);
      return { seeds: uniq(['how to check a vin', 'how to read a vin', ...guideSeeds]).slice(0, 20), longTailSeed: 'how to check a vin' };
    }
    case 'problems': {
      const problemSeeds = PROBLEM_PAGES.map((p) => lc(p.name));
      const competitorSeeds = COMPETITORS.slice(0, 4).map((c) => `${lc(c.name)} alternative`);
      return {
        seeds: uniq([...problemSeeds, 'most stolen cars', 'worst cars to buy', 'most reliable used cars', ...competitorSeeds]),
        longTailSeed: 'most stolen cars',
      };
    }
  }
}

export interface DiscoverOptions {
  clusters?: Cluster[];
  minVolume?: number; //     default 50
  maxDifficulty?: number; // default 45 (0-100; unknown difficulty passes)
  perCallLimit?: number; //  default 120 results per DataForSEO call
  maxInsert?: number; //     safety cap on rows inserted per run (default 250)
  includeLongTail?: boolean; // also run a suggestions call per cluster (default true)
}

export interface DiscoverySummary {
  configured: boolean;
  clusters: Cluster[];
  apiCalls: number;
  fetched: number; //   raw terms returned
  candidates: number; // passed filters + deduped
  inserted: number; //  written to keywords as `candidate`
  skippedExisting: number;
  topInserted: { term: string; volume: number; difficulty: number; intent: string; score: number; cluster: string }[];
  errors: string[];
}

/** Opportunity score: reward volume, penalize difficulty. Unknown difficulty
 *  (-1) treated as 50 (neutral). Stored in keywords.priority so the runner can
 *  draft the highest-value terms first. */
function scoreOf(k: DiscoveredKeyword): number {
  const diff = k.difficulty < 0 ? 50 : Math.min(100, Math.max(0, k.difficulty));
  return Math.round(k.volume * ((100 - diff) / 100));
}

function slugify(s: string): string {
  return lc(s).replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
}

export async function discoverKeywords(env: Partial<Env>, opts: DiscoverOptions = {}): Promise<DiscoverySummary> {
  const clusters = (opts.clusters?.length ? opts.clusters : ALL_CLUSTERS).filter((c) => ALL_CLUSTERS.includes(c));
  const minVolume = opts.minVolume ?? 50;
  const maxDifficulty = opts.maxDifficulty ?? 45;
  const perCallLimit = opts.perCallLimit ?? 120;
  const maxInsert = opts.maxInsert ?? 250;
  const includeLongTail = opts.includeLongTail ?? true;

  const summary: DiscoverySummary = {
    configured: isConfigured(env),
    clusters, apiCalls: 0, fetched: 0, candidates: 0, inserted: 0, skippedExisting: 0, topInserted: [], errors: [],
  };
  if (!summary.configured) {
    summary.errors.push('DataForSEO not configured (set DATAFORSEO_LOGIN / DATAFORSEO_PASSWORD).');
    return summary;
  }
  if (!env.DB) {
    summary.errors.push('No database bound — cannot store discovered keywords.');
    return summary;
  }
  const db = getDb(env as { DB: D1Database });

  // What we already target — dedupe against keyword terms AND published/queued post slugs.
  const [existingKw, existingPosts] = await Promise.all([
    db.select({ term: keywords.term }).from(keywords),
    db.select({ slug: posts.slug, keyword: posts.keyword }).from(posts),
  ]);
  const taken = new Set<string>();
  for (const k of existingKw) taken.add(lc(k.term));
  const takenSlugs = new Set<string>();
  for (const p of existingPosts) {
    if (p.slug) takenSlugs.add(p.slug);
    if (p.keyword) taken.add(lc(p.keyword));
  }

  // Collect raw terms per cluster.
  const collected: { k: DiscoveredKeyword; cluster: Cluster; source: string }[] = [];
  for (const cluster of clusters) {
    const { seeds, longTailSeed } = seedsForCluster(cluster);
    try {
      const ideas = await keywordIdeas(env, seeds, { limit: perCallLimit, minVolume });
      summary.apiCalls++;
      for (const k of ideas) collected.push({ k, cluster, source: 'dataforseo:ideas' });
    } catch (err) {
      summary.errors.push(`${cluster} ideas: ${(err as Error).message}`);
    }
    if (includeLongTail) {
      try {
        const sugg = await keywordSuggestions(env, longTailSeed, { limit: perCallLimit, minVolume });
        summary.apiCalls++;
        for (const k of sugg) collected.push({ k, cluster, source: 'dataforseo:suggestions' });
      } catch (err) {
        summary.errors.push(`${cluster} suggestions: ${(err as Error).message}`);
      }
    }
  }
  summary.fetched = collected.length;

  // Filter → dedupe → score. Keep the best cluster/source per term.
  const byTerm = new Map<string, { k: DiscoveredKeyword; cluster: Cluster; source: string; score: number }>();
  for (const { k, cluster, source } of collected) {
    const term = lc(k.keyword);
    if (term.length < 6 || term.length > 120) continue; //          too short/long
    if (k.intent === 'navigational') continue; //                    skip brand-nav ("carfax login")
    if (k.difficulty >= 0 && k.difficulty > maxDifficulty) continue; // too hard
    if (k.volume < minVolume) continue;
    if (taken.has(term) || takenSlugs.has(slugify(term))) { summary.skippedExisting++; continue; }
    const score = scoreOf(k);
    const prev = byTerm.get(term);
    if (!prev || score > prev.score) byTerm.set(term, { k, cluster, source, score });
  }
  const ranked = [...byTerm.values()].sort((a, b) => b.score - a.score).slice(0, maxInsert);
  summary.candidates = ranked.length;

  // Insert as review candidates (term is UNIQUE → onConflictDoNothing is a safety net).
  for (const { k, cluster, source, score } of ranked) {
    try {
      await db.insert(keywords).values({
        id: crypto.randomUUID(),
        term: k.keyword,
        intent: k.intent,
        priority: score,
        status: 'candidate',
        search_volume: k.volume,
        difficulty: k.difficulty < 0 ? null : k.difficulty,
        cpc: k.cpc || null,
        source,
        cluster,
      }).onConflictDoNothing();
      summary.inserted++;
      if (summary.topInserted.length < 15) {
        summary.topInserted.push({ term: k.keyword, volume: k.volume, difficulty: k.difficulty, intent: k.intent, score, cluster });
      }
    } catch (err) {
      summary.errors.push(`insert "${k.keyword}": ${(err as Error).message}`);
    }
  }

  return summary;
}
