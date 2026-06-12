import { MainShell } from "@/components/layout/MainShell";
import { SideNav } from "@/components/layout/SideNav";
import { SocketProvider } from "@/components/providers/SocketProvider";
import { isValidLocale } from "@/i18n/config";
import { notFound } from "next/navigation";

export default async function MainLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  if (!isValidLocale(lang)) notFound();

  return (
    <SocketProvider>
      {/* ── Desktop sidebar — hidden on mobile ── */}
      <SideNav lang={lang} />

      <MainShell lang={lang}>{children}</MainShell>
    </SocketProvider>
  );
}
