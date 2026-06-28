import { isValidLocale } from "@/i18n/config";
import { notFound } from "next/navigation";
import { CreatorProfilePage } from "@/features/profile/components/CreatorProfilePage";

interface Props {
  params: Promise<{ lang: string; username: string }>;
}

export default async function Page({ params }: Props) {
  const { lang, username } = await params;
  if (!isValidLocale(lang)) notFound();

  return <CreatorProfilePage username={username} lang={lang} />;
}

export async function generateMetadata({ params }: Props) {
  const { username } = await params;
  return { title: `@${username} · Shopi` };
}
