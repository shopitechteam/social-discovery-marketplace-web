import type { Dictionary } from "@/i18n/getDictionary";

export function HowItWorksSection({ dict }: { dict: Dictionary }) {
  const s = dict.howItWorks.steps;
  const steps: { number: string; title: string; body: string }[] = [
    { number: "01", title: s["1"].title, body: s["1"].body },
    { number: "02", title: s["2"].title, body: s["2"].body },
    { number: "03", title: s["3"].title, body: s["3"].body },
    { number: "04", title: s["4"].title, body: s["4"].body },
  ];
  return (
    <section
      id="how-it-works"
      className="border-y border-default bg-surface px-5 py-14 md:py-20"
    >
      <div className="mx-auto max-w-6xl">
        {/* Header */}
        <div className="mb-10 max-w-3xl md:mb-12">
          <p className="mb-3 text-xs font-bold uppercase tracking-normal text-primary md:text-sm">
            {dict.howItWorks.eyebrow}
          </p>
          <h2 className="font-display text-[clamp(1.65rem,2.7vw,2.45rem)] font-bold leading-tight tracking-normal text-foreground">
            {dict.howItWorks.headline}
          </h2>
          <p className="mt-4 max-w-2xl text-base leading-normal text-muted">
            {dict.howItWorks.intro}
          </p>
        </div>

        {/* Steps */}
        <div className="relative grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {steps.map(({ number, title, body }, i) => (
            <div
              key={number}
              className="landing-reveal rounded-[1.1rem] border border-default bg-elevated p-5 shadow-sm"
              style={{ animationDelay: `${i * 85}ms` }}
            >
              {/* Step circle */}
              <div
                className="relative z-1 mb-6 flex h-12 w-12 items-center justify-center rounded-full bg-primary font-display text-(length:--text-base) font-bold text-white"
                style={{
                  background: "",
                }}
              >
                {number}
              </div>
              <h3 className="mb-2.5 font-display text-(length:--text-lg) font-semibold text-foreground">
                {title}
              </h3>
              <p className="text-(length:--text-base) text-muted leading-normal">
                {body}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
