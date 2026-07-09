// Blog content model + seed articles + a small, edge-safe markdown renderer.
// Posts live here as the demo source; in production they come from the `posts`
// table (admin pipeline). Both share this BlogPost shape.

export interface BlogPost {
  slug: string;
  title: string;
  description: string;
  keyword: string;
  author: string;
  date: string; // ISO
  updated?: string;
  cover: string;
  coverAlt: string;
  readingMinutes: number;
  qualityScore: number;
  aiAssisted: boolean;
  body: string; // markdown
}

export const DEMO_POSTS: BlogPost[] = [
  {
    slug: 'how-to-read-a-vin-number',
    title: 'How to Read a VIN Number: What Each of the 17 Characters Means',
    description:
      'A plain-English breakdown of every digit in a U.S. VIN — what the WMI, check digit, model year, and plant code actually tell you about a car.',
    keyword: 'how to read a VIN number',
    author: 'CarVinLookup Editorial',
    date: '2026-05-28',
    updated: '2026-06-09',
    cover: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=1200&q=60',
    coverAlt: 'Close-up of a car dashboard VIN plate through the windshield',
    readingMinutes: 6,
    qualityScore: 92,
    aiAssisted: true,
    body: `Every car sold in the United States carries a 17-character Vehicle Identification Number (VIN). It is not a random string — each position is defined by federal standard (FMVSS 115 / ISO 3779), and once you know the pattern you can decode a lot before you ever pay for a report.

**Key takeaways**

- Every VIN has exactly 17 characters, each with a defined meaning under federal standard FMVSS 115 / ISO 3779.
- Position 9 is a check digit — a math formula that catches typos and some fabricated VINs.
- Decoding a VIN tells you what a car *should* be. It doesn't tell you what *happened* to it — for that you need a title and records check (see [our data sources](/data-sources)).

## Where to find the VIN

The three most reliable spots:

- **Lower-left corner of the windshield**, visible from outside the car.
- **Driver-side door jamb sticker** (also lists tire pressure and build date).
- **Title, registration, and insurance card.**

If the windshield VIN and the door-jamb VIN don't match, stop — that is a classic sign of a cloned or rebuilt vehicle.

## The 17 characters, position by position

| Positions | Name | What it tells you |
|-----------|------|-------------------|
| 1–3 | World Manufacturer Identifier (WMI) | Country and manufacturer |
| 4–8 | Vehicle Descriptor Section | Model, body, engine, restraints |
| 9 | Check digit | Math test that validates the whole VIN |
| 10 | Model year | The year code (see below) |
| 11 | Plant code | Which factory built it |
| 12–17 | Serial number | The car's unique production sequence |

### Position 1–3: who made it and where

The first character is the region: **1, 4, and 5 are the United States**, 2 is Canada, 3 is Mexico, J is Japan, K is Korea, S-Z are Europe. So a VIN starting with \`1HG\` is a Honda built in the USA.

### Position 9: the check digit

This is the anti-fraud position. A formula weighs the other 16 characters and the result must equal position 9 (0–9 or "X" for 10). If it doesn't, the VIN was mistyped or fabricated. Our [VIN check](/#vin-search) runs this validation automatically.

### Position 10: the model year

Letters and numbers cycle on a 30-year schedule. A few anchors: **A = 1980 / 2010**, **L = 2020**, **N = 2022**, **P = 2023**, **R = 2024**, **S = 2025**. (The letters I, O, Q, U, Z and the number 0 are never used.)

## Why decoding by eye isn't enough

Reading the VIN tells you what the car *should* be. It does **not** tell you what happened to it — salvage titles, flood damage, odometer rollbacks, and open liens never appear in the number itself. That history lives in NMVTIS, NICB, and state DMV records, which is exactly what a full report pulls together. For the terms you'll see in a report, see our [VIN & title glossary](/glossary); for what each agency actually provides, see [data sources & methodology](/data-sources).

> **The takeaway:** decode the VIN to confirm the car is what the seller claims, then run a history report to learn what they might not be telling you.`,
  },
  {
    slug: 'salvage-title-vs-rebuilt-title',
    title: 'Salvage Title vs. Rebuilt Title: What’s the Difference (and the Risk)?',
    description:
      'Salvage, rebuilt, junk, and flood titles are not the same thing. Here is what each brand means for safety, insurance, resale, and what you should pay.',
    keyword: 'salvage title vs rebuilt title',
    author: 'CarVinLookup Editorial',
    date: '2026-06-02',
    cover: 'https://images.unsplash.com/photo-1597007030739-6d2e7172ee5e?auto=format&fit=crop&w=1200&q=60',
    coverAlt: 'A damaged car in a repair shop being inspected',
    readingMinutes: 7,
    qualityScore: 90,
    aiAssisted: true,
    body: `A branded title is the single biggest red flag in a used-car listing — and the words dealers use are easy to blur together. Here is the difference that actually matters to your wallet and your safety.

**Key takeaways**

- Salvage, rebuilt, junk, and flood are four *different* title brands with different legal and financial consequences — not interchangeable terms.
- A rebuilt title is legal to drive, but the salvage history stays on the title forever and typically cuts resale value 20–50%.
- "Title washing" — moving a car across state lines to drop a brand — is exactly what a multi-state VIN check catches.

## The four brands you'll see

| Brand | Meaning | Legal to drive? | Resale impact |
|-------|---------|------------------|----------------|
| Salvage | Insurer declared a total loss — repair cost exceeded roughly 70–90% of value (threshold varies by state) | No, until it passes a state re-inspection | Not sellable as a driveable car; value is largely parts/scrap |
| Rebuilt / Reconstructed | A salvage car that was repaired and passed a state inspection | Yes | Drops 20–50% versus a clean-title equivalent |
| Junk | Totaled and certified as fit only for parts or scrap | No | Not a road vehicle |
| Flood | Water-damaged | Depends on state and inspection | Steep discount; corrosion and electrical faults often surface later |

## What a brand costs you

1. **Resale value** drops 20–50% versus a clean-title equivalent.
2. **Insurance** is harder to get — many carriers won't write collision/comprehensive on a branded car.
3. **Financing** is limited; many banks won't lend on a salvage or rebuilt title at all.
4. **Safety** depends entirely on the quality of repairs you usually can't see.

## How to protect yourself

Run the VIN before you visit. A history report checks [NMVTIS](https://vehiclehistory.gov) to see whether a title brand was ever applied **in any state** — important because "title washing" moves a car across state lines to drop the brand. If the seller's clean title contradicts the NMVTIS record, you've just saved yourself thousands. See our [VIN & title glossary](/glossary) for definitions of every term above, and [data sources & methodology](/data-sources) for what NMVTIS actually checks.

> A rebuilt title isn't automatically a scam — some are honestly repaired and fairly priced. But you should *know* it's branded, *why*, and pay accordingly. Never let it be a surprise after purchase.`,
  },
  {
    slug: 'check-car-for-flood-damage',
    title: 'How to Check a Used Car for Flood Damage Before You Buy',
    description:
      'Flood cars are cleaned up and resold across state lines every year. Here are the physical signs, the records to pull, and the VIN check that catches title washing.',
    keyword: 'check car for flood damage',
    author: 'CarVinLookup Editorial',
    date: '2026-06-07',
    cover: 'https://images.unsplash.com/photo-1561553590-267fc716698a?auto=format&fit=crop&w=1200&q=60',
    coverAlt: 'Cars partially submerged in flood water',
    readingMinutes: 5,
    qualityScore: 88,
    aiAssisted: true,
    body: `After every major hurricane, tens of thousands of flood-damaged cars are dried out, detailed, and shipped to states far from the storm to be sold to people who have no idea. Water damage is uniquely dangerous because it keeps causing problems — electrical gremlins, mold, and rust that surface long after the sale.

**Key takeaways**

- Flood damage keeps causing problems after a cosmetic clean-up — electrical faults, mold, and corrosion often surface months later.
- A 5-minute physical check (smell, hidden moisture, electronics) catches what a quick test drive won't.
- Pull the VIN history too — a [flood or salvage title brand](/glossary) applied in any state should show up in a report even if the car was retitled elsewhere.

## A 5-minute physical inspection

- **Smell first.** A musty or heavy air-freshener smell is a warning. Sellers mask odor for a reason.
- **Check hidden moisture.** Look under the carpet, in the spare-tire well, and inside the seatbelt retractors (pull the belt all the way out — water lines show).
- **Inspect electronics.** Test every window, light, infotainment function, and the heater/AC. Flood cars develop intermittent electrical faults.
- **Look for mismatched upholstery** or surprisingly new carpet in an otherwise older car.
- **Find dirt where it shouldn't be** — silt in the glovebox hinges, under the dash, around bolt heads.

## Pull the records, too

Your eyes can miss a professional clean-up. The VIN history is harder to fool. A report checks [NMVTIS](https://vehiclehistory.gov) for a **flood or salvage brand applied in any state**, which matters because title washing relocates the car specifically to erase that brand.

Run the [VIN](/#vin-search) and compare it against the seller's paperwork. If NMVTIS shows a flood event and the title in front of you says "clean," walk away. See our [data sources & methodology](/data-sources) for exactly what gets checked, and the [VIN & title glossary](/glossary) for what each term means.

> Flood damage is the one problem that gets *worse* after you buy. Spend the five minutes and the few dollars before, not the thousands after.`,
  },

  // ── Content expansion (Phase 1): original, optimized posts covering the
  // high-intent used-car search topics our audience looks for. Same topics as
  // the broader market, written fresh for CarVinLookup (no duplicate content).
  // TODO: cover images reuse existing stock art — diversify with per-topic art.
  {
    slug: 'what-is-a-vehicle-history-report',
    title: 'What Is a Vehicle History Report? A Complete Guide',
    description:
      'A vehicle history report reveals title brands, theft records, liens, and odometer history from one VIN. See what is inside a report and how to read every section.',
    keyword: 'what is a vehicle history report',
    author: 'CarVinLookup Editorial',
    date: '2026-07-09',
    cover: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=1200&q=60',
    coverAlt: 'Close-up of a vehicle VIN plate through the windshield',
    readingMinutes: 7,
    qualityScore: 93,
    aiAssisted: true,
    body: `A vehicle history report is a background check for a used car. Feed it a 17-character VIN and it pulls together title, theft, lien, and odometer records that no test drive or seller conversation will ever reveal on its own.

**Key takeaways**

- A report combines records from NMVTIS (titles), the NICB (theft), and state DMVs — data a seller cannot edit or hide.
- The five sections that matter most: title brands, theft/total-loss records, open liens, odometer history, and reported accidents.
- A report tells you what *happened* to a car. Decoding the VIN only tells you what it was *built* as — see [how to read a VIN](/blog/how-to-read-a-vin-number).

## What is inside a vehicle history report

| Section | What it answers | Why it matters |
|---------|-----------------|----------------|
| Title brands | Has this car ever been salvage, rebuilt, junk, or flood? | The single biggest hit to value and safety |
| Theft and total loss | Was it reported stolen or written off by an insurer? | A recovered-theft or total-loss car can hide structural damage |
| Open liens | Does a lender still have a claim on it? | You can inherit someone else's loan |
| Odometer | Do the reported readings move in one direction? | Rollbacks are common and illegal |
| Accidents and damage | Has damage been reported to a records provider? | Frame and airbag damage is expensive and unsafe |

For a plain-English definition of every term above, see the [VIN and title glossary](/glossary).

## Where the data comes from

No single database holds a car's whole life. A good report stitches together several:

- **NMVTIS** — the federal title system every state reports into. This is what catches a salvage brand applied in another state ([vehiclehistory.gov](https://vehiclehistory.gov)).
- **NICB** — insurance-industry theft and total-loss records ([nicb.org](https://www.nicb.org)).
- **State DMVs** — title and registration history.
- **NHTSA** — open safety recalls ([nhtsa.gov/recalls](https://www.nhtsa.gov/recalls)).

We explain what each source does and does not cover on our [data sources and methodology](/data-sources) page.

## How to read one without getting fooled

1. **Check the title section first.** Any brand — salvage, rebuilt, flood, junk — changes everything about the price you should pay.
2. **Follow the odometer trend.** Readings should only ever go up. A later-dated lower number is a red flag.
3. **Match the report to the paperwork.** If the seller's title says clean but the report shows a brand from another state, you have caught title washing.
4. **Note open recalls** and confirm they were fixed before you buy.

## Free preview vs. full report

A free preview should confirm the car's identity — make, model, year, and that the VIN is valid — before you pay anything. The paid report adds the history: brands, theft, liens, odometer, and accidents. Run the [VIN on the home page](/#vin-search) to see the preview first.

> A vehicle history report is the cheapest insurance you will ever buy on a used car. A few dollars up front routinely saves buyers thousands in hidden damage.`,
  },
  {
    slug: 'how-to-check-accident-history',
    title: 'How to Check a Car Accident History Before You Buy',
    description:
      'Accident and damage history does not always show on a clean title. Learn how to check a used car crash record by VIN — and what a report can and cannot see.',
    keyword: 'check car accident history',
    author: 'CarVinLookup Editorial',
    date: '2026-07-08',
    cover: 'https://images.unsplash.com/photo-1597007030739-6d2e7172ee5e?auto=format&fit=crop&w=1200&q=60',
    coverAlt: 'A car with collision damage in an auto body shop',
    readingMinutes: 6,
    qualityScore: 90,
    aiAssisted: true,
    body: `A clean title does not mean a clean past. Plenty of cars are in real collisions, get repaired, and are sold with a title that says nothing happened — because the damage never rose to an insurance total loss. Here is how to check a used car's accident history before you hand over money.

**Key takeaways**

- Accident history and title status are two different things — a repaired crash car can still carry a clean title.
- A VIN-based report surfaces damage that was *reported* to a records provider, but not every collision gets reported.
- Pair the records check with a physical inspection and a professional pre-purchase inspection for the full picture.

## Why accidents hide on a clean title

A car only gets a branded title when an insurer declares it a total loss. A 6,000-dollar repair on a 30,000-dollar car is a big accident — but not a total loss, so the title stays clean. That is exactly the gap a history report helps close.

## What a report can see

- **Reported accidents and damage events** from data providers and some police and DMV feeds.
- **Total-loss and salvage records** through NMVTIS and NICB — the severe end of the scale.
- **Airbag deployment and structural or frame damage** where it was reported.

Learn what each data source covers on our [data sources page](/data-sources).

## What a report cannot see

No report is omniscient. If a crash was fixed privately and never reported, it may not appear anywhere. That is why records are step one, not the only step:

1. **Read the VIN history** for reported accidents, brands, and total-loss events.
2. **Inspect the car** for mismatched paint, uneven panel gaps, and fresh undercoating hiding repairs.
3. **Get a pre-purchase inspection** from an independent mechanic — the best money you can spend on a used car.

## The fastest first move

Before you drive across town, run the [VIN](/#vin-search). If the report shows a total loss, salvage brand, or airbag deployment, you can walk away before wasting an afternoon. For the terminology you will see, keep the [glossary](/glossary) open, and read [what is a vehicle history report](/blog/what-is-a-vehicle-history-report) for the full picture.

> Treat "no accidents reported" as "none that reached the records" — not a guarantee. Combine the report, your eyes, and a mechanic, and you will rarely be surprised.`,
  },
  {
    slug: 'car-information-by-license-plate',
    title: 'Car Information by License Plate: What You Can Find',
    description:
      'You can learn a lot about a vehicle from its license plate, and there are real limits. See what a plate lookup reveals and what still needs the full VIN.',
    keyword: 'car information by license plate',
    author: 'CarVinLookup Editorial',
    date: '2026-07-07',
    cover: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=1200&q=60',
    coverAlt: 'Close-up of a vehicle VIN plate through the windshield',
    readingMinutes: 5,
    qualityScore: 89,
    aiAssisted: true,
    body: `A license plate is a pointer to a vehicle's records. With the plate and the state, you can start identifying a car — but there are firm legal limits on what you can pull, and the richest history still lives under the VIN.

**Key takeaways**

- A plate plus state can identify the vehicle (year, make, model) and, through a lookup, resolve to its VIN.
- Personal owner details are protected by the federal Driver's Privacy Protection Act (DPPA) — a plate lookup will not hand you a stranger's name and address.
- For title brands, theft, liens, and odometer history, the VIN is the key that unlocks a full report.

## What you can find from a plate

- **Vehicle identity** — year, make, model, and often body style and engine.
- **The VIN**, via a plate-to-VIN lookup, which then unlocks the full history.
- **Basic registration status** in some states.

## What you cannot find

The **Driver's Privacy Protection Act (DPPA)** restricts access to personal information tied to a motor-vehicle record. A legitimate lookup will not reveal the owner's name, home address, or phone number to a random buyer. Any service promising that is a red flag.

## Plate vs. VIN: which do you need

| You have | You can get | Best for |
|----------|-------------|----------|
| License plate + state | Vehicle identity, and the VIN | Starting from a listing photo |
| VIN | Full history: titles, theft, liens, odometer | The actual buying decision |

If a listing only shows a plate, use it to find the [VIN](/#vin-search), then run the history report. See the [glossary](/glossary) for how plates, VINs, and titles relate, and [what is a vehicle history report](/blog/what-is-a-vehicle-history-report) for what the VIN unlocks.

> Use the plate to find the car, then use the VIN to judge it. The plate identifies; the VIN tells the story.`,
  },
  {
    slug: 'how-to-spot-odometer-rollback',
    title: 'How to Spot Odometer Rollback on a Used Car',
    description:
      'Odometer fraud costs U.S. car buyers over a billion dollars a year. Learn the physical tells, the paperwork to compare, and the VIN check that flags rollbacks.',
    keyword: 'odometer rollback',
    author: 'CarVinLookup Editorial',
    date: '2026-07-06',
    cover: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=1200&q=60',
    coverAlt: 'A vehicle dashboard and VIN plate viewed through the windshield',
    readingMinutes: 6,
    qualityScore: 90,
    aiAssisted: true,
    body: `Odometer fraud is one of the oldest used-car scams, and it did not die with mechanical odometers — digital clusters can be rolled back too. The U.S. National Highway Traffic Safety Administration estimates odometer fraud costs American car buyers more than one billion dollars every year. Here is how to catch it.

**Key takeaways**

- Rolling back an odometer is a federal crime, but it still happens on both mechanical and digital dashboards.
- The strongest evidence is the paper trail: reported mileage readings should only ever increase over time.
- A VIN history report lines up past readings and flags any that go backwards — see our [data sources](/data-sources).

## Physical tells

- **Wear that does not match the miles.** A worn steering wheel, shiny brake pedal, or sagging driver's seat on a low-mileage car is a warning.
- **Odometer digits misaligned** or a dashboard with fresh tool marks on mechanical clusters.
- **Service stickers and inspection records** showing higher mileage than the dash reads now.

## The paperwork check

Every legitimate mileage reading is a data point with a date. Collect them from:

1. **Title transfers** — federal law requires a mileage disclosure at sale.
2. **Service and oil-change records.**
3. **State inspection or emissions history.**

Put them in date order. If a 2026 reading is lower than a 2024 one, the odometer was rolled back.

## Let the VIN do the cross-check

A history report already gathers reported readings from these sources and flags a reading that dropped. Run the [VIN](/#vin-search) and look at the odometer section before you trust the number on the dash. Learn more about rollbacks and other terms in the [glossary](/glossary), and read how mileage fits the bigger picture in [what is a vehicle history report](/blog/what-is-a-vehicle-history-report).

For the federal view on odometer fraud, see [NHTSA](https://www.nhtsa.gov/road-safety/odometer-fraud).

> The dashboard shows one number. The records show the truth. When they disagree, believe the records.`,
  },
  {
    slug: 'how-to-buy-a-salvage-car',
    title: 'How to Buy a Salvage Car Without Getting Burned',
    description:
      'Salvage-title cars are cheap for a reason. If you buy one, learn how to check the damage history, verify the repairs, and avoid an unsafe or unsellable car.',
    keyword: 'how to buy a salvage car',
    author: 'CarVinLookup Editorial',
    date: '2026-07-05',
    cover: 'https://images.unsplash.com/photo-1597007030739-6d2e7172ee5e?auto=format&fit=crop&w=1200&q=60',
    coverAlt: 'A damaged salvage car being repaired in a garage',
    readingMinutes: 7,
    qualityScore: 91,
    aiAssisted: true,
    body: `A salvage-title car can be a genuine bargain or a money pit wearing fresh paint. The difference is what you know before you buy. If you are going to consider a salvage or rebuilt car, do it with your eyes open.

**Key takeaways**

- A **salvage title** means an insurer declared the car a total loss; a **rebuilt title** means it was repaired and passed a state inspection.
- Expect 20–50% less resale value, limited financing, and pricier or harder-to-get insurance.
- Always pull the damage history and get a professional inspection before committing — see [salvage vs. rebuilt titles](/blog/salvage-title-vs-rebuilt-title).

## Know exactly what you are buying

| Title | What it means | Can you drive it? |
|-------|---------------|-------------------|
| Salvage | Insurer total loss; not yet repaired or inspected | No, until it passes state re-inspection |
| Rebuilt / reconstructed | Repaired salvage that passed inspection | Yes |
| Junk | Certified for parts or scrap only | No |

## Before you buy a salvage or rebuilt car

1. **Run the VIN history.** Find out *why* it was totaled — collision, flood, theft-recovery, or hail. Flood and frame damage are the riskiest. Start with the [VIN](/#vin-search).
2. **Get a pre-purchase inspection** from a mechanic experienced with rebuilt cars. Ask specifically about frame straightening and airbag replacement.
3. **Ask for repair documentation and photos** of the damage before repair.
4. **Call your insurer first.** Confirm you can actually insure it, and at what cost, before you pay.
5. **Discount hard.** A rebuilt car should cost meaningfully less than a clean-title equivalent — that discount is your compensation for the added risk.

## When to walk away

No repair records, a seller who is vague about the damage, or a flood-total priced like a clean car. If the story does not add up, the savings are not worth it.

For definitions of every title brand, see the [glossary](/glossary); for what the title records actually check, see [data sources](/data-sources).

> A rebuilt car is a calculated risk, not a scam by default. Buy the *documented, inspected, deeply discounted* one — never the mystery.`,
  },
  {
    slug: 'travel-trailer-vin-decoder',
    title: 'Travel Trailer and RV VIN Decoder: How to Read It',
    description:
      'RV, camper, and travel-trailer VINs follow their own rules. Learn how to find the VIN, decode all 17 characters, and check a used trailer before you buy it.',
    keyword: 'travel trailer VIN decoder',
    author: 'CarVinLookup Editorial',
    date: '2026-07-04',
    cover: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=1200&q=60',
    coverAlt: 'Close-up of a vehicle VIN plate through the windshield',
    readingMinutes: 6,
    qualityScore: 88,
    aiAssisted: true,
    body: `Recreational vehicles, campers, and travel trailers all carry a 17-character VIN, just like cars — but where it lives and what it tells you differ. Whether you are decoding a motorhome or a towable trailer, here is how to read it and check its history.

**Key takeaways**

- RV and travel-trailer VINs are 17 characters and follow the same federal standard as cars.
- On a towable trailer the VIN is usually on the **tongue or frame** near the hitch and on a **certification label** inside; on a motorhome it is on the chassis and dashboard.
- A trailer can still have a salvage or flood brand — run the VIN before you buy.

## Where to find the VIN on an RV or trailer

- **Travel trailers and fifth wheels:** stamped on the A-frame or tongue near the hitch, and on a federal certification label inside a cabinet or on the exterior sidewall.
- **Motorhomes:** on the chassis, the driver-side dashboard, and the door jamb — plus a separate label for the coach builder.
- **Title and registration** documents.

## Decoding the 17 characters

RV VINs use the same position rules as cars. A quick map:

| Positions | Meaning |
|-----------|---------|
| 1–3 | World Manufacturer Identifier (country and maker) |
| 4–8 | Model, body or floorplan, and build details |
| 9 | Check digit (validates the VIN) |
| 10 | Model year |
| 11 | Assembly plant |
| 12–17 | Serial number |

For a full walkthrough of each position, see [how to read a VIN number](/blog/how-to-read-a-vin-number).

## Do not skip the history check

Trailers flood, get in accidents, and carry liens just like cars — and because they are often bought used and towed across state lines, [title washing](/glossary) is a real risk. Run the [VIN](/#vin-search) to check for brands, theft, and liens before you buy. Note that some coach-specific details may be limited compared with mainstream cars; see [data sources](/data-sources) for coverage honesty.

> The camper is only worth the adventure if its paperwork is clean. Decode the VIN, then check its history — before the road trip, not after.`,
  },
  {
    slug: 'chassis-number-vs-vin',
    title: 'Chassis Number vs. VIN: Are They the Same Thing?',
    description:
      'Chassis number and VIN are often used to mean the same thing, but not always. Learn what each term means, where to find them, and which one runs a report.',
    keyword: 'chassis number vs VIN',
    author: 'CarVinLookup Editorial',
    date: '2026-07-03',
    cover: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=1200&q=60',
    coverAlt: 'A stamped vehicle identification plate on a car',
    readingMinutes: 5,
    qualityScore: 88,
    aiAssisted: true,
    body: `"Chassis number" and "VIN" get used as if they are the same thing. Often they point to the same 17-character code — but not always, and the difference matters when you are buying a car or running a history check.

**Key takeaways**

- In modern U.S. and international cars, the **chassis number is part of the VIN** — specifically the serial portion — and people often say "chassis number" to mean the whole VIN.
- Older or imported vehicles may have a separate chassis or frame number that is not identical to the VIN.
- A history report is keyed off the full 17-character **VIN**, so that is the number you want.

## What each term means

- **VIN (Vehicle Identification Number):** the full 17-character code assigned to the whole vehicle under federal standard FMVSS 115 / ISO 3779.
- **Chassis number:** historically the number stamped on the vehicle's frame. In modern cars this is folded into the VIN (roughly the last serial digits). On some classic or imported vehicles it can be a distinct number.
- **Engine number:** a separate code on the engine block — not the same as either of the above.

## Where to find them

| Number | Typical location |
|--------|------------------|
| VIN | Windshield lower-left, driver door jamb, title |
| Chassis or frame number | Stamped on the frame rail (modern cars: matches the VIN serial) |
| Engine number | On the engine block |

## Which one do you actually need

For decoding and for a history report, use the full **VIN**. If a windshield VIN and a frame stamp do not match on a car that should have one number, treat it as a serious red flag for a cloned or rebuilt vehicle. See [how to read a VIN](/blog/how-to-read-a-vin-number) to decode it, and run the [VIN](/#vin-search) to check the history. Definitions live in the [glossary](/glossary).

> When someone asks for the chassis number, they almost always mean the VIN. Confirm all 17 characters match across the car and its paperwork — mismatches are where fraud hides.`,
  },
  {
    slug: 'vin-cloning-explained',
    title: 'VIN Cloning: What It Is and How to Spot It',
    description:
      'VIN cloning disguises a stolen car with a legitimate VIN copied from another vehicle. Learn how the scam works, the warning signs, and how a VIN check helps.',
    keyword: 'VIN cloning',
    author: 'CarVinLookup Editorial',
    date: '2026-07-10',
    cover: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=1200&q=60',
    coverAlt: 'Close-up of a vehicle VIN plate through the windshield',
    readingMinutes: 5,
    qualityScore: 90,
    aiAssisted: true,
    body: `A cloned VIN is one of the hardest used-car scams to catch, because on paper everything looks legitimate. Here is how VIN cloning works and how to protect yourself.

**Key takeaways**

- VIN cloning copies a real VIN from a legally registered car onto a stolen or salvaged one.
- The paperwork can look clean because it matches a real, valid VIN — just not this car.
- Matching the VIN across every location on the car, and checking theft records, is how you catch it.

## How VIN cloning works

Thieves take a VIN from a legally registered vehicle — often the same make, model, and color — and copy it onto a stolen car using counterfeit plates and forged documents. The stolen car now wears a clean identity, and an unsuspecting buyer purchases what looks like a legitimate vehicle.

## Red flags of a cloned VIN

- **VIN plates that do not match.** The windshield VIN, door-jamb sticker, and title should be identical. Any mismatch is a serious warning.
- **A price that is too good to be true.** Cloned cars are sold fast and cheap.
- **A seller who only takes cash and rushes the sale.**
- **Signs the VIN plate was tampered with** — scratches, mismatched rivets, or fresh adhesive.

## How to protect yourself

1. **Check every VIN location** on the car and confirm they all match the title.
2. **Run the VIN history** for theft records and inconsistencies. See our guide on [how to check if a car is stolen](/how-to/find-stolen-car).
3. **Use the free NICB VINCheck** for theft and salvage records.
4. **Walk away from any mismatch.** If two VINs on the same car disagree, do not buy it.

Run the [VIN](/#vin-search) before you pay, and keep the [glossary](/glossary) handy for the terms involved.

> A cloned VIN hides a stolen car behind a real identity. The car cannot fake having the same VIN in every location — that is where you catch it.`,
  },
  {
    slug: 'what-is-a-bid-car-salvage-auction',
    title: 'What Is a Bid Car? Buying from Salvage Auctions Explained',
    description:
      'A bid car is a vehicle sold at a salvage or dealer auction, often with damage. Learn how these auctions work, the risks, and what to check before you bid.',
    keyword: 'what is a bid car',
    author: 'CarVinLookup Editorial',
    date: '2026-07-02',
    cover: 'https://images.unsplash.com/photo-1597007030739-6d2e7172ee5e?auto=format&fit=crop&w=1200&q=60',
    coverAlt: 'A damaged car being inspected at an auction lot',
    readingMinutes: 6,
    qualityScore: 88,
    aiAssisted: true,
    body: `A bid car is simply a vehicle sold through an auction rather than a traditional dealership or private seller. Many are salvage or damaged cars, which is why they sell cheap — and why you need to know what you are bidding on.

**Key takeaways**

- A bid car is any vehicle sold at a salvage, insurance, or dealer auction.
- Many carry damage or a branded title and are sold as-is, with limited disclosure.
- The VIN history and the damage type are the two things to check before you bid.

## How car auctions work

Auctions range from public online salvage sales to dealer-only wholesale lanes. Insurance companies send total-loss vehicles to auction, dealers offload trade-ins, and lenders sell repossessions. Cars are usually sold as-is, meaning no warranty and little recourse if something is wrong.

## The risks of buying a bid car

- **As-is sales.** What you see is what you get, problems included.
- **Branded titles.** Many auction cars are salvage, flood, or rebuilt. See our [salvage auction guide](/auctions) for what each damage type means.
- **Hidden damage.** Photos rarely show frame or flood damage.
- **Extra fees.** Buyer fees, transport, and repairs add up fast.

## What to check before you bid

1. **Run the VIN history** for title brands, theft, liens, and odometer issues. Start with the [VIN](/#vin-search).
2. **Understand the damage type** listed and what it means for safety and repair cost — browse the [auction damage types](/auctions).
3. **Set a hard budget** that includes fees and repairs, and stick to it.
4. **Inspect in person** or hire an inspection service when possible.

> A bid car can be a real bargain or a costly mistake. The difference is knowing exactly what you are buying — and the VIN history tells you before you raise your hand.`,
  },
  {
    slug: 'common-used-car-scams',
    title: '7 Common Used-Car Scams and How to Avoid Them',
    description:
      'Curbstoners, title washing, odometer rollbacks, and fake escrow — learn the most common used-car scams and the simple checks that stop each one.',
    keyword: 'used car scams',
    author: 'CarVinLookup Editorial',
    date: '2026-06-28',
    cover: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=1200&q=60',
    coverAlt: 'Close-up of a vehicle VIN plate through the windshield',
    readingMinutes: 6,
    qualityScore: 90,
    aiAssisted: true,
    body: `Most used-car scams rely on one thing: a buyer who does not check. Here are seven of the most common scams and the simple steps that stop each one.

**Key takeaways**

- Almost every used-car scam is defeated by verifying the VIN and the title before you pay.
- The riskiest sellers create urgency and avoid paperwork.
- A few minutes of checking saves thousands.

## 1. Curbstoning

An unlicensed dealer poses as a private seller to dodge disclosure laws. The name on the title will not match the seller. See [how to avoid curbstoners](/how-to/avoid-curbstoner).

## 2. Title washing

A branded car is retitled across state lines to erase the brand. A multi-state [title status check](/how-to/check-title-status) via NMVTIS catches it.

## 3. Odometer rollback

The mileage is wound back to raise the price. Compare reported readings with an [odometer check](/odometer-check).

## 4. VIN cloning

A stolen car wears a VIN copied from a legitimate one. Match the VIN in every location and run a [stolen vehicle check](/stolen-vehicle-check). See [VIN cloning explained](/blog/vin-cloning-explained).

## 5. Flood cars sold as clean

Water-damaged cars are cleaned up and shipped to dry states. A [flood damage check](/flood-damage-check) surfaces the brand.

## 6. Fake escrow and shipping scams

An online seller invents a third-party escrow or shipping service to collect payment for a car that does not exist. Never wire money for a car you have not seen, and never use a seller-chosen escrow site.

## 7. Undisclosed salvage flips

A rebuilt salvage car is sold without disclosing the history. Always confirm the title brand with a full report before you buy.

## The one habit that stops most scams

Run the [VIN](/#vin-search) and read the title before money changes hands. If the seller resists an inspection or a history check, that is your answer.

> Scammers count on urgency and blind trust. Slow down, verify the VIN and title, and almost every one of these falls apart.`,
  },
];

