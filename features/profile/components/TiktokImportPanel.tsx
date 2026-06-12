"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { useQuery, useMutation, useApolloClient } from "@apollo/client/react";
import {
  GetTiktokConnectStatusDocument,
  GetTiktokConnectUrlDocument,
  GetMyTiktokVideosDocument,
  GetMyTiktokImportsDocument,
  BatchImportTiktokVideosDocument,
} from "@/types/__generated__/graphql";
import type {
  GetMyTiktokVideosQuery,
  GetMyTiktokImportsQuery,
  DownloadStatus,
} from "@/types/__generated__/graphql";
import { getSocket, connectSocket, WS_EVENTS } from "@/lib/socket";
import type { TiktokImportUpdatedPayload } from "@/lib/socket";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import {
  AlertCircle,
  CheckCircle2,
  Clock,
  ExternalLink,
  Loader2,
  RefreshCw,
  Tv2,
  Upload,
  Video,
  XCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";

// ── Types ─────────────────────────────────────────────────────────────────────

type TiktokVideo = GetMyTiktokVideosQuery["myTiktokVideos"]["videos"][number];
type TiktokImport = GetMyTiktokImportsQuery["myTiktokImports"][number];

type ImportStatus = TiktokImport["status"];

// ── Helpers ───────────────────────────────────────────────────────────────────

function formatDuration(seconds: number) {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

function formatDate(ts: unknown) {
  const d = ts instanceof Date ? ts : new Date(Number(ts) * 1000);
  if (isNaN(d.getTime())) return "";
  return d.toLocaleDateString("en", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

const STATUS_CONFIG: Record<
  ImportStatus,
  {
    label: string;
    icon: React.ElementType;
    variant: "default" | "secondary" | "destructive" | "outline";
    className?: string;
  }
> = {
  PENDING: { label: "Queued", icon: Clock, variant: "secondary" },
  UPLOADING: {
    label: "Uploading",
    icon: Upload,
    variant: "secondary",
    className: "animate-pulse",
  },
  PROCESSING: {
    label: "Processing",
    icon: Loader2,
    variant: "secondary",
    className: "animate-spin",
  },
  COMPLETED: {
    label: "Imported",
    icon: CheckCircle2,
    variant: "default",
    className: "text-green-600 dark:text-green-400",
  },
  FAILED: { label: "Failed", icon: XCircle, variant: "destructive" },
};

const ACTIVE_STATUSES: ImportStatus[] = ["PENDING", "UPLOADING", "PROCESSING"];

// ── Sub-components ────────────────────────────────────────────────────────────

function ConnectGate({ lang }: { lang: string }) {
  const [getConnectUrl, { loading }] = useMutation(GetTiktokConnectUrlDocument);

  async function handleConnect() {
    const returnUrl = `${window.location.origin}/${lang}/profile`;
    const { data } = await getConnectUrl({ variables: { returnUrl } });
    if (data?.tiktokConnectUrl) {
      window.open(
        data.tiktokConnectUrl,
        "_blank",
        "width=600,height=700,noopener",
      );
    }
  }

  return (
    <section className="px-4 py-12">
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
          <Tv2 size={26} strokeWidth={2} />
        </div>
        <h2
          className="font-bold"
          style={{
            color: "rgb(var(--color-text))",
            fontSize: "var(--text-lg)",
          }}
        >
          Connect TikTok
        </h2>
        <p
          className="mt-2 max-w-sm leading-snug"
          style={{
            color: "rgb(var(--color-text-muted))",
            fontSize: "var(--text-base)",
          }}
        >
          Link your TikTok account to browse and import your videos into Shopi.
        </p>
        <Button
          onClick={handleConnect}
          disabled={loading}
          className="mt-5 gap-2 px-6 font-semibold text-white"
          style={{
            background:
              "linear-gradient(135deg, rgb(var(--brand-primary)), rgb(var(--brand-secondary)))",
            boxShadow: "0 10px 24px rgb(var(--brand-primary) / 0.24)",
            fontSize: "var(--text-sm)",
            height: 40,
            borderRadius: "var(--radius-md)",
          }}
        >
          {loading ? (
            <Loader2 size={15} className="animate-spin" />
          ) : (
            <ExternalLink size={15} />
          )}
          Connect TikTok
        </Button>
      </div>
    </section>
  );
}

function VideoCard({
  video,
  selected,
  imported,
  onToggle,
}: {
  video: TiktokVideo;
  selected: boolean;
  imported: boolean;
  onToggle: (id: string) => void;
}) {
  return (
    <div
      onClick={() => !imported && onToggle(video.id)}
      className={cn(
        "group relative cursor-pointer overflow-hidden rounded-xl border transition-all duration-150",
        selected && !imported && "ring-2 ring-offset-0",
        imported && "cursor-default opacity-60",
      )}
      style={{
        borderColor:
          selected && !imported
            ? "rgb(var(--brand-primary))"
            : "rgb(var(--color-border))",
        ["--tw-ring-color" as string]: "rgb(var(--brand-primary))",
        backgroundColor: "rgb(var(--color-bg-elevated))",
      }}
    >
      {/* Thumbnail */}
      <div className="relative" style={{ aspectRatio: "9/16" }}>
        <Image
          src={video.coverImageUrl}
          alt={video.title}
          fill
          className="object-cover"
          sizes="(max-width: 430px) 33vw, 140px"
          unoptimized
        />
        {/* Duration pill */}
        <div
          className="absolute bottom-1.5 right-1.5 rounded-md px-1.5 py-0.5 text-white"
          style={{
            fontSize: "var(--text-xs)",
            backgroundColor: "rgba(0,0,0,0.65)",
            fontWeight: 600,
          }}
        >
          {formatDuration(video.duration)}
        </div>

        {/* Already imported overlay */}
        {imported && (
          <div
            className="absolute inset-0 flex items-center justify-center"
            style={{ backgroundColor: "rgba(0,0,0,0.45)" }}
          >
            <CheckCircle2 size={28} className="text-white drop-shadow" />
          </div>
        )}

        {/* Checkbox — top-left */}
        {!imported && (
          <div className="absolute left-2 top-2">
            <Checkbox
              checked={selected}
              onCheckedChange={() => onToggle(video.id)}
              className="h-5 w-5 border-2 border-white bg-white/20 data-[state=checked]:bg-primary data-[state=checked]:border-primary shadow-sm"
              onClick={(e) => e.stopPropagation()}
            />
          </div>
        )}
      </div>

      {/* Title */}
      <div className="p-2">
        <p
          className="line-clamp-2 leading-tight"
          style={{
            fontSize: "var(--text-xs)",
            color: "rgb(var(--color-text))",
            fontWeight: 500,
          }}
        >
          {video.title || "Untitled"}
        </p>
        <p
          className="mt-0.5"
          style={{
            fontSize: "var(--text-xs)",
            color: "rgb(var(--color-text-muted))",
          }}
        >
          {formatDate(video.createTime)}
        </p>
      </div>
    </div>
  );
}

function ImportRow({
  item,
  liveStatus,
}: {
  item: TiktokImport;
  liveStatus?: ImportStatus;
}) {
  const status = liveStatus ?? item.status;
  const cfg = STATUS_CONFIG[status] ?? STATUS_CONFIG.PENDING;
  const StatusIcon = cfg.icon;
  const isActive = ACTIVE_STATUSES.includes(status);

  return (
    <div
      className="flex items-start gap-3 rounded-xl border p-3"
      style={{
        borderColor:
          status === "FAILED"
            ? "rgb(var(--color-error) / 0.35)"
            : "rgb(var(--color-border))",
        backgroundColor: "rgb(var(--color-bg-elevated))",
      }}
    >
      {/* Thumbnail */}
      <div
        className="relative h-16 w-10 shrink-0 overflow-hidden rounded-lg"
        style={{ backgroundColor: "rgb(var(--color-bg-subtle))" }}
      >
        {item.thumbnailUrl ? (
          <Image
            src={item.thumbnailUrl}
            alt={item.title ?? ""}
            fill
            className="object-cover"
            unoptimized
          />
        ) : (
          <div className="flex h-full items-center justify-center">
            <Video
              size={16}
              style={{ color: "rgb(var(--color-text-placeholder))" }}
            />
          </div>
        )}
      </div>

      {/* Info */}
      <div className="min-w-0 flex-1">
        <p
          className="truncate font-medium"
          style={{
            fontSize: "var(--text-sm)",
            color: "rgb(var(--color-text))",
          }}
        >
          {item.title ?? "Untitled"}
        </p>

        <div className="mt-1.5 flex items-center gap-1.5 flex-wrap">
          <Badge
            variant={cfg.variant === "default" ? "secondary" : cfg.variant}
            className={cn(
              "gap-1 py-0.5 text-xs font-semibold",
              cfg.variant !== "default" &&
                " dark:bg-green-900/30 dark:text-green-400 bg-green-100 text-black",
            )}
          >
            {/* <StatusIcon
              size={10}
              className={cn(
                cfg.variant !== "default" && cfg.className,
                cfg.variant === "default" && "text-black dark:text-green-400",
              )}
            /> */}
            {cfg.label}
          </Badge>
        </div>

        {/* Active progress bar */}
        {isActive && (
          <Progress
            value={undefined}
            className="mt-2 h-1"
            style={{ "--tw-bg-opacity": "0.15" } as React.CSSProperties}
          />
        )}

        {/* Error message */}
        {status === "FAILED" && item.errorMessage && (
          <p
            className="mt-1 flex items-center gap-1 leading-snug"
            style={{
              fontSize: "var(--text-xs)",
              color: "rgb(var(--color-error))",
            }}
          >
            <AlertCircle size={11} className="flex-shrink-0" />
            {item.errorMessage}
          </p>
        )}
      </div>
    </div>
  );
}

// ── Main panel ────────────────────────────────────────────────────────────────

interface Props {
  lang: string;
}

export function TiktokImportPanel({ lang }: Props) {
  const apolloClient = useApolloClient();

  // ── Auth / connect status ──────────────────────────────────────────────────
  const {
    data: statusData,
    loading: statusLoading,
    refetch: refetchStatus,
  } = useQuery(GetTiktokConnectStatusDocument, {
    fetchPolicy: "cache-and-network",
  });

  const isTiktokConnected = statusData?.me?.authProviders?.tiktok === true;

  // ── TikTok videos list ─────────────────────────────────────────────────────
  // pages: accumulate pages client-side; cursor drives each fetch
  const [pages, setPages] = useState<TiktokVideo[][]>([]);
  const [cursor, setCursor] = useState<string | undefined>(undefined);

  const {
    data: videosData,
    loading: videosLoading,
    refetch: refetchVideos,
  } = useQuery(GetMyTiktokVideosDocument, {
    variables: { cursor },
    skip: !isTiktokConnected,
    fetchPolicy: "network-only",
    notifyOnNetworkStatusChange: true,
  });

  // Accumulate pages as new data arrives
  useEffect(() => {
    if (!videosData) return;
    const page = videosData.myTiktokVideos.videos;
    // cursor === undefined means first page — reset; otherwise append
    // schedule the state update to avoid calling setState synchronously inside the effect
    const t = setTimeout(() => {
      setPages((prev) =>
        cursor === undefined && prev.length > 0 ? [page] : [...prev, page],
      );
    }, 0);
    return () => clearTimeout(t);
  }, [videosData, cursor]);

  const allVideos = pages.flat();
  const hasMore = videosData?.myTiktokVideos.hasMore ?? false;
  const nextCursor = videosData?.myTiktokVideos.nextCursor ?? null;

  // ── Existing imports ───────────────────────────────────────────────────────
  const { data: importsData, refetch: refetchImports } = useQuery(
    GetMyTiktokImportsDocument,
    { skip: !isTiktokConnected, fetchPolicy: "cache-and-network" },
  );

  const imports = importsData?.myTiktokImports ?? [];

  // Build set of already-imported shareUrls for quick look-up
  const importedUrls = new Set(imports.map((i) => i.url));

  // ── Selection state ────────────────────────────────────────────────────────
  const [selected, setSelected] = useState<Set<string>>(new Set());

  function toggleVideo(shareUrl: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(shareUrl) ? next.delete(shareUrl) : next.add(shareUrl);
      return next;
    });
  }

  const importableUrls = allVideos
    .filter((v) => !importedUrls.has(v.shareUrl))
    .map((v) => v.shareUrl);
  const allSelected =
    importableUrls.length > 0 &&
    importableUrls.every((url) => selected.has(url));

  function toggleSelectAll() {
    if (allSelected) {
      setSelected(new Set());
    } else {
      setSelected(new Set(importableUrls));
    }
  }

  function clearSelection() {
    setSelected(new Set());
  }

  // ── Batch import mutation ──────────────────────────────────────────────────
  const [batchImport, { loading: importing }] = useMutation(
    BatchImportTiktokVideosDocument,
  );
  const [importResult, setImportResult] = useState<{
    queued: number;
    skipped: number;
  } | null>(null);

  async function handleImport() {
    if (selected.size === 0) return;
    const shareUrls = Array.from(selected);
    const { data } = await batchImport({ variables: { shareUrls } });
    if (data?.batchImportTiktokVideos) {
      setImportResult({
        queued: data.batchImportTiktokVideos.queued,
        skipped: data.batchImportTiktokVideos.skipped,
      });
      setSelected(new Set());
      refetchImports();
    }
  }

  // ── WebSocket live updates ─────────────────────────────────────────────────
  const [liveStatuses, setLiveStatuses] = useState<
    Record<string, ImportStatus>
  >({});

  const hasActiveImports = imports.some((i) =>
    ACTIVE_STATUSES.includes(liveStatuses[i.id] ?? i.status),
  );

  useEffect(() => {
    if (!isTiktokConnected) return;

    const socket = getSocket();
    connectSocket();

    function handleUpdate(payload: TiktokImportUpdatedPayload) {
      setLiveStatuses((prev) => ({
        ...prev,
        [payload.downloadId]: payload.status as ImportStatus,
      }));

      // When a job completes/fails, refetch to pick up title/thumbnail from DB
      if (payload.status === "COMPLETED" || payload.status === "FAILED") {
        apolloClient.refetchQueries({ include: [GetMyTiktokImportsDocument] });
      }
    }

    socket.on(WS_EVENTS.TIKTOK_IMPORT_UPDATED, handleUpdate);
    return () => {
      socket.off(WS_EVENTS.TIKTOK_IMPORT_UPDATED, handleUpdate);
    };
  }, [isTiktokConnected, apolloClient]);

  // Poll while there are active imports (fallback if WS unavailable)
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);
  useEffect(() => {
    if (hasActiveImports) {
      pollRef.current = setInterval(() => refetchImports(), 8000);
    } else {
      if (pollRef.current) clearInterval(pollRef.current);
    }
    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, [hasActiveImports, refetchImports]);

  // Refresh TikTok connect status after returning from OAuth popup
  useEffect(() => {
    function handleFocus() {
      if (!isTiktokConnected) refetchStatus();
    }
    window.addEventListener("focus", handleFocus);
    return () => window.removeEventListener("focus", handleFocus);
  }, [isTiktokConnected, refetchStatus]);

  // ── View toggle ────────────────────────────────────────────────────────────
  const [view, setView] = useState<"pick" | "queue">("pick");
  const activeCount = imports.filter((i) =>
    ACTIVE_STATUSES.includes(liveStatuses[i.id] ?? i.status),
  ).length;

  // ── Render ─────────────────────────────────────────────────────────────────

  if (statusLoading && !statusData) {
    return (
      <div className="flex flex-col gap-0">
        {/* header row */}
        <div className="flex items-center justify-between px-4 pt-4 pb-3">
          <div className="flex flex-col gap-2">
            <Skeleton className="h-4 w-28 rounded-md" />
            <Skeleton className="h-3 w-20 rounded-md" />
          </div>
          <Skeleton className="h-8 w-8 rounded-full" />
        </div>
        {/* tab switcher */}
        <div className="flex gap-2 px-4 pb-3">
          <Skeleton className="h-8 flex-1 rounded-lg" />
          <Skeleton className="h-8 flex-1 rounded-lg" />
        </div>
        {/* video grid */}
        <div className="grid grid-cols-3 gap-1 px-4">
          {Array.from({ length: 9 }).map((_, i) => (
            <Skeleton
              key={i}
              className="rounded-xl"
              style={{ aspectRatio: "9/16" }}
            />
          ))}
        </div>
      </div>
    );
  }

  if (!isTiktokConnected) {
    return (
      <div className="p-4">
        <ConnectGate lang={lang} />
      </div>
    );
  }

  const notImportedVideos = allVideos.filter(
    (v) => !importedUrls.has(v.shareUrl),
  );

  return (
    <div className="flex flex-col gap-0">
      {/* ── Header ──────────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between px-4 pt-4 pb-3">
        <div>
          <p
            className="font-bold"
            style={{
              fontSize: "var(--text-md)",
              color: "rgb(var(--color-text))",
            }}
          >
            TikTok Import
          </p>
          <p
            style={{
              fontSize: "var(--text-xs)",
              color: "rgb(var(--color-text-muted))",
            }}
          >
            {allVideos.length > 0
              ? `${allVideos.length} video${allVideos.length !== 1 ? "s" : ""} · ${notImportedVideos.length} not yet imported`
              : "Browse your videos"}
          </p>
        </div>
        <button
          onClick={() => {
            setPages([]);
            setCursor(undefined);
            refetchVideos();
          }}
          className="flex h-8 w-8 items-center justify-center rounded-full transition-colors active:opacity-60"
          style={{
            backgroundColor: "rgb(var(--color-bg-subtle))",
            color: "rgb(var(--color-text-muted))",
          }}
          title="Refresh"
        >
          <RefreshCw
            size={14}
            className={videosLoading ? "animate-spin" : ""}
          />
        </button>
      </div>

      {/* ── Tab switcher ────────────────────────────────────────────────── */}
      <div
        className="sticky z-10 flex gap-2 px-4 pb-3 pt-1"
        style={{
          top: 48,
          backgroundColor: "rgb(var(--color-bg) / 0.94)",
          backdropFilter: "blur(14px) saturate(150%)",
          WebkitBackdropFilter: "blur(14px) saturate(150%)",
          borderBottom: "1px solid rgb(var(--color-border))",
        }}
      >
        <button
          onClick={() => setView("pick")}
          className={cn(
            "flex h-10 flex-1 items-center justify-center gap-1.5 rounded-lg border font-semibold transition-all",
            view === "pick"
              ? "border-primary bg-primary text-white shadow-sm"
              : "border-border bg-background text-muted-foreground",
          )}
          style={{
            fontSize: "var(--text-xs)",
            borderColor:
              view === "pick"
                ? "rgb(var(--brand-primary))"
                : "rgb(var(--color-border))",
            backgroundColor:
              view === "pick"
                ? "rgb(var(--brand-primary))"
                : "rgb(var(--color-bg-elevated))",
            color: view === "pick" ? "#fff" : "rgb(var(--color-text-muted))",
          }}
        >
          <Video size={13} strokeWidth={2.2} />
          My Videos
        </button>
        <button
          onClick={() => setView("queue")}
          className={cn(
            "relative flex h-10 flex-1 items-center justify-center gap-1.5 rounded-lg border font-semibold transition-all",
          )}
          style={{
            fontSize: "var(--text-xs)",
            borderColor:
              view === "queue"
                ? "rgb(var(--brand-primary))"
                : "rgb(var(--color-border))",
            backgroundColor:
              view === "queue"
                ? "rgb(var(--brand-primary))"
                : "rgb(var(--color-bg-elevated))",
            color: view === "queue" ? "#fff" : "rgb(var(--color-text-muted))",
          }}
        >
          <Upload size={13} strokeWidth={2.2} />
          Import Queue
          {activeCount > 0 && (
            <span
              className="absolute -right-1.5 -top-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-xs font-bold text-white"
              style={{ backgroundColor: "rgb(var(--brand-primary))" }}
            >
              {activeCount}
            </span>
          )}
        </button>
      </div>

      {/* ── Import result toast ──────────────────────────────────────────── */}
      {importResult && (
        <div
          className="mx-4 mb-3 flex items-start gap-2 rounded-xl border px-3 py-2.5"
          style={{
            backgroundColor: "rgb(var(--color-success) / 0.08)",
            borderColor: "rgb(var(--color-success) / 0.3)",
          }}
        >
          <CheckCircle2
            size={16}
            className="mt-0.5 shrink-0"
            style={{ color: "rgb(var(--color-success))" }}
          />
          <div>
            <p
              className="font-semibold"
              style={{
                fontSize: "var(--text-sm)",
                color: "rgb(var(--color-text))",
              }}
            >
              {importResult.queued} video{importResult.queued !== 1 ? "s" : ""}{" "}
              queued for import
            </p>
            {importResult.skipped > 0 && (
              <p
                style={{
                  fontSize: "var(--text-xs)",
                  color: "rgb(var(--color-text-muted))",
                }}
              >
                {importResult.skipped} already imported, skipped
              </p>
            )}
          </div>
          <button
            onClick={() => setImportResult(null)}
            className="ml-auto shrink-0 opacity-50 hover:opacity-100"
          >
            <XCircle size={14} />
          </button>
        </div>
      )}

      {/* ── Pick view ───────────────────────────────────────────────────── */}
      {view === "pick" && (
        <div className="flex flex-col gap-0">
          {/* Selection toolbar */}
          <div className="flex items-center justify-between px-4 pb-2">
            <div className="flex items-center gap-2">
              {selected.size > 0 ? (
                <>
                  <span
                    className="font-semibold"
                    style={{
                      fontSize: "var(--text-sm)",
                      color: "rgb(var(--color-text))",
                    }}
                  >
                    {selected.size} selected
                  </span>
                  <button
                    onClick={clearSelection}
                    className="rounded-md px-2 py-0.5 font-medium transition-opacity active:opacity-60"
                    style={{
                      fontSize: "var(--text-xs)",
                      color: "rgb(var(--color-text-muted))",
                      backgroundColor: "rgb(var(--color-bg-subtle))",
                    }}
                  >
                    Clear
                  </button>
                </>
              ) : (
                <span
                  style={{
                    fontSize: "var(--text-sm)",
                    color: "rgb(var(--color-text-muted))",
                  }}
                >
                  Tap to select
                </span>
              )}
            </div>
            <button
              onClick={toggleSelectAll}
              disabled={notImportedVideos.length === 0}
              className="font-semibold transition-opacity disabled:opacity-30"
              style={{
                fontSize: "var(--text-sm)",
                color: "rgb(var(--brand-primary))",
              }}
            >
              {allSelected ? "Deselect all" : "Select all"}
            </button>
          </div>

          {/* Video grid */}
          {videosLoading && allVideos.length === 0 ? (
            <div className="grid grid-cols-3 gap-1 px-4">
              {Array.from({ length: 9 }).map((_, i) => (
                <Skeleton
                  key={i}
                  className="rounded-xl"
                  style={{ aspectRatio: "9/16" }}
                />
              ))}
            </div>
          ) : allVideos.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-3 py-14 text-center px-6">
              <Video
                size={32}
                style={{ color: "rgb(var(--color-text-placeholder))" }}
              />
              <p
                className="font-semibold"
                style={{
                  fontSize: "var(--text-base)",
                  color: "rgb(var(--color-text))",
                }}
              >
                No videos found
              </p>
              <p
                style={{
                  fontSize: "var(--text-sm)",
                  color: "rgb(var(--color-text-muted))",
                }}
              >
                Your TikTok videos will appear here once loaded.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-3 gap-1 px-4">
              {allVideos.map((video) => (
                <VideoCard
                  key={video.id}
                  video={video}
                  selected={selected.has(video.shareUrl)}
                  imported={importedUrls.has(video.shareUrl)}
                  onToggle={(id) => {
                    const v = allVideos.find((x) => x.id === id);
                    if (v) toggleVideo(v.shareUrl);
                  }}
                />
              ))}
            </div>
          )}

          {/* Load more */}
          {hasMore && (
            <div className="flex justify-center px-4 pt-3 pb-1">
              <Button
                variant="outline"
                size="sm"
                disabled={videosLoading}
                onClick={() => setCursor(nextCursor ?? undefined)}
                className="gap-1.5"
              >
                {videosLoading ? (
                  <Loader2 size={13} className="animate-spin" />
                ) : null}
                Load more
              </Button>
            </div>
          )}

          {/* Spacer so last row of grid isn't hidden behind the sticky CTA */}
          {selected.size > 0 && <div style={{ height: 88 }} />}

          {/* Import CTA */}
          {selected.size > 0 && (
            <div
              className="fixed left-1/2 -translate-x-1/2 w-full px-4 z-30"
              style={{
                bottom: "calc(var(--nav-height, 60px) + 12px)",
                maxWidth: 430,
              }}
            >
              <div
                className="rounded-2xl px-4 py-3"
                style={{
                  backgroundColor: "rgb(var(--color-bg-elevated) / 0.88)",
                  backdropFilter: "blur(16px) saturate(180%)",
                  WebkitBackdropFilter: "blur(16px) saturate(180%)",
                  boxShadow:
                    "0 -2px 24px rgba(0,0,0,0.08), 0 8px 32px rgba(0,0,0,0.08)",
                  border: "1px solid rgb(var(--color-border))",
                }}
              >
                <Button
                  onClick={handleImport}
                  disabled={importing}
                  className="w-full gap-2 font-semibold"
                  style={{
                    background: "#000",
                    color: "#fff",
                    boxShadow: "0 4px 16px rgba(0,0,0,0.25)",
                    height: 48,
                    fontSize: "var(--text-md)",
                    borderRadius: "var(--radius-full)",
                  }}
                >
                  {importing ? (
                    <Loader2 size={16} className="animate-spin" />
                  ) : (
                    <Upload size={16} />
                  )}
                  Import {selected.size} video{selected.size !== 1 ? "s" : ""}
                </Button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── Queue view ───────────────────────────────────────────────────── */}
      {view === "queue" && (
        <div className="px-4 pb-4">
          {imports.length === 0 ? (
            <div
              className="flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed py-14 text-center"
              style={{ borderColor: "rgb(var(--color-border))" }}
            >
              <Upload
                size={28}
                style={{ color: "rgb(var(--color-text-placeholder))" }}
              />
              <p
                className="font-semibold"
                style={{
                  fontSize: "var(--text-base)",
                  color: "rgb(var(--color-text))",
                }}
              >
                No imports yet
              </p>
              <p
                style={{
                  fontSize: "var(--text-sm)",
                  color: "rgb(var(--color-text-muted))",
                }}
              >
                Select videos on the My Videos tab and tap Import.
              </p>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setView("pick")}
                className="mt-1 gap-1.5"
              >
                <Video size={13} /> Browse videos
              </Button>
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              {/* Active first */}
              {imports
                .slice()
                .sort((a, b) => {
                  const statusOrder: Record<DownloadStatus, number> = {
                    UPLOADING: 0,
                    PROCESSING: 1,
                    PENDING: 2,
                    FAILED: 3,
                    COMPLETED: 4,
                  };
                  const sa = liveStatuses[a.id] ?? a.status;
                  const sb = liveStatuses[b.id] ?? b.status;
                  return (statusOrder[sa] ?? 9) - (statusOrder[sb] ?? 9);
                })
                .map((item) => (
                  <ImportRow
                    key={item.id}
                    item={item}
                    liveStatus={liveStatuses[item.id]}
                  />
                ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
