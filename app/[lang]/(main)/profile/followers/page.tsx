import { notFound } from "next/navigation";
import { ProfileFollowersView } from "@/features/profile/components/ProfileFollowersView";
import { isValidLocale } from "@/i18n/config";

export default async function ProfileFollowersPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  if (!isValidLocale(lang)) notFound();

  return <ProfileFollowersView lang={lang} />;
}
