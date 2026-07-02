# GEO/AEO Audit — carvinlookup.us

**Date:** 2026-07-02
**Scope:** Generative Engine Optimization / Answer Engine Optimization readiness — how retrievable, understandable, and citable the site is to LLM-based answer engines (ChatGPT, Claude, Perplexity, Gemini, Copilot), in addition to classic search.

## 0. Headline finding

Most of the technical GEO foundation was already built in an earlier session on this project. This audit's job was to find the **real remaining gaps** and close them — not to rebuild infrastructure that already works. Sections 1–5 below document what exists (mostly ✅); section 6 is the prioritized backlog this pass executed against.

## 1. Stack

- Next.js App Router + TypeScript + Tailwind, deployed to Cloudflare Pages via `@cloudflare/next-on-pages`. Every route runs `export const runtime = 'edge'`.
- Rendering: all public routes are Server Components (static or dynamic-edge). The one exception found and fixed in this pass was `/report/[id]`, which was a `'use client'` page — see §6.1.
- `metadataBase` is set in the root layout (`src/app/layout.tsx`) from `SITE_URL`, so relative OG/canonical URLs resolve correctly.

## 2. Crawlability — robots.txt / sitemap.xml

**`src/app/robots.ts`** (pre-existing, verified good): explicit rules for 17 named AI crawlers/agents — `GPTBot`, `OAI-SearchBot`, `ChatGPT-User` (OpenAI); `ClaudeBot`, `anthropic-ai`, `Claude-User` (Anthropic); `PerplexityBot`, `Perplexity-User`; `Google-Extended`, `Google-CloudVertexBot`; `Applebot-Extended`; `Amazonbot`; `DuckAssistBot`; `MistralAI-User`; `cohere-ai`; `YouBot`; `Bytespider`; `meta-externalagent`; `CCBot`; `Timpibot` — plus the default `*` rule. `/api/`, `/admin`, and `/report/` are disallowed for everyone; the sitemap is referenced.

**Change made this pass:** added a scoped `allow` carve-out for the 4 curated sample-report paths (`/report/{sample-vin}`), sourced from `lib/sample-reports.ts` so it can't drift. Per the robots.txt spec, the most specific matching rule wins regardless of order, so this opens exactly those 4 paths for indexing while every other `/report/*` path (i.e. every real customer report) stays blocked.

**`src/app/sitemap.ts`** (pre-existing, verified good): generated programmatically from `BRANDS` and `allPosts()` — no hardcoded, divergent lists. Real report URLs were never included (correct).

**Changes made this pass:** added the missing `/refund` and `/cookies` (present as pages, absent from the sitemap before), plus the new `/glossary`, `/data-sources`, and the 4 sample-report URLs.

## 3. `/llms.txt` and `/llms-full.txt`

Both pre-existing (`src/app/llms.txt/route.ts`, `src/app/llms-full.txt/route.ts`), dynamically generated from `SITE_URL`, `TRIAL_PLAN` pricing, `BRANDS`, and `allPosts()` — never hardcoded or stale, never leak private report URLs.

**Changes made this pass:** added a "Reference" section to both linking `/glossary`, `/data-sources`, and the sample-reports anchor; added an NHTSA line and a `/data-sources` link to the "Data sources" section of `llms.txt`; added a condensed "Data sources & methodology" section to `llms-full.txt` (evergreen content, not a byte-for-byte duplicate of `/data-sources`).

## 4. Structured data (JSON-LD)

**Pre-existing, in `src/lib/structured-data.ts`** (kept as the single schema file — not split into a new `lib/schema/` directory, since one working, well-organized file already existed and splitting it would be pure churn with no functional benefit):

- `Organization`, `WebSite` (with `SearchAction`), `Service` — site-wide identity graph, root layout.
- `FAQPage`, `HowTo` — homepage, mirrors the visible FAQ/how-it-works text exactly.
- `BreadcrumbList` — brand pages, blog posts (now also glossary, data-sources).
- `BlogPosting` — blog posts, includes `dateModified`.
- `Product` — pricing page, dynamic `Offer` from `getPricing()`.
- `CollectionPage` / `WebPage` / `Service` — `/vin-check` hub and brand pages.

**No `AggregateRating` or `Review` schema exists anywhere — correctly.** The homepage displays a "4.8" rating and 3 testimonials that are explicitly marked in the code as placeholders (`TODO: replace with REAL reviews + an aggregate rating before launch (fabricated testimonials/ratings are an FTC risk...)`, `src/app/(site)/page.tsx`). Per the operator's decision, this pass leaves that visible copy unchanged and takes no schema action — flagged here as **unresolved**.

