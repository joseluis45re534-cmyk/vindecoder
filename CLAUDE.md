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
