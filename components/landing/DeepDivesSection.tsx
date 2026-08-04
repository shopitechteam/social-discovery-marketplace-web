import { Check } from "lucide-react";
import type { Dictionary } from "@/i18n/getDictionary";
import { ChatMockup, FeedMockup, SellMockup } from "./mockups";
import { Pill } from "./Pill";

/**
 * One alternating media/text row per pillar — the Tolstoy deep-dive
 * pattern. Media sits on a tinted canvas; text carries eyebrow, title,
 * body, three proof points and the CTA pair.
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
      id: "dive-feed",
      copy: t.feed,
      mockup: <FeedMockup />,
      tint: "bg-[rgb(var(--brand-primary)/0.07)]",
      primaryHref: `/${lang}/feed`,
      secondaryHref: "#how-it-works",
    },
    {
      id: "dive-chat",
      copy: t.chat,
      mockup: <ChatMockup />,
      tint: "bg-[rgb(var(--brand-accent)/0.07)]",
      primaryHref: `/${lang}/feed`,
      // "Browse nearby" should land on the feed's Nearby tab, not the
      // how-it-works anchor the other rows use.
      secondaryHref: `/${lang}/feed?tab=nearby`,
    },
    {
      id: "creators",
      copy: t.sell,
      mockup: <SellMockup />,
      tint: "bg-[rgb(var(--brand-secondary)/0.10)]",
      primaryHref: `/${lang}/upload`,
      secondaryHref: "#how-it-works",
    },
  ];

  return (
    <section className="px-(--landing-page-x)">
      <div className="mx-auto flex max-w-(--landing-page-max) flex-col gap-8 md:gap-14">
        {dives.map(
          ({ id, copy, mockup, tint, primaryHref, secondaryHref }, i) => (
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
                <p className="mt-4 max-w-lg text-base leading-normal text-muted">
                  {copy.body}
                </p>
                <ul className="mt-6 flex flex-col gap-3">
                  {copy.bullets.map((b) => (
                    <li
                      key={b}
                      className="flex items-start gap-2.5 text-base text-default"
                    >
                      <Check
                        size={18}
                        className="mt-0.5 shrink-0 text-primary"
                        strokeWidth={2.5}
                      />
                      {b}
                    </li>
                  ))}
                </ul>
                <div className="mt-8 flex flex-wrap gap-3">
                  <Pill
                    href={primaryHref}
                    className="bg-primary text-white hover:opacity-90"
                  >
                    {copy.ctaPrimary}
                  </Pill>
                  <Pill href={secondaryHref} variant="outline">
                    {copy.ctaSecondary}
                  </Pill>
                </div>
              </div>
            </article>
          ),
        )}
      </div>
    </section>
  );
}
