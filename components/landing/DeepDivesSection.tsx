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
      tint: "rgb(var(--brand-primary) / 0.07)",
      primaryHref: `/${lang}/feed`,
    },
    {
      id: "dive-chat",
      copy: t.chat,
      mockup: <ChatMockup />,
      tint: "rgb(var(--brand-accent) / 0.07)",
      primaryHref: `/${lang}/feed`,
    },
    {
      id: "creators",
      copy: t.sell,
      mockup: <SellMockup />,
      tint: "rgb(var(--brand-secondary) / 0.10)",
      primaryHref: `/${lang}/upload`,
    },
  ];

  return (
    <section className="px-5">
      <div className="mx-auto flex max-w-6xl flex-col gap-8 md:gap-14">
        {dives.map(({ id, copy, mockup, tint, primaryHref }, i) => (
          <article
            key={id}
            id={id}
            className="grid items-center gap-10 py-8 md:grid-cols-2 md:gap-16 md:py-10"
          >
            {/* Media on a tinted canvas */}
            <div
              className={`flex justify-center rounded-3xl p-8 md:p-14 ${
                i % 2 === 1 ? "md:order-2" : ""
              }`}
              style={{ backgroundColor: tint }}
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
                <Pill href={primaryHref}>{copy.ctaPrimary}</Pill>
                <Pill href="#how-it-works" variant="outline">
                  {copy.ctaSecondary}
                </Pill>
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
