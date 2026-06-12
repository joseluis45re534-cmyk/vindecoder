import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site";

export const runtime = "edge";

// Generated reports are thin, paywalled, per-user pages — keep them out of
// every index (search + AI). Everything else is open.
const DISALLOW = ["/report/", "/api/", "/admin"];

// Per the seo-tool GEO guidance: explicitly welcome the major AI search crawlers
// so the brand can be surfaced and cited by AI answers.
const AI_CRAWLERS = [
  "GPTBot", // OpenAI training
  "OAI-SearchBot", // ChatGPT search index
  "ChatGPT-User", // ChatGPT live browsing
  "ClaudeBot", // Anthropic
  "Claude-Web",
  "PerplexityBot", // Perplexity
  "Google-Extended", // Gemini / AI Overviews training signal
  "Applebot-Extended",
];

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      { userAgent: "*", allow: "/", disallow: DISALLOW },
      ...AI_CRAWLERS.map((userAgent) => ({ userAgent, allow: "/", disallow: DISALLOW })),
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
