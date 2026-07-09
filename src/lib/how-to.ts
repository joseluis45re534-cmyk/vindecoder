// How-to guides — step-by-step instructional content, mirrored (as original
// copy) from the market's /how-to/* tree. One data source drives the /how-to
// hub, every /how-to/[slug] page, the sitemap, and llms.txt — same
// source-of-truth pattern as BRANDS and DEMO_POSTS. Each guide's `steps` feed
// BOTH the visible ordered list AND the HowTo JSON-LD, so they can never drift.
//
// Topics already covered as editorial posts in blog.ts (odometer rollback,
// buying a salvage car, accident history, flood damage, salvage vs. rebuilt)
// are intentionally NOT duplicated here — the guides cross-link to them instead
// to avoid keyword cannibalization.

export interface HowToStep {
  name: string;
  text: string;
}

export interface HowToGuide {
  slug: string;
  title: string; // H1 + <title>
  description: string; // meta description (~150 chars)
  keyword: string;
  category: 'VIN basics' | 'Buying safely' | 'Fraud & red flags' | 'Reports & records';
  readingMinutes: number;
  totalTime?: string; // ISO 8601 duration for HowTo schema
  intro: string;
  takeaways: string[];
  steps: HowToStep[];
  faq: { q: string; a: string }[];
  related: string[]; // other how-to slugs
}

