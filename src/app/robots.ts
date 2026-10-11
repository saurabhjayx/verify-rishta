import type { MetadataRoute } from "next";
import { absoluteUrl } from "@/lib/seo/site";

// We want to be cited by AI assistants, so search and training crawlers are
// allowed explicitly. Re-check this list each quarter: crawler names change.
const AI_AND_SEARCH_AGENTS = [
  "GPTBot",
  "OAI-SearchBot",
  "ChatGPT-User",
  "ClaudeBot",
  "Claude-SearchBot",
  "Claude-User",
  "PerplexityBot",
  "Perplexity-User",
  "Google-Extended",
  "Applebot",
  "Applebot-Extended",
  "Bingbot",
  "CCBot",
];

// Query strings are deliberately not disallowed: canonical tags consolidate UTM variants.
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      { userAgent: "*", allow: "/", disallow: ["/api/", "/admin/"] },
      ...AI_AND_SEARCH_AGENTS.map((userAgent) => ({
        userAgent,
        allow: "/",
        disallow: "/api/",
      })),
    ],
    sitemap: absoluteUrl("/sitemap.xml"),
  };
}
