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
