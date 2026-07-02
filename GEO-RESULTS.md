# GEO/AEO Validation Results

Validation run against `npm run dev` (localhost:3000) after all changes in this pass. See `GEO-AUDIT.md` for the audit and prioritized backlog this executed against.

## 1. Build & types

```
npx tsc --noEmit   → 0 errors (run after each of 4 logical groups: report-page split; new pages + sitemap/llms.txt; blog polish; small fixes)
npm run build      → Compiled successfully, 0 errors, all routes listed including /glossary, /data-sources, /report/[id]
```

## 2. Server-rendered HTML (raw, pre-hydration) — sample vs. real report separation

| Route | Title | `robots` meta | Notable markers |
|---|---|---|---|
| `/report/4T1G11AK5MU546321` (sample) | `Sample report: 2021 Toyota Camry \| CarVinLookup` | `index, follow` | "Sample report" badge ×2, "Example report data" section, `CreativeWork` JSON-LD present, illustrative disclaimer present |
| `/report/1HGCM82633A004352` (real/arbitrary VIN) | `Vehicle history report \| CarVinLookup` | `noindex, nofollow` | No "Sample report" badge in the report body (the one match found was the unrelated footer "Sample reports" nav link, present site-wide), no `CreativeWork` schema |

Both confirmed via `curl` against the dev server — content present before any client JS runs.

**Title bug found and fixed during validation:** `/glossary` and `/data-sources` initially double-suffixed (`X — CarVinLookup | CarVinLookup`) because their own title strings redundantly included the site name on top of the root layout's `title.template`. `/report/[id]`'s dynamic `generateMetadata` didn't get the template applied at all (unlike the structurally similar `/vin-check/[brand]`, which does). Fixed by matching the site's established convention (omit the site name, let the template add `| CarVinLookup`) for glossary/data-sources, and using `title: { absolute: ... }` for `/report/[id]` to make the outcome deterministic regardless of the template-application inconsistency. Re-verified after the fix — all four routes now produce a single, correctly formatted title.

## 3. `/glossary` and `/data-sources`

- `/glossary`: `DefinedTermSet` JSON-LD present with 19 `DefinedTerm` entries (18 glossary terms + the set itself), visible term text confirmed in HTML (e.g. "Title washing").
- `/data-sources`: all three verified external links present (`vehiclehistory.gov`, `nicb.org/vincheck`, `nhtsa.gov/recalls`), "Honest limitations" section present.

## 4. `robots.txt`

All 21 rule blocks (`*` + 20 named AI crawlers) contain, in order:
```
Allow: /
Allow: /report/4T1G11AK5MU546321
Allow: /report/JF1VA2M62K980015S
Allow: /report/1G1ZE5ST5FF21984W
Allow: /report/1FTFW1ED5PFA1234F
Disallow: /report/
Disallow: /api/
Disallow: /admin
```
The 4 sample-VIN `Allow` rules are more specific than the general `Disallow: /report/`, so per the robots.txt spec they open exactly those 4 paths while every other `/report/*` URL (every real customer report) stays blocked for every listed crawler.

## 5. `sitemap.xml`

- `/glossary`, `/data-sources`, `/refund`, `/cookies` all present (previously `/refund`/`/cookies` were missing; `/glossary`/`/data-sources` are new).
- Exactly 4 `/report/*` URLs present, matching the 4 curated sample VINs — **zero real report URLs** in the sitemap (confirmed by listing every `<loc>` matching `/report/`).

## 6. `llms.txt` / `llms-full.txt`

- Both now have a `## Reference` section linking `/glossary`, `/data-sources`, and the sample-reports homepage anchor (`#examples`) — no individual `/report/{vin}` URLs listed in either file (matches the convention of linking the anchor, not per-report URLs).
- `llms.txt`'s "Data sources" section now also names NHTSA and links `/data-sources`.
- `llms-full.txt` has a new "Data sources & methodology" section (condensed, evergreen — not a duplicate of the `/data-sources` page).

## 7. Homepage regression check

- All 4 sample-report card links present and pointing at the same VINs used in `sample-reports.ts` (single source of truth — the homepage now imports `SAMPLE_REPORTS` instead of a local, divergent `EXAMPLES` const).
- Footer "Guides" column now links `/glossary` and `/data-sources`.
- `FAQPage`/`HowTo` JSON-LD and all existing homepage copy unchanged.

## 8. Blog post polish (spot-checked on `salvage-title-vs-rebuilt-title`)

- "Key takeaways" block present.
- The salvage/rebuilt/junk/flood list now also renders as an HTML `<table>` (converted from a bullet list, using the existing markdown renderer's pre-existing table support).
- Interlinks to `/glossary` and `/data-sources` present; outbound citation to `vehiclehistory.gov` present.

## 9. Contact page fixes

- Support hours now read "24/7 — always available" (was "Mon–Fri, 9am–6pm ET", per operator confirmation the real answer is 24/7).
- Support email confirmed `support@carvinlookup.us` (the two stray `support@carvinlookup.com` occurrences on `/privacy` and `/terms` were fixed to `.us`).

## 10. Checkout/payment/VIN-resolution safety check

```
$ git diff --stat -- src/components/checkout/TrialCheckout.tsx src/components/report/UnlockedReport.tsx \
    src/components/checkout/ManageSubscriptionButton.tsx 'src/app/api/checkout/**' 'src/app/api/webhooks/**' \
    src/lib/goodcar.ts src/app/api/preview/route.ts src/app/api/report/route.ts src/lib/pricing.ts

(no output — zero changes)
```

Also manually confirmed: the checkout panel ("Full report access" / price / `TrialCheckout`) still renders identically on a sample report page — sample mode only changes the vehicle-data section and adds the label/schema, never the payment flow.

## 11. Citation verification (done before writing content, not after)

| Citation | URL used | Verified via |
|---|---|---|
| NMVTIS | `https://vehiclehistory.gov` | WebFetch — confirmed official DOJ/BJA site, links to the current NMVTIS consumer report portal |
| NICB | `https://www.nicb.org/vincheck` | WebSearch — confirmed live, current VINCheck tool URL |
| NHTSA recalls | `https://www.nhtsa.gov/recalls` | WebSearch — confirmed live, current VIN-based recall lookup |
| ~~49 CFR 565 (eCFR)~~ | *not used* | WebFetch resolved to a bot-verification interstitial (`unblock.federalregister.gov`), not reliable live content — dropped rather than cite an unverified link |

## Summary

All items from the `GEO-AUDIT.md` backlog (rows 1–7) are implemented and verified. Rows 8–10 (fabricated-stat cleanup, new AggregateRating, new long-tail guides) were explicitly out of scope for this pass per operator decision — documented, not actioned.
