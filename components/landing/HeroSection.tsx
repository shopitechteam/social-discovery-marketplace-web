import type { Dictionary } from "@/i18n/getDictionary";
import Image from "next/image";
import { MapPin, MessageCircle, ShieldCheck } from "lucide-react";
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
      className="relative overflow-hidden px-[var(--landing-page-x)] pb-12 pt-28 md:pb-20 md:pt-36"
    >
      <div className="mx-auto grid max-w-[var(--landing-page-max)] items-center gap-10 lg:grid-cols-[1fr_0.78fr]">
        <div>
          <h1 className="max-w-4xl text-balance font-display text-[clamp(2.45rem,5.2vw,4.85rem)] font-semibold leading-[1.02] tracking-normal text-default">
            {t.headline}
          </h1>
          <p className="mt-6 max-w-2xl text-base leading-normal text-muted md:text-md">
            {t.subheadline}
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-3 md:mt-10">
            <Pill
              href={`/${lang}/feed`}
              className="bg-primary px-7 py-3.5 text-white hover:opacity-90"
            >
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
      <div className="relative aspect-[4/3] overflow-hidden">
        <Image
          src={landingPhotos.sofa}
          alt="Sofa listing in a living room"
          fill
          preload
          sizes="(max-width: 768px) 92vw, 420px"
          className="object-cover transition-transform duration-500 group-hover:scale-[1.04]"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/5 to-transparent" />
        <span className="absolute bottom-4 left-4 rounded-full bg-white px-3 py-1.5 text-xs font-bold text-black shadow-sm">
          KES 45,000
        </span>
      </div>
      <div className="p-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="font-display text-lg font-bold leading-tight text-default">
              Leather sofa
            </p>
            <p className="mt-1 flex items-center gap-1.5 text-sm text-muted">
              <MapPin size={14} /> Ongata Rongai
            </p>
          </div>
          <span className="rounded-full bg-primary-soft px-3 py-1 text-xs font-bold text-primary-strong">
            Nearby
          </span>
        </div>
        <div className="mt-5 rounded-2xl border border-default bg-surface p-4">
          <div className="flex items-start gap-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary text-white">
              <MessageCircle size={18} />
            </span>
            <div>
              <p className="text-sm font-bold text-default">
                Deal directly with the seller
              </p>
              <p className="mt-1 text-xs leading-snug text-muted">
                Ask questions, negotiate, then agree on pickup and payment.
              </p>
            </div>
          </div>
        </div>
      </div>
    </article>
  );
}
