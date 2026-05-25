import type { Metadata } from "next";
import { siteConfig } from "@/config/site";
import { FeedPage } from "@/features/feed/components/FeedPage";

export const metadata: Metadata = {
  title: siteConfig.routes.feed.title,
  description: siteConfig.routes.feed.description,
  alternates: { canonical: `${siteConfig.url}${siteConfig.routes.feed.path}` },
};

type Props = { params: Promise<{ lang: string }> };

export default async function FeedPageRoute({ params }: Props) {
  const { lang } = await params;
  return <FeedPage lang={lang} />;
}
