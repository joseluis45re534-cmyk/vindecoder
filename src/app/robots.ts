import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site";

export const runtime = "edge";

// Generated reports are thin, paywalled, per-user pages — keep them out of
// every index (search + AI). Everything else is open.
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
      { userAgent: "*", allow: "/", disallow: DISALLOW },
      ...AI_CRAWLERS.map((userAgent) => ({ userAgent, allow: "/", disallow: DISALLOW })),
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
