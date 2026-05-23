import type { MetadataRoute } from "next";
import { siteConfig } from "@/config/site";
import { blogPosts } from "@/lib/blog";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  const { url, routes } = siteConfig;

  const blogEntries: MetadataRoute.Sitemap = blogPosts.map((post) => ({
    url: `${url}/blog/${post.slug}`,
    lastModified: new Date(post.publishedAt),
    changeFrequency: "monthly",
    priority: 0.75,
  }));

  return [
    {
      url,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 1,
    },
    {
      url: `${url}/blog`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.85,
    },
    ...blogEntries,
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
