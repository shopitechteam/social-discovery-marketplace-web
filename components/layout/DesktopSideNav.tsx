"use client";

import dynamic from "next/dynamic";
import { useIsDesktop } from "@/hooks/useIsDesktop";

const SideNav = dynamic(
  () => import("@/components/layout/SideNav").then((mod) => mod.SideNav),
  { ssr: false },
);

/**
 * The desktop sidebar is CSS-hidden on phones, but a CSS-only hide still sends
 * and executes its queries, auth controls, and category UI. Mount it only once
 * the desktop media query actually matches.
 */
export function DesktopSideNav({ lang }: { lang: string }) {
  const isDesktop = useIsDesktop({ ssrDefault: false });
  if (!isDesktop) return null;
  return <SideNav lang={lang} />;
}
