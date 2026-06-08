"use client";

import Image from "next/image";
import {
  ArrowUpRight,
  CircleGauge,
  ExternalLink,
  Eye,
  Heart,
  PenLine,
  Sparkles,
  Upload,
  Users,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
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

function getCompletion(user: ProfileUserFieldsFragment) {
  const profile = user.profile;
  const checks = [
    Boolean(profile?.avatar),
    Boolean(user.username),
    Boolean(profile?.firstName || profile?.lastName),
    Boolean(profile?.bio),
    Boolean(profile?.website),
  ];

  return Math.round(
    (checks.filter(Boolean).length / Math.max(checks.length, 1)) * 100,
  );
}

function StatTile({
  icon: Icon,
  label,
  value,
  caption,
  tone,
}: {
  icon: LucideIcon;
  label: string;
  value: string;
  caption: string;
  tone: string;
}) {
  return (
    <div
      className="rounded-lg border p-3"
      style={{
        backgroundColor: "rgb(var(--color-bg-elevated) / 0.84)",
        borderColor: "rgb(var(--color-border))",
        boxShadow: "var(--shadow-sm)",
      }}
    >
      <div className="mb-3 flex items-center justify-between gap-2">
        <div
          className="flex h-8 w-8 items-center justify-center rounded-lg"
          style={{
            backgroundColor: `rgb(var(${tone}) / 0.12)`,
            color: `rgb(var(${tone}))`,
          }}
        >
          <Icon size={16} strokeWidth={2.2} />
        </div>
        <ArrowUpRight
          size={15}
          strokeWidth={2.1}
          style={{ color: "rgb(var(--color-text-placeholder))" }}
          aria-hidden
        />
      </div>
      <p
        className="font-bold leading-none"
        style={{
          color: "rgb(var(--color-text))",
          fontSize: "var(--text-lg)",
        }}
      >
        {value}
      </p>
      <div className="mt-1 min-w-0">
        <p
          className="font-semibold leading-tight"
          style={{
            color: "rgb(var(--color-text))",
            fontSize: "var(--text-sm)",
          }}
        >
          {label}
        </p>
        <p
          className="truncate"
          style={{
            color: "rgb(var(--color-text-muted))",
            fontSize: "var(--text-xs)",
          }}
        >
          {caption}
        </p>
      </div>
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
  const completion = getCompletion(user);
  const totalViews = user.totalViews ?? 0;
  const totalLikes = user.totalLikes ?? 0;
  const engagement =
    totalViews > 0 ? `${Math.min(99, (totalLikes / totalViews) * 100).toFixed(1)}%` : "--";

  return (
    <section
      className="relative overflow-hidden border-b"
      style={{
        background:
          "linear-gradient(135deg, rgb(var(--color-bg-elevated)) 0%, rgb(var(--color-bg-subtle)) 54%, rgb(var(--color-bg-elevated)) 100%)",
        borderColor: "rgb(var(--color-border))",
      }}
    >
      <div className="mx-auto w-full max-w-6xl px-4 py-4 sm:px-6 lg:px-8 lg:py-6">
        <div className="grid gap-4 lg:grid-cols-[minmax(0,1.25fr)_minmax(320px,0.75fr)] lg:items-stretch">
          <div className="flex min-w-0 flex-col gap-4">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div className="flex min-w-0 gap-4 sm:gap-5">
                <div
                  className="relative h-16 w-16 shrink-0 overflow-hidden rounded-full border sm:h-20 sm:w-20"
                  style={{
                    background: avatar
                      ? "rgb(var(--color-bg-subtle))"
                      : "linear-gradient(135deg, rgb(var(--brand-primary)), rgb(var(--brand-secondary)) 62%, rgb(var(--brand-accent)))",
                    borderColor: "rgb(var(--color-bg-elevated))",
                    boxShadow: "0 16px 40px rgb(var(--brand-primary) / 0.2)",
                  }}
                >
                  {avatar ? (
                    <Image
                      src={avatar}
                      alt={displayName}
                      fill
                      sizes="(max-width: 640px) 64px, 80px"
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
                  <div
                    className="mb-2 inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1"
                    style={{
                      backgroundColor: "rgb(var(--color-bg-elevated) / 0.76)",
                      borderColor: "rgb(var(--color-border))",
                      color: "rgb(var(--brand-primary))",
                      fontSize: "var(--text-xs)",
                    }}
                  >
                    <Sparkles size={13} strokeWidth={2.2} />
                    <span className="font-semibold">Creator profile</span>
                  </div>
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
              </div>

              <button
                onClick={onEditClick}
                className="inline-flex h-9 shrink-0 items-center justify-center gap-2 rounded-lg border px-3 font-semibold active:opacity-75"
                style={{
                  backgroundColor: "rgb(var(--color-bg-elevated))",
                  borderColor: "rgb(var(--color-border-strong))",
                  color: "rgb(var(--color-text))",
                  fontSize: "var(--text-sm)",
                  boxShadow: "var(--shadow-sm)",
                }}
              >
                <PenLine size={16} strokeWidth={2.2} />
                Edit profile
              </button>
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
          </div>

          <div
            className="rounded-lg border p-3"
            style={{
              backgroundColor: "rgb(var(--color-bg-elevated) / 0.82)",
              borderColor: "rgb(var(--color-border))",
              boxShadow: "var(--shadow-sm)",
            }}
          >
            <div className="mb-4 flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div
                  className="flex h-9 w-9 items-center justify-center rounded-lg"
                  style={{
                    backgroundColor: "rgb(var(--brand-accent) / 0.12)",
                    color: "rgb(var(--brand-accent))",
                  }}
                >
                  <CircleGauge size={17} strokeWidth={2.2} />
                </div>
                <div>
                  <p
                    className="font-bold leading-tight"
                    style={{
                      color: "rgb(var(--color-text))",
                      fontSize: "var(--text-base)",
                    }}
                  >
                    Profile strength
                  </p>
                  <p
                    style={{
                      color: "rgb(var(--color-text-muted))",
                      fontSize: "var(--text-xs)",
                    }}
                  >
                    {completion >= 80 ? "Ready for discovery" : "Almost ready"}
                  </p>
                </div>
              </div>
              <span
                className="font-bold"
                style={{
                  color: "rgb(var(--color-text))",
                  fontSize: "var(--text-lg)",
                }}
              >
                {completion}%
              </span>
            </div>
            <div
              className="h-2 overflow-hidden rounded-full"
              style={{ backgroundColor: "rgb(var(--color-bg-subtle))" }}
            >
              <div
                className="h-full rounded-full"
                style={{
                  width: `${completion}%`,
                  background:
                    "linear-gradient(90deg, rgb(var(--brand-primary)), rgb(var(--brand-secondary)), rgb(var(--brand-accent)))",
                }}
              />
            </div>
            <div className="mt-4 grid grid-cols-2 gap-2">
              <div
                className="rounded-lg p-3"
                style={{ backgroundColor: "rgb(var(--color-bg-subtle))" }}
              >
                <p
                  className="font-bold leading-none"
                  style={{
                    color: "rgb(var(--color-text))",
                    fontSize: "var(--text-base)",
                  }}
                >
                  {formatCompact(user.totalLikes)}
                </p>
                <p
                  className="mt-1"
                  style={{
                    color: "rgb(var(--color-text-muted))",
                    fontSize: "var(--text-xs)",
                  }}
                >
                  Total likes
                </p>
              </div>
              <div
                className="rounded-lg p-3"
                style={{ backgroundColor: "rgb(var(--color-bg-subtle))" }}
              >
                <p
                  className="font-bold leading-none"
                  style={{
                    color: "rgb(var(--color-text))",
                    fontSize: "var(--text-base)",
                  }}
                >
                  {engagement}
                </p>
                <p
                  className="mt-1"
                  style={{
                    color: "rgb(var(--color-text-muted))",
                    fontSize: "var(--text-xs)",
                  }}
                >
                  Like rate
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4 lg:gap-3">
          <StatTile
            icon={Upload}
            label="Posts"
            value={formatCompact(user.postCount)}
            caption="Published"
            tone="--brand-primary"
          />
          <StatTile
            icon={Users}
            label="Followers"
            value={formatCompact(user.followerCount)}
            caption={`${formatCompact(user.followingCount)} following`}
            tone="--color-success"
          />
          <StatTile
            icon={Eye}
            label="Views"
            value={formatCompact(user.totalViews)}
            caption="All content"
            tone="--brand-accent"
          />
          <StatTile
            icon={Heart}
            label="Likes"
            value={formatCompact(user.totalLikes)}
            caption="Audience signals"
            tone="--brand-secondary"
          />
        </div>
      </div>
    </section>
  );
}
