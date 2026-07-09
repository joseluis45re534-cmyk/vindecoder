import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site";
import { allPosts } from "@/lib/blog";
import { allGuides } from "@/lib/how-to";
import { COMPETITORS, comparisonSlug } from "@/lib/comparisons";
import { allCheckPages } from "@/lib/checks";
import { STICKER_MAKES, allStickerModels } from "@/lib/window-stickers";
import { DAMAGE_TYPES, VEHICLE_TYPES } from "@/lib/auctions";
import { BRANDS } from "@/lib/brands";
import { SAMPLE_REPORTS } from "@/lib/sample-reports";

export const runtime = "edge";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

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

  const posts: MetadataRoute.Sitemap = allPosts().map((p) => ({
    url: `${SITE_URL}/blog/${p.slug}`,
    lastModified: new Date(p.updated || p.date),
    changeFrequency: "monthly",
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

  const stickerMakes: MetadataRoute.Sitemap = STICKER_MAKES.map((m) => ({
    url: `${SITE_URL}/window-sticker/${m.slug}`,
    lastModified: now,
    changeFrequency: "monthly",
    priority: 0.6,
  }));

  const stickerModels: MetadataRoute.Sitemap = allStickerModels().map((m) => ({
    url: `${SITE_URL}/window-sticker/${m.makeSlug}/${m.modelSlug}`,
    lastModified: now,
    changeFrequency: "monthly",
    priority: 0.5,
  }));

  const auctions: MetadataRoute.Sitemap = [
    ...DAMAGE_TYPES.map((d) => ({
      url: `${SITE_URL}/auctions/damage/${d.slug}`,
      lastModified: now,
      changeFrequency: "monthly" as const,
      priority: 0.5,
    })),
    ...VEHICLE_TYPES.map((v) => ({
      url: `${SITE_URL}/auctions/type/${v.slug}`,
      lastModified: now,
      changeFrequency: "monthly" as const,
      priority: 0.5,
    })),
  ];

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
    ...stickerMakes,
    ...stickerModels,
    ...auctions,
    ...compare,
    ...sampleReports,
  ];
}