**Added this pass:**
- `sampleReportLd()` — `CreativeWork` schema for the 4 sample reports, explicitly described as an illustrative example, never `AggregateRating`, never implying a real individual vehicle record.
- `definedTermSetLd()` — `DefinedTermSet` + per-term `DefinedTerm` for the new `/glossary` page.

## 5. Metadata

Pre-existing: every public route (home, pricing, about, contact, privacy, terms, refund, cookies, vin-check, vin-check/[brand], blog, blog/[slug]) had complete, unique `title`/`description`/canonical/OG/Twitter metadata, sourced dynamically where relevant (brand name, post title, pricing).

**Gap found and fixed this pass:** `/report/[id]` had zero route-level metadata (it was a client component and couldn't export `generateMetadata`). It silently inherited the root layout's `index: true, follow: true` default — meaning a discovered real-customer report URL could theoretically be indexed even though `robots.txt` disallowed crawling it (disallow prevents fetching content, it doesn't guarantee a bare URL is never indexed). See §6.1.

## 6. What this pass changed (prioritized backlog, effort vs. impact)

| # | Item | Impact | Effort | Status |
|---|------|--------|--------|--------|
| 1 | `/report/[id]`: split sample vs. real reports, add per-route `generateMetadata` (`noindex` for real reports, indexable + labeled for the 4 curated samples), robots.txt allow carve-out | High | Medium | ✅ Done |
| 2 | Sitemap missing `/refund`, `/cookies` | Medium | Low | ✅ Done |
| 3 | New `/glossary` (18 terms, `DefinedTermSet`) | High | Medium | ✅ Done |
| 4 | New `/data-sources` (methodology, real outbound links, honest limitations) | High | Medium | ✅ Done |
| 5 | Blog: TL;DR blocks on all 3 posts, comparison table (salvage/rebuilt/junk/flood), real outbound citations | Medium | Low–Medium | ✅ Done |
| 6 | Support email domain inconsistency (`.us` vs `.com` across privacy/terms vs. contact/refund) | Low | Low | ✅ Fixed — standardized on `support@carvinlookup.us` per operator confirmation |
| 7 | `/contact` support-hours claim was "Mon–Fri, 9am–6pm ET" | Low | Low | ✅ Fixed — updated to 24/7 per operator confirmation |
| 8 | Homepage "268M+ vehicle records" stat — flagged in code as unverified | Medium (trust) | — | 🚩 **Documented only, no code change** — operator decision: leave the number, do not schema-encode it, confirm the real figure later |
| 9 | Homepage "4.8" rating + 3 testimonials — flagged in code as placeholder/FTC risk | High (trust) | — | 🚩 **Already correctly excluded from schema.** Visible copy unchanged this pass (out of scope — a content/business decision, not a GEO/schema task). Still needs real reviews before any `AggregateRating` schema is ever added. |
| 10 | New long-tail guide posts (mission's "optional" section — e.g. "How to check if a car is stolen by VIN") | Medium | High | ⏭️ **Deferred** — operator chose to scope this pass to infrastructure + polish; follow-up request. |

## 7. Guardrail compliance notes

- **No fabricated stats/reviews were added.** Items 8 and 9 above were found already flagged in the code by a prior session and are left exactly as flagged — this pass added no new claims and no schema for them.
- **Sample vs. real reports are now clearly separated** — sample pages carry a visible "Sample report" badge, a footer disclaimer ("This is a sample report for illustration only — it does not describe a real vehicle"), `CreativeWork` schema (not `Product`/`Vehicle`), and `robots: index/follow: true`; every other VIN gets generic metadata and `robots: index/follow: false`.
- **Checkout/payment/VIN-resolution logic was not touched.** `TrialCheckout.tsx`, `UnlockedReport.tsx`, `ManageSubscriptionButton.tsx`, everything under `api/checkout/`, `api/webhooks/`, `lib/goodcar.ts`, `api/preview/route.ts`, and `api/report/route.ts` have zero diffs from this work — see `GEO-RESULTS.md` for the `git diff --stat` confirmation.
- **All new/changed indexable content is server-rendered** — verified in `GEO-RESULTS.md` by inspecting raw (pre-hydration) HTML.
- **Real outbound citations only.** Every external URL cited (`vehiclehistory.gov`, `nicb.org/vincheck`, `nhtsa.gov/recalls`) was verified live via WebFetch/WebSearch during this pass, not recalled from memory. One candidate citation (a specific eCFR regulation deep link) was dropped after it resolved to a bot-verification page instead of live content — see `GEO-RESULTS.md`.

## 8. Still open (not in this pass's scope)

- Real customer reviews + a genuine `AggregateRating` (items 8/9 above).
- New long-tail guide posts (item 10).
- Password reset / email verification for the account system (unrelated to GEO — noted for completeness, not part of this audit).
