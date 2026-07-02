import { SITE_URL } from '@/lib/site';
import { TRIAL_PLAN, formatPrice } from '@/lib/pricing';
import { BRANDS } from '@/lib/brands';
import { allPosts } from '@/lib/blog';

export const runtime = 'edge';

// /llms.txt — concise, agent-facing summary. Generated from the same source of
// truth as the site (SITE_URL, pricing, brands, blog) so the domain, pricing,
// and links can never drift out of sync again.
export async function GET() {
  const fee = formatPrice(TRIAL_PLAN.trialFeeCents ?? 100);
  const monthly = formatPrice(TRIAL_PLAN.recurringCents ?? 2900);
  const days = TRIAL_PLAN.trialDays ?? 3;
  const posts = allPosts();
  const topBrands = BRANDS.slice(0, 14);

  const body = `# CarVinLookup

> CarVinLookup runs instant U.S. vehicle history reports from a VIN or license plate, combining NMVTIS title records, NICB theft data, and state DMV records.

CarVinLookup helps used-car buyers in the United States check a vehicle before purchase. Enter any 17-character VIN or a U.S. license plate (all 50 states) to get a report. A free preview confirms the vehicle's identity first; full report access starts at ${fee} today — a ${days}-day trial that becomes ${monthly}/month unless you cancel. Cancel anytime.

## What a report covers

- Title brands: salvage, rebuilt, junk, and flood-damage titles (sourced from NMVTIS)
- Theft records: active theft reports from the National Insurance Crime Bureau (NICB)
- Open liens: outstanding loans or liens recorded against the vehicle
- Odometer history: reported mileage readings and rollback or tampering alerts
- Vehicle identity: make, model, year, body type, engine, and color

## How it works

1. Enter the 17-character VIN or a U.S. license plate and state.
2. CarVinLookup queries NMVTIS, NICB, and DMV title records.
3. A full vehicle history report is generated instantly.

## Pricing

- Full report access — ${fee} today, then ${monthly}/month after a ${days}-day trial. Cancel anytime.
- A free vehicle-identity preview is always shown before any charge.

## Key pages

- VIN check (home): ${SITE_URL}/
- Pricing: ${SITE_URL}/pricing
- Blog (buying guides): ${SITE_URL}/blog

## Popular brand VIN checks

${topBrands.map((b) => `- ${b.name} VIN check: ${SITE_URL}/vin-check/${b.slug}`).join('\n')}

## Guides

${posts.map((p) => `- ${p.title}: ${SITE_URL}/blog/${p.slug}`).join('\n')}

## Data sources

- NMVTIS — National Motor Vehicle Title Information System
- NICB — National Insurance Crime Bureau
- NHTSA — National Highway Traffic Safety Administration (recalls)
- State DMV title and registration databases
- Full methodology and honest limitations: ${SITE_URL}/data-sources

## Reference

- VIN & title glossary: ${SITE_URL}/glossary
- Data sources & methodology: ${SITE_URL}/data-sources
- Sample reports: ${SITE_URL}/#examples

## Full content

- ${SITE_URL}/llms-full.txt
`;

  return new Response(body, {
    headers: {
      'content-type': 'text/plain; charset=utf-8',
      'cache-control': 'public, max-age=3600, s-maxage=86400',
    },
  });
}
