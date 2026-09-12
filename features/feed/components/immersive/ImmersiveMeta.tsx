"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { MapPin } from "lucide-react";
import type { ContentCardFieldsFragment } from "@/types/__generated__/graphql";
import { avatarGradient, idInitials } from "@/lib/avatar";
import { profileHref } from "@/lib/profile-url";
import { PriceTag } from "../PriceTag";
import { cn } from "@/lib/utils";

/**
 * Who posted it and what it is — the text half of the viewer's chrome.
 *
 * Shared by the mobile overlay (over the video, light-on-dark) and the desktop
 * rail (beside it, on its own dark surface), so a seller's name, price and
 * caption read the same in both.
 */
export function ImmersiveMeta({
  post,
  lang,
  onFollow,
  following,
  variant,
}: {
  post: ContentCardFieldsFragment;
  lang: string;
  onFollow?: () => void;
  following?: boolean;
  variant: "overlay" | "rail";
}) {
  const creator = post.creator;
  const displayName =
    [creator?.profile?.firstName, creator?.profile?.lastName]
      .filter(Boolean)
      .join(" ") ||
    creator?.username ||
    "Seller";
  const avatar = creator?.profile?.avatar;
  const overlay = variant === "overlay";

  return (
    // Over the video the block itself must not swallow taps — pause is the
    // whole-frame gesture, and a caption column eating the bottom third of it
    // would feel broken. Only the genuinely interactive children opt back in.
    <div
      className={cn(
        "flex flex-col gap-2",
        overlay ? "pointer-events-none text-white" : "text-default",
      )}
    >
      <div className="flex items-center gap-2">
        <Link
          href={profileHref(lang, creator)}
          className="pointer-events-auto flex items-center gap-2"
        >
          {avatar ? (
            <Image
              src={avatar}
              alt={displayName}
              width={36}
              height={36}
              className="h-9 w-9 rounded-full object-cover"
            />
          ) : (
            <span
              className={cn(
                "flex h-9 w-9 items-center justify-center rounded-full bg-linear-to-br text-xs font-bold text-white",
                avatarGradient(creator?.id ?? post.creatorId),
              )}
            >
              {idInitials(creator?.id ?? post.creatorId)}
            </span>
          )}
          <span className="text-sm font-semibold">{displayName}</span>
        </Link>

        {onFollow && !post.isMyContent && (
          <button
            type="button"
            onClick={(event) => {
              event.stopPropagation();
              onFollow();
            }}
            className={cn(
              "pointer-events-auto rounded-full px-3 py-1 text-xs font-semibold transition-colors",
              overlay
                ? following
                  ? "border border-white/40 text-white/80"
                  : "bg-white text-black"
                : following
                  ? "border border-default text-muted"
                  : "bg-primary text-white",
            )}
          >
            {following ? "Following" : "Follow"}
          </button>
        )}
      </div>

      {post.title && (
        <p className="text-sm font-semibold leading-snug">{post.title}</p>
      )}

      {post.price && post.price.amount > 0 && (
        <div>
          <PriceTag
            amount={post.price.amount}
            currency={post.price.currency}
            negotiable={post.price.negotiable}
            inverted={overlay}
          />
        </div>
      )}

      {post.caption && (
        <ExpandableCaption caption={post.caption} overlay={overlay} />
      )}

      {post.location?.county && (
        <p
          className={cn(
            "flex items-center gap-1 text-xs",
            overlay ? "text-white/80" : "text-muted",
          )}
        >
          <MapPin className="h-3.5 w-3.5" />
          {[post.location.subregion, post.location.county]
            .filter(Boolean)
            .join(", ")}
        </p>
      )}
    </div>
  );
}

/**
 * Caption clamped to two lines, with a toggle only when there is more to see.
 *
 * Overflow is measured rather than guessed from length: the same string wraps
 * to a different number of lines depending on width, so a character count
 * would show "more" on captions that already fit and hide it on ones that
 * don't. A ResizeObserver keeps that honest as the viewport changes, which is
 * the pattern the feed card already uses.
 */
function ExpandableCaption({
  caption,
  overlay,
}: {
  caption: string;
  overlay: boolean;
}) {
  const ref = useRef<HTMLParagraphElement>(null);
  const [expanded, setExpanded] = useState(false);
  const [overflows, setOverflows] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    // Measured from inside the observer rather than synchronously here, so the
    // read stays off the layout-flush path.
    const observer = new ResizeObserver(() => {
      setOverflows(el.scrollHeight > el.clientHeight + 1);
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, [caption, expanded]);

  return (
    <div>
      <p
        ref={ref}
        className={cn(
          "text-sm leading-snug whitespace-pre-line",
          !expanded && "line-clamp-2",
          // Expanded captions can be long, so cap the height and let them
          // scroll instead of pushing the action row off a phone screen.
          expanded && "pointer-events-auto max-h-40 overflow-y-auto no-scroll-indicator",
          overlay ? "text-white/90" : "text-default",
        )}
      >
        {caption}
      </p>
      {(overflows || expanded) && (
        <button
          type="button"
          onClick={(event) => {
            event.stopPropagation();
            setExpanded((value) => !value);
          }}
          className={cn(
            "pointer-events-auto mt-0.5 text-sm font-bold transition-opacity active:opacity-60",
            overlay ? "text-white/80" : "text-muted",
          )}
        >
          {expanded ? "less" : "more"}
        </button>
      )}
    </div>
  );
}
