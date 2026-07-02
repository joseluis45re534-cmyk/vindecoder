import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site";
import { SAMPLE_REPORTS } from "@/lib/sample-reports";

export const runtime = "edge";

// Generated reports are thin, paywalled, per-user pages — keep them out of
// every index (search + AI). The exception: the curated SAMPLE report paths
// (lib/sample-reports.ts) are deliberately indexable educational content —
// allow those specific paths. Per the robots.txt spec, the most specific
// matching rule wins regardless of order, so listing these exact paths in
// `allow` opens only them while every other /report/* path (i.e. every real
// customer report) stays blocked by the broader disallow below.
const SAMPLE_REPORT_PATHS = SAMPLE_REPORTS.map((r) => `/report/${r.vin}`);
const ALLOW = ["/", ...SAMPLE_REPORT_PATHS];
const DISALLOW = ["/report/", "/api/", "/admin"];

// Explicitly welcome the major AI search crawlers and agent fetchers so the brand
// can be surfaced and cited by AI answers (ChatGPT, Claude, Perplexity, Gemini, …).
// Two kinds: indexers (train/index for answers) and live "User" agents (fetch a
// page in real time when a user asks the assistant about us).
const AI_CRAWLERS = [
  // OpenAI
  "GPTBot", // training/index
  "OAI-SearchBot", // ChatGPT search index
  "ChatGPT-User", // ChatGPT live browsing
  // Anthropic
  "ClaudeBot", // index
  "anthropic-ai",
  "Claude-User", // Claude live fetch
  // Perplexity
  "PerplexityBot",
  "Perplexity-User", // live fetch
  // Google / Apple (AI training signals)
  "Google-Extended",
  "Google-CloudVertexBot",
  "Applebot-Extended",
  // Others
  "Amazonbot",
  "DuckAssistBot",
  "MistralAI-User",
  "cohere-ai",
  "YouBot",
  "Bytespider", // ByteDance / Doubao
  "meta-externalagent", // Meta AI
  "CCBot", // Common Crawl (feeds many LLMs)
  "Timpibot",
];

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      { userAgent: "*", allow: ALLOW, disallow: DISALLOW },
      ...AI_CRAWLERS.map((userAgent) => ({ userAgent, allow: ALLOW, disallow: DISALLOW })),
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
