import { notFound } from "next/navigation";
import { EditProfileScreen } from "@/features/profile/components/EditProfileScreen";
import { isValidLocale } from "@/i18n/config";

export default async function EditProfilePage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  if (!isValidLocale(lang)) notFound();

  return <EditProfileScreen lang={lang} />;
}
