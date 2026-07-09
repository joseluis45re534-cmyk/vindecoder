// Educational "problem" pages (/most-totaled-cars, /most-flooded-cars,
// /worst-cars-to-buy). These mirror the market's /problems tree, but because
// there is no authoritative public per-model ranking for these categories, they
// are written as EDUCATIONAL explainers — no fabricated model lists — funneling
// to the relevant check. (/most-stolen-cars is its own page with NICB citations.)

export interface ProblemSection {
  h2: string;
  paragraphs: string[];
  bullets?: string[];
}

export interface ProblemPage {
  slug: string;
  name: string;
  metaTitle: string;
  metaDescription: string;
  intro: string;
  sections: ProblemSection[];
  faq: { q: string; a: string }[];
  cta: { href: string; label: string };
}

export const PROBLEM_PAGES: ProblemPage[] = [
  {
    slug: 'most-totaled-cars',
    name: 'Most totaled cars',
    metaTitle: 'What Makes a Car a Total Loss? — CarVinLookup',
    metaDescription:
      'What it means when a car is "totaled," which vehicles are written off most easily, and how to check if a used car was ever declared a total loss by VIN.',
    intro:
      'A "totaled" car is one an insurer declared a total loss. Here is what pushes a car over that line, which vehicles reach it most easily, and how to check a used car before you buy.',
    sections: [
      {
        h2: 'What "totaled" actually means',
        paragraphs: [
          'A vehicle is totaled when the cost to repair it exceeds a threshold set by the insurer or the state — often a large percentage of the car\'s actual cash value (ACV). At that point the insurer pays out the value instead of repairing the car, and a salvage title is issued.',
          'That threshold is why the same damage can total one car and not another: a dented door is a cheap fix on a new SUV but can exceed the value of an older economy car.',
        ],
      },
      {
        h2: 'Which cars get totaled most easily',
        paragraphs: ['Rather than a fixed list of models, a few factors make a total loss more likely:'],
        bullets: [
          'Older, lower-value cars — a modest repair bill quickly exceeds the car\'s worth.',
          'Expensive-to-repair vehicles — luxury models and some EVs with costly parts or battery packs.',
          'High-theft models — theft and recovery damage can push a car to a total loss.',
          'Flood- and storm-exposed cars — water damage is frequently uneconomical to repair.',
        ],
      },
      {
        h2: 'How to check before you buy',
        paragraphs: [
          'A total loss leaves a record. Run the VIN and review the title and accident sections for a salvage brand or total-loss event — in any state, since cars are often retitled across state lines to hide it.',
        ],
      },
    ],
    faq: [
      { q: 'Can you buy a totaled car?', a: 'Yes — once repaired and re-inspected it may receive a rebuilt title. But you should know it was totaled, why, and pay accordingly. Financing and insurance are often harder.' },
      { q: 'Does a totaled car always have a salvage title?', a: 'A total loss typically results in a salvage brand. If a "clean" title contradicts a total-loss record in the report, that is a red flag for title washing.' },
    ],
    cta: { href: '/accident-check', label: 'Run an accident & total-loss check' },
  },
  {
    slug: 'most-flooded-cars',
    name: 'Most flooded cars',
    metaTitle: 'Flood Cars: Where They Come From & How to Avoid One',
    metaDescription:
      'After major storms, flood-damaged cars are cleaned up and resold nationwide. Learn how flood cars spread, the warning signs, and how to check a VIN for flood damage.',
    intro:
      'After every major storm, tens of thousands of flood-damaged cars are dried out and resold — often far from where they flooded. Here is how they spread and how to avoid buying one.',
    sections: [
      {
        h2: 'Why flood cars end up everywhere',
        paragraphs: [
          'Flooding is regional, but flood cars are national. After a hurricane or major flood, damaged vehicles are bought cheap, cosmetically cleaned, and shipped to states far from the disaster where buyers are not expecting them.',
          'Some are retitled along the way to wash a flood brand off the paperwork — which is exactly why a multi-state VIN check matters.',
        ],
      },
      {
        h2: 'Which cars are most at risk',
        paragraphs: ['Any vehicle in a flood zone can be affected, but risk concentrates around:'],
        bullets: [
          'Cars sold shortly after a major hurricane or flooding event.',
          'Vehicles transported from flood-affected states to dry ones.',
          'Deals that look too cheap for the model and condition.',
          'Cars with a musty smell masked by heavy air freshener.',
        ],
      },
      {
        h2: 'How to check for flood damage',
        paragraphs: [
          'Combine a physical inspection (hidden moisture, corrosion, silt, electrical faults) with a VIN history check for a flood or water-damage title brand recorded in any state.',
        ],
      },
    ],
    faq: [
      { q: 'Why is flood damage so dangerous?', a: 'Water causes electrical faults, mold, and corrosion that keep surfacing months or years after a cosmetic clean-up. It is the one problem that tends to get worse after you buy.' },
      { q: 'Will a report always show flood damage?', a: 'It shows flood and water-damage title brands recorded in NMVTIS. Because a privately repaired flood car may not always be branded, pair the report with a hands-on inspection.' },
    ],
    cta: { href: '/flood-damage-check', label: 'Run a flood damage check' },
  },
  {
    slug: 'worst-cars-to-buy',
    name: 'Worst cars to buy',
    metaTitle: 'Red Flags That Make Any Used Car a Bad Buy',
    metaDescription:
      'The worst used-car buy is not a specific model — it is any car hiding a branded title, flood damage, theft record, or odometer fraud. Learn the red flags and how to check.',
    intro:
      'The worst used car to buy is not a particular model — it is any car hiding a serious problem the seller did not disclose. Here are the red flags that make any car a bad buy, and how to catch them.',
    sections: [
      {
        h2: 'It is about the history, not the badge',
        paragraphs: [
          'A well-maintained example of almost any model can be a good buy, and a neglected or damaged example of a great model can be a money pit. The deciding factor is the individual car\'s history — which is exactly what a VIN check reveals.',
        ],
      },
      {
        h2: 'Red flags that make any car a bad buy',
        paragraphs: ['Walk away, or dig much deeper, when you see:'],
        bullets: [
          'A branded title — salvage, rebuilt, junk, or flood.',
          'A total-loss or serious accident record you cannot fully verify.',
          'An odometer reading that does not match the reported history.',
          'A theft record, or VIN plates that do not match across the car.',
          'Open safety recalls the seller cannot prove were fixed.',
          'A seller whose name does not match the title, or who rushes a cash sale.',
        ],
      },
      {
        h2: 'How to avoid the worst buys',
        paragraphs: [
          'Run the VIN, compare it against the paperwork, and get a pre-purchase inspection. A few dollars and a few minutes up front is the cheapest protection against an expensive mistake.',
        ],
      },
    ],
    faq: [
      { q: 'What is the single worst used-car red flag?', a: 'A branded title that the seller did not disclose. A salvage, flood, or junk brand affects safety, insurance, financing, and resale all at once.' },
      { q: 'How do I avoid buying a bad used car?', a: 'Check the VIN history, verify the title matches the car and seller, and get an independent pre-purchase inspection before you pay.' },
    ],
    cta: { href: '/salvage-check', label: 'Run a title & salvage check' },
  },
];

export function getProblemPage(slug: string): ProblemPage | undefined {
  return PROBLEM_PAGES.find((p) => p.slug === slug);
}
