import { SITE_URL } from '@/lib/site';
import { TRIAL_PLAN, formatPrice } from '@/lib/pricing';
import { BRANDS } from '@/lib/brands';
import { listAllArticles } from '@/lib/autoseo';
import { allGuides } from '@/lib/how-to';
import { COMPETITORS } from '@/lib/comparisons';
import { allCheckPages } from '@/lib/checks';

export const runtime = 'edge';

// /llms.txt — concise, agent-facing summary. Generated from the same source of
// truth as the site (SITE_URL, pricing, brands, blog) so the domain, pricing,
// and links can never drift out of sync again.
export async function GET() {
  const fee = formatPrice(TRIAL_PLAN.trialFeeCents ?? 100);
  const monthly = formatPrice(TRIAL_PLAN.recurringCents ?? 2900);
  const days = TRIAL_PLAN.trialDays ?? 3;
  const posts = await listAllArticles(); // live blog (AutoSEO) — same source as /blog
  const guides = allGuides();
  const checks = allCheckPages();
  const topBrands = BRANDS.slice(0, 14);

  const body = `# CarVinLookup

> CarVinLookup runs U.S. vehicle history reports from a 17-character VIN, built on NMVTIS title data (via an approved NMVTIS data provider) plus insurance, salvage-auction, lien, odometer, and NHTSA recall records.

CarVinLookup helps used-car buyers in the United States check a vehicle before purchase. Enter any 17-character VIN (cars titled in all 50 states) to get a report. License-plate search is launching soon and is not live yet. A free preview confirms the vehicle's identity first; unlocking a vehicle's full report costs ${fee} today for a ${days}-day trial, then ${monthly}/month unless you cancel. Billing is per vehicle (each unlock starts its own trial). Cancel anytime.

## What a report covers

- Title brands: salvage, rebuilt, junk, and flood-damage titles (sourced from NMVTIS)
- Total-loss and salvage records reported by insurers and salvage yards; salvage-auction records where available
- Theft check: a theft-risk flag from the data provider (not police or NICB records)
- Open liens: outstanding loans or liens recorded against the vehicle
- Odometer history: reported mileage readings with dates
- Open safety recalls (NHTSA)
- Vehicle identity: make, model, year, body type, and engine

## How it works

1. Enter the 17-character VIN.
2. Review the free vehicle preview (year, make, model).
3. Unlock the full history report online after checkout.

## Pricing

- Full report for one vehicle — ${fee} today for a ${days}-day trial, then ${monthly}/month unless you cancel. Billed per vehicle; cancel anytime.
- A free vehicle-identity preview is always shown before any charge.

## Data sources

- NMVTIS — National Motor Vehicle Title Information System (U.S. DOJ), accessed through an approved NMVTIS data provider
- Insurers, junk and salvage yards — total-loss and salvage reports (federally required NMVTIS reporting)
- Salvage-auction sale records, where available
- NHTSA — National Highway Traffic Safety Administration (recalls, VIN decoding)
- Not a source: the NICB's free VINCheck is a separate tool; CarVinLookup reports do not include NICB data
- Full methodology, honest limitations, and the NMVTIS disclaimer: ${SITE_URL}/data-sources

## Specialty checks

${checks.map((c) => `- ${c.h1}: ${SITE_URL}/${c.slug}`).join('\n')}

## How-to guides

${guides.map((g) => `- ${g.title}: ${SITE_URL}/how-to/${g.slug}`).join('\n')}

## Key pages

- VIN check (home): ${SITE_URL}/
- Pricing: ${SITE_URL}/pricing
${posts.length ? `- Blog (buying guides): ${SITE_URL}/blog\n` : ''}- How-to guides: ${SITE_URL}/how-to
- Window sticker guide (VIN-based sticker lookup launching soon): ${SITE_URL}/window-sticker
- Salvage auction guide: ${SITE_URL}/auctions
- Compare providers: ${SITE_URL}/compare

## Popular brand VIN checks

${topBrands.map((b) => `- ${b.name} VIN check: ${SITE_URL}/vin-check/${b.slug}`).join('\n')}

## Compare & alternatives

- Compare providers: ${SITE_URL}/compare
${COMPETITORS.map((c) => `- ${c.name} alternative: ${SITE_URL}/${c.slug}-alternative`).join('\n')}

## Reference

- VIN & title glossary: ${SITE_URL}/glossary
- Data sources & methodology: ${SITE_URL}/data-sources
- Sample reports: ${SITE_URL}/#examples

${posts.length ? `## Blog posts\n\n${posts.map((p) => `- ${p.title}: ${SITE_URL}/blog/${p.slug}`).join('\n')}\n\n` : ''}## Full content

- ${SITE_URL}/llms-full.txt
`;

  return new Response(body, {
    headers: {
      'content-type': 'text/plain; charset=utf-8',
      'cache-control': 'public, max-age=3600, s-maxage=86400',
    },
  });
}
