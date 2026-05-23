import React from "react";

const EL = ({ href, children }: { href: string; children: React.ReactNode }) => (
  <a
    href={href}
    target="_blank"
    rel="noopener noreferrer"
    className="underline decoration-dotted underline-offset-[3px] text-inherit"
  >
    {children}
  </a>
);

const steps: { number: string; title: string; node: React.ReactNode }[] = [
  {
    number: "01",
    title: "Sign up in 30 seconds",
    node: "No credit card. No long forms. Pick your interests — phones, fashion, food, whatever — and your local feed is ready.",
  },
  {
    number: "02",
    title: "Scroll your local feed",
    node: (
      <>
        Watch videos and photos posted by real sellers near you. Think{" "}
        <EL href="https://www.tiktok.com">TikTok</EL>, but every post is something actually for sale — with a seller you can message directly.
      </>
    ),
  },
  {
    number: "03",
    title: "Like it? Message the seller.",
    node: "Tap to open a direct chat with any seller. Negotiate, ask questions, arrange pickup or delivery — completely on your terms.",
  },
  {
    number: "04",
    title: "Sell. Post. Build your audience.",
    node: "Sellers post content, grow followers, and build trust over time. The more you post, the more people discover what you're selling.",
  },
];

export function HowItWorksSection() {
  return (
    <section
      id="how-it-works"
      className="py-16 px-5 bg-surface border-t border-default border-b border-default"
    >
      <div className="max-w-300 mx-auto">
        {/* Header */}
        <div className="text-center mb-16">
          <p className="text-(length:--text-sm) font-bold tracking-widest uppercase text-accent mb-3">
            How it works
          </p>
          <h2 className="font-display font-bold text-[clamp(1.75rem,3.5vw,3rem)] tracking-tight leading-[1.15] text-foreground">
            Discover locally. Connect directly. No checkout needed.
          </h2>
        </div>

        {/* Steps */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 relative">
          {steps.map(({ number, title, node }) => (
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
                {node}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
