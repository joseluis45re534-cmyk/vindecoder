// Generates src/lib/brand-recalls.ts from NHTSA's public recalls API — the
// verified recall-campaign counts shown on /vin-check/[brand].
//
//   node scripts/fetch-brand-recalls.mjs
//
// For each brand's popular models (src/lib/brands.ts) and model years
// FIRST_YEAR..LAST_YEAR we query recallsByVehicle (EXACT model-name match) and
// de-duplicate campaigns by NHTSA campaign number.
//
// Completeness: NHTSA also files many models under other names ("EXPLORER
// HYBRID", "GV70 ELECTRIFIED", "CAMARO SS"…), so an exact-name count can miss
// campaigns. We find those names two ways — from the vehicle list of every
// campaign we found (/recalls/campaignNumber), and by probing common hybrid/EV
// naming — and if ANY of them has a campaign the exact name doesn't, the model
// is left out (never published as an undercount). NHTSA's model lists
// (products/vehicle/models) are truncated, so they are only an EXTRA source of
// candidate names (trim naming like "ES 350" or BMW "330I"), never proof that
// no variant exists. Any API failure aborts the run, so a partial data file is
// never written.

import fs from 'node:fs';
import path from 'node:path';

const API = 'https://api.nhtsa.gov';
const FIRST_YEAR = 2020;
const LAST_YEAR = 2024;
const YEARS = Array.from({ length: LAST_YEAR - FIRST_YEAR + 1 }, (_, i) => FIRST_YEAR + i);
const OUT = path.join(process.cwd(), 'src', 'lib', 'brand-recalls.ts');
const UA = { 'user-agent': 'Mozilla/5.0 (compatible; CarVinLookup data refresh)' };

// Parent companies whose recall filings count as the maker's own. Campaigns
// filed by anyone else (van converters, equipment makers) are reported apart.
const MAKER_TOKENS = {
  ford: ['FORD'], lincoln: ['FORD', 'LINCOLN'],
  chevrolet: ['GENERAL MOTORS'], gmc: ['GENERAL MOTORS'], cadillac: ['GENERAL MOTORS'], buick: ['GENERAL MOTORS'],
  toyota: ['TOYOTA'], lexus: ['TOYOTA', 'LEXUS'], honda: ['HONDA'], acura: ['HONDA', 'ACURA'],
  nissan: ['NISSAN'], infiniti: ['NISSAN', 'INFINITI'], bmw: ['BMW'], mini: ['BMW', 'MINI'],
  'mercedes-benz': ['MERCEDES', 'DAIMLER'], audi: ['VOLKSWAGEN', 'AUDI'], volkswagen: ['VOLKSWAGEN'], porsche: ['PORSCHE', 'VOLKSWAGEN'],
  jeep: ['CHRYSLER', 'FCA', 'STELLANTIS'], dodge: ['CHRYSLER', 'FCA', 'STELLANTIS'], ram: ['CHRYSLER', 'FCA', 'STELLANTIS'],
  chrysler: ['CHRYSLER', 'FCA', 'STELLANTIS'], fiat: ['CHRYSLER', 'FCA', 'STELLANTIS', 'FIAT'],
  hyundai: ['HYUNDAI'], genesis: ['HYUNDAI', 'GENESIS'], kia: ['KIA'], subaru: ['SUBARU', 'FUJI'], mazda: ['MAZDA'],
  tesla: ['TESLA'], volvo: ['VOLVO'], 'land-rover': ['JAGUAR', 'LAND ROVER'], jaguar: ['JAGUAR', 'LAND ROVER'],
  mitsubishi: ['MITSUBISHI'],
};
const PROBE = (m) => [`${m} HYBRID`, `${m} PHEV`, `${m} PLUG-IN HYBRID`, `${m} ELECTRIFIED`, `ELECTRIFIED ${m}`, `${m} EV`, `${m} HEV`];

const brandsSrc = fs.readFileSync(path.join(process.cwd(), 'src', 'lib', 'brands.ts'), 'utf8');
const BRANDS = [...brandsSrc.matchAll(/slug: '([^']+)', name: '([^']+)'[^\n]*?models: \[([^\]]*)\]/g)].map((m) => ({
  slug: m[1],
  name: m[2],
  models: [...m[3].matchAll(/'([^']+)'/g)].map((x) => x[1]),
}));

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const cache = new Map();
async function getJson(url, tries = 5) {
  if (cache.has(url)) return cache.get(url);
  for (let i = 0; i < tries; i++) {
    try {
      const res = await fetch(url, { headers: UA, signal: AbortSignal.timeout(45000) });
      if (res.ok) { const j = await res.json(); cache.set(url, j); await sleep(110); return j; }
      if (res.status === 400 || res.status === 404) { cache.set(url, null); return null; }
    } catch { /* retry */ }
    await sleep(2000 * (i + 1));
  }
  throw new Error(`NHTSA request failed after retries (aborting, no file written): ${url}`);
}

const key = (s) => String(s).toUpperCase().replace(/[^A-Z0-9]/g, '');
const byVehicle = (make, model, year) =>
  getJson(`${API}/recalls/recallsByVehicle?make=${encodeURIComponent(make)}&model=${encodeURIComponent(model)}&modelYear=${year}`)
    .then((j) => (j?.results || []).map((r) => ({ id: r.NHTSACampaignNumber, component: r.Component || '', date: r.ReportReceivedDate || '', maker: r.Manufacturer || '' })));

