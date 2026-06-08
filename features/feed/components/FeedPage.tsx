"use client";

import { useState } from "react";
import { FeedHeader } from "./FeedHeader";
import { FeedGrid } from "./FeedGrid";
import { FollowingGrid } from "./FollowingGrid";
import { DesktopFeed } from "./DesktopFeed";

interface Props {
  lang: string;
}

export function FeedPage({ lang }: Props) {
  const [tab, setTab] = useState<"for-you" | "following" | "nearby">("for-you");

  function handleTabChange(next: "for-you" | "following" | "nearby") {
    setTab(next);
    window.scrollTo({ top: 0, behavior: "instant" });
  }

  return (
    <>
      {/* ── Desktop: fullscreen TikTok-style feed — no header/tabs needed ── */}
      <div className="hidden md:block">
        <DesktopFeed lang={lang} />
      </div>

      {/* ── Mobile: existing card feed with tabs ── */}
      <div className="md:hidden min-h-svh">
        <FeedHeader lang={lang} activeTab={tab} onTabChange={handleTabChange} />

        <div className="relative bg-surface">
          {tab === "for-you" && <FeedGrid lang={lang} />}

          {tab === "following" && <FollowingGrid lang={lang} />}

          {tab === "nearby" && (
            <div className="flex flex-col items-center justify-center py-24 px-6 text-center">
              <div className="text-5xl mb-4">📍</div>
              <h3 className="font-bold text-default text-base mb-2">
                Discover local sellers
              </h3>
              <p className="text-muted-foreground text-sm leading-relaxed">
                Enable location to find the best deals near you.
              </p>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
