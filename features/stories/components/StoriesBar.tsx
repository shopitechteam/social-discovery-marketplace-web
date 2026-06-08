"use client";

import { useState, useRef, useCallback } from "react";
import Image from "next/image";
import { useStoriesFeed, type StoryRing } from "../hooks/useStoriesFeed";
import { useStoryUpload } from "../hooks/useStoryUpload";
import { StoryViewer } from "./StoryViewer";
import { useAuthStore } from "@/stores/auth";

interface Props {
  lang: string;
}

// ── Upload sheet ──────────────────────────────────────────────────────────────

function UploadSheet({
  onSelect,
  onClose,
}: {
  onSelect: (file: File) => void;
  onClose: () => void;
}) {
  const imageRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLInputElement>(null);

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) onSelect(file);
    e.target.value = "";
    onClose();
  };

  return (
    <>
      <div className="fixed inset-0 z-[60] bg-black/50" onClick={onClose} />
      <div className="fixed bottom-0 left-0 right-0 z-[61] bg-background rounded-t-2xl px-4 pt-4 pb-8">
        <div className="w-10 h-1 bg-muted-foreground/30 rounded-full mx-auto mb-5" />
        <h3 className="text-sm font-semibold text-default mb-4 text-center">
          Add to your story
        </h3>
        <div className="flex gap-3">
          <button
            onClick={() => imageRef.current?.click()}
            className="flex-1 flex flex-col items-center gap-2 py-4 rounded-xl bg-surface border border-border/60 active:scale-95 transition-transform"
          >
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--color-primary)" strokeWidth="2">
                <rect x="3" y="3" width="18" height="18" rx="2" />
                <circle cx="8.5" cy="8.5" r="1.5" />
                <path d="m21 15-5-5L5 21" />
              </svg>
            </div>
            <span className="text-xs text-default font-medium">Photo</span>
          </button>
          <button
            onClick={() => videoRef.current?.click()}
            className="flex-1 flex flex-col items-center gap-2 py-4 rounded-xl bg-surface border border-border/60 active:scale-95 transition-transform"
          >
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--color-primary)" strokeWidth="2">
                <polygon points="23 7 16 12 23 17 23 7" />
                <rect x="1" y="5" width="15" height="14" rx="2" />
              </svg>
            </div>
            <span className="text-xs text-default font-medium">Video</span>
          </button>
        </div>
        <input ref={imageRef} type="file" accept="image/*" className="hidden" onChange={handleFile} />
        <input ref={videoRef} type="file" accept="video/*" className="hidden" onChange={handleFile} />
      </div>
    </>
  );
}

// ── Add-story card (9:14 aspect) ──────────────────────────────────────────────

function AddStoryCard({
  user,
  isUploading,
  onClick,
}: {
  user: { profile?: { firstName?: string | null; lastName?: string | null; avatar?: string | null } | null } | null;
  isUploading: boolean;
  onClick: () => void;
}) {
  const avatar = user?.profile?.avatar;
  const initial = user?.profile?.firstName?.[0]?.toUpperCase() ?? "+";

  return (
    <button
      onClick={onClick}
      className="relative flex-none w-[72px] rounded-2xl overflow-hidden border-2 border-dashed border-primary/50 bg-surface active:scale-95 transition-transform"
      style={{ aspectRatio: "9/14" }}
      aria-label="Add story"
    >
      {avatar ? (
        <Image src={avatar} alt="You" fill className="object-cover opacity-40" />
      ) : (
        <div className="absolute inset-0 bg-primary/5" />
      )}
      <div className="absolute inset-0 flex flex-col items-center justify-center gap-1.5">
        {isUploading ? (
          <div className="w-7 h-7 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        ) : (
          <>
            <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center shadow">
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <path d="M7 1v12M1 7h12" stroke="white" strokeWidth="2" strokeLinecap="round" />
              </svg>
            </div>
            <span className="text-[10px] font-semibold text-primary leading-none">
              {initial !== "+" ? initial : ""}
            </span>
          </>
        )}
      </div>
      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent px-1 pt-4 pb-1.5">
        <p className="text-white text-[9px] font-medium text-center truncate leading-tight">
          {isUploading ? "Uploading…" : "Add story"}
        </p>
      </div>
    </button>
  );
}

// ── Story card (9:14) ─────────────────────────────────────────────────────────

