import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site";

export const runtime = "edge";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        // Generated reports are thin, paywalled, per-user pages — keep them out of the index.
        disallow: ["/report/", "/api/"],
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
