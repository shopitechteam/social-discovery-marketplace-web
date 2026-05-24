"use client";

/**
 * TikTokImportPage — full-page TikTok video picker for the create flow.
 *
 * States:
 *  1. Not connected → show connect CTA (opens OAuth popup, returns to this page)
 *  2. Connected, loading → skeleton
 *  3. Connected → two tabs: "My TikTok" (live videos) | "Imported" (already downloaded)
 *     - RadioGroup single-select
 *     - If video not yet imported → "Import" button → polls until COMPLETED
 *     - Once a COMPLETED video is selected → "Use This Video" → creates draft → enter flow
 */

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useQuery, useLazyQuery, useMutation } from "@apollo/client/react";
import { useCreateStore } from "@/stores/create";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Button } from "@/components/ui/button";
import {
  MeDocument,
  MyTiktokImportsDocument,
  MyTiktokVideosDocument,
  MyDraftsDocument,
  TiktokConnectUrlDocument,
  ImportTiktokVideoDocument,
  type TiktokDownloadFieldsFragment,
  type TiktokVideoItemFieldsFragment,
} from "@/types/__generated__/graphql";
import Image from "next/image";
import { getSocket, connectSocket } from "@/lib/socket/socket-client";
import {
  WS_EVENTS,
  type TiktokImportUpdatedPayload,
} from "@/lib/socket/socket-events";

type Tab = "tiktok" | "imported";

interface Props {
  lang: string;
}

