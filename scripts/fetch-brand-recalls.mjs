// Generates src/lib/brand-recalls.ts from NHTSA's public recalls API — the
// verified recall-campaign counts shown on /vin-check/[brand].
//
//   node scripts/fetch-brand-recalls.mjs
//
// For each brand's popular models (src/lib/brands.ts) and model years
// FIRST_YEAR..LAST_YEAR, we query recallsByVehicle (EXACT model-name match) and
// de-duplicate campaigns by NHTSA campaign number (one campaign often spans
// several model years).
//
// Completeness rule: NHTSA files some models under several names (e.g. "CAMARO"
// and "CAMARO SS", "ES" trims as "ES 350", BMW "3 SERIES" and "330E"). An
// exact-name count would then UNDERCOUNT, so a model is published only if its
// exact name appears in NHTSA's model list and no other NHTSA name for that
// make looks like a variant of it. Otherwise it is left out — never estimated.

import fs from 'node:fs';
import path from 'node:path';

const API = 'https://api.nhtsa.gov';
const FIRST_YEAR = 2020;
const LAST_YEAR = 2024;
const OUT = path.join(process.cwd(), 'src', 'lib', 'brand-recalls.ts');
const UA = { 'user-agent': 'Mozilla/5.0 (compatible; CarVinLookup data refresh)' };

const brandsSrc = fs.readFileSync(path.join(process.cwd(), 'src', 'lib', 'brands.ts'), 'utf8');
const BRANDS = [...brandsSrc.matchAll(/slug: '([^']+)', name: '([^']+)'[^\n]*?models: \[([^\]]*)\]/g)].map((m) => ({
  slug: m[1],
  name: m[2],
  models: [...m[3].matchAll(/'([^']+)'/g)].map((x) => x[1]),
}));

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
async function getJson(url, tries = 4) {
  for (let i = 0; i < tries; i++) {
    try {
      const res = await fetch(url, { headers: UA, signal: AbortSignal.timeout(45000) });
      if (res.ok) return await res.json();
      if (res.status === 400 || res.status === 404) return null;
    } catch { /* retry */ }
    await sleep(1500 * (i + 1));
  }
  throw new Error(`NHTSA request failed: ${url}`);
}

const key = (s) => String(s).toUpperCase().replace(/[^A-Z0-9]/g, '');
const modelListCache = new Map();
async function nhtsaModels(make, year) {
  const k = `${make}|${year}`;
  if (!modelListCache.has(k)) {
    const j = await getJson(`${API}/products/vehicle/models?modelYear=${year}&make=${encodeURIComponent(make)}&issueType=r`);
    modelListCache.set(k, [...new Set((j?.results || []).map((r) => r.model))]);
  }
  return modelListCache.get(k);
}

async function campaignsFor(make, model, year) {
  const j = await getJson(`${API}/recalls/recallsByVehicle?make=${encodeURIComponent(make)}&model=${encodeURIComponent(model)}&modelYear=${year}`);
  return (j?.results || []).map((r) => ({ id: r.NHTSACampaignNumber, component: r.Component || '', date: r.ReportReceivedDate || '' }));
}

/** NHTSA names (any year in range) that look like variants of `model`. */
async function variantNames(make, model, siblings) {
  const k = key(model);
  const seriesDigit = /^(\d) SERIES$/i.exec(model)?.[1]; // BMW "3 Series" -> 330I, 330E, M340I…
  const out = new Set();
  let exactSeen = false;
  for (let y = FIRST_YEAR; y <= LAST_YEAR; y++) {
    for (const n of await nhtsaModels(make, y)) {
      const nk = key(n);
      if (nk === k) { exactSeen = true; continue; }
      if (siblings.has(nk)) continue; // another listed model (e.g. "Range Rover Sport"), counted on its own row
      if (nk.startsWith(k)) out.add(n);
      if (seriesDigit && new RegExp(`^M?${seriesDigit}\\d\\d`).test(nk)) out.add(n);
    }
  }
  return { exactSeen, variants: [...out] };
}

const parseDate = (d) => { const m = String(d).match(/^(\d{2})\/(\d{2})\/(\d{4})$/); return m ? `${m[3]}-${m[2]}-${m[1]}` : ''; };
const topComponent = (list) => {
  const counts = new Map();
  for (const c of list) {
    const top = c.component.split(':')[0].trim();
    if (top) counts.set(top, (counts.get(top) || 0) + 1);
  }
  const best = [...counts.entries()].sort((a, b) => b[1] - a[1])[0];
  return best ? best[0].toLowerCase().replace(/\b\w/g, (ch) => ch.toUpperCase()) : '';
};

const data = {};
for (const b of BRANDS) {
  const rows = [];
  const siblings = new Set(b.models.map(key));
  for (const model of b.models) {
    const { exactSeen, variants } = await variantNames(b.name, model, siblings);
    if (!exactSeen || variants.length) {
      console.error(`  skip ${b.name} ${model}: ${!exactSeen ? 'name not used by NHTSA' : `split across ${variants.slice(0, 4).join(', ')}`}`);
      continue;
    }
    const all = new Map();
    for (let y = FIRST_YEAR; y <= LAST_YEAR; y++) {
      for (const c of await campaignsFor(b.name, model, y)) if (c.id && !all.has(c.id)) all.set(c.id, c);
      await sleep(120);
    }
    if (all.size === 0) continue; // unmatched model name or no recalls: leave it out
    const list = [...all.values()];
    const latest = list.map((c) => parseDate(c.date)).filter(Boolean).sort().pop() || '';
    rows.push({ model, campaigns: list.length, topComponent: topComponent(list), latest });
  }
  data[b.slug] = rows;
  console.error(`${b.slug.padEnd(14)} ${rows.map((r) => `${r.model}=${r.campaigns}`).join(', ') || '(none matched)'}`);
}

const today = new Date().toISOString().slice(0, 10);
const ts = `// GENERATED by scripts/fetch-brand-recalls.mjs from the NHTSA recalls API on ${today} — do not edit by hand.
// Source: https://api.nhtsa.gov/recalls/recallsByVehicle — unique recall CAMPAIGNS (by NHTSA campaign
// number) for model years ${FIRST_YEAR}–${LAST_YEAR}. Counts are campaigns, not affected vehicles. Re-run to refresh.

export const BRAND_RECALLS_RETRIEVED = '${today}';
export const BRAND_RECALLS_YEARS = { first: ${FIRST_YEAR}, last: ${LAST_YEAR} } as const;

export interface ModelRecalls {
  model: string;
  /** Unique NHTSA recall campaigns across the model years above. */
  campaigns: number;
  /** Most frequent top-level component across those campaigns. */
  topComponent: string;
  /** Most recent report-received date (YYYY-MM-DD). */
  latest: string;
}

export const BRAND_RECALLS: Record<string, ModelRecalls[]> = ${JSON.stringify(data, null, 2)};
`;
fs.writeFileSync(OUT, ts);
console.error(`wrote ${OUT}`);
