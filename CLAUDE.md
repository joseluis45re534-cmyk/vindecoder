# CLAUDE.md

Project conventions for carvinlookup.us (Next.js App Router + TypeScript + Tailwind, Cloudflare Pages).

## SEO / GEO conventions

- **Every public route exports `metadata` or `generateMetadata`** — unique title (~50–60 chars), description (~140–160 chars), `alternates.canonical`, OpenGraph, Twitter card. `metadataBase` is set once in the root layout.
- **Structured data lives in `src/lib/structured-data.ts`.** Pure functions returning plain JSON-LD objects; render with `<JsonLd data={...} />` (`src/components/JsonLd.tsx`), which server-renders `<script type="application/ld+json">` tags. Don't create a parallel `lib/schema/` directory — extend this file.
- **All indexable content must be server-rendered.** Most LLM/AI crawlers don't execute JavaScript reliably. If a page needs metadata or crawlable text, it must be a Server Component (or have its client-only parts fed initial data from a Server Component wrapper) — see the `/report/[id]` pattern below.
- **`src/app/sitemap.ts` and `src/app/llms.txt` / `llms-full.txt` pull from the same source of truth as the pages** (`BRANDS`, `allPosts()`, `SAMPLE_REPORTS`, `TRIAL_PLAN`). Never hardcode a divergent list — add new indexable content to its source-of-truth file and these pick it up automatically.
- **`src/app/robots.ts` explicitly allow-lists AI crawlers** (GPTBot, ClaudeBot, PerplexityBot, etc. — see the file for the full, commented list) alongside the default `*` rule. When adding a new disallow, add it to the `DISALLOW` array once — it applies to every rule automatically.
- **Never fabricate stats, reviews, authors, or sources.** If a number or claim can't be verified against the product or a real source, don't schema-encode it — flag it in code with a `TODO` comment and leave it out of structured data. See `src/app/(site)/page.tsx` for the existing pattern (the homepage's "4.8" rating and testimonials are explicitly marked as placeholders pending real data).
- **Cite only verified, live external URLs.** Before citing a government/authority source (NMVTIS, NICB, NHTSA, etc.), verify the URL is live via WebFetch/WebSearch — don't cite from memory.

## Programmatic content clusters (SEO)

Large SEO page-groups are **data-driven from a single source-of-truth file**; the routes, `sitemap.ts`, `llms.txt`, and nav all read from it, so you add content by editing the data file — never by hand-listing URLs. Each cluster follows the `BRANDS` → `/vin-check/[brand]` pattern.

| Cluster | Source of truth | Routes |
|---|---|---|
| Blog posts | `src/lib/blog.ts` (`DEMO_POSTS`) | `/blog`, `/blog/[slug]` |
| How-to guides | `src/lib/how-to.ts` (`HOW_TO_GUIDES`) | `/how-to`, `/how-to/[slug]` |
| Comparisons / alternatives | `src/lib/comparisons.ts` (`COMPETITORS`) | `/compare`, `/compare/[slug]`, `/[x]-alternative` |
| Specialty checks | `src/lib/checks.ts` (`CHECK_PAGES`) | `/salvage-check`, `/lien-check`, `/vin-decoder`, `/license-plate-lookup`, … |
| Window stickers | `src/lib/window-stickers.ts` (`STICKER_MAKES`) | `/window-sticker`, `/window-sticker/[make]`, `/window-sticker/[make]/[model]` |
| Auctions (educational) | `src/lib/auctions.ts` (`DAMAGE_TYPES`, `VEHICLE_TYPES`) | `/auctions`, `/auctions/damage/[type]`, `/auctions/type/[type]` |
| Problem pages | `src/lib/problem-pages.ts` + `/most-stolen-cars` | `/problems`, `/most-*-cars`, `/worst-cars-to-buy` |
| Calculators | interactive client components in `src/components/calculators/` | `/auto-loan-calculator`, `/lease-calculator`, `/depreciation-calculator` |

Rules when adding to a cluster:
- **Add the entry to the data file, then verify `sitemap.ts` + `llms.txt` include it** (both import these lists — a new entry should appear automatically).
- **No self-cannibalization.** Don't create two pages targeting the same keyword/intent (e.g. a `/how-to/spot-odometer-rollback` guide *and* a `/blog/how-to-spot-odometer-rollback` post). Pick one canonical home and cross-link.
- **No fabrication (reinforced).** Competitor comparison pages stay to general, widely-known positioning — never invent a competitor's price/feature. Window-sticker and check pages describe what the report/sticker contains and funnel to the live VIN lookup; they never hardcode a specific car's MSRP/specs. Listicles cite real public sources (e.g. NICB for `/most-stolen-cars`) with a live link, or are written as educational explainers when no authoritative per-model data exists.

### Phased indexing — deep model tiers are intentionally `noindex` (crawl-budget)

The two deepest, most templated tiers — **`/window-sticker/[make]/[model]`** and **`/vin-check/[brand]/[model]`** (~500 pages combined) — are deliberately **`robots: { index: false, follow: true }`** and **omitted from `sitemap.ts`**. Reason: on a young, low-authority domain, ~500 near-duplicate templated pages triggered Google's *"Discovered – currently not indexed"* (crawl budget rationed; the pages were never even crawled). Concentrating crawl budget on the ~230 higher-value pages (make/brand hubs, checks, blog, how-to, compare, states, auctions, core) gets those indexed faster. The pages still render and stay internally linked for users; `follow: true` keeps link equity flowing.

- This is **temporary and deliberate** — not a bug. Don't "fix" it by re-indexing these tiers without a reason.
- **To re-open once the domain has indexing authority** (months out, once the hubs + blog rank and Search Console shows healthy indexing): remove the `robots` block from `src/app/(site)/window-sticker/[make]/[model]/page.tsx` and `src/app/(site)/vin-check/[brand]/[model]/page.tsx`, and restore the `stickerModels` + `modelVinChecks` blocks in `sitemap.ts` (see the comment there). It's a clean revert of commits `45961ed`/`c17f9b5`.
- **`sitemap.ts` uses a stable `CONTENT_REVISED` date, not `new Date()`** — a per-request `lastmod` tells Google every page changed "today" on every fetch, wasting crawl budget. Bump `CONTENT_REVISED` when programmatic content materially changes; blog posts keep their own real dates.
- New clusters that are thin/templated should follow the same judgment: if they'd add hundreds of near-duplicate URLs, ship them `noindex` + out of the sitemap until the domain can support them.

## Sample vs. real reports (`/report/[id]`)

`src/app/(site)/report/[id]/page.tsx` is a Server Component that branches on whether the VIN matches a curated entry in `src/lib/sample-reports.ts`:

- **Sample VINs** (4 curated, fictional VINs — not decodable via the live GoodCar API) get indexable metadata (`robots: index/follow: true`), a visible "Sample report" label, and `sampleReportLd()` schema (`CreativeWork`, explicitly illustrative — never `Product`/`Vehicle`, never `AggregateRating`). `src/app/robots.ts` has a matching `allow` carve-out for exactly these 4 paths.
- **Every other VIN** (a real or potential customer's report) gets generic, non-identifying metadata and `robots: index/follow: false`. `robots.ts` disallows crawling `/report/` broadly; the per-route `noindex` is defense-in-depth beyond that.
- The actual UI/fetch/checkout logic lives in `src/components/report/ReportView.tsx` (client component). It accepts an optional `sample` prop — when present, it skips the live `/api/preview` fetch and renders the curated static data instead. **Do not add new sample VINs without also adding them to `SAMPLE_REPORTS`** — that's the single source of truth used by the homepage cards, the report page, `robots.ts`, and `sitemap.ts`.

## Payment / checkout logic — hands off unless explicitly asked

`TrialCheckout.tsx`, `UnlockedReport.tsx`, `ManageSubscriptionButton.tsx`, everything under `src/app/api/checkout/`, `src/app/api/webhooks/`, `src/lib/goodcar.ts`, `src/app/api/preview/route.ts`, `src/app/api/report/route.ts` are the entitlement/billing core. Changes here have real financial/legal consequences (Stripe subscriptions, GoodCar API costs) — don't refactor incidentally while working on adjacent UI/SEO work.

## E-E-A-T / trust content

- `/glossary` — `DefinedTermSet` reference for every VIN/title term used across the site. Add new terms here first, then link to them from blog posts / brand pages rather than re-defining a term inline.
- `/data-sources` — the methodology page. If a new data provider or report section is added to the product, update this page so the "what we check" claims stay accurate.
