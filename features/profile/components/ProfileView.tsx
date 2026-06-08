"use client";

import { useState, type ReactNode } from "react";
import {
  ChartColumn,
  LayoutGrid,
  LogOut,
  Palette,
  Settings,
  Tv2,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { useMyProfile, useMyPosts, useMyAnalytics } from "../hooks/useMyProfile";
import { ProfileHeader } from "./ProfileHeader";
import { PostsGrid } from "./PostsGrid";
import { AnalyticsPanel } from "./AnalyticsPanel";
import { EditProfileSheet } from "./EditProfileSheet";
import { TiktokImportPanel } from "./TiktokImportPanel";
import { LogoutButton } from "@/features/auth/components/LogoutButton";
import { ThemeToggle } from "@/components/ui/ThemeToggle";

type Tab = "posts" | "analytics" | "tiktok" | "settings";

interface Props {
  lang: string;
}

function ProfileSkeleton() {
  return (
    <div
      className="min-h-screen animate-pulse"
      style={{ backgroundColor: "rgb(var(--color-bg))" }}
    >
      <div className="border-b" style={{ borderColor: "rgb(var(--color-border))" }}>
        <div className="mx-auto max-w-6xl px-4 py-5 sm:px-6 lg:px-8 lg:py-8">
          <div className="grid gap-5 lg:grid-cols-[minmax(0,1.25fr)_minmax(320px,0.75fr)]">
            <div className="flex gap-4">
              <div
                className="h-20 w-20 rounded-full sm:h-24 sm:w-24"
                style={{ backgroundColor: "rgb(var(--color-bg-subtle))" }}
              />
              <div className="min-w-0 flex-1 pt-1">
                <div
                  className="mb-3 h-7 w-32 rounded-lg"
                  style={{ backgroundColor: "rgb(var(--color-bg-subtle))" }}
                />
                <div
                  className="mb-2 h-5 w-56 max-w-full rounded-lg"
                  style={{ backgroundColor: "rgb(var(--color-bg-subtle))" }}
                />
                <div
                  className="h-4 w-36 rounded-lg"
                  style={{ backgroundColor: "rgb(var(--color-bg-subtle))" }}
                />
              </div>
            </div>
            <div
              className="h-40 rounded-lg"
              style={{ backgroundColor: "rgb(var(--color-bg-subtle))" }}
            />
          </div>
          <div className="mt-5 grid grid-cols-2 gap-2 sm:grid-cols-4 lg:gap-3">
            {Array.from({ length: 4 }).map((_, index) => (
              <div
                key={index}
                className="h-28 rounded-lg"
                style={{ backgroundColor: "rgb(var(--color-bg-subtle))" }}
              />
            ))}
          </div>
        </div>
      </div>
      <div className="mx-auto max-w-6xl px-4 py-5 sm:px-6 lg:px-8">
        <div className="grid grid-cols-3 gap-1.5 sm:grid-cols-4 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
          {Array.from({ length: 12 }).map((_, index) => (
            <div
              key={index}
              className="rounded-lg"
              style={{
                aspectRatio: "9/16",
                backgroundColor: "rgb(var(--color-bg-subtle))",
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

const tabConfig: { key: Tab; label: string; icon: LucideIcon }[] = [
  { key: "posts", label: "Posts", icon: LayoutGrid },
  { key: "analytics", label: "Analytics", icon: ChartColumn },
  { key: "tiktok", label: "TikTok", icon: Tv2 },
  { key: "settings", label: "Settings", icon: Settings },
];

export function ProfileView({ lang }: Props) {
  const [tab, setTab] = useState<Tab>("posts");
  const [editOpen, setEditOpen] = useState(false);
  const [postsLimit] = useState(18);

  const { data: profileData, loading: profileLoading } = useMyProfile();
  const { data: postsData, loading: postsLoading, fetchMore } = useMyPosts(postsLimit);
  const { data: analyticsData, loading: analyticsLoading } = useMyAnalytics();

  if (profileLoading && !profileData) return <ProfileSkeleton />;

  const user = profileData?.me;
  if (!user) return null;

  const posts = postsData?.myPosts.posts ?? [];
  const hasMore = postsData?.myPosts.hasMore ?? false;
  const nextCursor = postsData?.myPosts.nextCursor;
  const editSheetKey = editOpen
    ? `open-${user.id}`
    : [
        "closed",
        user.id,
        user.username ?? "",
        user.profile?.firstName ?? "",
        user.profile?.lastName ?? "",
        user.profile?.bio ?? "",
        user.profile?.website ?? "",
      ].join("|");

  function handleLoadMore() {
    if (!nextCursor) return;
    fetchMore({
      variables: { afterId: nextCursor, limit: postsLimit },
      updateQuery(prev, { fetchMoreResult }) {
        if (!fetchMoreResult) return prev;
        return {
          myPosts: {
            ...fetchMoreResult.myPosts,
            posts: [...prev.myPosts.posts, ...fetchMoreResult.myPosts.posts],
          },
        };
      },
    });
  }

  return (
    <div
      className="min-h-screen"
      style={{
        background:
          "linear-gradient(180deg, rgb(var(--color-bg)) 0%, rgb(var(--color-bg-subtle)) 100%)",
      }}
    >
      <ProfileHeader user={user} onEditClick={() => setEditOpen(true)} />

      <div
        className="sticky top-0 z-20 border-b"
        style={{
          backgroundColor: "rgb(var(--color-bg) / 0.9)",
          borderColor: "rgb(var(--color-border))",
          backdropFilter: "blur(14px) saturate(150%)",
          WebkitBackdropFilter: "blur(14px) saturate(150%)",
        }}
      >
        <div className="mx-auto flex w-full max-w-6xl gap-1 px-4 py-2 sm:px-6 lg:px-8">
          {tabConfig.map((item) => {
            const active = tab === item.key;
            const Icon = item.icon;

            return (
              <button
                key={item.key}
                onClick={() => setTab(item.key)}
                aria-pressed={active}
                className="flex h-10 flex-1 items-center justify-center gap-1.5 rounded-lg border font-semibold transition-transform active:scale-[0.98]"
                style={{
                  backgroundColor: active
                    ? "rgb(var(--brand-primary))"
                    : "rgb(var(--color-bg-elevated) / 0.72)",
                  borderColor: active
                    ? "rgb(var(--brand-primary))"
                    : "rgb(var(--color-border))",
                  color: active
                    ? "rgb(var(--color-text-on-brand))"
                    : "rgb(var(--color-text-muted))",
                  boxShadow: active ? "0 8px 20px rgb(var(--brand-primary) / 0.22)" : "none",
                  fontSize: "var(--text-xs)",
                }}
              >
                <Icon size={15} strokeWidth={2.2} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {tab === "posts" && (
        <PostsGrid
          posts={posts}
          hasMore={hasMore}
          onLoadMore={handleLoadMore}
          loading={postsLoading}
          lang={lang}
        />
      )}

      {tab === "analytics" && (
        <>
          {analyticsLoading && !analyticsData ? (
            <div className="flex justify-center py-12">
              <div
                className="h-7 w-7 animate-spin rounded-full border-2 border-t-transparent"
                style={{
                  borderColor: "rgb(var(--brand-primary))",
                  borderTopColor: "transparent",
                }}
              />
            </div>
          ) : analyticsData?.myAnalytics ? (
            <AnalyticsPanel data={analyticsData.myAnalytics} lang={lang} />
          ) : null}
        </>
      )}

      {tab === "tiktok" && <TiktokImportPanel lang={lang} />}

      {tab === "settings" && <SettingsPanel lang={lang} />}

      <EditProfileSheet
        key={editSheetKey}
        user={user}
        open={editOpen}
        onClose={() => setEditOpen(false)}
      />
    </div>
  );
}

function SettingsPanel({ lang }: { lang: string }) {
  return (
    <section className="px-4 py-5 sm:px-6 lg:px-8">
      <div className="mx-auto w-full max-w-3xl">
        <div className="mb-4">
          <h2
            className="font-bold leading-tight"
            style={{ color: "rgb(var(--color-text))", fontSize: "var(--text-lg)" }}
          >
            Settings
          </h2>
          <p
            className="mt-1"
            style={{
              color: "rgb(var(--color-text-muted))",
              fontSize: "var(--text-sm)",
            }}
          >
            Account preferences
          </p>
        </div>

        <div
          className="overflow-hidden rounded-lg border"
          style={{
            backgroundColor: "rgb(var(--color-bg-elevated))",
            borderColor: "rgb(var(--color-border))",
            boxShadow: "var(--shadow-sm)",
          }}
        >
          <SettingsRow
            icon={Palette}
            label="Appearance"
            description="Light and dark theme"
            tone="--brand-accent"
          >
            <ThemeToggle />
          </SettingsRow>

          <div style={{ height: 1, backgroundColor: "rgb(var(--color-border))" }} />

          <SettingsRow
            icon={LogOut}
            label="Sign out"
            description="End this session"
            tone="--color-error"
          >
            <LogoutButton lang={lang} />
          </SettingsRow>
        </div>
      </div>
    </section>
  );
}

function SettingsRow({
  icon: Icon,
  label,
  description,
  children,
  tone,
}: {
  icon: LucideIcon;
  label: string;
  description: string;
  children?: ReactNode;
  tone: string;
}) {
  return (
    <div className="flex items-center gap-3 p-4">
      <div
        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg"
        style={{
          backgroundColor: `rgb(var(${tone}) / 0.12)`,
          color: `rgb(var(${tone}))`,
        }}
      >
        <Icon size={18} strokeWidth={2.2} />
      </div>
      <div className="min-w-0 flex-1">
        <p
          className="font-bold leading-tight"
          style={{ color: "rgb(var(--color-text))", fontSize: "var(--text-base)" }}
        >
          {label}
        </p>
        <p
          className="mt-1"
          style={{
            color: "rgb(var(--color-text-muted))",
            fontSize: "var(--text-sm)",
          }}
        >
          {description}
        </p>
      </div>
      {children && <div className="shrink-0">{children}</div>}
    </div>
  );
}
