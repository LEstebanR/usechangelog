import type { MetadataRoute } from "next";
import { siteUrl } from "@/lib/site";

// Crawlers get the landing, the legal pages and the public changelogs; never the app,
// sign-in or the API (#19). Previews are kept out by Vercel's own noindex header.
// Rules are path prefixes, so each one is anchored: "/app" alone would also block a
// changelog like /apple. "$" ends the exact path; the "/" form covers what's under it.
const blocked = ["/app", "/sign-in", "/signup"].flatMap((path) => [`${path}$`, `${path}/`]);

export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: "*", allow: "/", disallow: [...blocked, "/api/"] },
    sitemap: `${siteUrl()}/sitemap.xml`,
  };
}
