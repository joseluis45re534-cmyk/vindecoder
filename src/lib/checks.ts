// Specialty-check landing pages — one data source drives every /[x]-check /
// /vin-decoder / /license-plate-lookup / /recalls landing page, the hub links,
// the sitemap, and llms.txt. Same source-of-truth pattern as BRANDS.
//
// Every claim here maps to what a CarVinLookup report ACTUALLY pulls (title
// brands from NMVTIS, a theft check, recalls from NHTSA, liens, odometer). The
// report provider does NOT supply NICB data — cite NICB only as the free,
// separate VINCheck tool, never as a source of our report.
// No feature is promised that the product does not deliver.

import { SRC } from '@/lib/sources';

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
  /** 40–70 word direct answer, rendered first — the passage answer engines quote. */
  answer: string;
  /** Extra explainer sections. Real, verifiable guidance only — no invented stats. */
  sections: { h2: string; body: string[] }[];
  /** Authority sources cited on the page. Verify each URL is live before adding. */
  sources: { label: string; href: string }[];
  /** How-to guide slugs (src/lib/how-to.ts) to cross-link. */
  guides: string[];
  /** Other internal resources (problem pages, glossary, hubs). */
  resources: { label: string; href: string }[];
  /** YYYY-MM-DD this page's content was last re-reviewed (defaults to CONTENT_REVISED).
   *  Set it per page so one edit doesn't re-date every page. */
  reviewed?: `${number}-${number}-${number}`;
}



