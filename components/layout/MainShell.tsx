"use client";

import { usePathname } from "next/navigation";
import { Suspense, type ReactNode } from "react";
import { BottomNav, shouldHideBottomNav } from "@/components/layout/BottomNav";
import { RouteScrollRestoration } from "@/components/layout/RouteScrollRestoration";

export function MainShell({
  children,
  lang,
}: {
  children: ReactNode;
  lang: string;
}) {
  const pathname = usePathname();
  const hideBottomNav = shouldHideBottomNav(pathname);

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
          "mx-auto max-w-107.5",
          "md:mx-0 md:ml-(--side-nav-width,220px) md:max-w-none",
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
