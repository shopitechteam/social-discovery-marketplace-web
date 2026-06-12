"use client";

import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { BottomNav, shouldHideBottomNav } from "@/components/layout/BottomNav";

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
      <div
        className={[
          "flex min-h-svh flex-col bg-app",
          "mx-auto max-w-107.5",
          "md:mx-0 md:ml-60 md:max-w-none",
        ].join(" ")}
      >
        <main
          className="flex-1"
          style={{
            paddingBottom: hideBottomNav
              ? 0
              : "calc(var(--nav-height, 0px) + var(--safe-bottom, 0px))",
          }}
        >
          {children}
        </main>
      </div>

      <BottomNav lang={lang} />
    </>
  );
}