export const CHECK_PAGES: CheckPage[] = [
  {
    slug: 'salvage-check',
    name: 'Salvage title check',
    h1: 'Salvage Title Check',
    metaTitle: 'Salvage Title Check by VIN — Free Preview',
    metaDescription:
      'Run a salvage title check by VIN. See if a car was ever branded salvage, rebuilt, or junk in any state, using NMVTIS data. Free preview, then the full report.',
    icon: 'salvage',
    intro:
      'Find out whether a car was ever declared a total loss and branded salvage — in any state, not just the one on the title.',
    whatItIs:
      'A salvage title check looks for a salvage, rebuilt, or junk brand on a vehicle title. Each state sets its own rules: most brand a title salvage when an insurer declares the car a total loss or when damage exceeds a state-set share of its value, and some states exempt older vehicles. Because sellers sometimes move a car across state lines to wash the brand off the paperwork, a multi-state check via NMVTIS is what actually catches it.',
    reportShows: [
      'Salvage, rebuilt, reconstructed, and junk title brands',
      'The state and, where available, the date a brand was applied',
      'Total-loss events reported by insurers',
      'Flood and other damage brands recorded on the title',
    ],
    steps: [
      { name: 'Enter the VIN', text: 'Type the 17-character VIN into the search box.' },
      { name: 'Confirm the vehicle', text: 'Check the free preview so you know you are pulling the right car.' },
      { name: 'Review the title section', text: 'Unlock the report and read the title/brand section for any salvage history across all 50 states.' },
    ],
    faq: [
      { q: 'Is a salvage check free?', a: 'The identity preview is free. The full salvage and title history is part of the paid report. It checks brands recorded in any state via NMVTIS.' },
      { q: 'Can a salvage title be hidden?', a: 'Sellers sometimes retitle a car in another state to drop the brand — called title washing. A multi-state NMVTIS check is designed to surface it anyway.' },
    ],
    related: ['flood-damage-check', 'accident-check', 'lien-check'],
    answer:
      "To check whether a car has a salvage title, run its 17-character VIN through a history check that searches NMVTIS. NMVTIS collects title brands from state titling agencies plus total-loss and salvage reports from insurers and salvage yards, so a salvage, rebuilt, or junk brand is designed to show up even if the car was later retitled in another state.",
    sections: [
      {
        h2: "Salvage vs. rebuilt vs. junk titles",
        body: [
          "A salvage brand means an insurer or owner declared the car a total loss. In most states a salvage-titled car can't be registered for road use until it is repaired and passes a state inspection.",
          "Once it passes, the state issues a rebuilt (or reconstructed) title: the car is road-legal again, but the brand stays on its record for good. A junk or non-repairable title means the car may only be sold for parts or scrap. Exact brand names and rules vary by state.",
        ],
      },
      {
        h2: "What to do if the report shows a salvage brand",
        body: [
          "Don't walk away automatically, but do change how you buy. Ask for repair records and photos, and have an independent mechanic or body shop check the frame, airbags, and electrical systems before you pay.",
          "Price it accordingly: branded-title cars sell for substantially less than comparable clean-title cars, can be harder to finance, and some insurers limit coverage on them. If the seller told you the title was clean, treat the brand as a serious red flag.",
        ],
      },
    ],
    sources: [SRC.nmvtis, SRC.nmvtisTips, SRC.ftcDealer],
    guides: ['check-title-status', 'read-vin-report'],
    resources: [{ href: "/most-totaled-cars", label: "What makes a car a total loss" }, { href: "/glossary", label: "Salvage, rebuilt & junk titles defined" }, { href: "/auctions", label: "Salvage auction guide" }],
  },
  {
    slug: 'flood-damage-check',
    name: 'Flood damage check',
    h1: 'Flood Damage Check',
    metaTitle: 'Flood Damage Check by VIN — Free Preview',
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
      { name: 'Enter the VIN', text: 'Type the 17-character VIN into the search box.' },
      { name: 'Preview the vehicle', text: 'Confirm the year, make, and model in the free preview.' },
      { name: 'Check for a flood brand', text: 'Unlock the report and review the title section for any flood or water-damage record in any state.' },
    ],
    faq: [
      { q: 'Does the report show flood damage?', a: 'It shows flood and water-damage title brands recorded in NMVTIS. Pair it with a physical inspection, since a privately repaired flood car may not always be branded.' },
      { q: 'Why check for flood damage separately?', a: 'Flood cars are frequently shipped far from the storm and retitled to hide the brand. A multi-state VIN check is the reliable way to catch it.' },
    ],
    related: ['salvage-check', 'accident-check', 'odometer-check'],
    answer:
      "To check a car for flood damage, run its VIN through a history check for flood or water-damage title brands and insurance total-loss records, then inspect the car itself. A flood brand only appears if an insurer or state recorded the damage, so an uninsured flood car can still carry a clean title — the inspection matters as much as the records.",
    sections: [
      {
        h2: "Signs of flood damage to look for",
        body: [
          "Smell first: a musty, mildew odor, or a heavy air freshener masking one, is a classic sign. Pull back carpet edges and look under the seats for silt, sand, or water lines, and check seat-belt webbing, seat rails, and bolts under the dashboard for rust a car of that age shouldn't have.",
          "Test every electrical feature: windows, locks, lights, the infotainment screen, and warning lights. Fog inside the headlights or instrument cluster, and corrosion on exposed wiring connectors, also point to water exposure.",
        ],
      },
      {
        h2: "Why flood cars turn up far from the storm",
        body: [
          "After a major hurricane or flood, damaged cars are often cleaned up and sold in other states, where buyers aren't looking for flood damage. A multi-state title check catches a flood brand recorded anywhere, and the free NICB VINCheck can also flag flood losses reported by participating insurers.",
        ],
      },
    ],
    sources: [SRC.nicb, SRC.nmvtisTips, SRC.ftcUsed],
    guides: ['check-title-status', 'read-vin-report'],
    resources: [{ href: "/most-flooded-cars", label: "How flood cars spread nationwide" }, { href: "/glossary", label: "Flood titles defined" }],
  },
  {
    slug: 'lien-check',
    name: 'Lien check',
    h1: 'Car Lien Check',
    metaTitle: 'Car Lien Check by VIN — Free Preview',
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
      'Title history (the state and date of each title record)',
    ],
    steps: [
      { name: 'Enter the VIN', text: 'Type the 17-character VIN into the search box.' },
      { name: 'Preview the vehicle', text: 'Confirm you have the right car in the free preview.' },
      { name: 'Review the lien section', text: 'Unlock the report and check for any outstanding lien before you pay.' },
    ],
    faq: [
      { q: 'Why does a lien matter to a buyer?', a: 'If a lien is open, the lender may retain rights to the car even after you buy it. Always confirm any lien is released before completing the sale.' },
      { q: 'How do I clear a lien?', a: 'Ask the seller for a lien-release document from the lender, or have the payoff handled at the sale so the title transfers free and clear.' },
    ],
    related: ['salvage-check', 'stolen-vehicle-check', 'accident-check'],
    answer:
      "A lien check shows whether a lender still has a legal claim on a car because a loan secured by it hasn't been paid off. Run the VIN to see recorded liens before you buy: if a lien is open, the seller usually can't transfer a clean title until the loan is paid and the lender releases its interest.",
    sections: [
      {
        h2: "Why an open lien matters",
        body: [
          "Until the loan is paid, the lender is listed on the title as the lienholder. If you pay a seller who still owes money on the car, you may be unable to register it in your name, and the lender may still have a claim on the vehicle.",
        ],
      },
      {
        h2: "How to safely buy a car that still has a loan",
        body: [
          "It's common and safe when done properly. Ask the seller for the lender's name and a payoff quote, then complete the sale at the lender or a bank so the payoff goes directly to the lender. Don't hand over the full price until you have a lien release or a title showing no lienholder.",
          "At a dealership, the dealer normally pays off the previous loan as part of the deal. Confirm it in writing on the purchase contract.",
        ],
      },
    ],
    sources: [SRC.ftcDealer, SRC.ftcUsed],
    guides: ['check-title-status', 'avoid-curbstoner'],
    resources: [{ href: "/glossary", label: "What a lien is" }, { href: "/pricing", label: "Report pricing" }],
  },
  {
    slug: 'accident-check',
    name: 'Accident check',
    h1: 'Accident History Check',
    metaTitle: 'Accident History Check by VIN — Free Preview',
    metaDescription:
      'Check a car accident history by VIN. See reported accidents, total-loss events, and damage records — a clean title does not always mean a clean past.',
    icon: 'accident',
    intro:
      'A clean title does not guarantee a clean past. Check a car reported accident and damage history before you buy.',
    whatItIs:
      'An accident check surfaces reported collisions, damage events, and total-loss records tied to a VIN. Not every fender-bender gets reported, but severe damage — the kind that leads to a total loss or salvage brand — is exactly what a records check is built to catch.',
    reportShows: [
      'Reported accidents and damage events',
      'Total-loss and salvage records reported by insurers and salvage yards (NMVTIS)',
      'Damage details as recorded in each reported accident or total-loss record',
      'Title brands that follow a serious accident',
    ],
    steps: [
      { name: 'Enter the VIN', text: 'Type the 17-character VIN into the search box.' },
      { name: 'Preview the vehicle', text: 'Confirm the car identity in the free preview.' },
      { name: 'Review the history', text: 'Unlock the report and check for reported accidents, damage, and total-loss events.' },
    ],
    faq: [
      { q: 'Will the report show every accident?', a: 'It shows accidents and damage that were reported to records providers. A crash repaired privately and never reported may not appear, so add a physical inspection.' },
      { q: 'Can a car with a clean title have accidents?', a: "Yes. A state brands a title only for specific events, usually an insurance total loss or damage above the state's threshold, so smaller repaired accidents can leave the title clean. That's why you check the history." },
    ],
    related: ['salvage-check', 'flood-damage-check', 'odometer-check'],
    answer:
      "To check a car's accident history, run its VIN through a history report that includes insurance total-loss, salvage, and auction-damage records, then have the car inspected. Reports only show accidents that reached a reporting source — minor damage paid for in cash often never appears — so a clean report is a good sign, not a guarantee.",
    sections: [
      {
        h2: "What an accident check can and can't find",
        body: [
          "Serious accidents tend to leave a trail: an insurer declaring the car a total loss, a salvage brand on the title, or a salvage-auction listing with damage photos. Those are the events a VIN report is best at catching.",
          "Smaller accidents repaired privately, or claims that never reached a reporting database, may not show up anywhere. That's why the FTC recommends an independent inspection by a mechanic you choose, in addition to a history report.",
        ],
      },
      {
        h2: "Physical signs of past accident repairs",
        body: [
          "Look for paint that doesn't quite match between panels, overspray on rubber trim, uneven gaps around the hood, doors, and trunk, and fresh tool marks on fender or hood bolts. Check that the airbag warning light comes on at startup and then turns off. A body shop can measure paint thickness and inspect the frame.",
        ],
      },
    ],
    sources: [SRC.ftcDealer, SRC.nmvtis],
    guides: ['read-vin-report', 'value-used-car'],
    resources: [{ href: "/most-totaled-cars", label: "What makes a car a total loss" }, { href: "/glossary", label: "Total loss and ACV defined" }],
  },
  {
    slug: 'stolen-vehicle-check',
    name: 'Stolen vehicle check',
    h1: 'Stolen Vehicle Check',
    metaTitle: 'Stolen Vehicle Check by VIN — Free Preview',
    metaDescription:
      'Run a stolen vehicle check by VIN. Screen for theft records so you do not buy a stolen car and lose both the vehicle and your money. Free preview, full report.',
    icon: 'stolen',
    intro:
      'Buying a stolen car can cost you both the car and the money you paid. A quick theft check protects you.',
    whatItIs:
      'A stolen vehicle check screens a VIN against theft records. If you unknowingly buy a stolen car, it can be seized and you may lose your payment. Checking theft records and confirming the VIN plates match the title is how buyers avoid that.',
    reportShows: [
      'A theft-risk check for the VIN (a flag from our data provider)',
      'Unrecovered-theft flags where available',
      'Salvage and total-loss events that can accompany theft-recovery',
      "Title history (state and date of each title record) to compare with the seller's paperwork",
    ],
    steps: [
      { name: 'Enter the VIN', text: 'Type the 17-character VIN into the search box.' },
      { name: 'Preview the vehicle', text: 'Confirm the car identity in the free preview.' },
      { name: 'Check theft records', text: 'Unlock the report and review the theft section, and confirm every VIN location matches the title.' },
    ],
    faq: [
      { q: 'Is there a free stolen-car check?', a: 'Yes. The National Insurance Crime Bureau (NICB) runs a free VINCheck that screens for unrecovered theft and salvage reports from participating insurers. A full CarVinLookup report is a separate product that adds NMVTIS title, lien, and odometer history alongside its own theft check.' },
      { q: 'What is VIN cloning?', a: 'Cloning copies a real VIN onto a stolen car. Matching the windshield, door-jamb, and title VINs is how you catch it.' },
    ],
    related: ['lien-check', 'salvage-check', 'accident-check'],
    answer:
      "To check if a car is stolen, run its VIN through a history report's theft check and the free NICB VINCheck, which screens for unrecovered theft reports from participating insurers. Then confirm that the VIN on the dashboard, the driver-side door jamb, and the title all match. If anything looks off, walk away and contact local police.",
    sections: [
      {
        h2: "Watch for VIN cloning",
        body: [
          "Thieves sometimes copy the VIN from a legally registered car of the same model onto a stolen one, so the paperwork appears to check out. Compare the VIN everywhere it appears — dashboard plate, door-jamb label, title, registration, and the history report — and look for tampered rivets, scratched labels, or stickers that look newer than the car.",
        ],
      },
      {
        h2: "Red flags in the deal",
        body: [
          "Be wary of a price far below market, a seller who won't meet at their home, can't produce a title in their own name, or insists on cash. A recovered-theft car can be sold legitimately, but it may be missing parts or hide damage, so inspect it carefully.",
        ],
      },
    ],
    sources: [SRC.nicb, SRC.ftcUsed],
    guides: ['find-stolen-car', 'avoid-curbstoner'],
    resources: [{ href: "/most-stolen-cars", label: "Most stolen cars in the U.S." }, { href: "/glossary", label: "VIN cloning defined" }],
  },
  {
    slug: 'odometer-check',
    name: 'Odometer check',
    h1: 'Odometer Check',
    metaTitle: 'Odometer Rollback Check by VIN — Free Preview',
    metaDescription:
      'Run an odometer check by VIN. Compare reported mileage readings over time and flag rollbacks or tampering before you overpay for a used car.',
    icon: 'odometer',
    intro:
      'Odometer fraud is common and illegal. Check the reported mileage history before you trust the number on the dash.',
    whatItIs:
      'An odometer check lines up the mileage readings reported over time, such as at title transfers and auction sales. Because legitimate readings only ever increase, a later reading that is lower than an earlier one is a strong signal the odometer was rolled back.',
    reportShows: [
      'Reported odometer readings with their dates',
      'Rollback and tampering alerts where a reading dropped',
      'Mileage disclosures recorded at title transfer',
      'Inconsistencies between reported readings',
    ],
    steps: [
      { name: 'Enter the VIN', text: 'Type the 17-character VIN into the search box.' },
      { name: 'Preview the vehicle', text: 'Confirm the car identity in the free preview.' },
      { name: 'Review the odometer trend', text: 'Unlock the report and check that reported readings only ever increase over time.' },
    ],
    faq: [
      { q: 'How does an odometer check catch fraud?', a: 'It gathers reported readings by date. If a newer reading is lower than an older one, the mileage was almost certainly rolled back.' },
      { q: 'Is odometer rollback illegal?', a: 'Yes. Rolling back an odometer is a federal crime, but it still happens on both mechanical and digital dashboards — which is why you check the records.' },
    ],
    related: ['accident-check', 'salvage-check', 'vin-decoder'],
    answer:
      "To check for odometer rollback, compare the car's current mileage with the readings recorded over time in its title and history records — a reading lower than an earlier one is a red flag. Federal law requires sellers to disclose the mileage when ownership changes (for model-year 2011 and newer vehicles until they're 20 years old; older vehicles are exempt), and NHTSA estimates more than 450,000 vehicles are sold each year with false odometer readings.",
    sections: [
      {
        h2: "How odometer fraud works",
        body: [
          "Rolling back an odometer is illegal under federal law, but digital odometers can be reprogrammed with off-the-shelf tools, and NHTSA notes that tampered digital odometers are even harder to detect than old mechanical ones. Rollback pays most on higher-mileage cars, where a lower reading adds the most value.",
        ],
      },
      {
        h2: "Signs the mileage isn't real",
        body: [
          "Compare wear with the miles shown: a worn steering wheel, brake pedal, driver's seat, or shifter on a supposedly low-mileage car doesn't add up. Check oil-change stickers, service and inspection records, and the title for recorded readings.",
          "Federal rules now require a mileage disclosure at each sale for the first 20 years of a vehicle's life, starting with model-year 2011 vehicles — so a newer car with no recorded readings deserves extra scrutiny.",
        ],
      },
    ],
    sources: [SRC.nhtsaOdometer, SRC.nmvtis],
    guides: ['read-vin-report', 'value-used-car'],
    resources: [{ href: "/glossary", label: "Odometer rollback defined" }],
  },
  {
    slug: 'recalls',
    name: 'Recall check',
    h1: 'Recall Check by VIN',
    metaTitle: 'Open Recall Check by VIN — Free Preview',
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
      { name: 'Enter the VIN', text: 'Type the 17-character VIN into the search box.' },
      { name: 'Preview the vehicle', text: 'Confirm the car identity in the free preview.' },
      { name: 'Check for open recalls', text: 'Review the recall section and ask the seller for proof any open recall was repaired.' },
    ],
    faq: [
      { q: 'Are recall repairs free?', a: 'Usually. Manufacturers must provide the safety-recall remedy free of charge, except for vehicles first sold more than 15 years before the recall notice. The risk with a used car is an open recall that was never taken care of.' },
      { q: 'Where does recall data come from?', a: 'Safety recall information originates with the National Highway Traffic Safety Administration (NHTSA), which tracks manufacturer recalls.' },
    ],
    related: ['salvage-check', 'accident-check', 'vin-decoder'],
    answer:
      "To check a car for open safety recalls, enter its 17-character VIN in NHTSA's free recall lookup at nhtsa.gov/recalls, or run it through a history report that includes recall records. Recall repairs are free at an authorized dealer for most vehicles. Except for rental companies with fleets of 35 or more vehicles, which must fix an open recall before renting or selling a car (Safe Rental Car Act), federal law doesn't require used-car sellers to repair open recalls before a sale, so check before you buy.",
    sections: [
      {
        h2: "How recall repairs work",
        body: [
          "When a vehicle has a safety defect, the manufacturer must notify owners and provide a remedy, typically a free repair at an authorized dealer. You don't have to be the original owner: the remedy follows the vehicle, so a used car with an open recall can usually still be fixed at no cost.",
          "NHTSA's VIN lookup covers recalls from the past 15 years and shows only recalls that haven't been repaired yet. Some very recent recalls may not have every VIN loaded, so check again close to purchase.",
        ],
      },
      {
        h2: "Recalls vs. vehicle history",
        body: [
          "A recall is about a design or manufacturing defect shared by many cars. It says nothing about how this particular car was treated, so check the title, accident, and odometer history too.",
        ],
      },
    ],
    sources: [SRC.nhtsaRecalls],
    guides: ['check-vin-number', 'read-vin-report'],
    resources: [{ href: "/glossary", label: "What a recall is" }],
  },
  {
    slug: 'vin-decoder',
    name: 'VIN decoder',
    h1: 'Free VIN Decoder',
    metaTitle: 'Free VIN Decoder — Decode Any 17-Digit VIN',
    metaDescription:
      'Decode any 17-character VIN free. See the make, model, year, body, and engine, then run the full title, lien, and odometer history plus a theft check.',
    icon: 'decoder',
    intro:
      'Every VIN encodes what a car was built as. Decode it free, then check what actually happened to the car.',
    whatItIs:
      'A VIN decoder reads the 17 characters of a Vehicle Identification Number to reveal the manufacturer, model year, and build details defined by federal standard. Decoding tells you what the car should be; a history report tells you what happened to it.',
    reportShows: [
      'Make, manufacturer, and country of origin',
      'Model year',
      'Body, engine, and build details from the VIN',
      'A format check (17 characters, no I, O, or Q) before the lookup',
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
    answer:
      "A VIN decoder translates a car's 17-character Vehicle Identification Number into its factory details: manufacturer, country of origin, model year, body style, engine, and assembly plant. Characters 1–3 identify the manufacturer, 4–8 describe the vehicle, 9 is a check digit, 10 is the model year, 11 is the plant, and 12–17 are the serial number.",
    sections: [
      {
        h2: "How to read a VIN, character by character",
        body: [
          "Positions 1–3 are the World Manufacturer Identifier (WMI). The first character (sometimes two) shows the country the code is registered in — not necessarily where the car was built: 1, 4, or 5 for the United States (some newer U.S. codes start with 7), 2 for Canada, 3 for Mexico, J for Japan, K for South Korea, and W for Germany. Position 11 names the actual assembly plant. Positions 4–8 describe the model, body, and engine. Position 9 is a check digit calculated from the other characters. It catches most typos and some made-up VINs, but a cloned or carefully forged VIN can still pass.",
          "Position 10 is the model year: A was 2010, and the codes run through Y (skipping I, O, Q, U, Z, and 0) before cycling through 1–9 — R is 2024, S is 2025, and T is 2026. Position 11 is the assembly plant, and 12–17 are the production sequence number. The letters I, O, and Q never appear in a VIN.",
        ],
      },
      {
        h2: "Free decode vs. full history",
        body: [
          "Decoding is free: CarVinLookup's preview decodes the VIN instantly, and NHTSA's public vPIC decoder does too. But a decoder can't tell you about salvage brands, accidents, liens, or odometer rollback — those live in title and insurance records, which is what the full report checks.",
        ],
      },
    ],
    sources: [SRC.vpic, SRC.cfr565],
    guides: ['check-vin-number', 'decode-wmi', 'find-motorcycle-vin'],
    resources: [{ href: "/glossary", label: "VIN, WMI, and check digit defined" }, { href: "/vin-check", label: "VIN check by brand" }],
    reviewed: '2026-11-25',
  },
  {
    slug: 'license-plate-lookup',
    name: 'License plate lookup',
    h1: 'License Plate Lookup',
    metaTitle: 'License Plate Lookup — Plate-to-VIN Search',
    metaDescription:
      'Plate-to-VIN search is launching soon for all 50 states. Until then, find the VIN on the windshield, door jamb, title, or registration and run a full check.',
    icon: 'plate',
    intro:
      'Plate-to-VIN search is launching soon. Until then, find the VIN in seconds and run the full history now.',
    whatItIs:
      "A license plate lookup resolves a plate and state to the vehicle and its VIN, which then unlocks the full history report. Personal owner details are protected by the federal Driver's Privacy Protection Act, so a lookup identifies the car — not a stranger's name and address.",
    reportShows: [
      'Vehicle identity — year, make, and model',
      'Plate-to-VIN resolution (launching soon)',
      'Full title, theft, lien, and odometer history from the VIN',
      'Coverage for cars titled in all 50 U.S. states',
    ],
    steps: [
      { name: 'Find the VIN', text: 'Read the 17-character VIN from the windshield, driver-side door jamb, title, or registration.' },
      { name: 'Enter the VIN', text: 'Type it into the search box and confirm the vehicle in the free preview.' },
      { name: 'Run the full report', text: 'Unlock the full history — title brands, theft, liens, and odometer.' },
    ],
    faq: [
      { q: 'Can I get the owner name from a plate?', a: 'No. The Driver Privacy Protection Act restricts personal information. A lookup identifies the vehicle and resolves the VIN, not the owner personal details.' },
      { q: 'When will plate lookup be available?', a: 'Plate-to-VIN search is launching soon for all 50 states. Until then, the VIN gives you exactly the same report — and it is printed on the car itself.' },
    ],
    related: ['vin-decoder', 'stolen-vehicle-check', 'salvage-check'],
    answer:
      "CarVinLookup's license plate lookup, which resolves a U.S. plate and state to the car's VIN, is launching soon. Until then, you can get the VIN straight from the car or its paperwork: it's at the lower-left corner of the windshield, on the driver-side door jamb label, and on the title, registration, and insurance card. Enter it above for the full history.",
    sections: [
      {
        h2: "Why our plate lookup won't show the owner's name",
        body: [
          "The federal Driver's Privacy Protection Act (DPPA) bars state DMVs from releasing personal information in motor-vehicle records, such as names and addresses, except for specific permitted uses like law enforcement, insurance claims, court proceedings, and licensed private investigators. A consumer plate lookup identifies the vehicle (year, make, model, and VIN), not the person. Be wary of any consumer site that promises an owner's identity from a plate.",
        ],
      },
    ],
    sources: [SRC.dppa],
    guides: ['find-license-plate-vin', 'check-vin-number'],
    resources: [{ href: "/vin-decoder", label: "Free VIN decoder" }],
  },
];

export function getCheckPage(slug: string): CheckPage | undefined {
  return CHECK_PAGES.find((c) => c.slug === slug);
}

export function allCheckPages(): CheckPage[] {
  return CHECK_PAGES;
}
