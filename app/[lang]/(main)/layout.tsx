import { BottomNav } from "@/components/layout/BottomNav";
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

      {/* ── Page shell ──
            Mobile  : centered phone card, max 430 px, bottom-nav padding
            Desktop : full viewport, content offset by sidebar width (ml-60)
      ── */}
      <div
        className={[
          "flex flex-col min-h-svh bg-app",
          // Mobile: centered card
          "mx-auto max-w-107.5",
          // Desktop: full-width, push content past sidebar
          "md:mx-0 md:max-w-none md:ml-60",
        ].join(" ")}
      >
        <main
          className="flex-1"
          style={{
            // Remove bottom padding on desktop (no bottom nav there)
            paddingBottom:
              "calc(var(--nav-height, 0px) + var(--safe-bottom, 0px))",
          }}
        >
          {children}
        </main>
      </div>

      {/* ── Mobile bottom nav (self-hides on md+ via md:hidden inside) ── */}
      <BottomNav lang={lang} />
    </SocketProvider>
  );
}