export function getPostBySlug(slug: string): BlogPost | undefined {
  return DEMO_POSTS.find((p) => p.slug === slug);
}

export function allPosts(): BlogPost[] {
  return [...DEMO_POSTS].sort((a, b) => (a.date < b.date ? 1 : -1));
}

/**
 * Minimal, dependency-free markdown → HTML for trusted editorial content.
 * Supports headings, paragraphs, bold, links, unordered/ordered lists,
 * blockquotes, and GitHub-style tables. Not a general-purpose sanitizer —
 * only run on content we author/review.
 */
export function renderMarkdown(md: string): string {
  const esc = (s: string) =>
    s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

  const inline = (s: string) =>
    esc(s)
      .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
      .replace(/`([^`]+)`/g, '<code>$1</code>')
      .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>');

  const lines = md.split('\n');
  const out: string[] = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];

    if (!line.trim()) { i++; continue; }

    // Table
    if (line.includes('|') && lines[i + 1]?.includes('---')) {
      const header = line.split('|').map((c) => c.trim()).filter(Boolean);
      i += 2;
      const rows: string[][] = [];
      while (i < lines.length && lines[i].includes('|')) {
        rows.push(lines[i].split('|').map((c) => c.trim()).filter(Boolean));
        i++;
      }
      out.push(
        `<table><thead><tr>${header.map((h) => `<th>${inline(h)}</th>`).join('')}</tr></thead><tbody>${rows
          .map((r) => `<tr>${r.map((c) => `<td>${inline(c)}</td>`).join('')}</tr>`)
          .join('')}</tbody></table>`
      );
      continue;
    }

    // Headings
    const h = line.match(/^(#{1,4})\s+(.*)$/);
    if (h) {
      const level = h[1].length + 1; // shift so ## -> h3 under the page h1
      out.push(`<h${level}>${inline(h[2])}</h${level}>`);
      i++;
      continue;
    }

    // Blockquote
    if (line.startsWith('>')) {
      const buf: string[] = [];
      while (i < lines.length && lines[i].startsWith('>')) {
        buf.push(lines[i].replace(/^>\s?/, ''));
        i++;
      }
      out.push(`<blockquote>${inline(buf.join(' '))}</blockquote>`);
      continue;
    }

    // Ordered list
    if (/^\d+\.\s/.test(line)) {
      const buf: string[] = [];
      while (i < lines.length && /^\d+\.\s/.test(lines[i])) {
        buf.push(`<li>${inline(lines[i].replace(/^\d+\.\s/, ''))}</li>`);
        i++;
      }
      out.push(`<ol>${buf.join('')}</ol>`);
      continue;
    }

    // Unordered list
    if (/^[-*]\s/.test(line)) {
      const buf: string[] = [];
      while (i < lines.length && /^[-*]\s/.test(lines[i])) {
        buf.push(`<li>${inline(lines[i].replace(/^[-*]\s/, ''))}</li>`);
        i++;
      }
      out.push(`<ul>${buf.join('')}</ul>`);
      continue;
    }

    // Paragraph
    out.push(`<p>${inline(line)}</p>`);
    i++;
  }

  return out.join('\n');
}
