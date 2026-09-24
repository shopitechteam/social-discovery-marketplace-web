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
      className="mx-auto max-w-(--landing-page-max) px-(--landing-page-x) py-8 text-center md:py-20"
    >
      <div className="relative overflow-hidden rounded-3xl border border-border bg-surface px-5 py-8 md:rounded-lg md:px-6 md:py-[clamp(2.5rem,6vw,4.5rem)]">
        <div className="relative z-1">
          <h2 className="mx-auto mb-2 max-w-160 font-display text-[1.5rem] font-bold tracking-normal leading-[1.15] text-foreground md:mb-4 md:text-[clamp(1.9rem,4.5vw,3.25rem)] md:leading-[1.12]">
            {dict.download.headline}
          </h2>
          <p className="mx-auto mb-5 max-w-130 text-base font-medium text-muted md:mb-9 md:text-xl">
            {dict.download.body}
          </p>

          {/* One CTA, and it points at the post flow, not the feed. Someone
              who has read the whole page is the most likely person on the
              site to actually publish something; the feed is one tap away in
              the nav. */}
          <Link
            href={`/${lang}/upload`}
            className="btn-primary flex h-12 w-full items-center justify-center gap-2 text-[0.9375rem] font-semibold no-underline md:inline-flex md:h-auto md:w-auto md:px-9 md:py-4 md:text-md"
          >
            {dict.download.cta}
            <span aria-hidden> →</span>
          </Link>
        </div>
      </div>
    </section>
  );
}
