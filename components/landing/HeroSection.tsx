import type { Dictionary } from "@/i18n/getDictionary";
import Image from "next/image";
import { MapPin, MessageCircle, ShieldCheck, Sparkles } from "lucide-react";
import { landingPhotos } from "./mockups";
import { Pill } from "./Pill";

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
      className="relative overflow-hidden px-5 pb-12 pt-28 md:pb-20 md:pt-36"
    >
      <div className="mx-auto grid max-w-6xl items-center gap-12 lg:grid-cols-[0.93fr_1.07fr]">
        <div className="landing-reveal">
          {/* <div className="inline-flex items-center gap-2 rounded-full border border-default bg-elevated px-3 py-1.5 text-sm font-semibold text-default shadow-sm">
            <Sparkles size={15} className="text-primary" />
            Local discovery, direct deals, zero commission
          </div> */}
          <h1 className="mt-6 max-w-4xl text-balance font-display text-[clamp(2.65rem,6vw,5.8rem)] font-semibold leading-[0.98] tracking-normal text-default">
            {t.headline}
          </h1>
          <p className="mt-6 max-w-xl text-base leading-normal text-muted md:text-md">
            {t.subheadline}
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-3 md:mt-10">
            <Pill href={`/${lang}/feed`} className="px-7 py-3.5">
              {t.ctaPrimary}
            </Pill>
            <Pill
              href={`/${lang}/upload`}
              variant="outline"
              className="px-7 py-3.5"
            >
              {t.ctaSecondary}
            </Pill>
          </div>
          <div className="mt-6 grid max-w-xl gap-3 sm:grid-cols-3">
            {[
              ["KES 0", "commission"],
              ["47", "counties"],
              ["1 tap", "to chat"],
            ].map(([figure, label]) => (
              <div
                key={label}
                className="rounded-2xl border border-default bg-elevated px-4 py-3"
              >
                <p className="font-display text-xl font-bold leading-none text-default tabular-nums">
                  {figure}
                </p>
                <p className="mt-1 text-xs font-semibold uppercase tracking-normal text-muted">
                  {label}
                </p>
              </div>
            ))}
          </div>
          <p className="mt-5 flex items-center gap-2 text-sm text-muted">
            <ShieldCheck size={16} className="text-primary" />
            {t.reassurance}
          </p>
        </div>

        <div className="landing-reveal landing-reveal-delay-1">
          <div className="landing-hero-board relative mx-auto grid max-w-[620px] grid-cols-[0.78fr_1fr] gap-3 rounded-[2rem] border border-default bg-surface p-3 shadow-lg md:gap-4 md:p-4">
            <ListingCard
              className="col-span-2 md:col-span-1"
              src={landingPhotos.sofa}
              alt="Sofa listing in a living room"
              title="Leather sofa"
              meta="Ongata Rongai"
              price="KES 45,000"
              priority
            />
            <div className="grid gap-3 md:gap-4">
              <ListingCard
                compact
                src={landingPhotos.phone}
                alt="Phone listing photo"
                title="Clean iPhone"
                meta="Nairobi CBD"
                price="KES 38,500"
                priority
              />
              <ListingCard
                compact
                src={landingPhotos.produce}
                alt="Fresh vegetables at a market"
                title="Fresh produce"
                meta="Kiambu"
                price="From KES 120"
                priority
              />
            </div>
            <div className="absolute -bottom-5 left-5 right-5 rounded-2xl border border-default bg-elevated p-4 shadow-lg md:left-auto md:right-7 md:w-72">
              <div className="flex items-start gap-3">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary text-white">
                  <MessageCircle size={18} />
                </span>
                <div>
                  <p className="text-sm font-bold text-default">
                    Deal directly with the seller
                  </p>
                  <p className="mt-1 text-xs leading-snug text-muted">
                    Ask questions, negotiate, agree on pickup and payment your
                    way.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function ListingCard({
  src,
  alt,
  title,
  meta,
  price,
  className = "",
  compact = false,
  priority = false,
}: {
  src: string;
  alt: string;
  title: string;
  meta: string;
  price: string;
  className?: string;
  compact?: boolean;
  priority?: boolean;
}) {
  return (
    <article
      className={`group overflow-hidden rounded-[1.35rem] border border-default bg-elevated shadow-sm transition-transform duration-300 hover:-translate-y-1 ${className}`}
    >
      <div
        className={`relative overflow-hidden ${compact ? "aspect-[16/10]" : "aspect-[4/5]"}`}
      >
        <Image
          src={src}
          alt={alt}
          fill
          priority={priority}
          sizes="(max-width: 768px) 82vw, 320px"
          className="object-cover transition-transform duration-500 group-hover:scale-[1.04]"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/5 to-transparent" />
        <span className="absolute bottom-3 left-3 rounded-full bg-white px-2.5 py-1 text-xs font-bold text-black shadow-sm">
          {price}
        </span>
      </div>
      <div className="p-3.5">
        <p className="text-sm font-bold text-default">{title}</p>
        <p className="mt-1 flex items-center gap-1 text-xs text-muted">
          <MapPin size={12} /> {meta}
        </p>
      </div>
    </article>
  );
}
