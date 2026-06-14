import type { Metadata } from "next";
import { siteConfig } from "@/config/site";
import { DiscoverPage } from "@/features/discover/components/DiscoverPage";

export const metadata: Metadata = {
  title: siteConfig.routes.explore.title,
  description: siteConfig.routes.explore.description,
  alternates: { canonical: `${siteConfig.url}${siteConfig.routes.explore.path}` },
};

type Props = { params: Promise<{ lang: string }> };

export default async function ExplorePage({ params }: Props) {
  const { lang } = await params;
  return <DiscoverPage lang={lang} />;
}
