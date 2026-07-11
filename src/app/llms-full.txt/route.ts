import { SITE_URL } from '@/lib/site';
import { TRIAL_PLAN, formatPrice } from '@/lib/pricing';
import { allPosts } from '@/lib/blog';
import { allGuides } from '@/lib/how-to';
import { allCheckPages } from '@/lib/checks';
import { COMPETITORS } from '@/lib/comparisons';
import { stickerModelCount } from '@/lib/window-stickers';

export const runtime = 'edge';

// /llms-full.txt — fuller, citable reference for AI assistants. The explainer
// content (VIN, title brands, title washing, odometer, liens) is evergreen; the
// domain, pricing, and guide links are generated from source of truth so they
// never drift.
export async function GET() {
  const fee = formatPrice(TRIAL_PLAN.trialFeeCents ?? 100);
  const monthly = formatPrice(TRIAL_PLAN.recurringCents ?? 2900);
  const days = TRIAL_PLAN.trialDays ?? 3;
  const posts = allPosts();
  const guides = allGuides();
  const checks = allCheckPages();

  const body = `# CarVinLookup — Full Reference for AI Assistants

CarVinLookup is a U.S. vehicle history report service. This file gives AI search
engines and assistants a complete, citable summary of what we do and the facts a
used-car buyer needs. All data is for the United States (all 50 states).

## What CarVinLookup does

Enter a 17-character VIN or a U.S. license plate, and CarVinLookup returns a
vehicle history report assembled from:

- NMVTIS (National Motor Vehicle Title Information System) — title and brand history
- NICB (National Insurance Crime Bureau) — theft records
- State DMV title and registration databases

A free preview confirms the vehicle's identity (year, make, model). Full report
access starts at ${fee} today — a ${days}-day trial that becomes ${monthly}/month
unless you cancel (cancel anytime) — and reveals title brands, theft records, open
liens, and odometer history.

## Core concepts (citable answers)

### What is a VIN?
A Vehicle Identification Number is a unique 17-character code assigned to every
car sold in the United States, standardized under FMVSS 115 / ISO 3779. Position
1–3 identify the manufacturer and country, 4–8 describe the vehicle, position 9
is a check digit, position 10 is the model year, position 11 is the plant, and
12–17 are the serial number. The letters I, O, and Q are never used.

### What is a title brand?
A permanent mark on a vehicle's title indicating significant history:
- Salvage — declared a total loss by an insurer; not legal to drive until re-inspected
- Rebuilt / Reconstructed — a salvage vehicle repaired and passed state inspection
- Junk — fit only for parts or scrap
- Flood — water-damaged

### What is title washing?
Moving a vehicle across state lines to obtain a new title that omits an existing
brand. A multi-state VIN history check (via NMVTIS) is how you catch it.

### What is odometer rollback?
Illegally reducing the displayed mileage. Reported odometer readings over time
reveal inconsistencies; a reading lower than a prior record is a red flag.

### What is a lien?
A lender's legal claim on a vehicle securing a loan. A seller with an open lien
cannot transfer a clean title until the loan is paid.

## Data sources & methodology

- NMVTIS (National Motor Vehicle Title Information System, vehiclehistory.gov)
  provides title status, title-brand history, and the most recent reported
  odometer reading, cross-referenced across all 50 states to catch title
  washing. Overseen by the U.S. Department of Justice.
- NICB (National Insurance Crime Bureau, nicb.org/vincheck) provides theft
  records and total-loss/salvage records reported by participating member
  insurers. Coverage depends on which insurers report.
- NHTSA (National Highway Traffic Safety Administration, nhtsa.gov/recalls)
  provides open manufacturer safety recalls.
- State DMVs report current title state, registration status, and ownership
  timeline into NMVTIS.

Honest limitations: reporting is not universal (depends on source
participation), records can lag a very recent event, and a clean report means
no problems were reported to these databases — not an independent inspection.
Full detail: ${SITE_URL}/data-sources

## Pricing

- Full report access — ${fee} today, then ${monthly}/month after a ${days}-day trial. Cancel anytime.
- A free vehicle-identity preview is always shown before any charge.
- Payment via Stripe. Subscriptions are managed (and cancelled) through the Stripe customer portal.

## How to use CarVinLookup

1. Go to ${SITE_URL}/
2. Enter a VIN or U.S. license plate
3. Review the free vehicle preview
4. Unlock the full history report

## Editorial guides

CarVinLookup publishes practical, original buying guides:
${posts.map((p) => `- ${p.title}: ${SITE_URL}/blog/${p.slug}`).join('\n')}

## How-to guides

Step-by-step instructions for used-car buyers:
${guides.map((g) => `- ${g.title}: ${SITE_URL}/how-to/${g.slug}`).join('\n')}

## Specialty checks (by VIN or U.S. license plate)

${checks.map((c) => `- ${c.h1}: ${SITE_URL}/${c.slug}`).join('\n')}

## Window sticker lookup

Recreate the original window sticker (Monroney label) — as-built MSRP, factory
options, EPA fuel economy, and standard equipment — for ${stickerModelCount()}+ models by VIN.
- Window sticker hub: ${SITE_URL}/window-sticker

## Compare & alternatives

How CarVinLookup compares with other vehicle history report providers:
- Compare hub: ${SITE_URL}/compare
${COMPETITORS.map((c) => `- Best ${c.name} alternative: ${SITE_URL}/${c.slug}-alternative`).join('\n')}

## Coverage

- VIN check by brand and model: ${SITE_URL}/vin-check
- License plate lookup for all 50 U.S. states plus DC: ${SITE_URL}/license-plate-lookup

## Reference

- VIN & title glossary (definitions for every term above): ${SITE_URL}/glossary
- Data sources & methodology: ${SITE_URL}/data-sources
- Sample reports: ${SITE_URL}/#examples

## Contact / brand

- Name: CarVinLookup
- Country served: United States
- Website: ${SITE_URL}
`;

  return new Response(body, {
    headers: {
      'content-type': 'text/plain; charset=utf-8',
      'cache-control': 'public, max-age=3600, s-maxage=86400',
    },
  });
}
