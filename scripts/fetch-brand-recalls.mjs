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
// HYBRID", "F-150 LIGHTNING", "KONA ELECTRIC", "WRANGLER 4XE"…), so an
// exact-name count can miss campaigns. We look for those names three ways —
// the vehicle list of every campaign we found (/recalls/campaignNumber),
// hybrid/EV/brand-specific probes, and NHTSA's full product catalogue for each
// model year (products/vehicle/models with max=500; its names are converted to
// recall naming) — and if ANY of them has a campaign the exact name doesn't,
// the model is left out rather than published as an undercount. This is a
// search, not proof that no other name exists, so the page says counts cover
// the exact model name. Any API failure aborts the run, so a partial data file
// is never written.

import fs from 'node:fs';
import path from 'node:path';

const API = 'https://api.nhtsa.gov';
const FIRST_YEAR = 2020;
const LAST_YEAR = 2024;
const YEARS = Array.from({ length: LAST_YEAR - FIRST_YEAR + 1 }, (_, i) => FIRST_YEAR + i);
const OUT = path.join(process.cwd(), 'src', 'lib', 'brand-recalls.ts');
// Generic client name — no site or personal details in requests to outside services.
const UA = { 'user-agent': 'Mozilla/5.0 (compatible; recall-data-refresh/1.0)' };

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
// Hybrid / EV names to probe for every model, plus brand-specific naming. Each
// is tried on the model name and on its base name without a trailing size
// number ("SILVERADO 1500" -> "SILVERADO EV").
const SUFFIXES = ['HYBRID', 'HEV', 'PHEV', 'PLUG-IN HYBRID', 'EV', 'ELECTRIC']; // Hyundai/Kia file hybrids as "<MODEL> HEV"
const BRAND_SUFFIXES = {
  ford: ['LIGHTNING', 'ENERGI'], lincoln: ['GRAND TOURING'], toyota: ['PRIME'], jeep: ['4XE'], chrysler: ['4XE'],
  volvo: ['RECHARGE'], porsche: ['E-HYBRID'], genesis: ['ELECTRIFIED'],
};
const BRAND_PREFIXES = { ford: ['E-'], genesis: ['ELECTRIFIED '] }; // "E-TRANSIT", "ELECTRIFIED G80"
const baseName = (m) => m.toUpperCase().replace(/\s+\d{3,4}$/, '').trim();
// Audi's performance versions don't contain the model name: A3 -> S3 / RS 3, Q5 -> SQ5.
const audiPerf = (slug, model) =>
  slug === 'audi' && /^[AQ]\d$/i.test(model) ? new RegExp(`^R?S${model.toUpperCase().replace(/^A/, '')}(?!\\d)`) : null;
function probeNames(slug, model) {
  const out = new Set();
  for (const b of new Set([model.toUpperCase(), baseName(model)])) {
    for (const s of [...SUFFIXES, ...(BRAND_SUFFIXES[slug] || [])]) out.add(`${b} ${s}`);
    for (const p of BRAND_PREFIXES[slug] || []) out.add(`${p}${b}`);
  }
  if (audiPerf(slug, model)) {
    const n = model.toUpperCase().replace(/^A/, ''); // "3" for A3, "Q5" for Q5
    for (const v of [`S${n}`, `RS ${n}`, `RS${n}`]) out.add(v);
  }
  return out;
}
// Separately sold vehicles whose NHTSA name starts with (or contains) a listed
// model's name — not versions of it. Per model: M340I is a 3 Series version but
// not an M3.
const NOT_VARIANT_OF = {
  'ford:Mustang': ['MUSTANG MACH'], 'bmw:M3': ['M340I'], 'nissan:Rogue': ['ROGUE SPORT'], 'buick:Encore': ['ENCORE GX'],
  'land-rover:Range Rover': ['RANGE ROVER VELAR', 'RANGE ROVER EVOQUE'], 'land-rover:Discovery': ['DISCOVERY SPORT'],
  'ram:ProMaster': ['PROMASTER CITY'], 'toyota:Corolla': ['COROLLA CROSS'], 'volkswagen:Atlas': ['ATLAS CROSS SPORT'],
  'toyota:Highlander': ['GRAND HIGHLANDER'], 'jeep:Cherokee': ['GRAND CHEROKEE'],
};
// …and a name that starts with a LONGER listed sibling's name belongs to that
// sibling: "RANGE ROVER SPORT PHEV" is a Range Rover Sport, not a Range Rover.
function otherVehicle(slug, model, mk, siblings) {
  const mKey = key(model);
  return (
    (NOT_VARIANT_OF[`${slug}:${model}`] || []).some((n) => mk.startsWith(key(n))) ||
    [...siblings].some((s) => s.length > mKey.length && s.includes(mKey) && mk.startsWith(s))
  );
}
// NHTSA's product catalogue (products/vehicle/models — returns only its first
// page unless max= is set) names vehicles differently from the recalls data:
// "F-150 (SUPER CREW) LIGHTNING BEV" is "F-150 LIGHTNING" there, "KONA EV" is
// "KONA ELECTRIC". Each catalogue name yields several recall-name candidates.
function recallNamesFor(productName) {
  const u = String(productName).toUpperCase().replace(/\([^)]*\)/g, ' ').replace(/\s+/g, ' ').trim();
  const tag = u.match(/\s(GAS|DIESEL|FFV|CNG|BEV|EV|PHEV|HEV)$/)?.[1];
  const base = tag ? u.slice(0, -(tag.length + 1)).trim() : u;
  const out = new Set([u, base]);
  if (tag === 'BEV' || tag === 'EV') for (const s of ['ELECTRIC', 'EV']) out.add(`${base} ${s}`);
  if (tag === 'PHEV') for (const s of ['PHEV', 'PLUG-IN HYBRID', '4XE']) out.add(`${base} ${s}`);
  if (tag === 'HEV') for (const s of ['HYBRID', 'HEV']) out.add(`${base} ${s}`);
  return out;
}

