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

function VerifiedBadge() {
  return (
    <svg
      width="20"
      height="20"
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

  const className =
    "block min-w-0 rounded-md border px-2 py-2 text-center lg:rounded-2xl lg:px-4 lg:py-3 lg:text-left";
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
      style={{ borderColor: "rgb(229 231 235)" }}
    >
      <div className="mx-auto w-full  px-4 py-4 sm:px-6 lg:px-8 lg:py-8">
        <div className="flex min-w-0 flex-col gap-4 lg:gap-6">
          <div className="flex min-w-0 flex-col gap-4 lg:grid lg:grid-cols-[minmax(280px,320px)_minmax(0,1fr)] lg:gap-6">
            <div
              className="flex min-w-0 items-start gap-4 lg:flex-col lg:items-center lg:rounded-4xl lg:border lg:bg-[rgb(var(--color-bg-elevated)/0.82)] lg:p-8 lg:text-center lg:shadow-sm"
              style={{ borderColor: "rgb(229 231 235)" }}
            >
              <div
                className={`relative h-20 w-20 shrink-0 overflow-hidden rounded-full border border-elevated sm:h-24 sm:w-24 lg:h-44 lg:w-44 lg:border-[3px] ${
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
                    sizes="(max-width: 640px) 80px, (max-width: 1023px) 96px, 176px"
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

              <div className="min-w-0 flex-1 pt-1 lg:flex lg:w-full lg:flex-col lg:items-center lg:pt-0">
                <div className="flex min-w-0 items-center gap-2 lg:justify-center">
                  <h1
                    className="truncate font-bold leading-tight"
                    style={{
                      fontSize: "var(--text-lg)",
                      color: "rgb(var(--color-text))",
                    }}
                  >
                    {displayName}
                  </h1>
                  {user.isVerified && <VerifiedBadge />}
                </div>

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

                <div className="mt-3 hidden flex-wrap items-center gap-3 lg:flex lg:justify-center">
                  <ProfileViewsCluster lang={lang} />
                  <span
                    className="text-sm font-medium"
                    style={{ color: "rgb(var(--color-text-muted))" }}
                  >
                    {formatCompact(user.followingCount)} following
                  </span>
                </div>

                <Button
                  asChild
                  variant="outline"
                  size="sm"
                  className="mt-4 h-9 shrink-0 rounded-md px-3 font-semibold lg:h-10 lg:w-full lg:max-w-[220px] lg:rounded-xl lg:px-4"
                  style={{
                    fontSize: "var(--text-sm)",
                    backgroundColor: "rgb(var(--color-bg-elevated))",
                    borderColor: "rgb(229 231 235)",
                    color: "rgb(var(--color-text))",
                  }}
                >
                  <Link href={editHref}>
                    <PenLine size={16} strokeWidth={2.2} />
                    Edit
                  </Link>
                </Button>
              </div>
            </div>

            <div
              className="min-w-0 pt-1 lg:rounded-[28px] lg:border lg:border-default lg:bg-[rgb(var(--color-bg-elevated)/0.76)] lg:p-6 lg:pt-5 lg:shadow-sm"
              style={{ borderColor: "rgb(229 231 235)" }}
            >
              <div className="flex min-w-0 items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="hidden lg:flex lg:flex-wrap lg:items-center lg:gap-2">
                    <span className="inline-flex items-center rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
                      Your profile
                    </span>
                    {user.isVerified && (
                      <span
                        className="inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold"
                        style={{
                          borderColor: "rgb(229 231 235)",
                          color: "rgb(var(--color-text-muted))",
                        }}
                      >
                        Verified account
                      </span>
                    )}
                  </div>

                  <h2
                    className="mt-0 lg:mt-4 font-bold leading-tight"
                    style={{
                      fontSize: "var(--text-lg)",
                      color: "rgb(var(--color-text))",
                    }}
                  >
                    My dashboard
                  </h2>
                  {user.username && (
                    <p
                      className="mt-1 max-w-2xl"
                      style={{
                        fontSize: "var(--text-sm)",
                        color: "rgb(var(--color-text-muted))",
                      }}
                    >
                      Manage your profile, track your listings, and keep an eye
                      on how your account is performing.
                    </p>
                  )}
                </div>
              </div>

              <ProfileViewsCluster lang={lang} className="mt-3 lg:hidden" />

              <div className="mt-3 grid grid-cols-3 gap-1.5 md:max-w-xl md:gap-2 lg:mt-5 lg:max-w-none lg:grid-cols-4 lg:gap-3">
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
            <div className="flex flex-col gap-2 lg:rounded-2xl lg:bg-[rgb(var(--color-bg-elevated)/0.46)] lg:px-4 lg:py-3">
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
