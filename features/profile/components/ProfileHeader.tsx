"use client";

import Image from "next/image";
import { ExternalLink, PenLine } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SHIMMER_AVATAR } from "@/lib/shimmer";
import type { ProfileUserFieldsFragment } from "@/types/__generated__/graphql";

interface Props {
  user: ProfileUserFieldsFragment;
  onEditClick: () => void;
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

function StatTile({ label, value }: { label: string; value: string }) {
  return (
    <div
      className="min-w-0 rounded-md border px-2 py-2 text-center"
      style={{
        backgroundColor: "rgb(var(--color-bg-elevated) / 0.78)",
        borderColor: "rgb(var(--color-border))",
      }}
    >
      <p
        className="truncate font-bold leading-none"
        style={{
          color: "rgb(var(--color-text))",
          fontSize: "var(--text-base)",
        }}
      >
        {value}
      </p>
      <p
        className="mt-1 truncate font-semibold leading-tight"
        style={{
          color: "rgb(var(--color-text-muted))",
          fontSize: "var(--text-xs)",
        }}
      >
        {label}
      </p>
    </div>
  );
}

export function ProfileHeader({ user, onEditClick }: Props) {
  const firstName = user.profile?.firstName ?? "";
  const lastName = user.profile?.lastName ?? "";
  const displayName =
    [firstName, lastName].filter(Boolean).join(" ") || "Your Name";
  const avatar = user.profile?.avatar;
  const initials =
    [firstName[0], lastName[0]].filter(Boolean).join("").toUpperCase() || "?";

  return (
    <section
      className="relative overflow-hidden border-b"
      style={{
        backgroundColor: "rgb(var(--color-bg))",
        borderColor: "rgb(var(--color-border))",
      }}
    >
      <div className="mx-auto w-full max-w-6xl px-4 py-4 sm:px-6 lg:px-8 lg:py-6">
        <div className="flex min-w-0 flex-col gap-4">
          <div className="flex min-w-0 items-start gap-4">
            <div
              className="relative h-20 w-20 shrink-0 overflow-hidden rounded-full border sm:h-24 sm:w-24"
              style={{
                background: avatar
                  ? "rgb(var(--color-bg-subtle))"
                  : "linear-gradient(135deg, rgb(var(--brand-primary)), rgb(var(--brand-secondary)) 62%, rgb(var(--brand-accent)))",
                borderColor: "rgb(var(--color-bg-elevated))",
              }}
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
                      color: "rgb(var(--color-text))",
                      fontSize: "var(--text-lg)",
                    }}
                  >
                    {displayName}
                  </h1>
                  {user.username && (
                    <p
                      className="truncate"
                      style={{
                        color: "rgb(var(--color-text-muted))",
                        fontSize: "var(--text-sm)",
                      }}
                    >
                      @{user.username}
                    </p>
                  )}
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={onEditClick}
                  className="h-9 shrink-0 rounded-md px-3 font-semibold"
                  style={{
                    backgroundColor: "rgb(var(--color-bg-elevated))",
                    borderColor: "rgb(var(--color-border-strong))",
                    color: "rgb(var(--color-text))",
                    fontSize: "var(--text-sm)",
                  }}
                >
                  <PenLine size={16} strokeWidth={2.2} />
                  Edit
                </Button>
              </div>

              <div className="mt-3 grid grid-cols-4 gap-1.5">
                <StatTile label="Posts" value={formatCompact(user.postCount)} />
                <StatTile
                  label="Followers"
                  value={formatCompact(user.followerCount)}
                />
                <StatTile
                  label="Views"
                  value={formatCompact(user.totalViews)}
                />
                <StatTile
                  label="Likes"
                  value={formatCompact(user.totalLikes)}
                />
              </div>
            </div>
          </div>

          {(user.profile?.bio || user.profile?.website) && (
            <div className="flex flex-col gap-2">
              {user.profile?.bio && (
                <p
                  className="max-w-3xl leading-snug"
                  style={{
                    color: "rgb(var(--color-text))",
                    fontSize: "var(--text-sm)",
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
                    color: "rgb(var(--brand-accent))",
                    fontSize: "var(--text-sm)",
                  }}
                >
                  <ExternalLink size={14} strokeWidth={2.2} />
                  {user.profile.website.replace(/^https?:\/\//, "")}
                </a>
              )}
            </div>
          )}

          <div className="hidden items-center gap-4 sm:flex">
            <span
              style={{
                color: "rgb(var(--color-text-muted))",
                fontSize: "var(--text-sm)",
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
