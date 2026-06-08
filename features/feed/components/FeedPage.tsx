"use client";

import { useState } from "react";
import { FeedHeader } from "./FeedHeader";
import { FeedGrid } from "./FeedGrid";
import { FollowingGrid } from "./FollowingGrid";
import { NearbyGrid } from "./NearbyGrid";
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

          {tab === "nearby" && <NearbyGrid lang={lang} />}
        </div>
      </div>
    </>
  );
}
