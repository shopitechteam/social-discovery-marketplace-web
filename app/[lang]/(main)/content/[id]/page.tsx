import type { Metadata } from "next";
import { ContentDetail } from "@/features/feed/components/ContentDetail";

export const metadata: Metadata = {
  title: "Post — Shopi",
};

type Props = { params: Promise<{ lang: string; id: string }> };

export default async function ContentDetailPage({ params }: Props) {
  const { lang, id } = await params;
  return <ContentDetail id={id} lang={lang} desktopMode="page" />;
}
