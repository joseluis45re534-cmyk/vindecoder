// Generates src/lib/brand-wmis.ts from NHTSA's public vPIC API — the verified,
// per-brand World Manufacturer Identifier (WMI) data shown on /vin-check/[brand].
//
//   node scripts/fetch-brand-wmis.mjs
//
// Method: vPIC files WMIs under the registrant (e.g. "General Motors", or a
// joint venture like "AutoAlliance"), not the brand. For each search term we
// list its WMIs (GetWMIsForManufacturer), keep 3-character passenger-car / MPV /
// truck codes, then confirm each code's MAKE with DecodeWMI (vPIC returns all
// makes as one comma-separated string) and attach it only to brands vPIC names.
// The REGION comes from the WMI's own first characters (ISO 3780 region table),
// not from vPIC's registrant record — that record's country is often the
// parent company's home country, not where the code is assigned. Nothing is
// hand-typed or guessed; the list is NOT every code a brand has ever used.

import fs from 'node:fs';
import path from 'node:path';

const API = 'https://vpic.nhtsa.dot.gov/api/vehicles';
const OUT = path.join(process.cwd(), 'src', 'lib', 'brand-wmis.ts');

// Registrant search terms (vPIC contains-match). Broad on purpose: DecodeWMI's
// make check is what decides attribution, so false matches are filtered out.
const MANUFACTURER_QUERIES = [
  'ford', 'general motors', 'toyota', 'honda', 'nissan', 'bmw', 'mercedes', 'daimler',
  'audi', 'volkswagen', 'porsche', 'fca', 'chrysler', 'fiat', 'stellantis', 'hyundai', 'kia',
  'subaru', 'fuji heavy', 'mazda', 'tesla', 'volvo', 'jaguar', 'land rover', 'mitsubishi', 'genesis',
  'auto alliance', 'autoalliance', 'new united motor', 'opel', 'renault samsung', 'otomotiv', 'otosan', 'isuzu',
];
const KEEP_TYPES = new Set(['Passenger Car', 'Multipurpose Passenger Vehicle (MPV)', 'Truck']);

// ISO 3780 WMI regions, by the first two characters. Character order is
// A–Z (no I, O, Q) then 1–9, 0.
const ORDER = 'ABCDEFGHJKLMNPRSTUVWXYZ1234567890';
const pos = (c) => ORDER.indexOf(c);
const R = (first, from, to, name) => ({ first, from, to, name });
// Verified 2026-11-25 against the ISO 3780 "Country or region codes" table on
// https://en.wikipedia.org/wiki/Vehicle_identification_number (as of April 2019).
const REGIONS = [
  R('1', 'A', '0', 'United States'), R('4', 'A', '0', 'United States'), R('5', 'A', '0', 'United States'), R('7', 'A', '0', 'United States'),
  R('2', 'A', '0', 'Canada'),
  R('3', 'A', 'X', 'Mexico'), R('3', '4', '4', 'Nicaragua'), R('3', '5', '5', 'Dominican Republic'), R('3', '6', '6', 'Honduras'), R('3', '7', '7', 'Panama'),
  R('6', 'A', 'X', 'Australia'), R('6', 'Y', '1', 'New Zealand'),
  R('8', 'A', 'E', 'Argentina'), R('8', 'F', 'G', 'Chile'), R('8', '4', '4', 'Costa Rica'),
  R('9', 'A', 'E', 'Brazil'), R('9', 'F', 'G', 'Colombia'), R('9', '1', '0', 'Brazil'),
  R('J', 'A', '0', 'Japan'),
  R('K', 'L', 'R', 'South Korea'),
  R('L', 'A', '0', 'China'),
  R('M', 'A', 'E', 'India'), R('M', 'F', 'K', 'Indonesia'), R('M', 'L', 'R', 'Thailand'),
  R('N', 'L', 'R', 'Turkey'),
  R('P', 'F', 'G', 'Singapore'), R('P', 'L', 'R', 'Malaysia'),
  R('R', 'F', 'K', 'Taiwan'),
  R('S', 'A', 'M', 'United Kingdom'), R('S', 'N', 'T', 'Germany'), R('S', 'U', 'Z', 'Poland'),
  R('T', 'A', 'H', 'Switzerland'), R('T', 'J', 'P', 'Czech Republic'), R('T', 'R', 'V', 'Hungary'), R('T', 'W', '2', 'Portugal'),
  R('U', '5', '7', 'Slovakia'),
  R('V', 'A', 'E', 'Austria'), R('V', 'F', 'R', 'France'), R('V', 'S', 'W', 'Spain'),
  R('W', 'A', '0', 'Germany'),
  R('X', 'L', 'R', 'Netherlands'),
  R('Y', 'A', 'E', 'Belgium'), R('Y', 'F', 'K', 'Finland'), R('Y', 'S', 'W', 'Sweden'),
  R('Z', 'A', 'U', 'Italy'),
];
function wmiRegion(wmi) {
  const [a, b] = wmi.toUpperCase();
  const hit = REGIONS.find((r) => r.first === a && pos(b) >= pos(r.from) && pos(b) <= pos(r.to));
  return hit ? hit.name : '';
}

