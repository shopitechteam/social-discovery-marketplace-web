"use client";

/**
 * On desktop (md+) the content detail page renders the desktop feed instead of
 * the mobile detail screen, keeping the user inside the familiar feed layout.
 */

import { useParams } from "next/navigation";
import DesktopFeed from "./DesktopFeed";

export function DesktopContentRedirect() {
  const params = useParams();
  const lang = typeof params?.lang === "string" ? params.lang : "en";
  return (
    <div className="hidden md:block">
      <DesktopFeed lang={lang} />
    </div>
  );
}
