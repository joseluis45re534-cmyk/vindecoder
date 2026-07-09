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
      'You can confirm the exact same core records — title brands, theft, liens, and odometer history — starting from a low-cost trial, and see a free identity preview before you pay anything.',
  },
  {
    slug: 'autocheck',
    name: 'AutoCheck',
    known: 'A vehicle history report brand from Experian, often associated with auction buyers and its comparative scoring approach.',
    bestFor: 'Buyers who want a single numeric score to compare auction cars at a glance.',
    switchAngle:
      'Instead of paying for a score, you get the underlying records that actually matter — NMVTIS title brands, NICB theft data, liens, and odometer readings — with a free preview first.',
  },
  {
    slug: 'bumper',
    name: 'Bumper',
    known: 'A subscription-based vehicle history and research service marketed around unlimited lookups.',
    bestFor: 'High-volume shoppers who run many reports every month.',
    switchAngle:
      'If you are checking one car, you should not have to commit like a dealer. Start for a low trial price, see the free preview, and cancel anytime — no long-term lock-in to run a single report.',
  },
  {
    slug: 'epicvin',
    name: 'EpicVIN',
    known: 'An online VIN check and vehicle history provider aimed at used-car buyers.',
    bestFor: 'Buyers who found a report bundled with a specific listing.',
    switchAngle:
      'CarVinLookup pulls from NMVTIS, NICB, and state DMV records, works from a VIN or a U.S. license plate in all 50 states, and shows you what the car is before you pay.',
  },
  {
    slug: 'clearvin',
    name: 'ClearVin',
    known: 'A VIN decoder and history report service popular with auction and export buyers.',
    bestFor: 'Auction and export use cases that need specialized data.',
    switchAngle:
      'For a normal U.S. used-car purchase, CarVinLookup gives you the title, theft, lien, and odometer history you need — with a free preview and a low-cost start.',
  },
  {
    slug: 'faxvin',
    name: 'FaxVIN',
    known: 'An online VIN lookup and vehicle history report service.',
    bestFor: 'Shoppers comparing several low-cost report options.',
    switchAngle:
      'CarVinLookup shows a free identity preview first, so you confirm the car before you decide to unlock the full NMVTIS, NICB, and DMV history.',
  },
  {
    slug: 'vinaudit',
    name: 'VinAudit',
    known: 'A vehicle history data provider that draws on NMVTIS title records.',
    bestFor: 'Developers and buyers comfortable with a data-first, no-frills report.',
    switchAngle:
      'CarVinLookup packages the same class of official records into a clear, readable report, adds NICB theft and lien checks, and lets you preview the vehicle for free first.',
  },
  {
    slug: 'carvertical',
    name: 'carVertical',
    known: 'A vehicle history provider known for international coverage and a data-driven brand.',
    bestFor: 'Buyers checking imported or overseas-market vehicles.',
    switchAngle:
      'For U.S. cars, CarVinLookup is built around U.S. sources — NMVTIS, NICB, and state DMVs — covering all 50 states from a VIN or license plate, with a free preview before you pay.',
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
  { label: 'Low-cost start', detail: 'Full report access starts from a {fee} trial — not a premium one-off fee.' },
  { label: 'Official U.S. data sources', detail: 'Title brands from NMVTIS, theft from NICB, plus state DMV records.' },
  { label: 'VIN or license plate', detail: 'Search by 17-character VIN or a U.S. license plate across all 50 states.' },
  { label: 'Instant online report', detail: 'The full history is generated in under a minute — no waiting.' },
  { label: 'Cancel anytime', detail: 'Manage or cancel your plan whenever you want.' },
];
