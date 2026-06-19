import type { MetadataRoute } from "next";
import { siteConfig } from "@/config/site";
import { blogPosts } from "@/lib/blog";
import { locales } from "@/i18n/config";

/**
 * The app is served under /[lang]. Every public page exists per-locale, so each
 * sitemap entry lists its locale alternates (hreflang) to avoid duplicate-content
 * issues and help engines serve the right language.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  const { url } = siteConfig;

  const langs = (l: string, path: string) => `${url}/${l}${path}`;
  const alternates = (path: string) => ({
    languages: Object.fromEntries(locales.map((l) => [l, langs(l, path)])),
  });

  // path -> [changeFrequency, priority, lastModified?]
  const staticPages: {
    path: string;
    changeFrequency: MetadataRoute.Sitemap[number]["changeFrequency"];
    priority: number;
  }[] = [
    { path: "", changeFrequency: "weekly", priority: 1 },
    { path: "/blog", changeFrequency: "weekly", priority: 0.85 },
    { path: "/about", changeFrequency: "monthly", priority: 0.7 },
    { path: "/careers", changeFrequency: "monthly", priority: 0.5 },
    { path: "/feed", changeFrequency: "always", priority: 0.9 },
    { path: "/explore", changeFrequency: "hourly", priority: 0.8 },
  ];

  const staticEntries: MetadataRoute.Sitemap = staticPages.map((p) => ({
    url: langs("en", p.path),
    lastModified: now,
    changeFrequency: p.changeFrequency,
    priority: p.priority,
    alternates: alternates(p.path),
  }));

  const blogEntries: MetadataRoute.Sitemap = blogPosts.map((post) => ({
    url: langs("en", `/blog/${post.slug}`),
    lastModified: new Date(post.publishedAt),
    changeFrequency: "monthly",
    priority: 0.75,
    alternates: alternates(`/blog/${post.slug}`),
  }));

  return [...staticEntries, ...blogEntries];
}
