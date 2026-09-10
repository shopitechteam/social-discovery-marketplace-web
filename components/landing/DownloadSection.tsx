import Link from "next/link";
import type { Dictionary } from "@/i18n/getDictionary";

export function DownloadSection({
  dict,
  lang,
}: {
  dict: Dictionary;
  lang: string;
}) {
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

          {/* Closing CTA points at the post flow, not the feed. Someone who
              has read the whole page is the most likely person on the site to
              actually publish something; sending them to a no-account browse
              spends that intent on nothing. */}
          <div className="flex flex-wrap items-center justify-center gap-3">
            <Link
              href={`/${lang}/upload`}
              className="btn-primary inline-flex items-center gap-2 px-9 py-4 text-md font-semibold no-underline"
            >
              {dict.download.webCta.replace(/\s*→\s*$/, "")}
              <span aria-hidden> →</span>
            </Link>
            <Link
              href={`/${lang}/feed`}
              className="inline-flex items-center rounded-full border border-border bg-elevated px-7 py-4 text-md font-semibold text-foreground no-underline hover:bg-subtle"
            >
              {dict.download.secondaryCta}
            </Link>
          </div>

          <p className="mt-5 text-sm text-muted">
            {dict.download.reassurance}
          </p>
        </div>
      </div>
    </section>
  );
}
