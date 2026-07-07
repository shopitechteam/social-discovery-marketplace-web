import type { Dictionary } from "@/i18n/getDictionary";

/**
 * Honest structural facts as big-numeral outlined cards — no invented
 * metrics, just how Shopi is built: free, local-first, direct.
 */
export function StatsSection({ dict }: { dict: Dictionary }) {
  const t = dict.landing.stats;
  const cards = [t.zero, t.counties, t.chat];

  return (
    <section className="px-5 py-16 md:py-24">
      <div className="mx-auto max-w-6xl">
        <div className="grid gap-8 lg:grid-cols-[0.85fr_1.15fr] lg:items-end">
          <div>
            <p className="text-sm font-bold uppercase tracking-normal text-primary">
              {t.eyebrow}
            </p>
            <h2 className="mt-3 max-w-2xl text-balance font-display text-[clamp(1.8rem,3.8vw,3.25rem)] font-bold leading-tight tracking-normal text-default">
              {t.headline}
            </h2>
          </div>
          <p className="max-w-xl text-base leading-normal text-muted lg:ml-auto">
            {t.intro}
          </p>
        </div>
        <div className="mt-10 grid gap-5 md:grid-cols-3">
          {cards.map(({ figure, label, body }, i) => (
            <div
              key={label}
              className="landing-reveal rounded-[1.35rem] border border-default bg-elevated p-7 shadow-sm"
              style={{ animationDelay: `${i * 90}ms` }}
            >
              <p className="font-display text-[2.75rem] font-bold leading-none tracking-normal text-default tabular-nums">
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
