import React from "react";
import type { Dictionary } from "@/i18n/getDictionary";

const EL = ({ href, children }: { href: string; children: React.ReactNode }) => (
  <a
    href={href}
    target="_blank"
    rel="noopener noreferrer"
    className="text-inherit underline decoration-dotted underline-offset-3"
  >
    {children}
  </a>
);

/* Honest, real use cases — not fabricated reviews. */
const useCases: {
  node: React.ReactNode;
  who: string;
  accentBar: string;
  accentText: string;
}[] = [
  {
    node: (
      <>
        A farmer in Kiambu records the animals, adds a price and location, then
        posts. Buyers can see the listing in the feed and message directly,
        without a broker setting the conversation for them.
      </>
    ),
    who: "Farm produce & livestock",
    accentBar: "bg-primary",
    accentText: "text-primary",
  },
  {
    node: (
      <>
        A phone dealer in town posts a clean iPhone with clear photos, video and
        a price. Someone nearby spots it while scrolling, asks a few questions,
        and they decide where to meet.
      </>
    ),
    who: "Electronics & phones",
    accentBar: "bg-secondary",
    accentText: "text-secondary",
  },
  {
    node: (
      <>
        Shopi keeps the classifieds idea people know from sites like{" "}
        <EL href="https://jiji.co.ke">Jiji</EL>, but makes discovery feel closer
        to a social feed. The difference is simple: every post is something for
        sale, with a seller you can message.
      </>
    ),
    who: "Fashion, furniture & more",
    accentBar: "bg-accent",
    accentText: "text-accent",
  },
];

export function TestimonialsSection({ dict }: { dict: Dictionary }) {
  return (
    <section className="border-y border-border bg-surface px-(--landing-page-x) py-20">
      <div className="mx-auto max-w-(--landing-page-max)">
        <div className="mb-12">
          <p className="mb-3 text-sm font-bold tracking-widest uppercase text-muted">
            {dict.testimonials.sectionLabel}
          </p>
          <h2 className="max-w-2xl font-display text-[clamp(1.6rem,3.2vw,2.5rem)] font-bold tracking-normal leading-tight text-foreground">
            {dict.testimonials.headline}
          </h2>
        </div>

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 lg:gap-6">
          {useCases.map(({ node, who, accentBar, accentText }) => (
            <div
              key={who}
              className="flex flex-col gap-5 rounded-lg border border-border bg-elevated p-8"
            >
              <div className={`h-1 w-9 rounded-[4px] ${accentBar}`} />
              <p className="flex-1 text-md leading-[1.6] text-foreground">
                {node}
              </p>
              <div className={`text-sm font-bold ${accentText}`}>{who}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
