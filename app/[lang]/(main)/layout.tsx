import { BottomNav } from "@/components/layout/BottomNav";
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
      <div
        className="relative mx-auto flex flex-col min-h-svh bg-app"
        style={{ maxWidth: 430 }}
      >
        <main
          className="flex-1 overflow-y-auto"
          style={{
            paddingBottom: "calc(var(--nav-height) + var(--safe-bottom))",
          }}
        >
          {children}
        </main>
        <BottomNav lang={lang} />
      </div>
    </SocketProvider>
  );
}
