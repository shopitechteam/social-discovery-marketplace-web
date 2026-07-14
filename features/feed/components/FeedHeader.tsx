"use client";

type Tab = "for-you" | "following" | "nearby";

interface Props {
  activeTab: Tab;
  onTabChange: (tab: Tab) => void;
}

export function FeedHeader({ activeTab, onTabChange }: Props) {
  const tabs: { id: Tab; label: string }[] = [
    { id: "for-you", label: "For You" },
    { id: "following", label: "Following" },
    { id: "nearby", label: "Nearby" },
    // { id: "ask-shopi", label: "Ask Shopi" },
  ];

  return (
    <header className="sticky top-0 py-4 z-30 bg-app/80 backdrop-blur-md border-b border-default">
      {/* Tabs */}
      <div className="flex gap-0 px-4 -mb-4">
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
