import type { MetadataRoute } from "next";

import { SITE_URL } from "@/lib/seo";

// AI crawlers, explicitly allowed: retrieval/search bots get us cited in AI
// answers; training bots put the brand in model knowledge. Both are wanted.
const AI_BOTS = [
  "GPTBot",
  "OAI-SearchBot",
  "ChatGPT-User",
  "ClaudeBot",
  "Claude-SearchBot",
  "Claude-User",
  "anthropic-ai",
  "PerplexityBot",
  "Perplexity-User",
  "Google-Extended",
  "Meta-ExternalAgent",
  "Applebot-Extended",
  "Amazonbot",
  "Bytespider",
  "CCBot",
];

const DISALLOW = ["/admin", "/api"];

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      { userAgent: "*", allow: "/", disallow: DISALLOW },
      ...AI_BOTS.map((userAgent) => ({
        userAgent,
        allow: "/",
        disallow: DISALLOW,
      })),
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
