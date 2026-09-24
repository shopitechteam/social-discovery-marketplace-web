import type { Dictionary } from "@/i18n/getDictionary";
import { MapPin, MessageCircle, Percent, Tag } from "lucide-react";

/**
 * The quick-benefits strip under the hero: four facts the product keeps —
 * free to post, no commission, local, direct chat — one line each. The
 * sections below show how each works, so nothing here is explained.
 */
const REVEAL_DELAYS = [
  "",
  "[animation-delay:70ms]",
  "[animation-delay:140ms]",
  "[animation-delay:210ms]",
];

export function PillarsSection({ dict }: { dict: Dictionary }) {
  const t = dict.landing.pillars;

  // Flat tiles, no tints: the strip should read as plain facts and leave the
  // colour to the post CTA.
  const items = [
    { key: "free", label: t.free, icon: Tag },
    { key: "commission", label: t.commission, icon: Percent },
    { key: "local", label: t.local, icon: MapPin },
    { key: "chat", label: t.chat, icon: MessageCircle },
  ];

  return (
    <section id="features" className="px-(--landing-page-x) pb-14 md:pb-20">
      <div className="mx-auto max-w-(--landing-page-max)">
        <h2 className="sr-only">{t.heading}</h2>
        <ul className="grid list-none grid-cols-2 gap-3 p-0 md:grid-cols-4 md:gap-5">
          {items.map(({ key, label, icon: Icon }, i) => (
            <li
              key={key}
              className={`landing-reveal flex items-center gap-3 rounded-[1.2rem] border border-default bg-elevated p-4 shadow-sm md:p-5 ${REVEAL_DELAYS[i] ?? ""}`}
            >
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-default bg-elevated text-primary shadow-sm md:h-11 md:w-11">
                <Icon size={20} />
              </span>
              <span className="font-display text-base font-semibold leading-tight text-default md:text-lg">
                {label}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
