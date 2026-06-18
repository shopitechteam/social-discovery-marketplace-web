"use client";

/**
 * TikTokEmbedMedia — feed media block for posts whose source = TIKTOK_EMBED.
 *
 * We do not host the video. The card shows our own chrome (cover image, price,
 * creator header live in PostCard) with a TikTok badge. On tap we lazily load
 * the `tiktok-video-element` web component and stream the video straight from
 * TikTok. A persistent "View on TikTok" badge links back to the original for
 * attribution.
 */

import { useState, useRef, useCallback, type DetailedHTMLProps, type HTMLAttributes } from "react";
import Image from "next/image";
import { TikTokIcon } from "@/components/ui/TikTokIcon";
import type { ContentCardFieldsFragment } from "@/types/__generated__/graphql";

// `<tiktok-video>` is a custom element (from tiktok-video-element). Declare it
// for JSX so we get type-checking on the props we use.
type TiktokVideoAttributes = DetailedHTMLProps<
  HTMLAttributes<HTMLElement>,
  HTMLElement
> & { src?: string; controls?: boolean };

declare module "react" {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace JSX {
    interface IntrinsicElements {
      "tiktok-video": TiktokVideoAttributes;
    }
  }
}

let registerPromise: Promise<unknown> | null = null;
/** Register the custom element once, lazily, on first play. */
function ensureRegistered(): Promise<unknown> {
  if (typeof window === "undefined") return Promise.resolve();
  if (!registerPromise) registerPromise = import("tiktok-video-element");
  return registerPromise;
}

export function TikTokEmbedMedia({
  post,
}: {
  post: ContentCardFieldsFragment;
}) {
  const embed = post.tiktokEmbed;
  const [playing, setPlaying] = useState(false);
  const [ready, setReady] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const handlePlay = useCallback(async () => {
    await ensureRegistered();
    setReady(true);
    setPlaying(true);
  }, []);

  if (!embed) return null;

  const shareUrl = embed.shareUrl;

  return (
    <div
      ref={containerRef}
      className="relative w-full overflow-hidden bg-black"
      style={{ aspectRatio: "9 / 16", maxHeight: "70vh" }}
    >
      {/* Live embed — mounted only after first tap */}
      {ready && (
        <tiktok-video
          src={shareUrl}
          controls
          className="absolute inset-0 h-full w-full"
          style={{ width: "100%", height: "100%" }}
        />
      )}

      {/* Cover + play affordance — shown until the user taps play */}
      {!playing && (
        <button
          type="button"
          onClick={handlePlay}
          className="absolute inset-0 flex items-center justify-center"
          aria-label="Play TikTok video"
        >
          {embed.coverImageUrl && (
            <Image
              src={embed.coverImageUrl}
              alt={embed.title ?? "TikTok video"}
              fill
              sizes="(max-width: 768px) 100vw, 600px"
              className="object-cover"
            />
          )}
          <span className="relative z-10 flex h-16 w-16 items-center justify-center rounded-full bg-black/55 backdrop-blur-sm">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="white">
              <path d="M8 5v14l11-7z" />
            </svg>
          </span>
        </button>
      )}

      {/* Attribution badge — always visible, links back to TikTok */}
      <a
        href={shareUrl}
        target="_blank"
        rel="noopener noreferrer"
        onClick={(e) => e.stopPropagation()}
        className="absolute right-3 top-3 z-20 flex items-center gap-1.5 rounded-full bg-black/65 px-2.5 py-1 text-xs font-medium text-white backdrop-blur-sm"
      >
        <TikTokIcon size={14} className="h-3.5 w-3.5" />
        View on TikTok
      </a>
    </div>
  );
}
