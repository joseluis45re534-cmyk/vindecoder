import type { MetadataRoute } from "next";
import { SITE_URL, CONTENT_REVISED as CONTENT_REVISED_ISO } from "@/lib/site";
import { getBlogSitemap } from "@/lib/autoseo";
import { allGuides } from "@/lib/how-to";
import { COMPETITORS, comparisonSlug } from "@/lib/comparisons";
import { allCheckPages } from "@/lib/checks";
import { BRANDS } from "@/lib/brands";
import { SAMPLE_REPORTS } from "@/lib/sample-reports";

export const runtime = "edge";

// Stable content-revision date. Using `new Date()` here would stamp EVERY page's
// <lastmod> as "today" on every sitemap fetch — telling Google all ~690 pages
// change daily, which erodes trust in lastmod and wastes crawl budget on a young
// domain. Bump this only when the programmatic content actually changes. Blog
// posts keep their own real dates below. Single source: CONTENT_REVISED in
// lib/site.ts (also drives the visible "Last reviewed" dates).
const CONTENT_REVISED = new Date(`${CONTENT_REVISED_ISO}T00:00:00Z`);

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = CONTENT_REVISED;

  const core: MetadataRoute.Sitemap = [
    { url: `${SITE_URL}/`, lastModified: now, changeFrequency: "weekly", priority: 1 },
    { url: `${SITE_URL}/vin-check`, lastModified: now, changeFrequency: "weekly", priority: 0.9 },
    { url: `${SITE_URL}/pricing`, lastModified: now, changeFrequency: "monthly", priority: 0.8 },
    { url: `${SITE_URL}/blog`, lastModified: now, changeFrequency: "weekly", priority: 0.7 },
    { url: `${SITE_URL}/how-to`, lastModified: now, changeFrequency: "weekly", priority: 0.7 },
    { url: `${SITE_URL}/window-sticker`, lastModified: now, changeFrequency: "weekly", priority: 0.7 },
    { url: `${SITE_URL}/auctions`, lastModified: now, changeFrequency: "monthly", priority: 0.6 },
    { url: `${SITE_URL}/compare`, lastModified: now, changeFrequency: "monthly", priority: 0.7 },
    { url: `${SITE_URL}/auto-loan-calculator`, lastModified: now, changeFrequency: "monthly", priority: 0.6 },
    { url: `${SITE_URL}/lease-calculator`, lastModified: now, changeFrequency: "monthly", priority: 0.6 },
    { url: `${SITE_URL}/depreciation-calculator`, lastModified: now, changeFrequency: "monthly", priority: 0.6 },
    { url: `${SITE_URL}/problems`, lastModified: now, changeFrequency: "monthly", priority: 0.6 },
    { url: `${SITE_URL}/most-stolen-cars`, lastModified: now, changeFrequency: "monthly", priority: 0.6 },
    { url: `${SITE_URL}/most-totaled-cars`, lastModified: now, changeFrequency: "monthly", priority: 0.6 },
    { url: `${SITE_URL}/most-flooded-cars`, lastModified: now, changeFrequency: "monthly", priority: 0.6 },
    { url: `${SITE_URL}/worst-cars-to-buy`, lastModified: now, changeFrequency: "monthly", priority: 0.6 },
    { url: `${SITE_URL}/glossary`, lastModified: now, changeFrequency: "monthly", priority: 0.6 },
    { url: `${SITE_URL}/data-sources`, lastModified: now, changeFrequency: "monthly", priority: 0.6 },
    { url: `${SITE_URL}/about`, lastModified: now, changeFrequency: "yearly", priority: 0.4 },
    { url: `${SITE_URL}/contact`, lastModified: now, changeFrequency: "yearly", priority: 0.4 },
    { url: `${SITE_URL}/privacy`, lastModified: now, changeFrequency: "yearly", priority: 0.2 },
    { url: `${SITE_URL}/terms`, lastModified: now, changeFrequency: "yearly", priority: 0.2 },
    { url: `${SITE_URL}/refund`, lastModified: now, changeFrequency: "yearly", priority: 0.2 },
    { url: `${SITE_URL}/cookies`, lastModified: now, changeFrequency: "yearly", priority: 0.2 },
  ];

  const brands: MetadataRoute.Sitemap = BRANDS.map((b) => ({
    url: `${SITE_URL}/vin-check/${b.slug}`,
    lastModified: now,
    changeFrequency: "monthly",
    priority: 0.8,
  }));

  // Blog posts come from AutoSEO's content API (slugs + updatedAt). Never throws
  // (returns [] on failure/unconfigured) so the sitemap always renders.
  const blogEntries = await getBlogSitemap();
  const posts: MetadataRoute.Sitemap = blogEntries.map((e) => ({
    url: `${SITE_URL}/blog/${e.slug}`,
    lastModified: e.updatedAt ? new Date(e.updatedAt) : now,
    changeFrequency: "weekly",
    priority: 0.6,
  }));

  const guides: MetadataRoute.Sitemap = allGuides().map((g) => ({
    url: `${SITE_URL}/how-to/${g.slug}`,
    lastModified: now,
    changeFrequency: "monthly",
    priority: 0.6,
  }));

  const checks: MetadataRoute.Sitemap = allCheckPages().map((c) => ({
    url: `${SITE_URL}/${c.slug}`,
    lastModified: now,
    changeFrequency: "monthly",
    priority: 0.8,
  }));

  // NOTE: thin/templated tiers are intentionally OMITTED from the sitemap and
  // carry robots noindex,follow (see their pages):
  //   - /window-sticker/[make]/[model] and /vin-check/[brand]/[model] (deep model tiers)
  //   - /window-sticker/[make]   (~100 words/page; sticker data not live until ClearVin)
  //   - /auctions/damage/[type] and /auctions/type/[type]   (~200 words/page)
  //   - /license-plate-lookup/[state]   (51 near-identical pages; plate search not live)
  // On a young domain they'd only dilute crawl budget; concentrate it on the
  // brand hubs, checks, guides, and blog. Re-add them here (and drop the
  // noindex) once each tier is enriched and the domain has indexing authority.

  const compare: MetadataRoute.Sitemap = COMPETITORS.flatMap((c) => [
    {
      url: `${SITE_URL}/${c.slug}-alternative`,
      lastModified: now,
      changeFrequency: "monthly" as const,
      priority: 0.6,
    },
    {
      url: `${SITE_URL}/compare/${comparisonSlug(c.slug)}`,
      lastModified: now,
      changeFrequency: "monthly" as const,
      priority: 0.6,
    },
  ]);

  // Curated SAMPLE reports only — real/paid reports are never in the sitemap
  // (see lib/sample-reports.ts + robots.ts for the matching allow carve-out).
  const sampleReports: MetadataRoute.Sitemap = SAMPLE_REPORTS.map((r) => ({
    url: `${SITE_URL}/report/${r.vin}`,
    lastModified: now,
    changeFrequency: "yearly",
    priority: 0.5,
  }));

  return [
    ...core,
    ...brands,
    ...posts,
    ...guides,
    ...checks,
    ...compare,
    ...sampleReports,
  ];
}
