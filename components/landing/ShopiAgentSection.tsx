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
      className="px-(--landing-page-x) py-8 md:py-10"
    >
      <div className="mx-auto flex max-w-(--landing-page-max) flex-col gap-6 rounded-[1.4rem] border border-default bg-elevated p-6 md:flex-row md:items-center md:gap-8 md:p-10">
        <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-primary text-white shadow-sm">
          <Camera size={24} />
        </span>
        <div className="flex-1">
          <p className="text-sm font-bold uppercase tracking-widest text-muted">
            {t.eyebrow}
          </p>
          <h2 className="mt-2 text-balance font-display text-[clamp(1.4rem,2.4vw,2rem)] font-bold leading-tight tracking-normal text-default">
            {t.title}
          </h2>
          <p className="mt-2 text-base text-muted md:text-lg">{t.body}</p>
        </div>
        <Pill
          href={`/${lang}/shopi-agent`}
          variant="outline"
          className="shrink-0 self-start md:self-auto"
        >
          {t.cta}
        </Pill>
      </div>
    </section>
  );
}
