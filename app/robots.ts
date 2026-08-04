import type { MetadataRoute } from "next";
import { siteConfig } from "@/config/site";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: [
        "/notifications",
        "/upload",
        "/api/",
        "/*/notifications",
        "/*/upload",
        "/*/auth/",
        // Public seller pages (/{lang}/profile/{username}) stay crawlable —
        // only the viewer's own profile and its management screens are private.
        "/*/profile/edit",
        "/*/profile/followers",
        "/*/profile/visitors",
        "/*/profile/posts",
      ],
    },
    sitemap: `${siteConfig.url}/sitemap.xml`,
    host: siteConfig.url,
  };
}
