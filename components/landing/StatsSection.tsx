import type { Dictionary } from "@/i18n/getDictionary";

/**
 * Honest structural facts as big-numeral outlined cards — no invented
 * metrics, just how Shopi is built: free, local-first, direct.
 */
export function StatsSection({ dict }: { dict: Dictionary }) {
  const t = dict.landing.stats;
  const cards = [t.zero, t.counties, t.chat];

  return (
    <section className="px-[var(--landing-page-x)] py-14 md:py-20">
      <div className="mx-auto max-w-[var(--landing-page-max)]">
        <div className="max-w-3xl">
          <p className="text-xs font-bold uppercase tracking-normal text-primary md:text-sm">
            {t.eyebrow}
          </p>
          <h2 className="mt-3 text-balance font-display text-[clamp(1.65rem,2.7vw,2.45rem)] font-bold leading-tight tracking-normal text-default">
            {t.headline}
          </h2>
          <p className="mt-4 max-w-2xl text-base leading-normal text-muted">
            {t.intro}
          </p>
        </div>
        <div className="mt-8 grid gap-4 md:grid-cols-3">
          {cards.map(({ figure, label, body }, i) => (
            <div
              key={label}
              className="landing-reveal rounded-[1.1rem] border border-default bg-elevated p-5 shadow-sm"
              style={{ animationDelay: `${i * 90}ms` }}
            >
              <p className="font-display text-[2.15rem] font-bold leading-none tracking-normal text-default tabular-nums">
                {figure}
              </p>
              <p className="mt-2 text-md font-semibold text-default">{label}</p>
              <p className="mt-3 text-sm leading-normal text-muted">{body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