export const HOW_TO_GUIDES: HowToGuide[] = [
  {
    slug: 'check-vin-number',
    title: 'How to Check a VIN Number: A Step-by-Step Guide',
    description:
      'Checking a VIN takes about a minute and can save you thousands. Learn where to find the VIN, how to validate it, and how to pull a full vehicle history.',
    keyword: 'how to check a VIN number',
    category: 'VIN basics',
    readingMinutes: 4,
    totalTime: 'PT2M',
    intro:
      'A VIN check is the fastest way to confirm a used car is what the seller claims. Here is exactly how to find, validate, and check any 17-character VIN.',
    takeaways: [
      'A VIN is 17 characters and never contains the letters I, O, or Q.',
      'You can check a VIN in about a minute — the free preview confirms the car identity before you pay.',
      'A history report checks title brands, theft, liens, and odometer across all 50 states, not just the one on the title.',
    ],
    steps: [
      { name: 'Find the VIN', text: 'Look at the lower-left corner of the windshield, the driver-side door jamb sticker, and the title or registration. All three should match.' },
      { name: 'Confirm it is valid', text: 'A real VIN is exactly 17 characters and uses no I, O, or Q. If it is shorter, it is likely a pre-1981 vehicle with a different format.' },
      { name: 'Enter the VIN for a free preview', text: 'Type the VIN (or a U.S. license plate and state) into the search box to confirm the year, make, and model at no cost.' },
      { name: 'Unlock the full history report', text: 'Review title brands, theft records, liens, and odometer readings sourced from NMVTIS, NICB, and state DMVs.' },
      { name: 'Compare against the paperwork', text: 'If the report shows a brand or odometer problem the seller did not disclose, you have your answer before spending a dollar more.' },
    ],
    faq: [
      { q: 'Is a VIN check free?', a: 'The identity preview — year, make, model, and VIN validation — is free. The full history report (title brands, theft, liens, odometer) is a paid unlock.' },
      { q: 'What if the VIN is not 17 characters?', a: 'Vehicles built before 1981 used shorter, non-standard VINs. Modern U.S. vehicles are always 17 characters; a short or malformed VIN on a newer car is a red flag.' },
      { q: 'Can I check by license plate instead?', a: 'Yes. Enter a U.S. license plate and state and it resolves to the VIN, then pulls the same report.' },
    ],
    related: ['decode-wmi', 'read-vin-report', 'check-title-status'],
  },
  {
    slug: 'read-vin-report',
    title: 'How to Read a Vehicle History Report',
    description:
      'A vehicle history report has five sections that matter. Learn how to read the title, odometer, theft, lien, and recall data and spot the red flags.',
    keyword: 'how to read a vehicle history report',
    category: 'Reports & records',
    readingMinutes: 5,
    totalTime: 'PT5M',
    intro:
      'A report is only useful if you know which sections to trust and what to compare. Here is how to read one section by section.',
    takeaways: [
      'Read the title section first — any brand changes the price you should pay.',
      'Odometer readings should only ever increase over time; a later, lower number means a rollback.',
      'Cross-check every section against the seller paperwork before you decide.',
    ],
    steps: [
      { name: 'Start with the title section', text: 'Look for any brand — salvage, rebuilt, junk, or flood. A branded title is the single biggest hit to value and safety.' },
      { name: 'Follow the odometer trend', text: 'Put the reported readings in date order. They should climb steadily. A drop between two dates signals tampering.' },
      { name: 'Check theft and total-loss records', text: 'A theft or total-loss event means the car may hide structural damage even if it looks clean now.' },
      { name: 'Review liens', text: 'An open lien means a lender still has a claim. Confirm it is released before money changes hands.' },
      { name: 'Confirm recalls are closed', text: 'Note any open safety recalls and ask the seller for proof the repairs were completed.' },
    ],
    faq: [
      { q: 'Does a clean report guarantee no accidents?', a: 'No. A report shows what was reported to records providers. A crash repaired privately and never reported may not appear — always add a physical inspection.' },
      { q: 'What is the most important section?', a: 'The title/brand section. A salvage or flood brand affects safety, insurability, financing, and resale all at once.' },
    ],
    related: ['check-title-status', 'check-vin-number', 'find-stolen-car'],
  },
  {
    slug: 'decode-wmi',
    title: 'How to Decode a WMI (World Manufacturer Identifier)',
    description:
      'The first three characters of a VIN are the WMI. Learn how to decode the region and manufacturer from a VIN and what the WMI can and cannot tell you.',
    keyword: 'decode WMI',
    category: 'VIN basics',
    readingMinutes: 4,
    totalTime: 'PT3M',
    intro:
      'The World Manufacturer Identifier is the first three characters of every VIN. Decoding it tells you where a car was made and by whom.',
    takeaways: [
      'Characters 1–3 of a VIN are the WMI: region, country, and manufacturer.',
      'The first character alone tells you the region — 1, 4, and 5 are the United States.',
      'The WMI confirms origin but not history — pair it with a full report.',
    ],
    steps: [
      { name: 'Isolate the first three characters', text: 'Write out the VIN and separate positions 1, 2, and 3 — that block is the WMI.' },
      { name: 'Read the region from character 1', text: '1, 4, and 5 = United States; 2 = Canada; 3 = Mexico; J = Japan; K = Korea; S–Z = Europe.' },
      { name: 'Identify the manufacturer', text: 'Characters 2 and 3 narrow it to a specific maker (for example, 1HG = Honda built in the USA).' },
      { name: 'Cross-check the badge', text: 'If the WMI says one manufacturer and the badges say another, treat it as a serious red flag for a cloned VIN.' },
    ],
    faq: [
      { q: 'Can the WMI tell me the model?', a: 'No. The WMI only identifies region and manufacturer. Model, body, and engine live in positions 4–8 (the Vehicle Descriptor Section).' },
      { q: 'Why do some makers have several WMIs?', a: 'Large manufacturers use different WMIs per country and plant, so the same brand can start with different three-character codes.' },
    ],
    related: ['check-vin-number', 'read-vin-report', 'find-motorcycle-vin'],
  },
  {
    slug: 'find-license-plate-vin',
    title: 'How to Find a VIN from a License Plate',
    description:
      'You can resolve a license plate to a VIN with a plate lookup. Learn how it works, what privacy law limits, and how to run the full history from there.',
    keyword: 'find VIN from license plate',
    category: 'VIN basics',
    readingMinutes: 4,
    totalTime: 'PT2M',
    intro:
      'When a listing only shows a plate, you can still get to the VIN — and from there, the full history. Here is how.',
    takeaways: [
      'A license plate plus the state can be resolved to the vehicle VIN.',
      'Owner personal details are protected by the federal Driver Privacy Protection Act (DPPA).',
      'Once you have the VIN, you can pull title, theft, lien, and odometer history.',
    ],
    steps: [
      { name: 'Note the plate and state', text: 'You need both — plates are only unique within a state.' },
      { name: 'Run a plate-to-VIN lookup', text: 'Enter the plate and state to resolve the vehicle identity and its VIN.' },
      { name: 'Verify the identity', text: 'Confirm the returned year, make, and model match the listing before going further.' },
      { name: 'Pull the full history', text: 'Use the VIN to run the report — title brands, theft, liens, and odometer.' },
    ],
    faq: [
      { q: 'Can I get the owner name from a plate?', a: 'No. The DPPA restricts access to personal information tied to a motor-vehicle record. Any service promising an owner name and address to a random buyer is a red flag.' },
      { q: 'Does a plate lookup work in every state?', a: 'Coverage varies, but a plate and state can generally resolve to the VIN, which is what you need for a history report.' },
    ],
    related: ['check-vin-number', 'read-vin-report', 'avoid-curbstoner'],
  },
  {
    slug: 'value-used-car',
    title: 'How to Value a Used Car Before You Buy',
    description:
      'Learn how to value a used car step by step — from book values to condition and history adjustments — so you never overpay for a branded or high-risk vehicle.',
    keyword: 'how to value a used car',
    category: 'Buying safely',
    readingMinutes: 5,
    intro:
      'A fair price starts with a fair valuation. Here is how to build one from public data and the car actual history.',
    takeaways: [
      'Start from published book values, then adjust for real condition and history.',
      'A branded title (salvage, rebuilt, flood) can cut value 20–50%.',
      'A history report gives you documented leverage to negotiate.',
    ],
    steps: [
      { name: 'Gather the details', text: 'Note the VIN, exact trim, mileage, options, and honest condition — these drive every valuation tool.' },
      { name: 'Check published book values', text: 'Compare estimates from major valuation guides for the same year, trim, and mileage to get a baseline range.' },
      { name: 'Adjust for history', text: 'Run the VIN. Subtract for any title brand, accident, or odometer discrepancy — these materially lower a fair price.' },
      { name: 'Compare local listings', text: 'Look at what the same model actually sells for in your area, not just national averages.' },
      { name: 'Factor in needed repairs', text: 'Deduct the cost of tires, brakes, or deferred maintenance the car needs now.' },
    ],
    faq: [
      { q: 'How much does a salvage title lower value?', a: 'Commonly 20–50% versus a clean-title equivalent, and it also limits financing and insurance. See our guide on salvage vs. rebuilt titles.' },
      { q: 'Do valuation tools account for accidents?', a: 'Not automatically. You have to adjust for reported accidents and brands yourself — which is why you pull the history first.' },
    ],
    related: ['negotiate-used-car-price', 'check-title-status', 'avoid-curbstoner'],
  },
  {
    slug: 'avoid-curbstoner',
    title: 'How to Avoid Curbstoners When Buying a Used Car',
    description:
      'Curbstoners are unlicensed dealers posing as private sellers, often flipping salvage or flood cars. Learn the warning signs and how to check before you buy.',
    keyword: 'avoid curbstoners',
    category: 'Fraud & red flags',
    readingMinutes: 5,
    intro:
      'A curbstoner is an unlicensed dealer posing as a private seller — frequently to offload branded, flood, or odometer-rolled cars. Here is how to spot and avoid them.',
    takeaways: [
      'Curbstoners pose as private sellers to dodge dealer disclosure laws.',
      'The biggest tell: the name on the title does not match the person selling the car.',
      'A VIN report exposes the hidden brands curbstoners rely on you not checking.',
    ],
    steps: [
      { name: 'Check the title name', text: 'Ask to see the title. If the seller name does not match the title, walk away — that is the classic curbstoner sign.' },
      { name: 'Search the phone number', text: 'Paste the listing phone number into a search engine. Curbstoners often run many listings under one number.' },
      { name: 'Meet at their home', text: 'Insist on meeting where the car is kept. A parking-lot-only meetup is a warning.' },
      { name: 'Run the VIN', text: 'Pull the history for salvage, flood, or odometer issues the seller is counting on you to miss.' },
      { name: 'Resist pressure', text: 'Cash-only, today-only urgency is a tactic. A legitimate private seller can wait for an inspection.' },
    ],
    faq: [
      { q: 'Why are curbstoners dangerous?', a: 'They skip the disclosures a licensed dealer must make, so branded, flood, or unsafe cars get sold as clean private-party vehicles.' },
      { q: 'Is curbstoning illegal?', a: 'Selling cars for profit without a dealer license is illegal in most states. It is also a strong signal the car history is being hidden.' },
    ],
    related: ['value-used-car', 'check-title-status', 'find-stolen-car'],
  },
  {
    slug: 'find-stolen-car',
    title: 'How to Check if a Car Is Stolen',
    description:
      'Buying a stolen car can mean losing both the car and your money. Learn how to check a VIN for theft records, verify the VIN plates, and confirm the seller.',
    keyword: 'check if a car is stolen',
    category: 'Fraud & red flags',
    readingMinutes: 4,
    totalTime: 'PT3M',
    intro:
      'If you unknowingly buy a stolen car, you can lose both the car and the money. A few checks up front prevent it.',
    takeaways: [
      'The NICB offers a free VINCheck for theft and salvage records.',
      'Confirm the VIN on the dash, door jamb, and title all match.',
      'A mismatch between the seller ID and the title is a major red flag.',
    ],
    steps: [
      { name: 'Run the free NICB VINCheck', text: 'Use the National Insurance Crime Bureau free VINCheck tool to screen for theft and unrecovered-theft records.' },
      { name: 'Check the full history report', text: 'A report flags theft records alongside title brands and total-loss events.' },
      { name: 'Verify the VIN plates match', text: 'Compare the windshield VIN, the door-jamb sticker, and the title. Any mismatch suggests a cloned or altered VIN.' },
      { name: 'Confirm the seller and title', text: 'The seller ID should match the title. Be wary of a rushed, cash-only sale with no paperwork.' },
      { name: 'Report suspicions', text: 'If something is off, do not buy. Report a suspected stolen vehicle to local law enforcement.' },
    ],
    faq: [
      { q: 'Is checking if a car is stolen free?', a: 'The NICB VINCheck is free and screens for theft and salvage records. A full history report adds title, lien, and odometer data.' },
      { q: 'What is VIN cloning?', a: 'Cloning copies a legitimate VIN from one car onto a stolen one. Matching every VIN location against the title is how you catch it.' },
    ],
    related: ['read-vin-report', 'check-vin-number', 'avoid-curbstoner'],
  },
  {
    slug: 'read-carfax-report',
    title: 'How to Read a Carfax Report (and What to Watch For)',
    description:
      'Learn how to read a vehicle history report section by section, what the common icons and events mean, and the limits every history report shares.',
    keyword: 'how to read a Carfax report',
    category: 'Reports & records',
    readingMinutes: 5,
    intro:
      'Whichever provider you use, a history report follows the same logic. Here is how to read the sections and understand their limits.',
    takeaways: [
      'Every history report is built from title, registration, and event records — not a live inspection.',
      'Focus on title brands, ownership timeline, reported accidents, and odometer readings.',
      'No single provider sees everything — cross-checking sources catches more.',
    ],
    steps: [
      { name: 'Read the title and brand summary', text: 'Confirm whether any salvage, rebuilt, junk, or flood brand was ever applied in any state.' },
      { name: 'Review the ownership timeline', text: 'Many owners in a short time, or a quick flip after purchase, can signal a problem car.' },
      { name: 'Scan reported accidents and damage', text: 'Note severity and location, and remember minor unreported repairs may not appear.' },
      { name: 'Trace the odometer readings', text: 'Confirm the mileage only ever increases across recorded dates.' },
      { name: 'Cross-check with a second source', text: 'Because providers draw on different data, a second report can surface events the first missed.' },
    ],
    faq: [
      { q: 'Do all history reports show the same data?', a: 'No. Providers license different data sets, so coverage varies. Running more than one source, and adding a physical inspection, gives the fullest picture.' },
      { q: 'Can a report miss an accident?', a: 'Yes. Only reported events appear. A crash repaired privately and never reported to any provider can be invisible on paper.' },
    ],
    related: ['read-vin-report', 'check-title-status', 'value-used-car'],
  },
  {
    slug: 'find-motorcycle-vin',
    title: 'How to Find a Motorcycle VIN',
    description:
      'Motorcycle VINs hide in a few specific spots. Learn where to find the VIN on a bike, how to decode it, and how to check a used motorcycle history.',
    keyword: 'find motorcycle VIN',
    category: 'VIN basics',
    readingMinutes: 4,
    totalTime: 'PT3M',
    intro:
      'A motorcycle VIN is a 17-character code just like a car, but it lives in different places. Here is where to look and how to use it.',
    takeaways: [
      'Modern motorcycle VINs are 17 characters and follow the same standard as cars.',
      'The most common location is the steering neck (headstock).',
      'Bikes get salvage titles, theft records, and liens too — always check the history.',
    ],
    steps: [
      { name: 'Check the steering neck', text: 'The frame VIN is most often stamped on the steering neck (headstock), below the handlebars.' },
      { name: 'Look at the engine case', text: 'The engine has its own number; note it, but the frame VIN is the one used for titling and history.' },
      { name: 'Confirm against the title', text: 'Match the frame VIN to the title and registration. A mismatch is a serious warning.' },
      { name: 'Run the history report', text: 'Enter the 17-character VIN to check for salvage brands, theft records, and liens.' },
    ],
    faq: [
      { q: 'Are motorcycle VINs 17 characters?', a: 'Yes, for modern bikes. Some older motorcycles used shorter, non-standard numbers, similar to pre-1981 cars.' },
      { q: 'Is the engine number the VIN?', a: 'No. The engine number is separate. The frame VIN — usually on the steering neck — is the identifier used for titles and history reports.' },
    ],
    related: ['check-vin-number', 'decode-wmi', 'read-vin-report'],
  },
  {
    slug: 'check-title-status',
    title: 'How to Check a Car Title Status',
    description:
      'A clean-looking title can hide a brand applied in another state. Learn how to check a car title status by VIN and catch title washing before you buy.',
    keyword: 'check car title status',
    category: 'Reports & records',
    readingMinutes: 4,
    totalTime: 'PT3M',
    intro:
      'The title in the seller hand is only part of the story. Here is how to verify a car true title status across all 50 states.',
    takeaways: [
      'A title brand applied in one state can be washed away by retitling in another.',
      'NMVTIS is the federal system that catches brands across state lines.',
      'Always compare the report title status against the physical title.',
    ],
    steps: [
      { name: 'Get the VIN', text: 'Take the 17-character VIN from the car and confirm it matches the title in hand.' },
      { name: 'Run the history report', text: 'Check the title section for salvage, rebuilt, junk, or flood brands in any state.' },
      { name: 'Understand NMVTIS coverage', text: 'The federal NMVTIS database aggregates state title data, which is how a hidden out-of-state brand surfaces.' },
      { name: 'Compare to the physical title', text: 'If the paper title says clean but the report shows a brand elsewhere, you have caught title washing.' },
    ],
    faq: [
      { q: 'What is title washing?', a: 'Moving a car across state lines and retitling it to drop a brand from the paperwork. A multi-state check via NMVTIS is what exposes it.' },
      { q: 'Is a clean title a guarantee?', a: 'No. It means no brand is currently on that state paperwork. A full history report checks whether a brand exists anywhere else.' },
    ],
    related: ['read-vin-report', 'check-vin-number', 'read-carfax-report'],
  },
  {
    slug: 'negotiate-used-car-price',
    title: 'How to Negotiate a Used Car Price',
    description:
      'The best negotiating leverage is documented facts. Learn how to use a valuation, a history report, and an inspection to negotiate a fair used-car price.',
    keyword: 'negotiate used car price',
    category: 'Buying safely',
    readingMinutes: 5,
    intro:
      'Confidence at the negotiating table comes from evidence. Here is how to build it and use it.',
    takeaways: [
      'Negotiate from a researched market value, not the asking price.',
      'A history report and inspection turn problems into documented leverage.',
      'Set a walk-away number before you start and stick to it.',
    ],
    steps: [
      { name: 'Research the market value', text: 'Establish a fair price range from book values and comparable local listings before you talk numbers.' },
      { name: 'Pull the history and inspect', text: 'Use the VIN report and a pre-purchase inspection to find documented issues that justify a lower offer.' },
      { name: 'Set your walk-away number', text: 'Decide your maximum before you engage, so emotion does not push you past it.' },
      { name: 'Negotiate on total price', text: 'Talk out-the-door price, not monthly payment — monthly framing hides the real cost.' },
      { name: 'Be ready to walk', text: 'The willingness to leave is your strongest position. There is always another car.' },
    ],
    faq: [
      { q: 'How does a history report help me negotiate?', a: 'A documented accident, brand, or odometer issue is objective leverage. It moves the conversation from opinion to fact and justifies a lower price.' },
      { q: 'Should I negotiate on monthly payments?', a: 'No. Always negotiate the total out-the-door price. Monthly-payment framing can hide a higher price stretched over a longer loan.' },
    ],
    related: ['value-used-car', 'check-title-status', 'read-vin-report'],
  },
];

export function getGuide(slug: string): HowToGuide | undefined {
  return HOW_TO_GUIDES.find((g) => g.slug === slug);
}

export function allGuides(): HowToGuide[] {
  return HOW_TO_GUIDES;
}
