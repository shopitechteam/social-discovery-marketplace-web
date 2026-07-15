import { MainShell } from "@/components/layout/MainShell";
import { DesktopSideNav } from "@/components/layout/DesktopSideNav";
import { SocketProvider } from "@/components/providers/SocketProvider";
import { ApiPreconnect } from "@/components/providers/ApiPreconnect";
import { isValidLocale } from "@/i18n/config";
import { notFound } from "next/navigation";
import { Analytics } from "@vercel/analytics/next";

export default async function MainLayout({
  children,
  modal,
  params,
}: {
  children: React.ReactNode;
  modal?: React.ReactNode;
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  if (!isValidLocale(lang)) notFound();

  return (
    <SocketProvider>
      <Analytics />
      <ApiPreconnect />
      {/* ── Desktop sidebar — hidden on mobile ── */}
      <DesktopSideNav lang={lang} />

      <MainShell lang={lang}>{children}</MainShell>
      {modal}
    </SocketProvider>
  );
}
