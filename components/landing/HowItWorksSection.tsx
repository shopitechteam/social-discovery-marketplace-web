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
      className="py-16 px-5 bg-surface border-t border-default border-b border-default"
    >
      <div className="max-w-300 mx-auto">
        {/* Header */}
        <div className="text-center mb-16">
          <p className="text-(length:--text-sm) font-bold tracking-widest uppercase text-accent mb-3">
            {dict.howItWorks.sectionLabel}
          </p>
          <h2 className="font-display font-bold text-[clamp(1.75rem,3.5vw,3rem)] tracking-tight leading-[1.15] text-foreground">
            {dict.howItWorks.headline}
          </h2>
        </div>

        {/* Steps */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 relative">
          {steps.map(({ number, title, body }) => (
            <div key={number} className="text-center px-2">
              {/* Step circle */}
              <div
                className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-6 font-display font-bold text-(length:--text-base) text-white relative z-1"
                style={{
                  background: "linear-gradient(135deg, rgb(var(--brand-primary)), rgb(var(--brand-accent)))",
                  boxShadow: "0 0 0 6px rgb(var(--color-bg-subtle))",
                }}
              >
                {number}
              </div>
              <h3 className="font-display font-semibold text-(length:--text-lg) text-foreground mb-2.5">
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
