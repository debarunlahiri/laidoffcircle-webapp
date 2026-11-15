import type { MetadataRoute } from "next";
import { canonicalOrigin } from "@/lib/share-metadata";

// Member areas and sign-in screens hold nothing worth indexing. Posts, member
// profiles and open referrals stay crawlable; the pages themselves mark
// anonymous or private items noindex.
const privatePaths = [
  "/api/",
  "/admin",
  "/settings",
  "/messages",
  "/notifications",
  "/bookmarks",
  "/support",
  "/profile",
  "/search",
  "/login",
  "/register",
  "/verify-email",
  "/offline",
  "/referrals/new",
];

// Crawlers that collect text to train models. Search and assistant crawlers
// (OAI-SearchBot, ChatGPT-User, Claude-SearchBot, PerplexityBot ...) are not
// listed, so they follow the default rule. Set AI_CRAWLERS=block to opt out.
const trainingCrawlers = [
  "GPTBot",
  "ClaudeBot",
  "anthropic-ai",
  "CCBot",
  "Google-Extended",
  "Applebot-Extended",
  "Bytespider",
  "Meta-ExternalAgent",
  "cohere-ai",
];

export default function robots(): MetadataRoute.Robots {
  const origin = canonicalOrigin();
  const rules: MetadataRoute.Robots["rules"] = [
    { userAgent: "*", allow: "/", disallow: privatePaths },
  ];
  if (process.env.AI_CRAWLERS === "block")
    rules.push({ userAgent: trainingCrawlers, disallow: "/" });
  return { rules, sitemap: `${origin}/sitemap.xml`, host: origin };
}
