// JSON-LD builders — one source of truth for the site's structured data so
// agents and search engines extract correct, current facts. Pure functions
// returning plain objects; render them with <JsonLd data={...} />.

import { SITE_URL, SITE_NAME, SITE_DESCRIPTION } from '@/lib/site';
import { TRIAL_PLAN, formatPrice } from '@/lib/pricing';

type Json = Record<string, unknown>;

const ORG_ID = `${SITE_URL}/#organization`;

/** Entry price as a schema.org Offer string, e.g. "1.00". */
function entryPrice(): string {
  return ((TRIAL_PLAN.trialFeeCents ?? 100) / 100).toFixed(2);
}

function offerDescription(): string {
  const fee = formatPrice(TRIAL_PLAN.trialFeeCents ?? 100);
  const monthly = formatPrice(TRIAL_PLAN.recurringCents ?? 2900);
  const days = TRIAL_PLAN.trialDays ?? 3;
  return `${fee} today, then ${monthly}/month after a ${days}-day trial. Cancel anytime.`;
}

export function organizationLd(): Json {
  return {
    '@type': 'Organization',
    '@id': ORG_ID,
    name: SITE_NAME,
    url: SITE_URL,
    description: SITE_DESCRIPTION,
    logo: { '@type': 'ImageObject', url: `${SITE_URL}/icon-512.png` },
    areaServed: { '@type': 'Country', name: 'United States' },
  };
}

export function websiteLd(): Json {
  return {
    '@type': 'WebSite',
    '@id': `${SITE_URL}/#website`,
    url: SITE_URL,
    name: SITE_NAME,
    description: SITE_DESCRIPTION,
    publisher: { '@id': ORG_ID },
    inLanguage: 'en-US',
    potentialAction: {
      '@type': 'SearchAction',
      target: { '@type': 'EntryPoint', urlTemplate: `${SITE_URL}/report/{vin}` },
      'query-input': 'required name=vin',
    },
  };
}

export function serviceLd(): Json {
  return {
    '@type': 'Service',
    '@id': `${SITE_URL}/#service`,
    name: 'Vehicle History Report',
    serviceType: 'VIN check and vehicle history report',
    provider: { '@id': ORG_ID },
    areaServed: { '@type': 'Country', name: 'United States' },
    description:
      'Instant U.S. vehicle history reports covering title brands, salvage and flood damage, theft records, open liens, and odometer history.',
    offers: {
      '@type': 'Offer',
      price: entryPrice(),
      priceCurrency: 'USD',
      description: offerDescription(),
      availability: 'https://schema.org/InStock',
      url: SITE_URL,
    },
  };
}

/** Site-wide identity graph (Organization + WebSite + Service). */
export function siteGraphLd(): Json {
  return {
    '@context': 'https://schema.org',
    '@graph': [organizationLd(), websiteLd(), serviceLd()],
  };
}

export function faqPageLd(items: { q: string; a: string }[]): Json {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: items.map(({ q, a }) => ({
      '@type': 'Question',
      name: q,
      acceptedAnswer: { '@type': 'Answer', text: a },
    })),
  };
}

export function vinCheckHowToLd(): Json {
  return {
    '@context': 'https://schema.org',
    '@type': 'HowTo',
    name: 'How to run a VIN check on CarVinLookup',
    description:
      'Check a used vehicle’s history in three steps using a VIN or U.S. license plate.',
    totalTime: 'PT1M',
    step: [
      {
        '@type': 'HowToStep',
        position: 1,
        name: 'Enter the VIN or plate',
        text: 'Enter the 17-character VIN, or a U.S. license plate and state.',
        url: `${SITE_URL}/#vin-search`,
      },
      {
        '@type': 'HowToStep',
        position: 2,
        name: 'Review the free preview',
        text: 'Confirm the vehicle’s identity — year, make, model — in the free preview.',
        url: `${SITE_URL}/#vin-search`,
      },
      {
        '@type': 'HowToStep',
        position: 3,
        name: 'Unlock the full report',
        text: 'Unlock the full NMVTIS, NICB, and DMV history report for the vehicle.',
        url: `${SITE_URL}/#vin-search`,
      },
    ],
  };
}

/**
 * Schema for a curated SAMPLE report page (src/lib/sample-reports.ts). Uses
 * CreativeWork, not Product/Vehicle, and the description explicitly says
 * "illustrative example" — this must never read as a real individual vehicle
 * record, and must never carry AggregateRating/Review.
 */
export function sampleReportLd(sample: { vin: string; title: string; url: string }): Json {
  return {
    '@context': 'https://schema.org',
    '@type': 'CreativeWork',
    name: `Sample vehicle history report — ${sample.title}`,
    description: `An illustrative example vehicle history report for a ${sample.title}, showing the kind of title, accident, odometer, theft, lien, and recall data a real CarVinLookup report covers. Not a record of an actual vehicle.`,
    url: sample.url,
    isPartOf: { '@id': `${SITE_URL}/#website` },
    about: { '@id': `${SITE_URL}/#service` },
    audience: { '@type': 'Audience', audienceType: 'Used car buyers' },
  };
}

export function breadcrumbLd(items: { name: string; url: string }[]): Json {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((it, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: it.name,
      item: it.url,
    })),
  };
}

/** DefinedTermSet + DefinedTerm for /glossary — one citable definition per term. */
export function definedTermSetLd(terms: { term: string; definition: string }[]): Json {
  return {
    '@context': 'https://schema.org',
    '@type': 'DefinedTermSet',
    '@id': `${SITE_URL}/glossary#glossary`,
    name: 'VIN & Vehicle Title Glossary',
    url: `${SITE_URL}/glossary`,
    hasDefinedTerm: terms.map(({ term, definition }) => ({
      '@type': 'DefinedTerm',
      name: term,
      description: definition,
      inDefinedTermSet: `${SITE_URL}/glossary#glossary`,
    })),
  };
}
