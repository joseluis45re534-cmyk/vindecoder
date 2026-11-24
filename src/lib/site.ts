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

// Keep within ~160 chars (Google's snippet width). Only claim what the report
// provider actually supplies — see /data-sources. License-plate search is not
// live yet (it ships with the ClearVin integration), so it is not promised here.
export const SITE_DESCRIPTION =
  'Run an instant U.S. vehicle history report by VIN. Check title brands, salvage and flood damage, theft, open liens, and odometer records with NMVTIS title data.';

export const SITE_TAGLINE = 'U.S. Vehicle History Reports by VIN';

// Stable content-revision date (ISO yyyy-mm-dd). Drives sitemap <lastmod>, the
// visible "Last reviewed" line on money pages, and schema dateModified. Bump it
// ONLY when evergreen page content materially changes — never use new Date().
export const CONTENT_REVISED = '2026-11-24';

/** "November 24, 2026" — human form of CONTENT_REVISED for visible dates. */
export function formatRevised(iso: string = CONTENT_REVISED): string {
  return new Date(`${iso}T12:00:00Z`).toLocaleDateString('en-US', {
    year: 'numeric', month: 'long', day: 'numeric', timeZone: 'UTC',
  });
}

// Official brand profiles for Organization `sameAs` (entity signals for Google
// and AI engines). Add ONLY real, live profile URLs you control — e.g.
// 'https://www.linkedin.com/company/…', 'https://www.facebook.com/…',
// 'https://x.com/…', 'https://www.trustpilot.com/review/carvinlookup.us'.
export const SOCIAL_PROFILES: string[] = [];

// Official NMVTIS consumer-access disclaimer (U.S. DOJ). Products that include
// NMVTIS data must make it available to consumers — /data-sources#nmvtis-disclaimer
// summarizes it and links these originals (verified live 2026-11-24).
export const NMVTIS_DISCLAIMER_URL =
  'https://vehiclehistory.bja.ojp.gov/sites/vehiclehist/files/media/document/CAPDisclaimer_1_0.pdf';
export const NMVTIS_DISCLAIMER_SUMMARY_URL =
  'https://vehiclehistory.bja.ojp.gov/sites/vehiclehist/files/media/document/CAPDisclaimerSUMMARY062112.pdf';

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
