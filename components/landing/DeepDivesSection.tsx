import { Check } from "lucide-react";
import type { Dictionary } from "@/i18n/getDictionary";
import { ChatMockup, FeedMockup, SellMockup } from "./mockups";
import { Pill } from "./Pill";

/**
 * Sell → find → talk, one alternating media/text row each. The mockup does
 * the explaining; the copy is a headline, a three-beat line and one fact.
 *
 * The section carries #how-it-works (nav + footer anchor) and each row keeps
 * the id the footer links to: #creators, #dive-feed, #dive-chat.
 */
export function DeepDivesSection({
  dict,
  lang,
}: {
  dict: Dictionary;
  lang: string;
}) {
  const t = dict.landing.dives;

  const dives = [
    {
      id: "creators",
      copy: t.sell,
      mockup: <SellMockup />,
      tint: "bg-[rgb(var(--brand-secondary)/0.10)]",
      cta: { label: t.sell.cta, href: `/${lang}/upload` },
    },
    {
      id: "dive-feed",
      copy: t.feed,
      mockup: <FeedMockup />,
      tint: "bg-[rgb(var(--brand-primary)/0.07)]",
      cta: { label: t.feed.cta, href: `/${lang}/for-you` },
    },
    {
      // The deal happens in chat, so there is nothing to click through to
      // here — the rows either side already carry the sell and browse CTAs.
      id: "dive-chat",
      copy: t.chat,
      mockup: <ChatMockup />,
      tint: "bg-[rgb(var(--brand-accent)/0.07)]",
      cta: null,
    },
  ];

  return (
    <section id="how-it-works" className="px-(--landing-page-x)">
      <div className="mx-auto flex max-w-(--landing-page-max) flex-col gap-8 md:gap-14">
        {dives.map(({ id, copy, mockup, tint, cta }, i) => (
          <article
            key={id}
            id={id}
            className="grid items-center gap-10 py-8 md:grid-cols-2 md:gap-16 md:py-10"
          >
            {/* Media on a tinted canvas */}
            <div
              className={`flex justify-center rounded-3xl p-8 md:p-14 ${tint} ${
                i % 2 === 1 ? "md:order-2" : ""
              }`}
            >
              {mockup}
            </div>

            {/* Copy */}
            <div>
              <p className="text-sm font-bold uppercase tracking-widest text-muted">
                {copy.eyebrow}
              </p>
              <h2 className="mt-3 max-w-md text-balance font-display text-[clamp(1.6rem,3vw,2.4rem)] font-bold leading-tight tracking-normal text-default">
                {copy.title}
              </h2>
              <p className="mt-4 max-w-lg text-lg font-medium text-muted md:text-xl">
                {copy.body}
              </p>
              <p className="mt-6 flex items-start gap-2.5 text-sm leading-normal text-default">
                <Check
                  size={18}
                  className="mt-0.5 shrink-0 text-primary"
                  strokeWidth={2.5}
                />
                {copy.note}
              </p>
              {cta && (
                <div className="mt-8 flex flex-wrap gap-3">
                  <Pill
                    href={cta.href}
                    className="bg-primary text-white hover:opacity-90"
                  >
                    {cta.label}
                  </Pill>
                </div>
              )}
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
