"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ExternalLink, PenLine } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SHIMMER_AVATAR } from "@/lib/shimmer";
import type { ProfileUserFieldsFragment } from "@/types/__generated__/graphql";
import { ProfileViewsCluster } from "./ProfileViewsCluster";

interface Props {
  user: ProfileUserFieldsFragment;
  editHref: string;
  lang: string;
}

function formatCompact(value: number | null | undefined) {
  if (value == null) return "--";
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}M`;
  if (value >= 1_000) return `${(value / 1_000).toFixed(1)}K`;
  return String(value);
}

function getWebsiteHref(website: string) {
  return website.startsWith("http") ? website : `https://${website}`;
}

function VerifiedBadge() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 20 20"
      fill="none"
      className="shrink-0"
      aria-label="Verified"
    >
      <circle cx="10" cy="10" r="10" fill="#1D9BF0" />
      <path
        d="M6 10.5l2.5 2.5 5.5-5.5"
        stroke="white"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/** Bio text, clamped to 3 lines with a "more"/"less" toggle. The toggle only
 * renders when the text actually overflows 3 lines — measured against the
 * DOM rather than guessed from character count, since a bio can wrap short
 * on a narrow phone and long on desktop at the same length. */
function ExpandableBio({ text }: { text: string }) {
  const [expanded, setExpanded] = useState(false);
  const [truncated, setTruncated] = useState(false);
  const ref = useRef<HTMLParagraphElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    setTruncated(el.scrollHeight > el.clientHeight + 1);
  }, [text]);

  return (
    <div>
      <p
        ref={ref}
        className={`text-sm leading-6 text-main ${expanded ? "" : "line-clamp-3"}`}
      >
        {text}
      </p>
      {truncated ? (
        <button
          type="button"
          onClick={() => setExpanded((v) => !v)}
          className="mt-0.5 text-sm font-bold text-primary"
        >
          {expanded ? "less" : "more"}
        </button>
      ) : null}
    </div>
  );
}

function Stat({
  label,
  value,
  href,
}: {
  label: string;
  value: string;
  href?: string;
}) {
  const content = (
    <>
      <span className="text-sm font-black text-main">{value}</span>
      <span className="text-xs font-medium text-muted">{label}</span>
    </>
  );

  if (href) {
    return (
      <Link
        href={href}
        className="flex min-w-0 items-baseline gap-1.5 rounded-md py-1 transition-colors hover:text-primary"
      >
        {content}
      </Link>
    );
  }

  return <div className="flex min-w-0 items-baseline gap-1.5 py-1">{content}</div>;
}

export function ProfileHeader({ user, editHref, lang }: Props) {
  const firstName = user.profile?.firstName ?? "";
  const lastName = user.profile?.lastName ?? "";
  const displayName =
    [firstName, lastName].filter(Boolean).join(" ") || "Your Name";
  const avatar = user.profile?.avatar;
  const initials =
    [firstName[0], lastName[0]].filter(Boolean).join("").toUpperCase() || "?";

  return (
    <section className="border-b border-border bg-app">
      <div className="w-full px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
        <div className="flex min-w-0 items-start gap-5 lg:gap-7">
          <div
            className={`relative h-20 w-20 shrink-0 overflow-hidden rounded-full border border-border sm:h-24 sm:w-24 lg:h-30 lg:w-30 ${
              avatar ? "bg-surface" : "bg-main"
            }`}
          >
            {avatar ? (
              <Image
                src={avatar}
                alt={displayName}
                fill
                sizes="(max-width: 640px) 80px, (max-width: 1023px) 96px, 120px"
                className="object-cover"
                placeholder="blur"
                blurDataURL={SHIMMER_AVATAR}
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center">
                <span className="select-none text-xl font-black text-elevated">
                  {initials}
                </span>
              </div>
            )}
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div className="min-w-0">
                <div className="flex min-w-0 items-center gap-2">
                  <h1 className="truncate text-xl font-black leading-tight text-main lg:text-2xl">
                    {displayName}
                  </h1>
                  {user.isVerified ? <VerifiedBadge /> : null}
                </div>
                {user.username ? (
                  <p className="mt-0.5 truncate text-sm font-medium text-muted">
                    @{user.username}
                  </p>
                ) : null}
              </div>

              <Button
                asChild
                variant="outline"
                size="sm"
                className="h-9 w-fit shrink-0 rounded-full border-border px-4 text-sm font-bold text-main hover:bg-surface"
              >
                <Link href={editHref}>
                  <PenLine size={15} strokeWidth={2.2} />
                  Edit profile
                </Link>
              </Button>
            </div>

            <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-1">
              <Stat label="posts" value={formatCompact(user.postCount)} />
              <Stat
                label="followers"
                value={formatCompact(user.followerCount)}
                href={`/${lang}/profile/followers`}
              />
              <Stat label="following" value={formatCompact(user.followingCount)} />
            </div>

            <div className="mt-3">
              <ProfileViewsCluster lang={lang} />
            </div>
          </div>
        </div>

        {/* Its own full-width block below the avatar row, not squeezed into
            the column beside it — on a phone that column is only ~200px
            wide, which wrapped a multi-line bio into a narrow ribbon next to
            empty space under the avatar. */}
        {(user.profile?.bio || user.profile?.website) && (
          <div className="mt-4 flex max-w-3xl flex-col gap-2">
            {user.profile?.bio ? <ExpandableBio text={user.profile.bio} /> : null}

            {user.profile?.website ? (
              <a
                href={getWebsiteHref(user.profile.website)}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex w-fit items-center gap-1.5 text-sm font-semibold text-main underline-offset-4 hover:underline"
              >
                <ExternalLink size={14} strokeWidth={2.2} />
                {user.profile.website.replace(/^https?:\/\//, "")}
              </a>
            ) : null}
          </div>
        )}
      </div>
    </section>
  );
}
