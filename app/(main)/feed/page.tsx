import type { Metadata } from "next";
import { siteConfig } from "@/config/site";

export const metadata: Metadata = {
  title: siteConfig.routes.feed.title,
  description: siteConfig.routes.feed.description,
  alternates: { canonical: `${siteConfig.url}${siteConfig.routes.feed.path}` },
};

export default function FeedPage() {
  return <div className="p-4">Feed</div>;
}
