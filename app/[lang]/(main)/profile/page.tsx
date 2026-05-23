import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { LogoutButton } from "@/features/auth/components/LogoutButton";
import { isValidLocale } from "@/i18n/config";
import { notFound } from "next/navigation";

export default async function ProfilePage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  if (!isValidLocale(lang)) notFound();

  return (
    <div className="p-4 flex flex-col items-center gap-6 pt-16">
      <ThemeToggle />
      <LogoutButton lang={lang} />
    </div>
  );
}
