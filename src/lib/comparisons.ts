// Competitor / comparison data — drives the /[x]-alternative pages and the
// /compare hub + /compare/[slug] pages. Same source-of-truth pattern as BRANDS.
//
// GUARDRAIL: competitor descriptions are deliberately GENERAL and widely known
// (positioning only). We never encode a specific competitor price, stat, or
// feature list we cannot stand behind — pricing and features change, and a
// visible note tells readers to verify on the provider's own site. The selling
// is done with CarVinLookup's own verifiable strengths, sourced from pricing.ts.

export interface Competitor {
  slug: string; // 'carfax'
  name: string; // 'Carfax'
  /** Short, widely-known positioning — no fabricated specifics. */
  known: string;
  /** Honest, light acknowledgement of where they may still fit. */
  bestFor: string;
  /** The switch angle — framed around our strengths. */
  switchAngle: string;
}

export const COMPETITORS: Competitor[] = [
  {
    slug: 'carfax',
    name: 'Carfax',
    known: 'One of the most recognized vehicle history brands in the United States, long the default report at many franchise dealerships.',
    bestFor: 'Shoppers who specifically want the brand a dealer already references by name.',
    switchAngle:
      'You can check the core records that matter — NMVTIS title brands, a theft check, liens, and odometer history — and see a free vehicle preview before you pay anything.',
  },
  {
    slug: 'autocheck',
    name: 'AutoCheck',
    known: 'A vehicle history report brand from Experian, often associated with auction buyers and its comparative scoring approach.',
    bestFor: 'Buyers who want a single numeric score to compare auction cars at a glance.',
    switchAngle:
      'CarVinLookup shows the underlying records — NMVTIS title brands, a theft check, liens, and odometer readings — with a free vehicle preview first.',
  },
  {
    slug: 'bumper',
    name: 'Bumper',
    known: 'A subscription-based vehicle history and research service marketed around unlimited lookups.',
    bestFor: 'High-volume shoppers who run many reports every month.',
    switchAngle:
      "Start with a free vehicle preview, then unlock only the cars you're serious about. Each unlock is its own subscription, so cancel it once you're done.",
  },
  {
    slug: 'epicvin',
    name: 'EpicVIN',
    known: 'An online VIN check and vehicle history provider aimed at used-car buyers.',
    bestFor: 'Buyers who found a report bundled with a specific listing.',
    switchAngle:
      'CarVinLookup is built on NMVTIS title data, works from a VIN for cars titled in any of the 50 states, and shows you what the car is before you pay.',
  },
  {
    slug: 'faxvin',
    name: 'FaxVIN',
    known: 'An online VIN lookup and vehicle history report service.',
    bestFor: 'Shoppers comparing several low-cost report options.',
    switchAngle:
      'CarVinLookup shows a free identity preview first, so you confirm the car before you decide to unlock the full NMVTIS-based title, theft, lien, and odometer history.',
  },
  {
    slug: 'vinaudit',
    name: 'VinAudit',
    known: 'A vehicle history data provider that draws on NMVTIS title records.',
    bestFor: 'Developers and buyers comfortable with a data-first, no-frills report.',
    switchAngle:
      'CarVinLookup presents NMVTIS title data alongside insurance, salvage, lien, and odometer records in one readable report, and lets you preview the vehicle for free first.',
  },
  {
    slug: 'carvertical',
    name: 'carVertical',
    known: 'A vehicle history provider known for international coverage and a data-driven brand.',
    bestFor: 'Buyers checking imported or overseas-market vehicles.',
    switchAngle:
      'For U.S. cars, CarVinLookup is built around U.S. records — NMVTIS title data plus insurance, salvage, lien, and odometer records — covering all 50 states from a VIN, with a free preview before you pay.',
  },
];

export function getCompetitor(slug: string): Competitor | undefined {
  return COMPETITORS.find((c) => c.slug === slug);
}

/** The us-vs-them comparison slug used under /compare. */
export function comparisonSlug(competitorSlug: string): string {
  return `carvinlookup-vs-${competitorSlug}`;
}

/** Resolve a /compare/[slug] param back to a competitor. */
export function getComparisonBySlug(slug: string): Competitor | undefined {
  const prefix = 'carvinlookup-vs-';
  if (!slug.startsWith(prefix)) return undefined;
  return getCompetitor(slug.slice(prefix.length));
}

/**
 * CarVinLookup's own advantages — verifiable from the product/pricing, reused
 * across every comparison page. `{fee}` is filled in at render from pricing.ts.
 */
export const OUR_ADVANTAGES: { label: string; detail: string }[] = [
  { label: 'Free preview before you pay', detail: 'Confirm the year, make, model, and VIN at no cost before unlocking anything.' },
  { label: 'Low-cost start', detail: 'Unlock a vehicle for {price}, billed per vehicle.' },
  { label: 'U.S. title data', detail: 'Title brands from NMVTIS via an approved data provider, plus theft, lien, and odometer records.' },
  { label: 'Any U.S. VIN', detail: 'Search any 17-character VIN for cars titled in all 50 states. License-plate search is launching soon.' },
  { label: 'Online report + PDF', detail: 'The full history appears online right after checkout, with a PDF download.' },
  { label: 'Cancel anytime', detail: 'Manage or cancel your plan whenever you want.' },
];
