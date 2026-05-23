import type { MetadataRoute } from "next";
import { siteConfig } from "@/config/site";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  const { url, routes } = siteConfig;

  return [
    {
      url: `${url}${routes.feed.path}`,
      lastModified: now,
      changeFrequency: "always",
      priority: 1,
    },
    {
      url: `${url}${routes.explore.path}`,
      lastModified: now,
      changeFrequency: "hourly",
      priority: 0.9,
    },
    // profile and notifications are user-private — excluded from sitemap
  ];
}
