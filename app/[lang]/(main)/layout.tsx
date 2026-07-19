import { MainShell } from "@/components/layout/MainShell";
import { SideNav } from "@/components/layout/SideNav";
import { SocketProvider } from "@/components/providers/SocketProvider";
import { ApiPreconnect } from "@/components/providers/ApiPreconnect";
import { isValidLocale } from "@/i18n/config";
import { notFound } from "next/navigation";

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
      <ApiPreconnect />
      <SideNav lang={lang} />
      <MainShell lang={lang}>{children}</MainShell>
      {modal}
    </SocketProvider>
  );
}
