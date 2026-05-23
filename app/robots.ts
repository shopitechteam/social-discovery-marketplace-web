import type { MetadataRoute } from "next";
import { siteConfig } from "@/config/site";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: ["/feed", "/explore", "/profile/"],
      disallow: ["/notifications", "/upload", "/api/"],
    },
    sitemap: `${siteConfig.url}/sitemap.xml`,
  };
}
