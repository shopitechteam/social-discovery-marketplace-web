import type { Dictionary } from "@/i18n/getDictionary";
import Image from "next/image";
import { MessageCircle, PlusCircle, ScanSearch } from "lucide-react";
import { landingPhotos } from "./mockups";

/**
 * The three product pillars — Feed, Direct chat, Sell — as photo-led cards with
 * direct conversion proof and the softer spacing of the marketing reference.
 */
export function PillarsSection({ dict }: { dict: Dictionary }) {
  const t = dict.landing.pillars;

  const cards = [
    {
      key: "feed",
      title: t.feed.title,
      tagline: t.feed.tagline,
      photo: landingPhotos.fashion,
      alt: "Clothes market and fashion items for discovery",
      icon: ScanSearch,
      proof: "Discover useful items before searching",
      tint: "rgb(var(--brand-primary) / 0.12)",
    },
    {
      key: "chat",
      title: t.chat.title,
      tagline: t.chat.tagline,
      photo: landingPhotos.phone,
      alt: "Phone photo representing a direct buyer-seller chat",
      icon: MessageCircle,
      proof: "Message the seller in one tap",
      tint: "rgb(var(--brand-accent) / 0.12)",
    },
    {
      key: "sell",
      title: t.sell.title,
      tagline: t.sell.tagline,
      photo: landingPhotos.produce,
      alt: "Fresh produce at a market ready to list",
      icon: PlusCircle,
      proof: "Post with price, location and photos",
      tint: "rgb(var(--brand-secondary) / 0.16)",
    },
  ];

  return (
    <section id="features" className="px-5 pb-18 md:pb-24">
      <div className="mx-auto grid max-w-6xl gap-5 md:grid-cols-3">
        {cards.map(({ key, title, tagline, photo, alt, icon: Icon, proof, tint }, i) => (
          <article
            key={key}
            className="landing-reveal group overflow-hidden rounded-[1.6rem] border border-default bg-elevated shadow-sm transition-transform duration-300 hover:-translate-y-1"
            style={{
              animationDelay: `${i * 90}ms`,
              background: `linear-gradient(180deg, ${tint}, transparent 48%)`,
            }}
          >
            <div className="p-4">
              <div className="relative aspect-[4/3] overflow-hidden rounded-[1.15rem]">
                <Image
                  src={photo}
                  alt={alt}
                  fill
                  sizes="(max-width: 768px) 92vw, 360px"
                  className="object-cover transition-transform duration-500 group-hover:scale-[1.04]"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/10 to-transparent" />
                <span className="absolute bottom-3 left-3 inline-flex items-center gap-1.5 rounded-full bg-white px-3 py-1.5 text-xs font-bold text-black shadow-sm">
                  <Icon size={14} />
                  {proof}
                </span>
              </div>
            </div>
            <div className="px-6 pb-7 pt-2">
              <h2 className="font-display text-xl font-semibold text-default">
                {title}
              </h2>
              <p className="mt-2 text-base leading-snug text-muted">
                {tagline}
              </p>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
