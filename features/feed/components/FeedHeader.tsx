"use client";

import Link from "next/link";
import { Search } from "lucide-react";

type Tab = "for-you" | "following" | "nearby";

interface Props {
  lang: string;
  activeTab: Tab;
  onTabChange: (tab: Tab) => void;
}

export function FeedHeader({ lang, activeTab, onTabChange }: Props) {
  const tabs: { id: Tab; label: string }[] = [
    { id: "for-you", label: "For You" },
    { id: "following", label: "Following" },
    { id: "nearby", label: "Nearby" },
    // { id: "ask-shopi", label: "Ask Shopi" },
  ];

  return (
    <header className="sticky top-0 z-30 bg-app/80 backdrop-blur-md border-b border-default">
      <div className="flex items-center justify-end px-4 h-4">
        {/* Search */}
        <Link
          href={`/${lang}/search`}
          className="w-9 h-9 rounded-full flex items-center justify-center text-muted-foreground hover:bg-surface transition-colors active:scale-95"
          aria-label="Search"
        >
          <Search className="w-5 h-5" strokeWidth={2} />
        </Link>
      </div>

      {/* Tabs */}
      <div className="flex gap-0 px-4 -mb-px">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={`flex-1 border-b-2 pt-1 pb-2.5 text-[14.5px] font-semibold transition-colors ${
              activeTab === tab.id
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>
    </header>
  );
}
