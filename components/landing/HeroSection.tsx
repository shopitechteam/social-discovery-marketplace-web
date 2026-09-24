import type { Dictionary } from "@/i18n/getDictionary";
import Image from "next/image";
import { MapPin, MessageCircle } from "lucide-react";
import { landingPhotos } from "./mockups";
import { HeroCtas } from "./HeroCtas";

export function HeroSection({
  dict,
  lang,
}: {
  dict: Dictionary;
  lang: string;
}) {
  const t = dict.landing.hero;

  return (
    <section
      id="hero"
      className="relative overflow-hidden px-(--landing-page-x) pb-6 pt-20 md:pb-20 md:pt-36"
    >
      <div className="mx-auto grid max-w-(--landing-page-max) items-center gap-6 md:gap-10 lg:grid-cols-[1fr_0.78fr]">
        <div>
          {/* Eyebrow (dict.landing.hero.eyebrow) intentionally hidden; the
              string is kept in the dictionaries so it can be restored here. */}
          <h1 className="max-w-4xl text-balance font-display text-[clamp(1.75rem,7.6vw,2.25rem)] font-semibold leading-[1.1] tracking-[-0.01em] text-default md:text-[clamp(2.45rem,5.2vw,4.85rem)] md:leading-[1.02] md:tracking-normal">
            {t.headline}
          </h1>
          {/* Photo → price → post in six words. It is the whole seller pitch,
              so it reads at a glance rather than as muted body copy. The
              free / 0% / nearby / direct facts sit in the strip right below
              the hero (PillarsSection), not repeated here. */}
          <p className="mt-3 max-w-2xl text-base font-medium text-muted md:mt-6 md:text-xl">
            {t.subheadline}
          </p>
          <HeroCtas
            lang={lang}
            ctaPost={t.ctaPost}
            ctaPostShort={t.ctaPostShort}
            ctaFeed={t.ctaFeed}
            ctaFeedLoggedIn={t.ctaFeedLoggedIn}
          />
        </div>

        <div>
          <FocusedListing />
        </div>
      </div>
    </section>
  );
}

function FocusedListing() {
  return (
    <article className="landing-hero-board mx-auto max-w-md overflow-hidden rounded-[1.4rem] border border-default bg-elevated shadow-lg">
      <div className="relative aspect-[16/10] overflow-hidden md:aspect-4/3">
        <Image
          src={landingPhotos.sofa}
          alt="A green three-seater sofa in a living room"
          fill
          preload
          sizes="(max-width: 768px) 92vw, 420px"
          className="object-cover transition-transform duration-500 group-hover:scale-[1.04]"
        />
        <div className="absolute inset-0 bg-linear-to-t from-black/60 via-black/5 to-transparent" />
        <span className="absolute bottom-3 left-3 rounded-full bg-white px-3 py-1.5 text-xs font-bold text-black shadow-sm md:bottom-4 md:left-4">
          KES 45,000
        </span>
      </div>
      <div className="p-4 md:p-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="font-display text-base font-bold leading-tight text-default md:text-lg">
              3-seater sofa
            </p>
            <p className="mt-1 flex items-center gap-1.5 text-sm text-muted">
              <MapPin size={14} /> Ongata Rongai
            </p>
          </div>
          <span className="rounded-full bg-primary-soft px-3 py-1 text-xs font-bold text-primary-strong">
            Nearby
          </span>
        </div>
        <div className="mt-3 rounded-2xl border border-default bg-surface p-3 md:mt-5 md:p-4">
          <div className="flex items-start gap-3">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary text-white md:h-10 md:w-10">
              <MessageCircle size={18} />
            </span>
            <div>
              <p className="text-sm font-bold text-default">
                Buyers message you here
              </p>
              <p className="mt-1 text-xs leading-snug text-muted">
                You agree the price and pickup.
              </p>
            </div>
          </div>
        </div>
      </div>
    </article>
  );
}