const brandsSrc = fs.readFileSync(path.join(process.cwd(), 'src', 'lib', 'brands.ts'), 'utf8');
// ONLY=ford,hyundai node scripts/fetch-brand-recalls.mjs -> dry run for those brands (prints, writes nothing).
const ONLY = process.env.ONLY ? new Set(process.env.ONLY.split(',')) : null;
const BRANDS = [...brandsSrc.matchAll(/slug: '([^']+)', name: '([^']+)'[^\n]*?models: \[([^\]]*)\]/g)].map((m) => ({
  slug: m[1],
  name: m[2],
  models: [...m[3].matchAll(/'([^']+)'/g)].map((x) => x[1]),
})).filter((b) => !ONLY || ONLY.has(b.slug));

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const cache = new Map();
async function getJson(url, tries = 6) {
  if (cache.has(url)) return cache.get(url);
  for (let i = 0; i < tries; i++) {
    try {
      const res = await fetch(url, { headers: UA, signal: AbortSignal.timeout(45000) });
      if (res.ok) { const j = await res.json(); cache.set(url, j); await sleep(150); return j; }
      if (res.status === 400 || res.status === 404) { cache.set(url, null); return null; }
      // 403/429 = being throttled: back off hard instead of retrying quickly.
      if (res.status === 403 || res.status === 429) { await sleep(15000 * (i + 1)); continue; }
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
  // Sequential on purpose: parallel bursts get the client blocked (HTTP 403).
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
    const perf = audiPerf(b.slug, model);
    for (const id of exact.keys()) {
      const rec = await getJson(`${API}/recalls/campaignNumber?campaignNumber=${id}`);
      // A campaign number NHTSA just returned must resolve; a failure here would hide variants.
      if (!rec) throw new Error(`Campaign ${id} lookup failed (aborting, no file written)`);
      for (const r of rec.results || []) {
        const mk = key(r.Model);
        if (key(r.Make) !== key(b.name) || mk === key(model) || siblings.has(mk) || otherVehicle(b.slug, model, mk, siblings)) continue;
        if (mk.includes(key(model)) || (perf && perf.test(mk))) variants.add(String(r.Model).trim());
      }
    }
    // …plus hybrid / EV naming that may never share a campaign with the base name…
    for (const v of probeNames(b.slug, model)) if (key(v) !== key(model) && !siblings.has(key(v))) variants.add(v);
    // …plus names from NHTSA's full product catalogue for each year, converted to
    // recall naming: trims ("ES 350" for "ES"), EVs ("F-150 LIGHTNING"), BMW-style
    // "330I"/"M340I" for "3 Series", and number-prefixed names ("718 BOXSTER").
    // A base-name match followed by another size number ("SILVERADO 2500" for
    // "Silverado 1500") is a different model, not a variant.
    const seriesDigit = /^(\d) SERIES$/i.exec(model)?.[1];
    const mKey = key(model);
    const bKey = key(baseName(model));
    let catalogueRows = 0;
    for (const y of YEARS) {
      const list = await getJson(`${API}/products/vehicle/models?modelYear=${y}&make=${encodeURIComponent(b.name)}&issueType=r&max=500`);
      const products = list?.results || [];
      if (products.length >= 500) throw new Error(`Product catalogue may be truncated: ${b.name} ${y} returned ${products.length} rows — raise max (no file written)`);
      catalogueRows += products.length;
      for (const r of products) {
        for (const name of recallNamesFor(r.model)) {
          const mk = key(name);
          if (mk === mKey || siblings.has(mk) || otherVehicle(b.slug, model, mk, siblings)) continue;
          const isVariant =
            mk.startsWith(mKey) ||
            (bKey !== mKey && mk.startsWith(bKey) && !/^\d/.test(mk.slice(bKey.length))) ||
            mk.replace(/^\d+/, '').startsWith(mKey) ||
            (seriesDigit && new RegExp(`^M?${seriesDigit}\\d\\d`).test(mk)) ||
            (perf && perf.test(mk)) ||
            (b.slug === 'mini' && mk.includes(mKey)); // "COOPER S COUNTRYMAN ALL4" for "Countryman"
          if (isVariant) variants.add(name);
        }
      }
    }
    // Every brand here has 2020–2024 products; an empty catalogue means the request failed.
    if (!catalogueRows) throw new Error(`No product-catalogue rows for ${b.name} ${FIRST_YEAR}–${LAST_YEAR} (aborting, no file written)`);

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

if (ONLY) {
  console.error(`\nDRY RUN (ONLY=${process.env.ONLY}) — skipped:\n  ${skipped.join('\n  ')}`);
  process.exit(0);
}
const today = new Date().toISOString().slice(0, 10);
const ts = `// GENERATED by scripts/fetch-brand-recalls.mjs from the NHTSA recalls API on ${today} — do not edit by hand.
// Source: https://api.nhtsa.gov/recalls — unique recall CAMPAIGNS (by NHTSA campaign number) covering model
// years ${FIRST_YEAR}–${LAST_YEAR}, filed under each model's exact name. Models with a variant name we found
// (hybrid, EV, trim) that has additional campaigns are left out. Counts are campaigns, not affected vehicles.

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
