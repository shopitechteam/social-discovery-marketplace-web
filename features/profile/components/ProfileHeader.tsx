"use client";

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

function StatTile({
  label,
  value,
  href,
}: {
  label: string;
  value: string;
  href?: string;
}) {
  const inner = (
    <>
      <p
        className="truncate font-bold leading-none"
        style={{
          fontSize: "var(--text-base)",
          color: "rgb(var(--color-text))",
        }}
      >
        {value}
      </p>
      <p
        className="mt-1 truncate font-semibold leading-tight"
        style={{
          fontSize: "var(--text-xs)",
          color: "rgb(var(--color-text-muted))",
        }}
      >
        {label}
      </p>
    </>
  );

  const className = "block min-w-0 rounded-md border px-2 py-2 text-center";
  const style = {
    backgroundColor: "rgb(var(--color-bg-elevated) / 0.78)",
    borderColor: "rgb(var(--color-border))",
  } as const;

  if (href) {
    return (
      <Link
        href={href}
        className={`${className} transition-opacity active:opacity-70`}
        style={style}
      >
        {inner}
      </Link>
    );
  }
  return (
    <div className={className} style={style}>
      {inner}
    </div>
  );
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
    <section
      // Subtle brand wash — Tailwind gradient (inline-style gradients don't
      // render in this build). Matches the creator profile hero for consistency.
      className="relative py-6 overflow-hidden border-b border-border bg-linear-160 from-primary/10 from-0% to-background to-60%"
    >
      <div className="mx-auto w-full max-w-6xl px-4 py-4 sm:px-6 lg:px-8 lg:py-8">
        <div className="flex min-w-0 flex-col gap-4 lg:gap-6">
          <div className="flex min-w-0 items-start gap-4 lg:gap-5">
            <div
              className={`relative h-20 w-20 shrink-0 overflow-hidden rounded-full border border-elevated sm:h-24 sm:w-24 lg:h-28 lg:w-28 ${
                avatar
                  ? "bg-surface"
                  : "bg-linear-135 from-primary via-secondary via-62% to-accent"
              }`}
            >
              {avatar ? (
                <Image
                  src={avatar}
                  alt={displayName}
                  fill
                  sizes="(max-width: 640px) 80px, 96px"
                  className="object-cover"
                  placeholder="blur"
                  blurDataURL={SHIMMER_AVATAR}
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center">
                  <span
                    className="select-none font-bold text-white"
                    style={{ fontSize: "var(--text-lg)" }}
                  >
                    {initials}
                  </span>
                </div>
              )}
            </div>

            <div className="min-w-0 flex-1 pt-1">
              <div className="flex min-w-0 items-start justify-between gap-3">
                <div className="min-w-0">
                  <h1
                    className="truncate font-bold leading-tight"
                    style={{
                      fontSize: "var(--text-lg)",
                      color: "rgb(var(--color-text))",
                    }}
                  >
                    {displayName}
                  </h1>
                  {user.username && (
                    <p
                      className="truncate"
                      style={{
                        fontSize: "var(--text-sm)",
                        color: "rgb(var(--color-text-muted))",
                      }}
                    >
                      @{user.username}
                    </p>
                  )}
                </div>
                <Button
                  asChild
                  variant="outline"
                  size="sm"
                  className="h-9 shrink-0 rounded-md px-3 font-semibold"
                  style={{
                    fontSize: "var(--text-sm)",
                    backgroundColor: "rgb(var(--color-bg-elevated))",
                    borderColor: "rgb(var(--color-border-strong))",
                    color: "rgb(var(--color-text))",
                  }}
                >
                  <Link href={editHref}>
                    <PenLine size={16} strokeWidth={2.2} />
                    Edit
                  </Link>
                </Button>
              </div>

              <ProfileViewsCluster lang={lang} className="mt-3" />

              <div className="mt-3 grid grid-cols-3 gap-1.5 md:max-w-xl md:gap-2 lg:max-w-2xl lg:grid-cols-4">
                <StatTile label="Posts" value={formatCompact(user.postCount)} />
                <StatTile
                  label="Followers"
                  value={formatCompact(user.followerCount)}
                  href={`/${lang}/profile/followers`}
                />
                <StatTile
                  label="Views"
                  value={formatCompact(user.totalViews)}
                />
                <div className="hidden lg:block">
                  <StatTile
                    label="Following"
                    value={formatCompact(user.followingCount)}
                  />
                </div>
              </div>
            </div>
          </div>

          {(user.profile?.bio || user.profile?.website) && (
            <div className="flex flex-col gap-2">
              {user.profile?.bio && (
                <p
                  className="max-w-3xl leading-snug"
                  style={{
                    fontSize: "var(--text-sm)",
                    color: "rgb(var(--color-text))",
                  }}
                >
                  {user.profile.bio}
                </p>
              )}

              {user.profile?.website && (
                <a
                  href={getWebsiteHref(user.profile.website)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex w-fit items-center gap-1.5 font-semibold"
                  style={{
                    fontSize: "var(--text-sm)",
                    color: "rgb(var(--brand-accent))",
                  }}
                >
                  <ExternalLink size={14} strokeWidth={2.2} />
                  {user.profile.website.replace(/^https?:\/\//, "")}
                </a>
              )}
            </div>
          )}
          <div className="hidden items-center gap-4 sm:flex lg:hidden">
            <span
              style={{
                fontSize: "var(--text-sm)",
                color: "rgb(var(--color-text-muted))",
              }}
            >
              {formatCompact(user.followingCount)} following
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
