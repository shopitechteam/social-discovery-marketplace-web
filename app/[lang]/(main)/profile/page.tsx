import { isValidLocale } from "@/i18n/config";
import { notFound } from "next/navigation";
import { ProfileView } from "@/features/profile/components/ProfileView";

export default async function ProfilePage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  if (!isValidLocale(lang)) notFound();

  return <ProfileView lang={lang} />;
}
