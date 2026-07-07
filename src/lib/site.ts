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

// Single source of truth for NAP (name / address / phone) so the footer and the
// Organization JSON-LD never diverge. Set SUPPORT_PHONE once you have a number.
export const SUPPORT_EMAIL = 'support@carvinlookup.us';
// Typed as string (not the '' literal) so the "phone present" branches compile.
export const SUPPORT_PHONE: string = ''; // e.g. '+1-303-555-0100' — leave '' to hide it
export const SITE_ADDRESS = {
  line1: '1500 N Grant St',
  line2: 'Ste N',
  city: 'Denver',
  region: 'CO',
  postalCode: '80203',
  country: 'US',
};
