import type { Metadata } from "next";
import { siteConfig } from "@/config/site";

export const metadata: Metadata = {
  title: siteConfig.routes.explore.title,
  description: siteConfig.routes.explore.description,
  alternates: { canonical: `${siteConfig.url}${siteConfig.routes.explore.path}` },
};

export default function ExplorePage() {
  return <div className="p-4">Explore</div>;
}
