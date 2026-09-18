"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useState } from "react";
import {
  Bookmark,
  ChartColumn,
  FileEdit,
  LayoutGrid,
  Plus,
  Settings,
  UserRound,
} from "lucide-react";

// Icon may be a lucide icon or a custom SVG component (both take size/className)
type TabIcon = React.ComponentType<{
  size?: number;
  className?: string;
  strokeWidth?: number;
}>;
import {
  useMyProfile,
  useMySavedContent,
  useMyAnalytics,
} from "../hooks/useMyProfile";
import { useMyManagedPosts } from "../hooks/useManagedPosts";
import { Skeleton } from "@/components/ui/skeleton";
import { ProfileHeader } from "./ProfileHeader";
import { PostsGrid } from "./PostsGrid";
import { ManagedPostsGrid } from "./ManagedPostsGrid";
import { DraftsGrid } from "./DraftsGrid";
import { AnalyticsPanel } from "./AnalyticsPanel";
import { TiktokImportPanel } from "./TiktokImportPanel";
import { cn } from "@/lib/utils";
import { SettingsList } from "./SettingsList";
import { appendUnique } from "../lib/appendUnique";

type Tab = "posts" | "drafts" | "saved" | "analytics" | "tiktok" | "settings";

interface Props {
  lang: string;
}

