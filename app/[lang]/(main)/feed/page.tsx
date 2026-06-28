import type { Metadata } from "next";
import { siteConfig } from "@/config/site";

export const metadata: Metadata = {
  title: siteConfig.routes.feed.title,
  description: siteConfig.routes.feed.description,
  alternates: { canonical: `${siteConfig.url}${siteConfig.routes.feed.path}` },
};

// The Home feed itself is mounted once in MainShell so it persists across
// bottom-nav navigation (Home ⇄ Explore …) without remounting/refetching. This
// route only exists for its URL + metadata; MainShell renders the live feed and
// suppresses this page's body on /feed to avoid a double mount.
export default function FeedPageRoute() {
  return null;
}