function StoryCard({ ring, onClick }: { ring: StoryRing; onClick: () => void }) {
  const firstStory = ring.stories[0];
  const thumb =
    firstStory?.media.thumbnailUrl ??
    firstStory?.media.imageUrl ??
    (firstStory?.media.muxPlaybackId
      ? `https://image.mux.com/${firstStory.media.muxPlaybackId}/thumbnail.jpg?time=0&width=200&fit_mode=smartcrop`
      : null);
  const name = ring.user.profile?.firstName ?? "User";
  const avatar = ring.user.profile?.avatar;
  const isVideo = firstStory?.media.mediaType === "VIDEO";
  const count = ring.stories.length;

  return (
    <button
      onClick={onClick}
      className="relative flex-none w-[72px] rounded-2xl overflow-hidden active:scale-95 transition-transform"
      style={{ aspectRatio: "9/14" }}
      aria-label={`${name}'s story`}
    >
      {thumb ? (
        <Image src={thumb} alt={name} fill className="object-cover" sizes="72px" unoptimized={thumb.includes(".gif")} />
      ) : (
        <div className="absolute inset-0 bg-neutral-800" />
      )}
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent" />
      {ring.hasUnviewed && (
        <div className="absolute inset-0 rounded-2xl ring-[2.5px] ring-primary ring-inset pointer-events-none" />
      )}
      <div className="absolute top-1.5 left-0 right-0 flex flex-col items-center gap-1 pointer-events-none">
        <div className={`w-8 h-8 rounded-full overflow-hidden ring-2 ${ring.hasUnviewed ? "ring-primary" : "ring-white/40"} ring-offset-1 ring-offset-black/60`}>
          {avatar ? (
            <Image src={avatar} alt={name} width={32} height={32} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full bg-primary/80 flex items-center justify-center text-white text-[10px] font-bold">{name[0]}</div>
          )}
        </div>
      </div>
      {isVideo && (
        <div className="absolute top-1.5 right-1.5 pointer-events-none">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="white" opacity={0.8}><path d="M8 5v14l11-7z" /></svg>
        </div>
      )}
      {count > 1 && (
        <div className="absolute top-1.5 left-1.5 bg-black/50 rounded-full px-1 py-0.5 pointer-events-none">
          <span className="text-white text-[9px] font-bold">{count}</span>
        </div>
      )}
      <div className="absolute bottom-0 left-0 right-0 px-1 pb-1.5 pointer-events-none">
        <p className="text-white text-[10px] font-semibold text-center truncate leading-tight">{name}</p>
      </div>
    </button>
  );
}

// ── StoriesBar ────────────────────────────────────────────────────────────────

export function StoriesBar({ lang: _lang }: Props) {
  const { rings, loading, refetch, markViewed } = useStoriesFeed();
  const { uploadImage, uploadVideo, status: uploadStatus } = useStoryUpload();

  const user = useAuthStore((s) => s.user);
  const isAuthed = !!user;

  const [viewerOpen, setViewerOpen] = useState(false);
  const [viewerRingIdx, setViewerRingIdx] = useState(0);
  const [sheetOpen, setSheetOpen] = useState(false);

  const isUploading = uploadStatus === "uploading" || uploadStatus === "processing";

  const ownRing = rings.find((r) => r.user.id === user?.id);
  const otherRings = rings.filter((r) => r.user.id !== user?.id);

  const openViewer = useCallback((idx: number) => {
    setViewerRingIdx(idx);
    setViewerOpen(true);
  }, []);

  const handleFileSelected = async (file: File) => {
    if (file.type.startsWith("video/")) {
      await uploadVideo(file);
    } else {
      await uploadImage(file);
    }
    refetch();
  };

  // Loading skeleton
  if (loading && rings.length === 0) {
    return (
      <section className="py-3 border-b border-border/30">
        <div className="flex items-center gap-2.5 px-4 mb-2">
          <div className="w-3 h-3 rounded bg-surface animate-pulse" />
          <div className="w-16 h-3 rounded bg-surface animate-pulse" />
        </div>
        <div className="flex gap-2 px-4 overflow-hidden">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="flex-none w-[72px] rounded-2xl bg-surface animate-pulse" style={{ aspectRatio: "9/14" }} />
          ))}
        </div>
      </section>
    );
  }

  // No stories and not authed → hide entirely (TrendingStrip renders below)
  if (!isAuthed && rings.length === 0) return null;

  // Authed but no stories and no rings → just show the add button
  return (
    <>
      <section className="pt-3 pb-1 border-b border-border/30">
        <div className="flex items-center justify-between px-4 mb-2.5">
          <h2 className="text-sm font-bold text-default flex items-center gap-1.5">
            <span>📖</span> Stories
          </h2>
          {rings.length > 0 && (
            <span className="text-[11px] text-muted-foreground">{rings.length} active</span>
          )}
        </div>

        <div
          className="flex gap-2 px-4 overflow-x-auto scrollbar-none pb-0.5"
          style={{ scrollSnapType: "x mandatory" }}
        >
          {/* Add story — always visible for authed users */}
          {isAuthed && (
            <div style={{ scrollSnapAlign: "start" }}>
              <AddStoryCard user={user} isUploading={isUploading} onClick={() => setSheetOpen(true)} />
            </div>
          )}

          {/* Own story ring */}
          {ownRing && (
            <div style={{ scrollSnapAlign: "start" }}>
              <StoryCard ring={ownRing} onClick={() => openViewer(rings.findIndex((r) => r.user.id === user?.id))} />
            </div>
          )}

          {/* Other rings */}
          {otherRings.map((ring) => {
            const globalIdx = rings.findIndex((r) => r.user.id === ring.user.id);
            return (
              <div key={ring.user.id} style={{ scrollSnapAlign: "start" }}>
                <StoryCard ring={ring} onClick={() => openViewer(globalIdx)} />
              </div>
            );
          })}
        </div>
      </section>

      {/* Story viewer */}
      {viewerOpen && rings.length > 0 && (
        <StoryViewer
          rings={rings}
          initialRingIndex={viewerRingIdx}
          onClose={() => setViewerOpen(false)}
          onMarkViewed={markViewed}
        />
      )}

      {/* Upload sheet */}
      {sheetOpen && (
        <UploadSheet onSelect={handleFileSelected} onClose={() => setSheetOpen(false)} />
      )}
    </>
  );
}
