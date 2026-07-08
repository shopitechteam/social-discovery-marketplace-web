"use client";

import Link from "next/link";
import type { Dictionary } from "@/i18n/getDictionary";

export function DownloadSection({ dict }: { dict: Dictionary }) {
  return (
    <section
      id="download"
      className="mx-auto max-w-(--landing-page-max) px-(--landing-page-x) py-20 text-center"
    >
      <div className="relative overflow-hidden rounded-lg border border-border bg-surface px-6 py-[clamp(2.5rem,6vw,4.5rem)]">
        <div className="relative z-1">
          <p className="mb-4 text-sm font-bold tracking-widest uppercase text-primary">
            {dict.download.sectionLabel}
          </p>
          <h2 className="mx-auto mb-4 max-w-160 font-display text-[clamp(1.9rem,4.5vw,3.25rem)] font-bold tracking-normal leading-[1.12] text-foreground">
            {dict.download.headline}
          </h2>
          <p className="mx-auto mb-9 max-w-130 text-[clamp(1rem,1.6vw,1.15rem)] leading-[1.6] text-muted">
            {dict.download.body}
          </p>

          <Link
            href="/feed"
            className="btn-primary inline-flex items-center gap-2 px-9 py-4 text-md font-semibold no-underline"
          >
            {dict.download.webCta}
          </Link>

          <p className="mt-5 text-sm text-muted">
            Free to browse · No checkout · No commission
          </p>
        </div>
      </div>
    </section>
  );
}