export function TikTokImportPage({ lang }: Props) {
  const router = useRouter();
  const { setContentType, setStep, setDraftId, addMediaItem, reset } =
    useCreateStore();

  const [tab, setTab] = useState<Tab>("tiktok");
  const [selectedShareUrl, setSelectedShareUrl] = useState<string | null>(null);
  const [selectedImportId, setSelectedImportId] = useState<string | null>(null);
  const [importingUrl, setImportingUrl] = useState<string | null>(null);
  const [importError, setImportError] = useState<string | null>(null);
  const pageRef = useRef<HTMLDivElement>(null);

  // Scroll page to top — stable ref so WS handler can call it without stale closure
  const scrollToTop = useRef(() => {
    pageRef.current?.scrollTo({ top: 0, behavior: "smooth" });
  });
  // Fire on every tab switch (including auto-switch after import completes)
  useEffect(() => {
    scrollToTop.current();
  }, [tab]);

  // ── Queries ──────────────────────────────────────────────────────────────
  const { data: meData, loading: meLoading } = useQuery(MeDocument);
  const isTiktokConnected = meData?.me?.authProviders?.tiktok ?? false;

  const {
    data: importedData,
    loading: importedLoading,
    refetch: refetchImported,
  } = useQuery(MyTiktokImportsDocument, {
    skip: !isTiktokConnected,
    fetchPolicy: "network-only", // always fresh — never serve stale imports
    nextFetchPolicy: "network-only", // keep network-only after refetch too
  });

  const {
    data: videosData,
    loading: videosLoading,
    fetchMore,
  } = useQuery(MyTiktokVideosDocument, { skip: !isTiktokConnected });

  // ── Mutations ─────────────────────────────────────────────────────────────
  const [getTiktokConnectUrl, { loading: connectLoading }] = useMutation(
    TiktokConnectUrlDocument,
  );
  const [importTiktokVideo] = useMutation(ImportTiktokVideoDocument);
  const [fetchMyDrafts] = useLazyQuery(MyDraftsDocument, {
    fetchPolicy: "network-only",
  });

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

  // ── WebSocket — real-time import status ──────────────────────────────────
  // ── WebSocket — real-time import status ──────────────────────────────────
  // Keep refetchImported in a ref so the stable WS handler can always call
  // the latest version without being recreated on every render.
  const refetchImportedRef = useRef(refetchImported);
  useEffect(() => {
    refetchImportedRef.current = refetchImported;
  }, [refetchImported]);

  useEffect(() => {
    connectSocket();
    const socket = getSocket();

    const handler = async (payload: TiktokImportUpdatedPayload) => {
      if (payload.status === "COMPLETED") {
        try {
          await refetchImportedRef.current();
        } catch {
          /* non-fatal */
        }
        setImportingUrl(null);
        setSelectedImportId(payload.downloadId);
        setTab("imported");
        scrollToTop.current();
      } else if (payload.status === "FAILED") {
        setImportError(payload.errorMessage ?? "Import failed");
        setImportingUrl(null);
      }
    };

    socket.on(WS_EVENTS.TIKTOK_IMPORT_UPDATED, handler);
    return () => {
      socket.off(WS_EVENTS.TIKTOK_IMPORT_UPDATED, handler);
    };
  }, []); // mount/unmount only — handler reads refs, not stale closures

  // ── Import ────────────────────────────────────────────────────────────────
  async function handleImport(shareUrl: string) {
    setImportError(null);
    setImportingUrl(shareUrl);
    try {
      await importTiktokVideo({ variables: { shareUrl } });
      // Status updates arrive via WebSocket — no polling needed
    } catch (e) {
      setImportError(String(e));
      setImportingUrl(null);
    }
  }

  // ── Use selected video → enter create flow ────────────────────────────────
  async function handleUseImported() {
    const item = (importedData?.myTiktokImports ?? []).find(
      (d) => d.id === selectedImportId,
    );
    if (!item || item.status !== "COMPLETED" || !item.muxPlaybackId) return;

    // Find the auto-created draft for this TikTok import (created by TiktokDraftCreateWorker)
    const { data: draftsData } = await fetchMyDrafts();
    const linkedDraft = (draftsData?.myDrafts ?? []).find(
      (d) => d.sourceImportId === item.id,
    );

    reset();
    setContentType("video");
    if (linkedDraft) setDraftId(linkedDraft.id);
    addMediaItem({
      id: `tiktok-${item.id}`,
      localUri: item.thumbnailUrl ?? "",
      type: "video",
      status: "ready",
      thumbnailUrl: item.thumbnailUrl ?? undefined,
      muxPlaybackId: item.muxPlaybackId,
    });
    setStep("edit");
    router.push(`/${lang}/upload/create`);
  }

  // ── Derived ───────────────────────────────────────────────────────────────
  const imports = importedData?.myTiktokImports ?? [];
  const importedByUrl = new Map(imports.map((d) => [d.url, d]));
  const videos = videosData?.myTiktokVideos?.videos ?? [];
  const hasMore = videosData?.myTiktokVideos?.hasMore ?? false;
  const nextCursor = videosData?.myTiktokVideos?.nextCursor ?? undefined;
  const completedCount = imports.filter((d) => d.status === "COMPLETED").length;

  const selectedImport = imports.find((d) => d.id === selectedImportId);
  const canUse =
    selectedImport?.status === "COMPLETED" && !!selectedImport.muxPlaybackId;

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
              Connect your TikTok account to import your videos directly into
              Shopi
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
      {/* Sticky tabs */}
      <div
        className="flex px-4 gap-1 py-3 shrink-0 bg-app"
        style={{ borderBottom: "1px solid rgb(var(--color-border))" }}
      >
        {(["tiktok", "imported"] as Tab[]).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className="flex-1 h-9 rounded-xl text-sm font-medium transition-colors"
            style={{
              backgroundColor:
                tab === t
                  ? "rgb(var(--brand-primary))"
                  : "rgb(var(--color-bg-subtle))",
              color: tab === t ? "white" : "rgb(var(--color-text-muted))",
            }}
          >
            {t === "tiktok" ? "My TikTok" : `Imported (${completedCount})`}
          </button>
        ))}
      </div>

      {/* Scrollable list — this is the ONLY part that scrolls */}
      <div ref={pageRef} className="flex-1 overflow-y-auto px-4 pt-3 pb-2">
        {importError && (
          <div
            className="mb-3 rounded-xl px-4 py-3 text-sm"
            style={{
              backgroundColor: "rgb(var(--color-error)/0.08)",
              border: "1px solid rgb(var(--color-error)/0.2)",
              color: "rgb(var(--color-error))",
            }}
          >
            {importError}
          </div>
        )}

        {/* Tab: My TikTok videos */}
        {tab === "tiktok" && (
          <>
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
                  value={selectedShareUrl ?? ""}
                  onValueChange={setSelectedShareUrl}
                  className="space-y-3"
                >
                  {videos.map((video) => {
                    const existing = importedByUrl.get(video.shareUrl);
                    return (
                      <TikTokVideoRow
                        key={video.id}
                        video={video}
                        isSelected={selectedShareUrl === video.shareUrl}
                        existingImport={existing}
                        isImporting={importingUrl === video.shareUrl}
                        anyImporting={importingUrl !== null}
                        onSelect={() => {
                          if (existing?.status === "COMPLETED") {
                            setSelectedImportId(existing.id);
                            setTab("imported");
                          } else {
                            setSelectedShareUrl(video.shareUrl);
                          }
                        }}
                        onImport={() => handleImport(video.shareUrl)}
                      />
                    );
                  })}
                </RadioGroup>
                {hasMore && (
                  <Button
                    variant="ghost"
                    className="w-full mt-4"
                    onClick={() =>
                      fetchMore({ variables: { cursor: nextCursor } })
                    }
                  >
                    Load more
                  </Button>
                )}
              </>
            )}
          </>
        )}

        {/* Tab: Already imported */}
        {tab === "imported" && (
          <>
            {importedLoading ? (
              <LoadingSkeleton />
            ) : (
              <>
                {imports.length === 0 && (
                  <p
                    className="text-center py-12 text-sm"
                    style={{ color: "rgb(var(--color-text-muted))" }}
                  >
                    No imported videos yet — go to My TikTok to import one
                  </p>
                )}
                <RadioGroup
                  value={selectedImportId ?? ""}
                  onValueChange={setSelectedImportId}
                  className="space-y-3"
                >
                  {imports.map((item) => (
                    <ImportedVideoRow
                      key={item.id}
                      item={item}
                      isSelected={selectedImportId === item.id}
                      onSelect={() => setSelectedImportId(item.id)}
                    />
                  ))}
                </RadioGroup>
              </>
            )}
          </>
        )}
      </div>

      {/* Sticky footer CTA */}
      <div
        className="px-4 py-4 shrink-0 bg-app"
        style={{ borderTop: "1px solid rgb(var(--color-border))" }}
      >
        <Button
          onClick={handleUseImported}
          disabled={!canUse}
          className="w-full h-12 rounded-2xl font-semibold text-white"
          style={{
            backgroundColor: canUse
              ? "rgb(var(--brand-primary))"
              : "rgb(var(--color-border))",
            opacity: canUse ? 1 : 0.4,
          }}
        >
          Use This Video
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
  return (
    // Fixed full-height column — only the middle slot (flex-1 overflow-y-auto) scrolls
    <div
      className="flex overflow-y-hidden fixed top-0 bottom-0  right-0 left-0 flex-col bg-app"
      style={{ height: "100svh", margin: "0 auto" }}
    >
      {/* Header — scrolls away with content */}
      <div className="shrink-0 flex items-center gap-3 px-4 pt-4 pb-4">
        <button
          onClick={() => router.push(`/${lang}/upload`)}
          className="w-9 h-9 rounded-full flex items-center justify-center"
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
          TikTok Import
        </h1>
      </div>
      {children}
    </div>
  );
}

