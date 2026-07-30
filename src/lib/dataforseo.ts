// DataForSEO Labs adapter — SEO keyword discovery for the automated content
// pipeline. Two endpoints (verified against docs.dataforseo.com):
//   • keyword_ideas       — seed keywords → related ideas by category/relevance
//   • keyword_suggestions — one seed → long-tail terms containing that phrase
// Both return search_volume, keyword_difficulty, and search intent per term.
//
// Auth: HTTP Basic (base64 of "login:password"). Server-side only — the key
// never touches the browser. Config-guarded like the VinCheck adapter: when
// DATAFORSEO_LOGIN/PASSWORD aren't set, isConfigured() is false and callers
// surface a "not configured" state instead of throwing into the request path.

import type { Env } from '@/db';

const DEFAULT_BASE = 'https://api.dataforseo.com';
export const US_LOCATION_CODE = 2840; // United States
export const EN_LANGUAGE = 'en';

export class DataForSeoError extends Error {
  status?: number;
  constructor(message: string, status?: number) {
    super(message);
    this.name = 'DataForSeoError';
    this.status = status;
  }
}

export interface DiscoveredKeyword {
  keyword: string;
  volume: number; //      avg monthly US search volume
  difficulty: number; //  0-100 (100 = hardest); -1 when unknown
  cpc: number; //         $ cost-per-click (0 when unknown)
  competition: number; // 0-1 paid competition
  intent: 'informational' | 'commercial' | 'transactional' | 'navigational';
}

export function isConfigured(env: Partial<Env>): boolean {
  return Boolean(env.DATAFORSEO_LOGIN && env.DATAFORSEO_PASSWORD);
}

function authHeader(env: Partial<Env>): string {
  const raw = `${env.DATAFORSEO_LOGIN}:${env.DATAFORSEO_PASSWORD}`;
  // btoa is available in the edge/Workers runtime and modern Node.
  return `Basic ${btoa(raw)}`;
}

type AnyObj = Record<string, unknown>;
const obj = (v: unknown): AnyObj => (v && typeof v === 'object' && !Array.isArray(v) ? (v as AnyObj) : {});
const arr = (v: unknown): unknown[] => (Array.isArray(v) ? v : []);
const num = (v: unknown, fallback = 0): number => {
  const n = typeof v === 'number' ? v : Number(v);
  return Number.isFinite(n) ? n : fallback;
};

const INTENTS = new Set(['informational', 'commercial', 'transactional', 'navigational']);
function normIntent(v: unknown): DiscoveredKeyword['intent'] {
  const s = String(v || '').toLowerCase();
  return (INTENTS.has(s) ? s : 'informational') as DiscoveredKeyword['intent'];
}

function mapItem(raw: unknown): DiscoveredKeyword | null {
  const it = obj(raw);
  const keyword = String(it.keyword || '').trim().toLowerCase();
  if (!keyword) return null;
  const info = obj(it.keyword_info);
  const props = obj(it.keyword_properties);
  const intentInfo = obj(it.search_intent_info);
  return {
    keyword,
    volume: num(info.search_volume),
    difficulty: props.keyword_difficulty == null ? -1 : num(props.keyword_difficulty, -1),
    cpc: num(info.cpc),
    competition: num(info.competition),
    intent: normIntent(intentInfo.main_intent),
  };
}

async function post(env: Partial<Env>, path: string, task: AnyObj, timeoutMs = 30000): Promise<DiscoveredKeyword[]> {
  if (!isConfigured(env)) throw new DataForSeoError('DATAFORSEO_LOGIN/PASSWORD not configured');
  const base = (env.DATAFORSEO_BASE || DEFAULT_BASE).replace(/\/$/, '');
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), timeoutMs);
  try {
    const res = await fetch(`${base}${path}`, {
      method: 'POST',
      headers: { Authorization: authHeader(env), 'Content-Type': 'application/json' },
      body: JSON.stringify([task]),
      signal: ctrl.signal,
    });
    let parsed: unknown = null;
    try { parsed = await res.json(); } catch { /* non-JSON */ }
    if (res.status === 401) throw new DataForSeoError('DataForSEO auth failed — check login/password', 401);
    if (!res.ok) throw new DataForSeoError(`DataForSEO HTTP ${res.status}`, res.status);

    const top = obj(parsed);
    // Top-level status_code 20000 = ok; 40xxx = auth/param errors, 402xx = billing.
    const statusCode = num(top.status_code, 0);
    if (statusCode && statusCode >= 40000) {
      throw new DataForSeoError(`DataForSEO ${statusCode}: ${String(top.status_message || 'error')}`, statusCode);
    }
    const task0 = obj(arr(top.tasks)[0]);
    const taskStatus = num(task0.status_code, 0);
    if (taskStatus && taskStatus >= 40000) {
      throw new DataForSeoError(`DataForSEO task ${taskStatus}: ${String(task0.status_message || 'error')}`, taskStatus);
    }
    const result0 = obj(arr(task0.result)[0]);
    const items = arr(result0.items);
    return items.map(mapItem).filter((x): x is DiscoveredKeyword => x !== null);
  } catch (err) {
    if (err instanceof Error && err.name === 'AbortError') throw new DataForSeoError('DataForSEO timed out');
    throw err;
  } finally {
    clearTimeout(t);
  }
}

export interface IdeaOptions {
  limit?: number; //       max results (<=1000)
  minVolume?: number; //   filter: search_volume >= this
  locationCode?: number;
}

/** Related keyword ideas for a group of seed terms (relevance-ranked). */
export async function keywordIdeas(env: Partial<Env>, seeds: string[], opts: IdeaOptions = {}): Promise<DiscoveredKeyword[]> {
  const keywords = seeds.map((s) => s.trim().toLowerCase()).filter(Boolean).slice(0, 200);
  if (!keywords.length) return [];
  const task: AnyObj = {
    keywords,
    location_code: opts.locationCode ?? US_LOCATION_CODE,
    language_code: EN_LANGUAGE,
    limit: Math.min(opts.limit ?? 100, 1000),
    order_by: ['keyword_info.search_volume,desc'],
  };
  if (opts.minVolume) task.filters = [['keyword_info.search_volume', '>=', opts.minVolume]];
  return post(env, '/v3/dataforseo_labs/google/keyword_ideas/live', task);
}

/** Long-tail suggestions that CONTAIN the seed phrase. */
export async function keywordSuggestions(env: Partial<Env>, seed: string, opts: IdeaOptions = {}): Promise<DiscoveredKeyword[]> {
  const keyword = seed.trim().toLowerCase();
  if (!keyword) return [];
  const task: AnyObj = {
    keyword,
    location_code: opts.locationCode ?? US_LOCATION_CODE,
    language_code: EN_LANGUAGE,
    limit: Math.min(opts.limit ?? 100, 1000),
    order_by: ['keyword_info.search_volume,desc'],
  };
  if (opts.minVolume) task.filters = [['keyword_info.search_volume', '>=', opts.minVolume]];
  return post(env, '/v3/dataforseo_labs/google/keyword_suggestions/live', task);
}

/** Lightweight connectivity/credential check (cheap single-result call). */
export async function ping(env: Partial<Env>): Promise<{ ok: boolean; error?: string }> {
  try {
    await keywordSuggestions(env, 'vin check', { limit: 1 });
    return { ok: true };
  } catch (err) {
    return { ok: false, error: (err as Error).message };
  }
}
