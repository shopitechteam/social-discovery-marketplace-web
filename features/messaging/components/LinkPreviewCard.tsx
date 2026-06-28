"use client";

import { useQuery } from "@apollo/client/react";
import Image from "next/image";
import { Link2 } from "lucide-react";
import { LINK_PREVIEW } from "../graphql/operations";

interface LinkPreviewResult {
  linkPreview: {
    url: string;
    title?: string | null;
    description?: string | null;
    image?: string | null;
    siteName?: string | null;
  } | null;
}

/**
 * Compact link-unfurl card for a URL shared in chat: OG image + title +
 * description, tapping opens the link in a new tab. Fetched lazily per URL and
 * cached server-side; renders nothing until/unless metadata resolves so a chat
 * with plain links stays clean.
 */
export function LinkPreviewCard({ url, mine }: { url: string; mine: boolean }) {
  const { data } = useQuery(LINK_PREVIEW, {
    variables: { url },
    fetchPolicy: "cache-first",
    errorPolicy: "ignore",
  });

  const preview = (data as LinkPreviewResult | undefined)?.linkPreview;
  if (!preview || (!preview.title && !preview.image)) return null;

  const host = (() => {
    try {
      return new URL(preview.url).hostname.replace(/^www\./, "");
    } catch {
      return preview.siteName ?? "";
    }
  })();

  return (
    <a
      href={preview.url}
      target="_blank"
      rel="noopener noreferrer"
      className={`mt-2 block overflow-hidden rounded-xl transition-opacity active:opacity-70 ${
        mine ? "bg-white/15" : "bg-black/5"
      }`}
    >
      {preview.image ? (
        <div className="relative aspect-[1.91/1] w-full bg-black/10">
          <Image
            src={preview.image}
            alt={preview.title ?? host}
            fill
            sizes="(max-width: 430px) 75vw, 320px"
            className="object-cover"
            unoptimized
          />
        </div>
      ) : null}
      <div className="px-2.5 py-2">
        <span
          className={`flex items-center gap-1 ${mine ? "text-white/70" : "text-muted"}`}
          style={{ fontSize: "var(--text-xs)" }}
        >
          <Link2 size={11} className="shrink-0" />
          <span className="truncate">{preview.siteName || host}</span>
        </span>
        {preview.title ? (
          <p
            className="mt-0.5 line-clamp-2 font-semibold leading-tight"
            style={{ fontSize: "var(--text-sm)" }}
          >
            {preview.title}
          </p>
        ) : null}
        {preview.description ? (
          <p
            className={`mt-0.5 line-clamp-2 leading-snug ${mine ? "text-white/70" : "text-muted"}`}
            style={{ fontSize: "var(--text-xs)" }}
          >
            {preview.description}
          </p>
        ) : null}
      </div>
    </a>
  );
}
