import { Camera } from "lucide-react";
import type { Dictionary } from "@/i18n/getDictionary";
import { Pill } from "./Pill";

/**
 * Shopi Agent as a supporting line, not a headline feature: the benefit
 * (posting from one photo) leads, the name sits in the eyebrow, and the
 * detail lives on /shopi-agent.
 */
export function ShopiAgentSection({
  dict,
  lang,
}: {
  dict: Dictionary;
  lang: string;
}) {
  const t = dict.landing.agent;

  return (
    <section
      id="shopi-agent"
      className="px-(--landing-page-x) py-6 md:py-10"
    >
      {/* Phones: icon beside the text, full-width button below. */}
      <div className="mx-auto grid max-w-(--landing-page-max) grid-cols-[auto_1fr] items-start gap-x-3 gap-y-4 rounded-3xl border border-default bg-elevated p-4 md:flex md:flex-row md:items-center md:gap-8 md:rounded-[1.4rem] md:p-10">
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-primary text-white shadow-sm md:h-14 md:w-14">
          <Camera className="size-5 md:size-6" />
        </span>
        <div className="md:flex-1">
          <p className="text-[0.6875rem] font-bold uppercase tracking-widest text-muted md:text-sm">
            {t.eyebrow}
          </p>
          <h2 className="mt-1 text-balance font-display text-[1.125rem] font-bold leading-tight tracking-normal text-default md:mt-2 md:text-[clamp(1.4rem,2.4vw,2rem)]">
            {t.title}
          </h2>
          <p className="mt-1 text-[0.9375rem] text-muted md:mt-2 md:text-lg">{t.body}</p>
        </div>
        <Pill
          href={`/${lang}/shopi-agent`}
          variant="outline"
          className="col-span-2 h-11 w-full shrink-0 py-0 md:h-auto md:w-auto md:self-auto md:py-3"
        >
          {t.cta}
        </Pill>
      </div>
    </section>
  );
}
