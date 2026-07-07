import type { Dictionary } from "@/i18n/getDictionary";
import { MessageCircle, PlusCircle, ScanSearch } from "lucide-react";

/**
 * The three product pillars — Feed, Direct chat, Sell — as copy-led cards.
 * Images stay out of this section so the value proposition remains the focus.
 */
export function PillarsSection({ dict }: { dict: Dictionary }) {
  const t = dict.landing.pillars;
  const dives = dict.landing.dives;

  const cards = [
    {
      key: "feed",
      title: t.feed.title,
      tagline: t.feed.tagline,
      icon: ScanSearch,
      proof: dives.feed.bullets[0],
      tint: "rgb(var(--brand-primary) / 0.12)",
    },
    {
      key: "chat",
      title: t.chat.title,
      tagline: t.chat.tagline,
      icon: MessageCircle,
      proof: dives.chat.bullets[0],
      tint: "rgb(var(--brand-accent) / 0.12)",
    },
    {
      key: "sell",
      title: t.sell.title,
      tagline: t.sell.tagline,
      icon: PlusCircle,
      proof: dives.sell.bullets[0],
      tint: "rgb(var(--brand-secondary) / 0.16)",
    },
  ];

  return (
    <section
      id="features"
      className="px-[var(--landing-page-x)] pb-18 md:pb-24"
    >
      <div className="mx-auto grid max-w-[var(--landing-page-max)] gap-5 md:grid-cols-3">
        {cards.map(({ key, title, tagline, icon: Icon, proof, tint }, i) => (
          <article
            key={key}
            className="landing-reveal rounded-[1.2rem] border border-default bg-elevated p-6 shadow-sm transition-transform duration-300 hover:-translate-y-1"
            style={{
              animationDelay: `${i * 90}ms`,
              background: `linear-gradient(180deg, ${tint}, transparent 58%)`,
            }}
          >
            <span className="flex h-11 w-11 items-center justify-center rounded-full border border-default bg-elevated text-primary shadow-sm">
              <Icon size={20} />
            </span>
            <h2 className="mt-7 font-display text-xl font-semibold text-default">
              {title}
            </h2>
            <p className="mt-2 text-base leading-snug text-muted">{tagline}</p>
            <div className="mt-6 border-t border-default pt-4">
              <p className="text-sm font-medium leading-normal text-default">
                {proof}
              </p>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
