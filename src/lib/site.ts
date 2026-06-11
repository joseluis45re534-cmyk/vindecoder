// Central site metadata used across SEO surfaces (metadata, sitemap, robots, JSON-LD).
// Override the canonical origin per-environment with NEXT_PUBLIC_SITE_URL.

export const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL || 'https://carvinlookup.com'
).replace(/\/$/, '');

export const SITE_NAME = 'CarVinLookup';

export const SITE_DESCRIPTION =
  'Run an instant U.S. vehicle history report by VIN or license plate. Check title brands, salvage and flood damage, theft records, open liens, and odometer rollback from NMVTIS, NICB, and DMV records.';

export const SITE_TAGLINE = 'U.S. Vehicle History Reports by VIN';
