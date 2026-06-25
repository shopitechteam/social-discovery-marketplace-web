"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { FeedHeader } from "./FeedHeader";
import { FeedGrid } from "./FeedGrid";
import { FollowingGrid } from "./FollowingGrid";
import { NearbyGrid } from "./NearbyGrid";
import DesktopFeed from "./DesktopFeed";

interface Props {
  lang: string;
}

type Tab = "for-you" | "following" | "nearby";

export function FeedPage({ lang }: Props) {
  const searchParams = useSearchParams();
  const initialTab = (searchParams.get("tab") as Tab | null) ?? "for-you";
  const [tab, setTab] = useState<Tab>(initialTab);

  // If the user returns from auth with ?tab=following, honour it
  useEffect(() => {
    const t = searchParams.get("tab") as Tab | null;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (t && t !== tab) void setTab(t);
    // only re-run when the search params change, not when tab changes internally
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  function handleTabChange(next: Tab) {
    // Don't force scroll-to-top: each sub-tab grid restores its own saved
    // position via useScrollRestoration, so switching back to a tab returns the
    // user to where they left off instead of jumping to the top.
    setTab(next);
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
