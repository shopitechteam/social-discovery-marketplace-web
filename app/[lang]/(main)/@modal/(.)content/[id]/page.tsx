import { ContentDetailSheet } from "@/features/feed/components/ContentDetailSheet";

type Props = { params: Promise<{ lang: string; id: string }> };

export default async function ContentDetailModalPage({ params }: Props) {
  const { lang, id } = await params;

  return <ContentDetailSheet id={id} lang={lang} />;
}