const brandsSrc = fs.readFileSync(path.join(process.cwd(), 'src', 'lib', 'brands.ts'), 'utf8');
const BRANDS = [...brandsSrc.matchAll(/slug: '([^']+)', name: '([^']+)'/g)].map((m) => ({ slug: m[1], name: m[2] }));
const norm = (s) => String(s || '').toUpperCase().replace(/[^A-Z0-9]/g, '');
const brandByMake = new Map(BRANDS.map((b) => [norm(b.name), b.slug]));
const MAKE_SPELLING = new Map([
  ...BRANDS.map((b) => [norm(b.name), b.name]),
  ['HMC', 'HMC'], ['BRIGHTDROP', 'BrightDrop'], ['SRT', 'SRT'], ['LANCIA', 'Lancia'], ['ALFAROMEO', 'Alfa Romeo'],
  ['MAYBACH', 'Maybach'], ['SMART', 'smart'], ['DATSUN', 'Datsun'], ['POLESTAR', 'Polestar'], ['SCION', 'Scion'],
]);
const spellMake = (m) => MAKE_SPELLING.get(norm(m)) ?? m.toLowerCase().replace(/(^|[\s-])\w/g, (c) => c.toUpperCase());

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
async function getJson(url, tries = 5) {
  for (let i = 0; i < tries; i++) {
    try {
      const res = await fetch(url, { signal: AbortSignal.timeout(45000) });
      if (res.ok) return await res.json();
    } catch { /* retry */ }
    await sleep(1500 * (i + 1));
  }
  // Fail the whole run: a partial data file must never be committed.
  throw new Error(`vPIC request failed after retries: ${url}`);
}
async function mapLimit(items, limit, fn) {
  const out = new Array(items.length);
  let i = 0;
  await Promise.all(Array.from({ length: limit }, async () => {
    while (i < items.length) {
      const k = i++;
      out[k] = await fn(items[k]);
      await sleep(150);
    }
  }));
  return out;
}

const candidates = new Map(); // wmi -> vehicle type
for (const q of MANUFACTURER_QUERIES) {
  const j = await getJson(`${API}/GetWMIsForManufacturer/${encodeURIComponent(q)}?format=json`);
  for (const r of j.Results || []) {
    const wmi = String(r.WMI || '').toUpperCase();
    if (wmi.length !== 3 || !KEEP_TYPES.has(r.VehicleType)) continue;
    if (!candidates.has(wmi)) candidates.set(wmi, r.VehicleType);
  }
  console.error(`${q}: ${candidates.size} candidate WMIs so far`);
}

const wmis = [...candidates.keys()].sort();
const decoded = await mapLimit(wmis, 3, async (wmi) => {
  const j = await getJson(`${API}/DecodeWMI/${wmi}?format=json`);
  return { wmi, results: j.Results || [] };
});

const byBrand = Object.fromEntries(BRANDS.map((b) => [b.slug, []]));
for (const { wmi, results } of decoded) {
  const makes = [...new Set(results.flatMap((r) => String(r.Make || '').split(',')).map((m) => m.trim()).filter(Boolean))];
  const type = candidates.get(wmi);
  for (const make of makes) {
    const slug = brandByMake.get(norm(make));
    if (!slug) continue;
    byBrand[slug].push({
      wmi,
      region: wmiRegion(wmi),
      vehicleType: type === 'Multipurpose Passenger Vehicle (MPV)' ? 'SUV / MPV' : type,
      sharedWith: makes.filter((m) => norm(m) !== norm(make)).map(spellMake),
    });
  }
}

const data = Object.fromEntries(Object.entries(byBrand).map(([slug, rows]) => [slug, rows.sort((a, b) => a.wmi.localeCompare(b.wmi))]));
const missingRegion = Object.values(data).flat().filter((r) => !r.region).map((r) => r.wmi);
if (missingRegion.length) console.error(`WARNING: no ISO 3780 region for ${[...new Set(missingRegion)].join(' ')} — extend REGIONS`);

const today = new Date().toISOString().slice(0, 10);
const ts = `// GENERATED by scripts/fetch-brand-wmis.mjs from NHTSA vPIC on ${today} — do not edit by hand.
// Source: https://vpic.nhtsa.dot.gov/ (GetWMIsForManufacturer + DecodeWMI). Each WMI is listed only under
// the make(s) vPIC decodes it to. Region = ISO 3780 region of the WMI's first characters. Car, SUV/MPV and
// truck codes only — not every code a brand has used. Re-run the script to refresh.

export const BRAND_WMIS_RETRIEVED = '${today}';

export interface BrandWmi {
  wmi: string;
  /** ISO 3780 region of the code (usually, not always, the build country). */
  region: string;
  vehicleType: string;
  /** Other makes vPIC lists under the same WMI (empty = this make only). */
  sharedWith: string[];
}

export const BRAND_WMIS: Record<string, BrandWmi[]> = ${JSON.stringify(data, null, 2)};
`;
fs.writeFileSync(OUT, ts);
for (const b of BRANDS) console.error(`${b.slug.padEnd(14)} ${String(data[b.slug].length).padStart(3)} WMIs`);
console.error(`wrote ${OUT}`);