function TikTokVideoRow({
  video,
  isSelected,
  existingImport,
  isImporting,
  anyImporting,
  onSelect,
  onImport,
}: {
  video: TiktokVideoItemFieldsFragment;
  isSelected: boolean;
  existingImport?: TiktokDownloadFieldsFragment;
  isImporting: boolean;
  anyImporting: boolean;
  onSelect: () => void;
  onImport: () => void;
}) {
  const isImported = existingImport?.status === "COMPLETED";
  const isPending =
    existingImport?.status === "PENDING" ||
    existingImport?.status === "PROCESSING" ||
    existingImport?.status === "UPLOADING";
  // This row is blocked if another row is currently importing
  const isBlockedByOther = anyImporting && !isImporting;

  return (
    <div
      onClick={isBlockedByOther ? undefined : onSelect}
      className="flex items-center gap-3 p-3 rounded-2xl transition-colors"
      style={{
        cursor: isBlockedByOther ? "default" : "pointer",
        opacity: isBlockedByOther ? 0.4 : 1,
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
          // eslint-disable-next-line @next/next/no-img-element
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
        {isImported && (
          <span
            className="inline-flex items-center gap-1 text-xs mt-1"
            style={{ color: "#4ade80" }}
          >
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none">
              <path
                d="M5 13l4 4L19 7"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
              />
            </svg>
            Imported
          </span>
        )}
        {(isImporting || isPending) && (
          <span
            className="inline-flex items-center gap-1 text-xs mt-1"
            style={{ color: "rgb(var(--brand-primary))" }}
          >
            <MiniSpinner /> Importing…
          </span>
        )}
      </div>

      {/* Right action */}
      <div className="shrink-0">
        {isImported ? (
          <RadioGroupItem value={video.shareUrl} />
        ) : isImporting || isPending ? (
          <MiniSpinner />
        ) : (
          <Button
            size="sm"
            disabled={isBlockedByOther}
            onClick={(e) => {
              e.stopPropagation();
              onImport();
            }}
            className="h-8 px-3 rounded-xl text-xs font-semibold text-white"
            style={{ backgroundColor: "rgb(var(--brand-primary))" }}
          >
            Import
          </Button>
        )}
      </div>
    </div>
  );
}

function ImportedVideoRow({
  item,
  isSelected,
  onSelect,
}: {
  item: TiktokDownloadFieldsFragment;
  isSelected: boolean;
  onSelect: () => void;
}) {
  const isReady = item.status === "COMPLETED";
  const isFailed = item.status === "FAILED";

  return (
    <div
      onClick={isReady ? onSelect : undefined}
      className="flex items-center gap-3 p-3 rounded-2xl transition-colors"
      style={{
        cursor: isReady ? "pointer" : "default",
        backgroundColor: isSelected
          ? "rgb(var(--brand-primary)/0.06)"
          : "rgb(var(--color-bg-subtle))",
        border: isSelected
          ? "1.5px solid rgb(var(--brand-primary)/0.3)"
          : "1.5px solid transparent",
        opacity: isReady ? 1 : 0.55,
      }}
    >
      {/* Thumbnail */}
      <div className="relative w-14 h-14 rounded-xl overflow-hidden flex-shrink-0 bg-gray-200">
        {item.thumbnailUrl && (
          // eslint-disable-next-line @next/next/no-img-element
          <Image
            height={100}
            width={100}
            src={item?.thumbnailUrl}
            alt=""
            className="absolute inset-0 w-full h-full object-cover"
          />
        )}
        {!isReady && !isFailed && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/40">
            <MiniSpinner color="white" />
          </div>
        )}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <p
          className="text-sm font-medium truncate"
          style={{ color: "rgb(var(--color-text))" }}
        >
          {item.title || item.authorNickname || "TikTok Video"}
        </p>
        {item.authorUsername && (
          <p
            className="text-xs mt-0.5"
            style={{ color: "rgb(var(--color-text-muted))" }}
          >
            @{item.authorUsername}
          </p>
        )}
        <span
          className="text-xs mt-1 inline-block"
          style={{
            color: isReady
              ? "#4ade80"
              : isFailed
                ? "rgb(var(--color-error))"
                : "rgb(var(--color-text-muted))",
          }}
        >
          {isReady ? "Ready" : isFailed ? "Failed" : "Processing…"}
        </span>
      </div>

      {isReady && <RadioGroupItem value={item.id} className="flex-shrink-0" />}
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

function MiniSpinner({
  color = "rgb(var(--brand-primary))",
}: {
  color?: string;
}) {
  return (
    <svg
      className="animate-spin"
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
    >
      <circle
        cx="12"
        cy="12"
        r="10"
        stroke={color}
        strokeOpacity="0.25"
        strokeWidth="3"
      />
      <path
        d="M12 2a10 10 0 0 1 10 10"
        stroke={color}
        strokeWidth="3"
        strokeLinecap="round"
      />
    </svg>
  );
}

function formatDuration(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}
