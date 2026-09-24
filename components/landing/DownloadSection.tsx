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
          <h2 className="mx-auto mb-4 max-w-160 font-display text-[clamp(1.9rem,4.5vw,3.25rem)] font-bold tracking-normal leading-[1.12] text-foreground">
            {dict.download.headline}
          </h2>
          <p className="mx-auto mb-9 max-w-130 text-lg font-medium text-muted md:text-xl">
            {dict.download.body}
          </p>

          {/* One CTA, and it points at the post flow, not the feed. Someone
              who has read the whole page is the most likely person on the
              site to actually publish something; the feed is one tap away in
              the nav. */}
          <Link
            href={`/${lang}/upload`}
            className="btn-primary inline-flex items-center gap-2 px-9 py-4 text-md font-semibold no-underline"
          >
            {dict.download.cta}
            <span aria-hidden> →</span>
          </Link>
        </div>
      </div>
    </section>
  );
}
