"use client";

/**
 * TikTokImportPage — full-page TikTok video picker for the create flow.
 *
 * Embed-and-attribute model: we do NOT download or re-host. The user picks one
 * of their own TikTok videos; we create an embed-backed draft that streams the
 * video from TikTok via <tiktok-video> and links back with a "View on TikTok"
 * badge in the feed.
 *
 * States:
 *  1. Not connected → connect CTA (opens OAuth popup, returns to this page)
 *  2. Connected, loading → skeleton
 *  3. Connected → single list of the user's TikTok videos (RadioGroup single-select)
 *     → "Use This Video" → createDraftFromTiktokEmbed → enter edit flow
 */

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useQuery, useMutation } from "@apollo/client/react";
import { useCreateStore } from "@/stores/create";
import { useIsDesktop } from "@/hooks/useIsDesktop";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  MeDocument,
  MyTiktokVideosDocument,
  TiktokConnectUrlDocument,
  CreateDraftFromTiktokEmbedDocument,
  type TiktokVideoItemFieldsFragment,
} from "@/types/__generated__/graphql";
import Image from "next/image";

interface Props {
  lang: string;
}

export function TikTokImportPage({ lang }: Props) {
  const router = useRouter();
  const {
    setContentType,
    setStep,
    setDraftId,
    setTiktokEmbed,
    addMediaItem,
    reset,
    setTitle,
  } = useCreateStore();

  const [selectedVideoId, setSelectedVideoId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [using, setUsing] = useState(false);

  // ── Queries ──────────────────────────────────────────────────────────────
  const { data: meData, loading: meLoading } = useQuery(MeDocument);
  const isTiktokConnected = meData?.me?.authProviders?.tiktok ?? false;

  const {
    data: videosData,
    loading: videosLoading,
    fetchMore,
  } = useQuery(MyTiktokVideosDocument, { skip: !isTiktokConnected });

  // ── Mutations ─────────────────────────────────────────────────────────────
  const [getTiktokConnectUrl, { loading: connectLoading }] = useMutation(
    TiktokConnectUrlDocument,
  );
  const [createDraftFromTiktokEmbed] = useMutation(
    CreateDraftFromTiktokEmbedDocument,
  );

  // ── Connect TikTok ────────────────────────────────────────────────────────
  async function handleConnect() {
    const returnUrl = `${window.location.origin}/${lang}/upload/tiktok`;
    const { data } = await getTiktokConnectUrl({ variables: { returnUrl } });
    const url = data?.tiktokConnectUrl;
    if (!url) return;

    const popup = window.open(url, "tiktok-connect", "width=520,height=680");

    const onMessage = (e: MessageEvent) => {
      if (e.origin !== window.location.origin) return;
      if (e.data?.type === "TIKTOK_AUTH_SUCCESS") {
        window.removeEventListener("message", onMessage);
        popup?.close();
        window.location.reload();
      }
    };
    window.addEventListener("message", onMessage);

    // Fallback: popup blocked or closed manually
    const onFocus = () => {
      window.removeEventListener("focus", onFocus);
      window.removeEventListener("message", onMessage);
      window.location.reload();
    };
    window.addEventListener("focus", onFocus);
  }

  // ── Use selected video → create embed draft → enter create flow ────────────
  async function handleUse() {
    const video = videos.find((v) => v.id === selectedVideoId);
    if (!video) return;

    setUsing(true);
    setError(null);
    try {
      const { data } = await createDraftFromTiktokEmbed({
        variables: {
          input: {
            videoId: video.id,
            shareUrl: video.shareUrl,
            coverImageUrl: video.coverImageUrl,
            title: video.title,
            duration: video.duration,
          },
        },
      });
      const draft = data?.createDraftFromTiktokEmbed;
      if (!draft) {
        setError("Could not create draft — please try again.");
        return;
      }

      reset();
      setContentType("video");
      setDraftId(draft.id);
      if (draft.title) setTitle(draft.title);
      setTiktokEmbed({
        videoId: video.id,
        shareUrl: video.shareUrl,
        coverImageUrl: video.coverImageUrl ?? undefined,
        title: video.title ?? undefined,
        duration: video.duration ?? undefined,
      });
      // Synthesize a read-only cover media item so the create-flow steps (which
      // key off mediaItems[0]) render a preview and pass their "media ready" gates.
      addMediaItem({
        id: `tiktok-embed:${video.id}`,
        localUri: video.coverImageUrl ?? "",
        type: "video",
        status: "ready",
        thumbnailUrl: video.coverImageUrl ?? undefined,
      });

      setStep("edit");
      router.push(`/${lang}/upload/create`);
    } catch (e) {
      setError(String(e));
    } finally {
      setUsing(false);
    }
  }

  // ── Derived ───────────────────────────────────────────────────────────────
  const videos = videosData?.myTiktokVideos?.videos ?? [];
  const hasMore = videosData?.myTiktokVideos?.hasMore ?? false;
  const nextCursor = videosData?.myTiktokVideos?.nextCursor ?? undefined;
  const canUse = !!selectedVideoId;

  // ── Render ────────────────────────────────────────────────────────────────
  if (meLoading)
    return (
      <PageShell lang={lang}>
        <LoadingSkeleton />
      </PageShell>
    );

  if (!isTiktokConnected) {
    return (
      <PageShell lang={lang}>
        <div className="flex flex-col items-center justify-center flex-1 px-8 gap-6 text-center">
          <div
            className="w-20 h-20 rounded-2xl flex items-center justify-center"
            style={{ backgroundColor: "rgb(var(--color-bg-elevated))" }}
          >
            <TikTokIcon size={40} />
          </div>
          <div className="space-y-2">
            <h2
              className="font-semibold text-lg"
              style={{ color: "rgb(var(--color-text))" }}
            >
              Connect TikTok
            </h2>
            <p
              style={{
                fontSize: "var(--text-sm)",
                color: "rgb(var(--color-text-muted))",
              }}
            >
              Connect your TikTok account to feature your videos on Shopi — they
              stream from TikTok and link back to your profile.
            </p>
          </div>
          <Button
            onClick={handleConnect}
            disabled={connectLoading}
            className="w-full h-12 rounded-2xl font-semibold text-white"
            style={{ backgroundColor: "#010101" }}
          >
            {connectLoading ? "Opening…" : "Connect TikTok"}
          </Button>
        </div>
      </PageShell>
    );
  }

  return (
    <PageShell lang={lang}>
      {/* Scrollable list */}
      <div className="flex-1 overflow-y-auto px-4 pt-3 pb-2 md:px-6">
        {error && (
          <div
            className="mb-3 rounded-xl px-4 py-3 text-sm"
            style={{
              backgroundColor: "rgb(var(--color-error)/0.08)",
              border: "1px solid rgb(var(--color-error)/0.2)",
              color: "rgb(var(--color-error))",
            }}
          >
            {error}
          </div>
        )}

        {videosLoading ? (
          <LoadingSkeleton />
        ) : (
          <>
            {videos.length === 0 && (
              <p
                className="text-center py-12 text-sm"
                style={{ color: "rgb(var(--color-text-muted))" }}
              >
                No TikTok videos found
              </p>
            )}
            <RadioGroup
              value={selectedVideoId ?? ""}
              onValueChange={setSelectedVideoId}
              className="grid grid-cols-1 md:grid-cols-2 gap-3"
            >
              {videos.map((video) => (
                <TikTokVideoRow
                  key={video.id}
                  video={video}
                  isSelected={selectedVideoId === video.id}
                  onSelect={() => setSelectedVideoId(video.id)}
                />
              ))}
            </RadioGroup>
            {hasMore && (
              <Button
                variant="ghost"
                className="w-full mt-4"
                onClick={() => fetchMore({ variables: { cursor: nextCursor } })}
              >
                Load more
              </Button>
            )}
          </>
        )}
      </div>

      {/* Sticky footer CTA */}
      <div
        className="px-4 md:px-6 py-4 shrink-0 bg-app"
        style={{ borderTop: "1px solid rgb(var(--color-border))" }}
      >
        <Button
          onClick={handleUse}
          disabled={!canUse || using}
          className="w-full h-12 rounded-2xl font-semibold text-white"
          style={{
            backgroundColor: canUse
              ? "rgb(var(--brand-primary))"
              : "rgb(var(--color-border))",
            opacity: canUse && !using ? 1 : 0.4,
          }}
        >
          {using ? "Loading…" : "Use This Video"}
        </Button>
      </div>
    </PageShell>
  );
}

// ── Sub-components ────────────────────────────────────────────────────────────

function PageShell({
  lang,
  children,
}: {
  lang: string;
  children: React.ReactNode;
}) {
  const router = useRouter();
  const isDesktop = useIsDesktop({ ssrDefault: false });

  function goBackToPicker() {
    router.replace(`/${lang}/upload`);
  }

  const shellBody = (
    <div
      className="flex flex-col bg-app overflow-hidden fixed inset-0 md:static md:inset-auto md:w-[860px] md:max-w-[95vw] md:max-h-[90vh] md:min-h-[600px]"
    >
      <div
        className="shrink-0 flex items-center gap-3 px-4 pt-4 pb-4"
        style={{ borderBottom: "1px solid rgb(var(--color-border))" }}
      >
        <button
          onClick={goBackToPicker}
          className="flex h-9 w-9 items-center justify-center rounded-full"
          style={{ backgroundColor: "rgb(var(--color-bg-subtle))" }}
        >
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M15 18l-6-6 6-6" />
          </svg>
        </button>
        <h1
          className="font-semibold"
          style={{
            fontSize: "var(--text-xl)",
            color: "rgb(var(--color-text))",
          }}
        >
          Add from TikTok
        </h1>
      </div>
      {children}
    </div>
  );

  if (isDesktop) {
    return (
      <Dialog
        open
        onOpenChange={(open) => {
          if (!open) goBackToPicker();
        }}
      >
        <DialogContent className="w-[min(94vw,900px)] max-w-none overflow-hidden rounded-3xl border border-[rgb(229_231_235)] bg-app p-0">
          <DialogHeader className="sr-only">
            <DialogTitle>Add from TikTok</DialogTitle>
            <DialogDescription>
              Pick one of your TikTok videos to create a Shopi post.
            </DialogDescription>
          </DialogHeader>
          {shellBody}
        </DialogContent>
      </Dialog>
    );
  }

  return (
    /*
     * Mobile: fixed full-viewport column, only list scrolls.
     */
    shellBody
  );
}

function TikTokVideoRow({
  video,
  isSelected,
  onSelect,
}: {
  video: TiktokVideoItemFieldsFragment;
  isSelected: boolean;
  onSelect: () => void;
}) {
  return (
    <div
      onClick={onSelect}
      className="flex items-center gap-3 p-3 rounded-2xl transition-colors cursor-pointer"
      style={{
        backgroundColor: isSelected
          ? "rgb(var(--brand-primary)/0.06)"
          : "rgb(var(--color-bg-subtle))",
        border: isSelected
          ? "1.5px solid rgb(var(--brand-primary)/0.3)"
          : "1.5px solid transparent",
      }}
    >
      {/* Thumbnail */}
      <div className="relative w-14 h-14 rounded-xl overflow-hidden flex-shrink-0 bg-gray-200">
        {video.coverImageUrl && (
          <Image
            height={100}
            width={100}
            src={video.coverImageUrl}
            alt=""
            className="absolute inset-0 w-full h-full object-cover"
          />
        )}
        <div
          className="absolute bottom-0.5 right-0.5 rounded px-1"
          style={{
            backgroundColor: "rgb(0 0 0/0.6)",
            fontSize: 10,
            color: "white",
          }}
        >
          {formatDuration(video.duration)}
        </div>
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <p
          className="text-sm font-medium truncate"
          style={{ color: "rgb(var(--color-text))" }}
        >
          {video.title || "Untitled"}
        </p>
        <p
          className="text-xs mt-0.5"
          style={{ color: "rgb(var(--color-text-muted))" }}
        >
          {new Date(video.createTime * 1000).toLocaleDateString()}
        </p>
      </div>

      {/* Right action */}
      <div className="shrink-0">
        <RadioGroupItem value={video.id} />
      </div>
    </div>
  );
}

function LoadingSkeleton() {
  return (
    <div className="space-y-3">
      {[0, 1, 2, 3].map((i) => (
        <div
          key={i}
          className="flex items-center gap-3 p-3 rounded-2xl animate-pulse"
          style={{ backgroundColor: "rgb(var(--color-bg-subtle))" }}
        >
          <div className="w-14 h-14 rounded-xl bg-gray-300 flex-shrink-0" />
          <div className="flex-1 space-y-2">
            <div className="h-3 bg-gray-300 rounded w-3/4" />
            <div className="h-3 bg-gray-300 rounded w-1/2" />
          </div>
        </div>
      ))}
    </div>
  );
}

function TikTokIcon({ size = 24 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <path
        d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 0 0-.79-.05 6.34 6.34 0 0 0-6.34 6.34 6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.33-6.34V8.69a8.22 8.22 0 0 0 4.82 1.56V6.8a4.85 4.85 0 0 1-1.05-.11Z"
        fill="rgb(var(--color-text))"
      />
    </svg>
  );
}

function formatDuration(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}