async function campaignsAllYears(make, model) {
  const all = new Map();
  for (const y of YEARS) for (const c of await byVehicle(make, model, y)) if (c.id && !all.has(c.id)) all.set(c.id, c);
  return all;
}

const parseDate = (d) => { const m = String(d).match(/^(\d{2})\/(\d{2})\/(\d{4})$/); return m ? `${m[3]}-${m[2]}-${m[1]}` : ''; };
/** Most frequent top-level component — only when it leads outright with ≥2 campaigns. */
function topComponent(list) {
  const counts = new Map();
  for (const c of list) {
    const top = c.component.split(':')[0].trim();
    if (top) counts.set(top, (counts.get(top) || 0) + 1);
  }
  const [first, second] = [...counts.entries()].sort((a, b) => b[1] - a[1]);
  if (!first || first[1] < 2 || (second && second[1] === first[1])) return '';
  return first[0].toLowerCase().replace(/\b\w/g, (ch) => ch.toUpperCase());
}

const data = {};
const skipped = [];
for (const b of BRANDS) {
  const siblings = new Set(b.models.map(key));
  const makerTokens = MAKER_TOKENS[b.slug] || [b.name.toUpperCase()];
  const rows = [];
  for (const model of b.models) {
    const exact = await campaignsAllYears(b.name, model);
    if (exact.size === 0) { skipped.push(`${b.name} ${model}: no campaigns under this exact name`); continue; }

    // Variant names NHTSA uses for this model, from the campaigns' own vehicle lists…
    const variants = new Set();
    for (const id of exact.keys()) {
      const rec = await getJson(`${API}/recalls/campaignNumber?campaignNumber=${id}`);
      for (const r of rec?.results || []) {
        const mk = key(r.Model);
        if (key(r.Make) !== key(b.name) || mk === key(model) || siblings.has(mk)) continue;
        if (mk.includes(key(model))) variants.add(String(r.Model).trim());
      }
    }
    // …plus common hybrid / EV naming that may never share a campaign with the base name…
    for (const v of PROBE(model)) if (!siblings.has(key(v))) variants.add(v);
    // …plus trim-style names from NHTSA's (truncated) model lists: "ES 350" for "ES",
    // and BMW-style "330I"/"M340I" for "3 Series".
    const seriesDigit = /^(\d) SERIES$/i.exec(model)?.[1];
    for (const y of YEARS) {
      const list = await getJson(`${API}/products/vehicle/models?modelYear=${y}&make=${encodeURIComponent(b.name)}&issueType=r`);
      for (const r of list?.results || []) {
        const mk = key(r.model);
        if (mk === key(model) || siblings.has(mk)) continue;
        if (mk.startsWith(key(model)) || (seriesDigit && new RegExp(`^M?${seriesDigit}\\d\\d`).test(mk))) variants.add(String(r.model).trim());
      }
    }

    let extraBy = '';
    for (const v of variants) {
      const vc = await campaignsAllYears(b.name, v);
      const extra = [...vc.keys()].filter((id) => !exact.has(id));
      if (extra.length) { extraBy = `${v} (${extra.length} extra)`; break; }
    }
    if (extraBy) { skipped.push(`${b.name} ${model}: variant name ${extraBy}`); continue; }

    const list = [...exact.values()];
    const latest = list.map((c) => parseDate(c.date)).filter(Boolean).sort().pop() || '';
    const byOthers = list.filter((c) => !makerTokens.some((t) => c.maker.toUpperCase().includes(t))).length;
    rows.push({ model, campaigns: list.length, byOthers, topComponent: topComponent(list), latest });
  }
  data[b.slug] = rows;
  console.error(`${b.slug.padEnd(14)} ${rows.map((r) => `${r.model}=${r.campaigns}${r.byOthers ? `(+${r.byOthers} other)` : ''}`).join(', ') || '(none)'}`);
}

const today = new Date().toISOString().slice(0, 10);
const ts = `// GENERATED by scripts/fetch-brand-recalls.mjs from the NHTSA recalls API on ${today} — do not edit by hand.
// Source: https://api.nhtsa.gov/recalls — unique recall CAMPAIGNS (by NHTSA campaign number) covering model
// years ${FIRST_YEAR}–${LAST_YEAR}, filed under each model's exact name. Models NHTSA also files under variant
// names with additional campaigns are left out (never undercounted). Counts are campaigns, not affected vehicles.

export const BRAND_RECALLS_RETRIEVED = '${today}';
export const BRAND_RECALLS_YEARS = { first: ${FIRST_YEAR}, last: ${LAST_YEAR} } as const;

export interface ModelRecalls {
  model: string;
  /** Unique NHTSA recall campaigns covering the model years above. */
  campaigns: number;
  /** Of those, campaigns filed by companies other than the maker (e.g. van converters). */
  byOthers: number;
  /** Top-level component that leads outright with 2+ campaigns, else ''. */
  topComponent: string;
  /** Most recent report-received date (YYYY-MM-DD). */
  latest: string;
}

export const BRAND_RECALLS: Record<string, ModelRecalls[]> = ${JSON.stringify(data, null, 2)};
`;
fs.writeFileSync(OUT, ts);
console.error(`\nskipped ${skipped.length} model(s):\n  ${skipped.join('\n  ')}`);
console.error(`wrote ${OUT}`);
