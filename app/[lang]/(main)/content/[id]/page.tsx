import type { Metadata } from "next";
import { ContentDetail } from "@/features/feed/components/ContentDetail";
import { DesktopContentRedirect } from "@/features/feed/components/DesktopContentRedirect";

export const metadata: Metadata = {
  title: "Post — Shopi",
};

type Props = { params: Promise<{ lang: string; id: string }> };

export default async function ContentDetailPage({ params }: Props) {
  const { lang, id } = await params;
  return (
    <>
      {/* Desktop: redirect to feed which scroll-snaps to this post via URL */}
      <DesktopContentRedirect />
      {/* Mobile: full detail page */}
      <div className="md:hidden">
        <ContentDetail id={id} lang={lang} />
      </div>
    </>
  );
}
