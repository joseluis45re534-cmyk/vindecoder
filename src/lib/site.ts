// Central site metadata used across SEO surfaces (metadata, sitemap, robots, JSON-LD).
// Override the canonical origin per-environment with NEXT_PUBLIC_SITE_URL.

const FALLBACK_SITE_URL = 'https://carvinlookup.us';

// Always resolve to a valid absolute origin. A protocol-less env value
// (e.g. "carvinlookup.us") would otherwise make `new URL(SITE_URL)` throw and
// 500 every page, so we normalize defensively.
function normalizeSiteUrl(raw?: string): string {
  let u = (raw || '').trim();
  if (!u) return FALLBACK_SITE_URL;
  if (!/^https?:\/\//i.test(u)) u = `https://${u}`;
  try {
    return new URL(u).origin;
  } catch {
    return FALLBACK_SITE_URL;
  }
}

export const SITE_URL = normalizeSiteUrl(process.env.NEXT_PUBLIC_SITE_URL);

export const SITE_NAME = 'CarVinLookup';

export const SITE_DESCRIPTION =
  'Run an instant U.S. vehicle history report by VIN or license plate. Check title brands, salvage and flood damage, theft records, open liens, and odometer rollback from NMVTIS, NICB, and DMV records.';

export const SITE_TAGLINE = 'U.S. Vehicle History Reports by VIN';
