"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useQuery } from "@apollo/client/react";
import { MyProfileVisitorsPreviewDocument } from "@/types/__generated__/graphql";
import { SHIMMER_AVATAR } from "@/lib/shimmer";

function formatCompact(value: number | null | undefined) {
  if (value == null) return "0";
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}M`;
  if (value >= 1_000) return `${(value / 1_000).toFixed(1)}K`;
  return String(value);
}

function initialsOf(firstName?: string | null, lastName?: string | null, username?: string | null) {
  const fromName = [firstName?.[0], lastName?.[0]].filter(Boolean).join("");
  return (fromName || username?.[0] || "?").toUpperCase();
}

/** A single rounded avatar in the stack — image or initials fallback. */
function StackAvatar({
  avatar,
  label,
  index,
}: {
  avatar?: string | null;
  label: string;
  index: number;
}) {
  return (
    <div
      className="relative h-7 w-7 shrink-0 overflow-hidden rounded-full border-2"
      style={{
        marginLeft: index === 0 ? 0 : "-10px",
        zIndex: 10 - index,
        borderColor: "rgb(var(--color-bg))",
        background: avatar
          ? "rgb(var(--color-bg-subtle))"
          : "linear-gradient(135deg, rgb(var(--brand-primary)), rgb(var(--brand-secondary)) 62%, rgb(var(--brand-accent)))",
      }}
    >
      {avatar ? (
        <Image
          src={avatar}
          alt={label}
          fill
          sizes="28px"
          className="object-cover"
          placeholder="blur"
          blurDataURL={SHIMMER_AVATAR}
        />
      ) : (
        <div className="flex h-full w-full items-center justify-center">
          <span
            className="select-none font-bold text-white"
            style={{ fontSize: "10px" }}
          >
            {label}
          </span>
        </div>
      )}
    </div>
  );
}

interface Props {
  lang: string;
}

/**
 * TikTok-style "profile views" pill: a stack of the most recent visitors'
 * avatars (initials fallback) + the total count. Tapping opens the full
 * visitors list. Owner-only data — render this on the user's own profile.
 */
export function ProfileViewsCluster({ lang }: Props) {
  const router = useRouter();
  const { data, loading } = useQuery(MyProfileVisitorsPreviewDocument, {
    variables: { limit: 3 },
    fetchPolicy: "cache-and-network",
  });

  const preview = data?.myProfileVisitorsPreview;
  const recent = preview?.recent ?? [];
  const total = preview?.totalCount ?? 0;

  // "Thinking" placeholder while loading the first time
  if (loading && !data) {
    return (
      <button
        type="button"
        disabled
        className="flex items-center gap-2 rounded-full border px-3 py-1.5"
        style={{
          backgroundColor: "rgb(var(--color-bg-elevated) / 0.6)",
          borderColor: "rgb(var(--color-border))",
        }}
      >
        <div className="flex">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="h-7 w-7 animate-pulse rounded-full border-2"
              style={{
                marginLeft: i === 0 ? 0 : "-10px",
                zIndex: 10 - i,
                borderColor: "rgb(var(--color-bg))",
                backgroundColor: "rgb(var(--color-bg-subtle))",
              }}
            />
          ))}
        </div>
        <span
          className="font-semibold"
          style={{ color: "rgb(var(--color-text-muted))", fontSize: "var(--text-xs)" }}
        >
          Profile views
        </span>
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={() => router.push(`/${lang}/profile/visitors`)}
      className="flex items-center gap-2 rounded-full border px-3 py-1.5 transition-opacity active:opacity-70"
      style={{
        backgroundColor: "rgb(var(--color-bg-elevated) / 0.78)",
        borderColor: "rgb(var(--color-border))",
      }}
      aria-label={`${total} profile views`}
    >
      {recent.length > 0 ? (
        <div className="flex">
          {recent.map((v, i) => (
            <StackAvatar
              key={v.id}
              index={i}
              avatar={v.profile?.avatar}
              label={initialsOf(v.profile?.firstName, v.profile?.lastName, v.username)}
            />
          ))}
        </div>
      ) : (
        // No visitors yet — show empty rounded holders, TikTok-style
        <div className="flex">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="h-7 w-7 rounded-full border-2"
              style={{
                marginLeft: i === 0 ? 0 : "-10px",
                zIndex: 10 - i,
                borderColor: "rgb(var(--color-bg))",
                backgroundColor: "rgb(var(--color-bg-subtle))",
              }}
            />
          ))}
        </div>
      )}
      <span
        className="font-semibold"
        style={{ color: "rgb(var(--color-text))", fontSize: "var(--text-xs)" }}
      >
        {formatCompact(total)} profile {total === 1 ? "view" : "views"}
      </span>
    </button>
  );
}
