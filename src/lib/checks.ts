// Specialty-check landing pages — one data source drives every /[x]-check /
// /vin-decoder / /license-plate-lookup / /recalls landing page, the hub links,
// the sitemap, and llms.txt. Same source-of-truth pattern as BRANDS.
//
// Every claim here maps to what a CarVinLookup report ACTUALLY pulls (title
// brands from NMVTIS, theft from NICB, recalls from NHTSA, liens, odometer).
// No feature is promised that the product does not deliver.

export type CheckIconKey =
  | 'salvage'
  | 'flood'
  | 'lien'
  | 'accident'
  | 'stolen'
  | 'odometer'
  | 'recall'
  | 'decoder'
  | 'plate';

export interface CheckPage {
  slug: string;
  name: string; // short label
  h1: string;
  metaTitle: string;
  metaDescription: string;
  icon: CheckIconKey;
  intro: string;
  whatItIs: string;
  reportShows: string[];
  steps: { name: string; text: string }[];
  faq: { q: string; a: string }[];
  related: string[];
}

export const CHECK_PAGES: CheckPage[] = [
  {
    slug: 'salvage-check',
    name: 'Salvage title check',
    h1: 'Salvage Title Check',
    metaTitle: 'Free Salvage Title Check by VIN — CarVinLookup',
    metaDescription:
      'Run a salvage title check by VIN. See if a car was ever branded salvage, rebuilt, or junk in any state — sourced from NMVTIS. Free preview, then the full report.',
    icon: 'salvage',
    intro:
      'Find out whether a car was ever declared a total loss and branded salvage — in any state, not just the one on the title.',
    whatItIs:
      'A salvage title check looks for a salvage, rebuilt, or junk brand on a vehicle title. An insurer applies a salvage brand when repair costs exceed a large share of the car value. Because sellers sometimes move a car across state lines to wash the brand off the paperwork, a multi-state check via NMVTIS is what actually catches it.',
    reportShows: [
      'Salvage, rebuilt, reconstructed, and junk title brands',
      'The state and, where available, the date a brand was applied',
      'Total-loss events reported by insurers',
      'Flood and other damage brands recorded on the title',
    ],
    steps: [
      { name: 'Enter the VIN', text: 'Type the 17-character VIN, or a U.S. license plate and state, into the search box.' },
      { name: 'Confirm the vehicle', text: 'Check the free preview so you know you are pulling the right car.' },
      { name: 'Review the title section', text: 'Unlock the report and read the title/brand section for any salvage history across all 50 states.' },
    ],
    faq: [
      { q: 'Is a salvage check free?', a: 'The identity preview is free. The full salvage and title history is part of the paid report. It checks brands recorded in any state via NMVTIS.' },
      { q: 'Can a salvage title be hidden?', a: 'Sellers sometimes retitle a car in another state to drop the brand — called title washing. A multi-state NMVTIS check is designed to surface it anyway.' },
    ],
    related: ['flood-damage-check', 'accident-check', 'lien-check'],
  },
  {
    slug: 'flood-damage-check',
    name: 'Flood damage check',
    h1: 'Flood Damage Check',
    metaTitle: 'Free Flood Damage Check by VIN — CarVinLookup',
    metaDescription:
      'Check a car for flood damage by VIN. See flood and water-damage title brands recorded in any state via NMVTIS. Free preview, then the full history report.',
    icon: 'flood',
    intro:
      'After every major storm, flood cars are dried out and resold across state lines. Check the VIN before the damage becomes your problem.',
    whatItIs:
      'A flood damage check looks for a flood or water-damage title brand and related total-loss events. Flood damage is uniquely dangerous because electrical faults, mold, and corrosion keep surfacing long after a cosmetic clean-up — which is why the records check matters as much as a test drive.',
    reportShows: [
      'Flood and water-damage title brands (NMVTIS)',
      'Salvage or total-loss events tied to flooding',
      'The state where a flood brand was recorded',
      'Other title brands that often accompany flood damage',
    ],
    steps: [
      { name: 'Enter the VIN', text: 'Type the VIN or a U.S. license plate and state into the search box.' },
      { name: 'Preview the vehicle', text: 'Confirm the year, make, and model in the free preview.' },
      { name: 'Check for a flood brand', text: 'Unlock the report and review the title section for any flood or water-damage record in any state.' },
    ],
    faq: [
      { q: 'Does the report show flood damage?', a: 'It shows flood and water-damage title brands recorded in NMVTIS. Pair it with a physical inspection, since a privately repaired flood car may not always be branded.' },
      { q: 'Why check for flood damage separately?', a: 'Flood cars are frequently shipped far from the storm and retitled to hide the brand. A multi-state VIN check is the reliable way to catch it.' },
    ],
    related: ['salvage-check', 'accident-check', 'odometer-check'],
  },
  {
    slug: 'lien-check',
    name: 'Lien check',
    h1: 'Car Lien Check',
    metaTitle: 'Free Car Lien Check by VIN — CarVinLookup',
    metaDescription:
      'Run a lien check by VIN before you buy. See whether a lender still has a claim on a used car so you do not inherit someone else loan. Free preview, full report.',
    icon: 'lien',
    intro:
      'Make sure the car you are buying is not still tied to someone else loan. A lien check protects you from inheriting a debt.',
    whatItIs:
      'A lien is a lender legal claim on a vehicle until a loan is paid off. If you buy a car with an open lien, the lender can still have rights to it — even after you pay the seller. A lien check flags outstanding claims so you can require they be cleared before money changes hands.',
    reportShows: [
      'Reported open liens recorded against the vehicle',
      'Lienholder information where available',
      'Title records that indicate a loan was not released',
      'Related title and ownership history',
    ],
    steps: [
      { name: 'Enter the VIN', text: 'Type the VIN or a U.S. license plate and state.' },
      { name: 'Preview the vehicle', text: 'Confirm you have the right car in the free preview.' },
      { name: 'Review the lien section', text: 'Unlock the report and check for any outstanding lien before you pay.' },
    ],
    faq: [
      { q: 'Why does a lien matter to a buyer?', a: 'If a lien is open, the lender may retain rights to the car even after you buy it. Always confirm any lien is released before completing the sale.' },
      { q: 'How do I clear a lien?', a: 'Ask the seller for a lien-release document from the lender, or have the payoff handled at the sale so the title transfers free and clear.' },
    ],
    related: ['salvage-check', 'stolen-vehicle-check', 'accident-check'],
  },
  {
    slug: 'accident-check',
    name: 'Accident check',
    h1: 'Accident History Check',
    metaTitle: 'Free Accident History Check by VIN — CarVinLookup',
    metaDescription:
      'Check a car accident history by VIN. See reported accidents, total-loss events, and damage records — a clean title does not always mean a clean past.',
    icon: 'accident',
    intro:
      'A clean title does not guarantee a clean past. Check a car reported accident and damage history before you buy.',
    whatItIs:
      'An accident check surfaces reported collisions, damage events, and total-loss records tied to a VIN. Not every fender-bender gets reported, but severe damage — the kind that leads to a total loss or salvage brand — is exactly what a records check is built to catch.',
    reportShows: [
      'Reported accidents and damage events',
      'Total-loss and salvage records (NMVTIS, NICB)',
      'Airbag deployment and structural damage where reported',
      'Title brands that follow a serious accident',
    ],
    steps: [
      { name: 'Enter the VIN', text: 'Type the VIN or a U.S. license plate and state.' },
      { name: 'Preview the vehicle', text: 'Confirm the car identity in the free preview.' },
      { name: 'Review the history', text: 'Unlock the report and check for reported accidents, damage, and total-loss events.' },
    ],
    faq: [
      { q: 'Will the report show every accident?', a: 'It shows accidents and damage that were reported to records providers. A crash repaired privately and never reported may not appear, so add a physical inspection.' },
      { q: 'Can a car with a clean title have accidents?', a: 'Yes. A title is only branded when an insurer declares a total loss. Smaller repaired accidents can leave the title clean, which is why you check the history.' },
    ],
    related: ['salvage-check', 'flood-damage-check', 'odometer-check'],
  },
  {
    slug: 'stolen-vehicle-check',
    name: 'Stolen vehicle check',
    h1: 'Stolen Vehicle Check',
    metaTitle: 'Free Stolen Vehicle Check by VIN — CarVinLookup',
    metaDescription:
      'Run a stolen vehicle check by VIN. Screen for theft records so you do not buy a stolen car and lose both the vehicle and your money. Free preview, full report.',
    icon: 'stolen',
    intro:
      'Buying a stolen car can cost you both the car and the money you paid. A quick theft check protects you.',
    whatItIs:
      'A stolen vehicle check screens a VIN against theft records. If you unknowingly buy a stolen car, it can be seized and you may lose your payment. Checking theft records and confirming the VIN plates match the title is how buyers avoid that.',
    reportShows: [
      'Theft records reported to the National Insurance Crime Bureau (NICB)',
      'Unrecovered-theft flags where available',
      'Salvage and total-loss events that can accompany theft-recovery',
      'Title and ownership history to cross-check the seller',
    ],
    steps: [
      { name: 'Enter the VIN', text: 'Type the VIN or a U.S. license plate and state.' },
      { name: 'Preview the vehicle', text: 'Confirm the car identity in the free preview.' },
      { name: 'Check theft records', text: 'Unlock the report and review the theft section, and confirm every VIN location matches the title.' },
    ],
    faq: [
      { q: 'Is there a free stolen-car check?', a: 'The NICB offers a free VINCheck for theft and salvage records. A full CarVinLookup report adds title, lien, and odometer history alongside theft data.' },
      { q: 'What is VIN cloning?', a: 'Cloning copies a real VIN onto a stolen car. Matching the windshield, door-jamb, and title VINs is how you catch it.' },
    ],
    related: ['lien-check', 'salvage-check', 'accident-check'],
  },
  {
    slug: 'odometer-check',
    name: 'Odometer check',
    h1: 'Odometer Check',
    metaTitle: 'Free Odometer Check by VIN — CarVinLookup',
    metaDescription:
      'Run an odometer check by VIN. Compare reported mileage readings over time and flag rollbacks or tampering before you overpay for a used car.',
    icon: 'odometer',
    intro:
      'Odometer fraud is common and illegal. Check the reported mileage history before you trust the number on the dash.',
    whatItIs:
      'An odometer check lines up reported mileage readings from title transfers, service records, and inspections. Because legitimate readings only ever increase, a later reading that is lower than an earlier one is a strong signal the odometer was rolled back.',
    reportShows: [
      'Reported odometer readings with their dates',
      'Rollback and tampering alerts where a reading dropped',
      'Mileage disclosures recorded at title transfer',
      'Inconsistencies between reported readings',
    ],
    steps: [
      { name: 'Enter the VIN', text: 'Type the VIN or a U.S. license plate and state.' },
      { name: 'Preview the vehicle', text: 'Confirm the car identity in the free preview.' },
      { name: 'Review the odometer trend', text: 'Unlock the report and check that reported readings only ever increase over time.' },
    ],
    faq: [
      { q: 'How does an odometer check catch fraud?', a: 'It gathers reported readings by date. If a newer reading is lower than an older one, the mileage was almost certainly rolled back.' },
      { q: 'Is odometer rollback illegal?', a: 'Yes. Rolling back an odometer is a federal crime, but it still happens on both mechanical and digital dashboards — which is why you check the records.' },
    ],
    related: ['accident-check', 'salvage-check', 'vin-decoder'],
  },
  {
    slug: 'recalls',
    name: 'Recall check',
    h1: 'Recall Check by VIN',
    metaTitle: 'Free Recall Check by VIN — CarVinLookup',
    metaDescription:
      'Check open safety recalls by VIN. See NHTSA recall records so you can confirm a used car was repaired before you buy. Free preview, then the full report.',
    icon: 'recall',
    intro:
      'Open safety recalls are free to fix — but only if you know about them. Check a VIN for outstanding recalls before you buy.',
    whatItIs:
      'A recall check looks for open safety recalls issued for a vehicle. Manufacturers must repair safety recalls at no charge, but an unrepaired recall on a used car is a safety risk you inherit. Recall data comes from the National Highway Traffic Safety Administration (NHTSA).',
    reportShows: [
      'Open safety recalls flagged for the vehicle',
      'The nature of the recall where available',
      'A prompt to confirm the repair was completed',
      'Full vehicle identity to match the recall to the car',
    ],
    steps: [
      { name: 'Enter the VIN', text: 'Type the VIN or a U.S. license plate and state.' },
      { name: 'Preview the vehicle', text: 'Confirm the car identity in the free preview.' },
      { name: 'Check for open recalls', text: 'Review the recall section and ask the seller for proof any open recall was repaired.' },
    ],
    faq: [
      { q: 'Are recall repairs free?', a: 'Yes. Manufacturers must fix safety recalls at no charge. The risk with a used car is an open recall that was never taken care of.' },
      { q: 'Where does recall data come from?', a: 'Safety recall information originates with the National Highway Traffic Safety Administration (NHTSA), which tracks manufacturer recalls.' },
    ],
    related: ['salvage-check', 'accident-check', 'vin-decoder'],
  },
  {
    slug: 'vin-decoder',
    name: 'VIN decoder',
    h1: 'Free VIN Decoder',
    metaTitle: 'Free VIN Decoder — Decode Any VIN — CarVinLookup',
    metaDescription:
      'Decode any 17-character VIN free. See the make, model, year, plant, and engine encoded in the VIN, then run the full title, theft, lien, and odometer history.',
    icon: 'decoder',
    intro:
      'Every VIN encodes what a car was built as. Decode it free, then check what actually happened to the car.',
    whatItIs:
      'A VIN decoder reads the 17 characters of a Vehicle Identification Number to reveal the manufacturer, model year, plant, and build details defined by federal standard. Decoding tells you what the car should be; a history report tells you what happened to it.',
    reportShows: [
      'Make, manufacturer, and country of origin (WMI)',
      'Model year and assembly plant',
      'Body, engine, and build details from the VIN',
      'A check-digit validation to catch typos and fake VINs',
    ],
    steps: [
      { name: 'Enter the VIN', text: 'Type the 17-character VIN into the search box.' },
      { name: 'See the decoded identity', text: 'Review the make, model, year, and build details in the free preview.' },
      { name: 'Run the full history', text: 'Unlock title brands, theft, liens, and odometer history to complete the picture.' },
    ],
    faq: [
      { q: 'Is the VIN decoder free?', a: 'Yes. Decoding the VIN identity — make, model, year, and validation — is free. The full history report is a paid unlock.' },
      { q: 'What can a VIN decoder not tell me?', a: 'It cannot tell you what happened to the car — salvage titles, accidents, and odometer rollbacks live in title and records data, not the VIN itself.' },
    ],
    related: ['odometer-check', 'salvage-check', 'license-plate-lookup'],
  },
  {
    slug: 'license-plate-lookup',
    name: 'License plate lookup',
    h1: 'License Plate Lookup',
    metaTitle: 'License Plate Lookup — Find a Car by Plate — CarVinLookup',
    metaDescription:
      'Look up a car by U.S. license plate. Resolve a plate and state to the VIN, then run the full title, theft, lien, and odometer history in all 50 states.',
    icon: 'plate',
    intro:
      'Only have the plate? Resolve it to the VIN and run the full history — in all 50 states.',
    whatItIs:
      'A license plate lookup resolves a plate and state to the vehicle identity and its VIN, which then unlocks the full history report. Personal owner details are protected by the federal Driver Privacy Protection Act, so a lookup identifies the car — not a stranger name and address.',
    reportShows: [
      'Vehicle identity — year, make, and model',
      'The VIN resolved from the plate',
      'Full title, theft, lien, and odometer history once unlocked',
      'Coverage across all 50 U.S. states',
    ],
    steps: [
      { name: 'Enter the plate and state', text: 'Type the U.S. license plate and select the state.' },
      { name: 'Confirm the vehicle', text: 'Review the resolved identity and VIN in the free preview.' },
      { name: 'Run the full report', text: 'Unlock the full history — title brands, theft, liens, and odometer.' },
    ],
    faq: [
      { q: 'Can I get the owner name from a plate?', a: 'No. The Driver Privacy Protection Act restricts personal information. A lookup identifies the vehicle and resolves the VIN, not the owner personal details.' },
      { q: 'Does plate lookup work in every state?', a: 'CarVinLookup supports plate-to-VIN lookups across all 50 U.S. states.' },
    ],
    related: ['vin-decoder', 'stolen-vehicle-check', 'salvage-check'],
  },
];

export function getCheckPage(slug: string): CheckPage | undefined {
  return CHECK_PAGES.find((c) => c.slug === slug);
}

export function allCheckPages(): CheckPage[] {
  return CHECK_PAGES;
}
