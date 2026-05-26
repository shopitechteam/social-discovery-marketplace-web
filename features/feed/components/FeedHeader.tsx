"use client";

import { useRouter } from "next/navigation";

type Tab = "for-you" | "following" | "nearby";

interface Props {
  lang: string;
  activeTab: Tab;
  onTabChange: (tab: Tab) => void;
}

export function FeedHeader({ lang, activeTab, onTabChange }: Props) {
  const router = useRouter();

  const tabs: { id: Tab; label: string }[] = [
    { id: "for-you", label: "For You" },
    { id: "following", label: "Following" },
    { id: "nearby", label: "Nearby" },
  ];

  return (
    <header className="sticky top-0 z-30 bg-app/80 backdrop-blur-md border-b border-default">
      <div className="flex items-center justify-between px-4 h-4">
        {/* Logo */}
        {/* <span className="text-primary font-black text-xl tracking-tight select-none">
          shopi
        </span> */}

        {/* Search */}
        {/* <button
          onClick={() => router.push(`/${lang}/explore`)}
          className="w-9 h-9 rounded-full flex items-center justify-center text-muted-foreground hover:bg-surface transition-colors active:scale-95"
          aria-label="Search"
        >
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
        </button> */}
      </div>

      {/* Tabs */}
      <div className="flex px-4 gap-0 -mb-px">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={[
              "flex-1 font-semibold pb-2.5 pt-1 border-b-2 transition-colors",
              activeTab === tab.id
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-default",
            ].join(" ")}
            style={{ fontSize: 15 }}
          >
            {tab.label}
          </button>
        ))}
      </div>
    </header>
  );
}
