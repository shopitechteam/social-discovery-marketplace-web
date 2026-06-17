"use client";

/**
 * MediaCarouselDialog — full-screen image carousel shown when a multi-image
 * PostCard is tapped (replaces navigating to the PDP). Swipe / arrow through
 * images, tap the scrim or the ✕ to close.
 */

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { X, ChevronLeft, ChevronRight } from "lucide-react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { SHIMMER_PORTRAIT } from "@/lib/shimmer";
import type { ContentCardFieldsFragment } from "@/types/__generated__/graphql";

type MediaItem = NonNullable<ContentCardFieldsFragment["media"]>[number];

function srcOf(item: MediaItem): string {
  return (
    item.r2Variants?.find((v) => v.variant === "large")?.url ??
    item.r2Variants?.[0]?.url ??
    item.imageUrl ??
    item.thumbnailUrl ??
    ""
  );
}

export function MediaCarouselDialog({
  open,
  onOpenChange,
  media,
  title,
  startIndex = 0,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  media: MediaItem[];
  title: string;
  startIndex?: number;
}) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [idx, setIdx] = useState(startIndex);

  // Jump to the starting image once the dialog (and its track) is mounted.
  // Deferred so we don't setState synchronously inside the effect body.
  useEffect(() => {
    if (!open) return;
    const t = setTimeout(() => {
      setIdx(startIndex);
      const el = trackRef.current;
      if (el)
        el.scrollTo({
          left: startIndex * el.clientWidth,
          behavior: "instant" as ScrollBehavior,
        });
    }, 0);
    return () => clearTimeout(t);
  }, [open, startIndex]);

  function go(next: number) {
    const el = trackRef.current;
    if (!el) return;
    const clamped = Math.max(0, Math.min(media.length - 1, next));
    el.scrollTo({ left: clamped * el.clientWidth, behavior: "smooth" });
    setIdx(clamped);
  }

  function handleScroll() {
    const el = trackRef.current;
    if (!el) return;
    const i = Math.round(el.scrollLeft / el.clientWidth);
    if (i !== idx) setIdx(i);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="h-svh w-screen max-w-none translate-x-[-50%] translate-y-[-50%] gap-0 border-0 bg-black p-0 sm:rounded-none [&>button]:hidden"
      >
        <DialogTitle className="sr-only">{title}</DialogTitle>

        {/* Close */}
        <button
          type="button"
          onClick={() => onOpenChange(false)}
          aria-label="Close"
          className="absolute right-4 z-30 flex h-11 w-11 items-center justify-center rounded-full bg-black/55 text-white backdrop-blur-sm active:scale-95"
          style={{ top: "max(env(safe-area-inset-top, 0px), 16px)" }}
        >
          <X className="h-6 w-6" />
        </button>

        {/* Counter */}
        <div
          className="absolute left-1/2 z-30 -translate-x-1/2 rounded-full bg-black/55 px-3 py-1 text-xs font-semibold text-white backdrop-blur-sm"
          style={{ top: "max(env(safe-area-inset-top, 0px), 18px)" }}
        >
          {idx + 1} / {media.length}
        </div>

        {/* Swipeable track */}
        <div
          ref={trackRef}
          onScroll={handleScroll}
          className="flex h-svh w-screen snap-x snap-mandatory overflow-x-auto scrollbar-hide"
          style={{ scrollSnapType: "x mandatory" }}
        >
          {media.map((item, i) => {
            const src = srcOf(item);
            return (
              <div
                key={i}
                className="relative h-svh w-screen shrink-0 snap-center bg-black"
              >
                {src && (
                  <Image
                    src={src}
                    alt={`${title} ${i + 1}`}
                    fill
                    sizes="100vw"
                    className="object-contain"
                    priority={i === startIndex}
                    placeholder="blur"
                    blurDataURL={SHIMMER_PORTRAIT}
                  />
                )}
              </div>
            );
          })}
        </div>

        {/* Desktop arrows */}
        {media.length > 1 && (
          <>
            <button
              type="button"
              onClick={() => go(idx - 1)}
              disabled={idx === 0}
              aria-label="Previous image"
              className="absolute left-3 top-1/2 z-30 hidden h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-black/50 text-white disabled:opacity-30 md:flex"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button
              type="button"
              onClick={() => go(idx + 1)}
              disabled={idx === media.length - 1}
              aria-label="Next image"
              className="absolute right-3 top-1/2 z-30 hidden h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-black/50 text-white disabled:opacity-30 md:flex"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </>
        )}

        {/* Dots */}
        <div className="absolute bottom-6 left-1/2 z-30 flex -translate-x-1/2 gap-1.5">
          {media.map((_, i) => (
            <button
              key={i}
              type="button"
              onClick={() => go(i)}
              aria-label={`Go to image ${i + 1}`}
              className={[
                "rounded-full transition-all",
                i === idx ? "h-1.5 w-4 bg-white" : "h-1.5 w-1.5 bg-white/50",
              ].join(" ")}
            />
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}
