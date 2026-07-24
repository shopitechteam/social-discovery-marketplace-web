"use client";

import { usePathname } from "next/navigation";
import { Suspense, type ReactNode } from "react";
import { BottomNav, shouldHideBottomNav } from "@/components/layout/BottomNav";
import { RouteScrollRestoration } from "@/components/layout/RouteScrollRestoration";
import { usePreloadInbox } from "@/features/notifications/hooks/usePreloadInbox";
import { useUiStore } from "@/stores/ui";

export function MainShell({
  children,
  lang,
}: {
  children: ReactNode;
  lang: string;
}) {
  const pathname = usePathname();
  const bottomNavHidden = useUiStore((s) => s.bottomNavHidden);
  // Reserve no space for the nav when it's route-hidden OR class-hidden by a
  // full-viewport screen (e.g. the create-mode chooser) — otherwise the hidden
  // nav's padding leaves an empty gap under that screen's own footer.
  const hideBottomNav = shouldHideBottomNav(pathname) || bottomNavHidden;
  const isImmersiveCreate =
    pathname.includes("/upload/create") ||
    pathname.includes("/upload/tiktok");
  usePreloadInbox();

  return (
    <>
      {/* Wrapped in Suspense: RouteScrollRestoration reads useSearchParams(),
          which otherwise opts the whole route into a client-render bail and can
          thrash dynamic routes (e.g. /content/[id]) — remounting the page and
          reflashing its skeleton. The boundary contains that de-opt here. */}
      <Suspense fallback={null}>
        <RouteScrollRestoration />
      </Suspense>

      <div
        className={[
          "flex min-h-svh flex-col bg-app",
          "mx-auto",
          isImmersiveCreate
            ? "md:mx-0 md:ml-0 md:max-w-none"
            : "md:mx-0 md:ml-(--side-nav-width,220px) md:max-w-none",
        ].join(" ")}
      >
        {/* The bottom padding clears the fixed BottomNav, which is md:hidden —
            so drop it on md+ too. Leaving it creates dead scroll space below
            the page content, and scrolling into that space pushes desktop
            sticky elements (feed tabs, right rail) up out of the viewport. */}
        <main
          className={`flex-1 ${
            hideBottomNav
              ? ""
              : "pb-[calc(var(--nav-height,0)+var(--safe-bottom,0))] md:pb-0"
          }`}
        >
          {children}
        </main>
      </div>

      <BottomNav lang={lang} />
    </>
  );
}