function ProfileSkeleton() {
  return (
    <div
      className="min-h-screen animate-pulse"
      style={{ backgroundColor: "rgb(var(--color-bg))" }}
    >
      <div
        className="border-b"
        style={{ borderColor: "rgb(var(--color-border))" }}
      >
        <div className="mx-auto max-w-6xl px-4 py-4 sm:px-6 lg:px-8 lg:py-6">
          <div className="flex gap-4">
            <div
              className="h-20 w-20 rounded-full sm:h-24 sm:w-24"
              style={{ backgroundColor: "rgb(var(--color-bg-subtle))" }}
            />
            <div className="min-w-0 flex-1 pt-1">
              <div
                className="mb-2 h-6 w-32 rounded-md"
                style={{ backgroundColor: "rgb(var(--color-bg-subtle))" }}
              />
              <div
                className="mb-3 h-4 w-28 rounded-md"
                style={{ backgroundColor: "rgb(var(--color-bg-subtle))" }}
              />
              <div className="grid grid-cols-4 gap-1.5">
                {Array.from({ length: 4 }).map((_, index) => (
                  <div
                    key={index}
                    className="h-12 rounded-md"
                    style={{ backgroundColor: "rgb(var(--color-bg-subtle))" }}
                  />
                ))}
              </div>
            </div>
          </div>
          <div className="mt-4 space-y-2">
            <div
              className="h-4 w-full max-w-sm rounded-md"
              style={{ backgroundColor: "rgb(var(--color-bg-subtle))" }}
            />
            <div
              className="h-4 w-40 rounded-md"
              style={{ backgroundColor: "rgb(var(--color-bg-subtle))" }}
            />
          </div>
        </div>
      </div>
      <div className="mx-auto max-w-6xl px-4 py-5 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 gap-2 md:grid-cols-3 md:gap-3 xl:grid-cols-4 xl:gap-4">
          {Array.from({ length: 6 }).map((_, index) => (
            <div
              key={index}
              className="aspect-9/10 rounded-lg"
              style={{
                backgroundColor: "rgb(var(--color-bg-subtle))",
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

function ProfileUnavailable({
  onRetry,
  error,
}: {
  onRetry: () => void;
  error: boolean;
}) {
  return (
    <div
      className="flex min-h-screen items-center justify-center px-6 py-12"
      style={{ backgroundColor: "rgb(var(--color-bg))" }}
    >
      <div className="flex max-w-sm flex-col items-center text-center">
        <div
          className="mb-4 flex h-16 w-16 items-center justify-center rounded-lg border"
          style={{
            backgroundColor: "rgb(var(--color-bg-elevated))",
            borderColor: "rgb(var(--color-border))",
            color: "rgb(var(--color-text-muted))",
            boxShadow: "var(--shadow-sm)",
          }}
        >
          <UserRound size={26} strokeWidth={2} />
        </div>
        <h2
          className="font-bold"
          style={{
            fontSize: "var(--text-lg)",
            color: "rgb(var(--color-text))",
          }}
        >
          Couldn&apos;t load your profile
        </h2>
        <p
          className="mt-2 leading-snug"
          style={{
            fontSize: "var(--text-base)",
            color: "rgb(var(--color-text-muted))",
          }}
        >
          {error
            ? "Something went wrong on our end."
            : "Your session may have expired."}{" "}
          Try again.
        </p>
        <button
          type="button"
          onClick={onRetry}
          className="mt-5 inline-flex h-10 items-center justify-center rounded-lg px-5 font-semibold text-white active:opacity-80"
          style={{
            fontSize: "var(--text-sm)",
            background:
              "linear-gradient(135deg, rgb(var(--brand-primary)), rgb(var(--brand-secondary)))",
            boxShadow: "0 10px 24px rgb(var(--brand-primary) / 0.24)",
          }}
        >
          Retry
        </button>
      </div>
    </div>
  );
}

// NOTE: the "tiktok" tab is intentionally omitted here so it's hidden from the
// UI, but the TiktokImportPanel component and its render branch below are kept
// intact (the functionality is preserved, just not surfaced as a subtab).
const tabConfig: { key: Tab; label: string; icon: TabIcon }[] = [
  { key: "posts", label: "Posts", icon: LayoutGrid },
  { key: "drafts", label: "Drafts", icon: FileEdit },
  { key: "saved", label: "Saved", icon: Bookmark },
  { key: "analytics", label: "Analytics", icon: ChartColumn },

  { key: "settings", label: "Settings", icon: Settings },
];

function isTab(value: string | null): value is Tab {
  return !!value && tabConfig.some((item) => item.key === value);
}

export function ProfileView({ lang }: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();

  // The active sub-tab lives in the URL so leaving and coming back returns to
  // it. Settings is the tab this matters most for: every row in it navigates
  // away (Edit profile, Followers, and so on), and landing back on Posts each
  // time meant re-finding the tab after every single one.
  //
  // Read once, as the initial value. Coming back is a fresh mount, so the
  // param is picked up then; making it a live subscription instead would fight
  // the replace() below on every tab press.
  const [tab, setTab] = useState<Tab>(() => {
    const requested = searchParams.get("tab");
    return isTab(requested) ? requested : "posts";
  });

  // replace, not push: a tab is a view of this page, not a place in history.
  // Pushing would mean back stepped through every tab the user had tried
  // before it left the profile at all.
  const selectTab = useCallback(
    (next: Tab) => {
      setTab(next);
      const params = new URLSearchParams(searchParams.toString());
      if (next === "posts") params.delete("tab");
      else params.set("tab", next);
      const query = params.toString();
      router.replace(`/${lang}/profile${query ? `?${query}` : ""}`, {
        scroll: false,
      });
    },
    [router, lang, searchParams],
  );
  const [postsLimit] = useState(18);

  const {
    data: profileData,
    loading: profileLoading,
    error: profileError,
    refetch: refetchProfile,
  } = useMyProfile();
  const {
    data: managedPostsData,
    loading: managedPostsLoading,
    fetchMore,
    refetch: refetchManagedPosts,
  } = useMyManagedPosts(postsLimit);
  const {
    data: savedData,
    loading: savedLoading,
    fetchMore: fetchMoreSaved,
  } = useMySavedContent(postsLimit, tab === "saved");
  const { data: analyticsData, loading: analyticsLoading } = useMyAnalytics(
    tab === "analytics",
  );

  if (profileLoading && !profileData) return <ProfileSkeleton />;

  const user = profileData?.me;
  // Never render nothing: a viewer-scoped query that errored or resolved
  // `me: null` (expired token, refresh mid-flight) used to bail to `null` here,
  // leaving a blank screen with no way out except a hard reload.
  if (!user) return <ProfileUnavailable onRetry={() => refetchProfile()} error={!!profileError} />;

  const managedPosts = managedPostsData?.myManagedContent.items ?? [];
  const managedHasMore = managedPostsData?.myManagedContent.hasMore ?? false;
  const managedNextCursor = managedPostsData?.myManagedContent.nextCursor;

  function handleLoadMore() {
    if (!managedNextCursor) return;
    fetchMore({
      variables: { afterId: managedNextCursor, limit: postsLimit },
      updateQuery(prev, { fetchMoreResult }) {
        if (!fetchMoreResult) return prev;
        return {
          myManagedContent: {
            ...fetchMoreResult.myManagedContent,
            items: appendUnique(
              prev.myManagedContent.items,
              fetchMoreResult.myManagedContent.items,
            ),
          },
        };
      },
    });
  }

  const savedPosts = savedData?.mySavedContent.items ?? [];
  const savedHasMore = savedData?.mySavedContent.hasMore ?? false;
  const savedNextCursor = savedData?.mySavedContent.nextCursor;

  function handleLoadMoreSaved() {
    if (!savedNextCursor) return;
    fetchMoreSaved({
      variables: { afterId: savedNextCursor, limit: postsLimit },
      updateQuery(prev, { fetchMoreResult }) {
        if (!fetchMoreResult) return prev;
        return {
          mySavedContent: {
            ...fetchMoreResult.mySavedContent,
            items: appendUnique(
              prev.mySavedContent.items,
              fetchMoreResult.mySavedContent.items,
            ),
          },
        };
      },
    });
  }

  return (
    <div
      className="min-h-screen pb-8"
      style={{ backgroundColor: "rgb(var(--color-bg))" }}
    >
      <ProfileHeader
        user={user}
        editHref={`/${lang}/profile/edit`}
        lang={lang}
      />

      <div className="sticky top-0 z-20 border-b border-border bg-app/94 backdrop-blur-md md:top-(--desktop-top-nav-height,80px)">
        <div className="w-full px-2 sm:px-6 lg:px-8">
          <div
            className="grid h-12 w-full grid-cols-5 md:hidden"
            role="tablist"
            aria-label="Profile sections"
          >
            {tabConfig.map((item) => {
              const active = tab === item.key;
              const Icon = item.icon;

              return (
                <button
                  key={item.key}
                  type="button"
                  role="tab"
                  aria-selected={active}
                  aria-label={item.label}
                  title={item.label}
                  onClick={() => selectTab(item.key)}
                  className="relative flex h-12 min-w-0 items-center justify-center transition-opacity active:opacity-60"
                  style={{
                    color: active
                      ? "rgb(var(--color-text))"
                      : "rgb(var(--color-text-muted))",
                  }}
                >
                  <Icon size={24} strokeWidth={2.2} />
                  {active && (
                    <span
                      className="absolute bottom-0 h-0.5 w-8 rounded-full"
                      style={{ backgroundColor: "rgb(var(--color-text))" }}
                    />
                  )}
                </button>
              );
            })}
          </div>

          <div className="hidden py-2 md:flex" role="tablist" aria-label="Profile sections">
            <div className="flex w-full items-center gap-6 overflow-x-auto">
              {tabConfig.map((item) => {
                const active = tab === item.key;
                const Icon = item.icon;

                return (
                  <button
                    key={item.key}
                    type="button"
                    role="tab"
                    aria-selected={active}
                    onClick={() => selectTab(item.key)}
                    className={cn(
                      "relative inline-flex h-10 shrink-0 items-center justify-center gap-2 text-sm font-bold transition-colors",
                      active
                        ? "text-primary after:absolute after:bottom-0 after:left-0 after:h-0.5 after:w-full after:rounded-full after:bg-primary"
                        : "text-muted hover:text-main",
                    )}
                  >
                    <Icon size={18} strokeWidth={2.15} />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {tab === "posts" && (
        <ManagedPostsGrid
          posts={managedPosts}
          hasMore={managedHasMore}
          onLoadMore={handleLoadMore}
          loading={managedPostsLoading}
          lang={lang}
          onRefresh={() => refetchManagedPosts({ limit: postsLimit })}
        />
      )}

      {tab === "saved" && (
        <PostsGrid
          posts={savedPosts}
          hasMore={savedHasMore}
          onLoadMore={handleLoadMoreSaved}
          loading={savedLoading}
          lang={lang}
        />
      )}

      {tab === "drafts" && <DraftsGrid lang={lang} />}

      {tab === "analytics" && (
        <>
          {analyticsLoading && !analyticsData ? (
            <section className="px-4 py-5 sm:px-6 lg:px-8">
              <div className="mx-auto w-full max-w-6xl flex flex-col gap-4">
                {/* header row */}
                <div className="flex items-end justify-between">
                  <div className="flex flex-col gap-2">
                    <Skeleton className="h-5 w-24 rounded-md" />
                    <Skeleton className="h-3.5 w-16 rounded-md" />
                  </div>
                  <Skeleton className="h-9 w-40 rounded-lg" />
                </div>
                {/* metric cards */}
                <div className="grid grid-cols-2 gap-2 lg:grid-cols-4 lg:gap-3">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <Skeleton key={i} className="h-28 rounded-lg" />
                  ))}
                </div>
                {/* chart + sidebar */}
                <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_320px]">
                  <Skeleton className="h-64 rounded-lg" />
                  <div className="flex flex-col gap-4">
                    <Skeleton className="h-48 rounded-lg" />
                    <Skeleton className="h-32 rounded-lg" />
                  </div>
                </div>
              </div>
            </section>
          ) : analyticsData?.myAnalytics ? (
            <AnalyticsPanel data={analyticsData.myAnalytics} lang={lang} />
          ) : (
            <section className="px-4 py-12 sm:px-6 lg:px-8">
              <div className="mx-auto flex min-h-80 max-w-xl flex-col items-center justify-center text-center">
                <div
                  className="mb-4 flex h-16 w-16 items-center justify-center rounded-lg border"
                  style={{
                    backgroundColor: "rgb(var(--color-bg-elevated))",
                    borderColor: "rgb(var(--color-border))",
                    color: "rgb(var(--brand-primary))",
                    boxShadow: "var(--shadow-sm)",
                  }}
                >
                  <ChartColumn size={26} strokeWidth={2} />
                </div>
                <h2
                  className="font-bold"
                  style={{
                    fontSize: "var(--text-lg)",
                    color: "rgb(var(--color-text))",
                  }}
                >
                  No analytics yet
                </h2>
                <p
                  className="mt-2 max-w-sm leading-snug"
                  style={{
                    fontSize: "var(--text-base)",
                    color: "rgb(var(--color-text-muted))",
                  }}
                >
                  Post your first video and analytics will appear here once it
                  gets views.
                </p>
                <Link
                  href={`/${lang}/upload`}
                  className="mt-5 inline-flex h-10 items-center justify-center gap-2 rounded-lg px-4 font-semibold text-white active:opacity-80"
                  style={{
                    fontSize: "var(--text-sm)",
                    background:
                      "linear-gradient(135deg, rgb(var(--brand-primary)), rgb(var(--brand-secondary)))",
                    boxShadow: "0 10px 24px rgb(var(--brand-primary) / 0.24)",
                  }}
                >
                  <Plus size={16} strokeWidth={2.4} />
                  New post
                </Link>
              </div>
            </section>
          )}
        </>
      )}

      {tab === "tiktok" && <TiktokImportPanel lang={lang} />}

      {tab === "settings" && <SettingsList lang={lang} />}
    </div>
  );
}
