"use client";

/**
 * On desktop (md+) the content detail page renders the full TikTok-style
 * DesktopFeed, which reads the current URL (/content/:id) on mount and
 * scroll-snaps to the matching post. No redirect needed — the feed just
 * starts at the right position.
 */

import DesktopFeed from "./DesktopFeed";

export function DesktopContentRedirect() {
  return (
    <div className="hidden md:block">
      <DesktopFeed />
    </div>
  );
}
