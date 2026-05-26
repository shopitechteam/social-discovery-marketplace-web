"use client";

import { useState, useRef, useEffect } from "react";
import { useMutation } from "@apollo/client/react";
import Image from "next/image";
import MuxPlayer from "@mux/mux-player-react";
import { useRouter } from "next/navigation";
import { useCreateStore } from "@/stores/create";
import { PublishDraftDocument } from "@/types/__generated__/graphql";
import type MuxPlayerElement from "@mux/mux-player";

interface StepReadyProps {
  lang: string;
}

export function StepReady({ lang }: StepReadyProps) {
  const {
    draftId,
    title,
    caption,
    hashtags,
    mediaItems,
    contentType,
    price,
    isFree,
    currency,
    visibilityMode,
    reset,
    setStep,
    setError,
    error,
  } = useCreateStore();

  const router = useRouter();
  const [publishing, setPublishing] = useState(false);
  const saving = false;
  const [muted, setMuted] = useState(true);
  const [paused, setPaused] = useState(false);
  const [showPauseIcon, setShowPauseIcon] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [scrubbing, setScrubbing] = useState(false);
  const scrubbingRef = useRef(false);
  const [published, setPublished] = useState(false);

  // MuxPlayer ref — gives us the custom element which has .media (inner <video>)
  const playerRef = useRef<MuxPlayerElement>(null);
  const scrubBarRef = useRef<HTMLDivElement>(null);

  const [publishDraft] = useMutation(PublishDraftDocument);

  const cover = mediaItems[0];
  const isVideo = contentType === "video";

  // ── Helpers that reach inside MuxPlayer's shadow DOM ─────────────────────
  /** Returns the inner <video> element MuxPlayer manages */
  function mediaEl(): HTMLVideoElement | null {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const player = playerRef.current as any;
    // @mux/mux-player exposes .media on the custom element
    return player?.media ?? player?.shadowRoot?.querySelector("video") ?? null;
  }

  function togglePlay() {
    const el = mediaEl();
    if (!el) return;
    if (el.paused) el.play().catch(() => {});
    else el.pause();
  }

  function handleMuteClick(e: React.MouseEvent) {
    e.stopPropagation();
    setMuted((m) => !m);
  }

  function seekTo(clientX: number) {
    const bar = scrubBarRef.current;
    const el = mediaEl();
    if (!bar || !el || !el.duration) return;
    const { left, width } = bar.getBoundingClientRect();
    const ratio = Math.max(0, Math.min(1, (clientX - left) / width));
    el.currentTime = ratio * el.duration;
    setProgress(ratio);
    setCurrentTime(ratio * el.duration);
  }

  function onScrubStart(clientX: number) {
    scrubbingRef.current = true;
    setScrubbing(true);
    seekTo(clientX);
  }
  function onScrubMove(clientX: number) {
    if (scrubbingRef.current) seekTo(clientX);
  }
  function onScrubEnd() {
    scrubbingRef.current = false;
    setScrubbing(false);
  }

  // ── Poll inner <video> for time/duration after player mounts ─────────────
  // MuxPlayer's shadow DOM events don't bubble to React handlers reliably on
  // iOS. Polling is more robust and has negligible cost at 250 ms.
  useEffect(() => {
    if (!isVideo) return;
    const id = setInterval(() => {
      const el = mediaEl();
      if (!el) return;
      if (el.duration && !isNaN(el.duration)) setDuration(el.duration);
      if (!scrubbingRef.current) {
        setCurrentTime(el.currentTime);
        setProgress(el.duration ? el.currentTime / el.duration : 0);
      }
      setPaused(el.paused);
    }, 250);
    return () => clearInterval(id);
  }, [isVideo]);

  // ── Publish ───────────────────────────────────────────────────────────────
  async function handlePublish() {
    if (!draftId || publishing) return;
    setPublishing(true);
    setError(null);
    try {
      const { data, error: publishError } = await publishDraft({
        variables: { id: draftId },
      });
      if (publishError) {
        setError(publishError.message ?? "Failed to publish");
        return;
      }
      if (data?.publishDraft) {
        setPublished(true);
        setTimeout(() => {
          reset();
          router.push(`/${lang}/feed`);
        }, 1800);
      }
    } catch (err) {
      setError(String(err));
    } finally {
      setPublishing(false);
    }
  }

  async function handleSaveDraft() {
    if (saving) return;
    reset();
    router.push(`/${lang}/feed`);
  }

  // ── Published success ─────────────────────────────────────────────────────
  if (published) {
    return (
      <div className="flex flex-col h-full items-center justify-center gap-5 px-6 pb-16">
        <div
          className="w-20 h-20 rounded-full flex items-center justify-center"
          style={{
            background:
              "linear-gradient(135deg, rgb(var(--brand-primary)), rgb(var(--brand-secondary)))",
            boxShadow: "0 8px 32px rgb(var(--brand-primary) / 0.4)",
          }}
        >
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none">
            <path
              d="M5 13l4 4L19 7"
              stroke="white"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
        <div className="text-center">
          <h2
            className="font-bold mb-1"
            style={{
              fontSize: "var(--text-xl)",
              color: "rgb(var(--color-text))",
            }}
          >
            Published! 🎉
          </h2>
          <p
            style={{
              fontSize: "var(--text-base)",
              color: "rgb(var(--color-text-muted))",
            }}
          >
            Your post is live on the feed
          </p>
        </div>
      </div>
    );
  }

  // ── VIDEO — fullscreen TikTok-style layout ────────────────────────────────
  if (isVideo) {
    const safeBottom = "env(safe-area-inset-bottom)";
    const safeTop = "env(safe-area-inset-top)";

    return (
      <div
        style={{
          position: "fixed",
          inset: 0,
          zIndex: 50,
          background: "black",
          display: "flex",
          alignItems: "stretch",
          justifyContent: "center",
        }}
      >
        {/* Dimmed side panels on desktop */}
        <div
          className="hidden md:block"
          style={{ flex: 1, background: "rgba(0,0,0,0.7)" }}
        />

        {/* ── Main column ─────────────────────────────────────────────────── */}
        <div
          style={{
            position: "relative",
            width: "100%",
            maxWidth: 430,
            background: "black",
            flexShrink: 0,
            overflow: "hidden",
          }}
        >
          {/* ── MuxPlayer fills column, contain keeps aspect ratio ─────── */}
          {cover?.muxPlaybackId ? (
            <MuxPlayer
              ref={playerRef}
              playbackId={cover.muxPlaybackId}
              streamType="on-demand"
              autoPlay="muted"
              loop
              muted={muted}
              playsInline
              preload="auto"
              className="object-contain?."
              poster={
                cover.thumbnailUrl ??
                `https://image.mux.com/${cover.muxPlaybackId}/thumbnail.webp?time=0&width=720`
              }
              style={
                {
                  position: "absolute",
                  inset: 0,
                  width: "100%",
                  height: "100%",
                  // contain = letterbox; video fills as much as possible without cropping
                  "--media-object-fit": "contain",
                  "--media-object-position": "center center",
                  // hide MuxPlayer's own chrome — we draw our own controls
                  "--controls": "none",
                } as never
              }
            />
          ) : cover ? (
            // Blob fallback (regular upload still processing)
            <video
              src={cover.localUri}
              style={{
                position: "absolute",
                inset: 0,
                width: "100%",
                height: "100%",
                objectFit: "contain",
              }}
              autoPlay
              loop
              muted={muted}
              playsInline
            />
          ) : (
            <div
              style={{ position: "absolute", inset: 0, background: "#111" }}
            />
          )}

          {/* ── Tap overlay — play/pause (z:10) ─────────────────────────── */}
          <div
            style={{
              position: "absolute",
              inset: 0,
              zIndex: 10,
              cursor: "pointer",
            }}
            onClick={togglePlay}
          />

          {/* ── Pause icon flash (z:20, no pointer events) ───────────────── */}
          {showPauseIcon && paused && (
            <div
              style={{
                position: "absolute",
                inset: 0,
                zIndex: 20,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                pointerEvents: "none",
              }}
              onTransitionEnd={() => setShowPauseIcon(false)}
            >
              <div
                style={{
                  width: 72,
                  height: 72,
                  borderRadius: "50%",
                  background: "rgba(0,0,0,0.5)",
                  backdropFilter: "blur(8px)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <svg width="32" height="32" viewBox="0 0 24 24" fill="white">
                  <rect x="6" y="4" width="4" height="16" rx="1" />
                  <rect x="14" y="4" width="4" height="16" rx="1" />
                </svg>
              </div>
            </div>
          )}

          {/* ── Gradients (z:20, no pointer events) ─────────────────────── */}
          <div
            style={{
              position: "absolute",
              inset: "0 0 auto 0",
              height: 120,
              zIndex: 20,
              background:
                "linear-gradient(to bottom,rgba(0,0,0,0.6),transparent)",
              pointerEvents: "none",
            }}
          />
          <div
            style={{
              position: "absolute",
              inset: "auto 0 0 0",
              height: 260,
              zIndex: 20,
              background:
                "linear-gradient(to top,rgba(0,0,0,0.85),transparent)",
              pointerEvents: "none",
            }}
          />

          {/* ── Mute button (z:30) ──────────────────────────────────────── */}
          <button
            onClickCapture={handleMuteClick}
            aria-label={muted ? "Unmute" : "Mute"}
            style={{
              position: "absolute",
              zIndex: 30,
              top: `calc(44px + ${safeTop})`,
              right: 16,
              width: 40,
              height: 40,
              borderRadius: "50%",
              background: "rgba(0,0,0,0.5)",
              backdropFilter: "blur(8px)",
              border: "none",
              cursor: "pointer",
              color: "white",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            {muted ? (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                <path
                  d="M11 5L6 9H2v6h4l5 4V5Z"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinejoin="round"
                />
                <path
                  d="M23 9l-6 6M17 9l6 6"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              </svg>
            ) : (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                <path
                  d="M11 5L6 9H2v6h4l5 4V5Z"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinejoin="round"
                />
                <path
                  d="M15.54 8.46a5 5 0 0 1 0 7.07"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
                <path
                  d="M19.07 4.93a10 10 0 0 1 0 14.14"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              </svg>
            )}
          </button>

          {/* ── Back button (z:30) ──────────────────────────────────────── */}
          <button
            onClick={() => setStep("options")}
            style={{
              position: "absolute",
              zIndex: 30,
              top: `calc(48px + ${safeTop})`,
              left: 16,
              color: "white",
              fontSize: "var(--text-sm)",
              background: "none",
              border: "none",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: 4,
            }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path
                d="M15 18l-6-6 6-6"
                stroke="currentColor"
                strokeWidth="2.2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            Back
          </button>

          {/* ── Caption (z:30) ──────────────────────────────────────────── */}
          <div
            style={{
              position: "absolute",
              zIndex: 30,
              left: 16,
              right: 60,
              bottom: `calc(168px + ${safeBottom})`,
            }}
          >
            {title && (
              <p
                style={{
                  fontWeight: 600,
                  color: "white",
                  marginBottom: 4,
                  fontSize: "var(--text-md)",
                }}
              >
                {title}
              </p>
            )}
            {caption && (
              <p
                style={
                  {
                    color: "rgba(255,255,255,0.8)",
                    fontSize: "var(--text-sm)",
                    display: "-webkit-box",
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: "vertical",
                    overflow: "hidden",
                  } as React.CSSProperties
                }
              >
                {caption}
              </p>
            )}
            {hashtags.length > 0 && (
              <p
                style={{
                  marginTop: 4,
                  fontSize: "var(--text-sm)",
                  color: "rgb(var(--brand-primary))",
                }}
              >
                {hashtags.map((t) => `#${t}`).join(" ")}
              </p>
            )}
          </div>

          {/* ── Progress scrubber (z:30) ─────────────────────────────────── */}
          <div
            style={{
              position: "absolute",
              zIndex: 30,
              left: 16,
              right: 16,
              bottom: `calc(124px + ${safeBottom})`,
            }}
          >
            {/* Time labels */}
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                marginBottom: 6,
                fontSize: 10,
                color: "rgba(255,255,255,0.7)",
              }}
            >
              <span>{fmt(currentTime)}</span>
              <span>{fmt(duration)}</span>
            </div>
            {/* Track — 20px tall for easy touch, 3px visual bar */}
            <div
              ref={scrubBarRef}
              style={{
                position: "relative",
                width: "100%",
                height: 20,
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
              }}
              onPointerDown={(e) => {
                e.stopPropagation();
                (e.currentTarget as HTMLDivElement).setPointerCapture(
                  e.pointerId,
                );
                onScrubStart(e.clientX);
              }}
              onPointerMove={(e) => {
                e.stopPropagation();
                onScrubMove(e.clientX);
              }}
              onPointerUp={(e) => {
                e.stopPropagation();
                onScrubEnd();
              }}
            >
              {/* Track bg */}
              <div
                style={{
                  position: "absolute",
                  left: 0,
                  right: 0,
                  height: 3,
                  borderRadius: 99,
                  background: "rgba(255,255,255,0.3)",
                }}
              >
                {/* Fill */}
                <div
                  style={{
                    position: "absolute",
                    left: 0,
                    top: 0,
                    height: "100%",
                    width: `${progress * 100}%`,
                    background: "white",
                    borderRadius: 99,
                  }}
                />
              </div>
              {/* Thumb */}
              <div
                style={{
                  position: "absolute",
                  left: `calc(${progress * 100}% - ${scrubbing ? 7 : 5}px)`,
                  width: scrubbing ? 14 : 10,
                  height: scrubbing ? 14 : 10,
                  borderRadius: "50%",
                  background: "white",
                  boxShadow: "0 1px 4px rgba(0,0,0,0.5)",
                  transition: scrubbing ? "none" : "width 0.1s, height 0.1s",
                  zIndex: 1,
                }}
              />
            </div>
          </div>

          {/* ── Action buttons (z:30) ────────────────────────────────────── */}
          <div
            style={{
              position: "absolute",
              zIndex: 30,
              left: 0,
              right: 0,
              bottom: `calc(36px + ${safeBottom})`,
              display: "flex",
              gap: 12,
              padding: "0 16px",
            }}
          >
            <button
              onClick={handleSaveDraft}
              disabled={saving || publishing}
              style={{
                flex: 1,
                height: 52,
                borderRadius: 16,
                background: "rgba(255,255,255,0.15)",
                backdropFilter: "blur(12px)",
                border: "1px solid rgba(255,255,255,0.25)",
                color: "white",
                fontWeight: 600,
                fontSize: "var(--text-base)",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 8,
              }}
            >
              <SaveIcon /> Save draft
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                handlePublish();
              }}
              disabled={publishing || saving}
              style={{
                flex: 1,
                height: 52,
                borderRadius: 16,
                background: publishing
                  ? "rgba(255,255,255,0.2)"
                  : "linear-gradient(135deg,rgb(var(--brand-primary)),rgb(var(--brand-secondary)))",
                border: "none",
                color: "white",
                fontWeight: 600,
                fontSize: "var(--text-base)",
                cursor: publishing ? "default" : "pointer",
                opacity: publishing ? 0.7 : 1,
                boxShadow: publishing
                  ? "none"
                  : "0 4px 20px rgb(var(--brand-primary)/0.5)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 8,
              }}
            >
              {publishing ? (
                <MiniSpinner />
              ) : (
                <>
                  <SendIcon /> Post
                </>
              )}
            </button>
          </div>

          {/* Error */}
          {error && (
            <div
              style={{
                position: "absolute",
                zIndex: 30,
                left: 16,
                right: 16,
                bottom: `calc(200px + ${safeBottom})`,
                background: "rgb(var(--color-error)/0.9)",
                color: "white",
                fontSize: "var(--text-sm)",
                borderRadius: 12,
                padding: "12px 16px",
              }}
            >
              {error}
            </div>
          )}
        </div>

        {/* Dimmed right panel on desktop */}
        <div
          className="hidden md:block"
          style={{ flex: 1, background: "rgba(0,0,0,0.7)" }}
        />
      </div>
    );
  }

  // ── IMAGES — card layout ───────────────────────────────────────────────────
  return (
    <div className="md:fixed md:inset-0 md:z-50 md:flex md:items-center md:justify-center md:bg-black/50 md:backdrop-blur-sm">
      <div className="create-flow-card flex flex-col md:flex-row bg-app w-full md:rounded-2xl md:shadow-2xl md:overflow-hidden">
        {/* Desktop left — image preview */}
        <div
          className="hidden md:flex md:flex-col md:justify-center md:items-center md:p-8 md:gap-4"
          style={{
            width: 420,
            flexShrink: 0,
            borderRight: "1px solid rgb(var(--color-border))",
            backgroundColor: "rgb(var(--color-bg-subtle))",
          }}
        >
          <div
            className="rounded-2xl overflow-hidden relative w-full"
            style={{
              aspectRatio: "1/1",
              maxWidth: 320,
              border: "1px solid rgb(var(--color-border))",
              backgroundColor: "rgb(var(--color-bg))",
            }}
          >
            {cover ? (
              <Image
                src={cover.thumbnailUrl ?? cover.localUri}
                alt={title}
                fill
                className="object-cover"
                unoptimized={cover.localUri.startsWith("blob:")}
              />
            ) : (
              <div
                className="absolute inset-0 flex items-center justify-center"
                style={{ color: "rgb(var(--color-text-muted))" }}
              >
                <PlaceholderIcon />
              </div>
            )}
            {mediaItems.length > 1 && <CountBadge count={mediaItems.length} />}
          </div>
          {title && (
            <p
              className="font-semibold text-center line-clamp-2"
              style={{
                fontSize: "var(--text-base)",
                color: "rgb(var(--color-text))",
                maxWidth: 320,
              }}
            >
              {title}
            </p>
          )}
          {hashtags.length > 0 && (
            <p
              className="text-center"
              style={{
                fontSize: "var(--text-sm)",
                color: "rgb(var(--brand-primary))",
                maxWidth: 320,
              }}
            >
              {hashtags.map((t) => `#${t}`).join(" ")}
            </p>
          )}
        </div>

        {/* Right / mobile — header + meta + actions */}
        <div className="flex flex-col flex-1 h-full min-h-0">
          <div className="flex items-center justify-between px-4 pt-4 pb-3 shrink-0">
            <button
              onClick={() => setStep("options")}
              className="flex items-center gap-1"
              style={{
                color: "rgb(var(--color-text-muted))",
                fontSize: "var(--text-sm)",
              }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                <path
                  d="M15 18l-6-6 6-6"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              Back
            </button>
            <h2
              className="font-semibold"
              style={{
                fontSize: "var(--text-lg)",
                color: "rgb(var(--color-text))",
              }}
            >
              Preview
            </h2>
            <div style={{ width: 50 }} />
          </div>

          <div className="flex-1 overflow-y-auto px-4 pb-6">
            {/* Mobile preview card */}
            <div
              className="rounded-2xl overflow-hidden md:hidden"
              style={{
                border: "1px solid rgb(var(--color-border))",
                backgroundColor: "rgb(var(--color-bg-elevated))",
              }}
            >
              <div className="relative w-full" style={{ aspectRatio: "1/1" }}>
                {cover ? (
                  <Image
                    src={cover.thumbnailUrl ?? cover.localUri}
                    alt={title}
                    fill
                    className="object-cover"
                    unoptimized={cover.localUri.startsWith("blob:")}
                  />
                ) : (
                  <div
                    className="w-full h-full flex items-center justify-center"
                    style={{ backgroundColor: "rgb(var(--color-bg-subtle))" }}
                  >
                    <span
                      style={{
                        fontSize: "var(--text-sm)",
                        color: "rgb(var(--color-text-muted))",
                      }}
                    >
                      No preview
                    </span>
                  </div>
                )}
                {mediaItems.length > 1 && (
                  <CountBadge count={mediaItems.length} />
                )}
              </div>
              <div className="px-4 py-3">
                <h3
                  className="font-semibold mb-1"
                  style={{
                    fontSize: "var(--text-md)",
                    color: "rgb(var(--color-text))",
                  }}
                >
                  {title || "Untitled"}
                </h3>
                {caption && (
                  <p
                    className="line-clamp-2"
                    style={{
                      fontSize: "var(--text-base)",
                      color: "rgb(var(--color-text-muted))",
                      lineHeight: 1.5,
                    }}
                  >
                    {caption}
                  </p>
                )}
                {hashtags.length > 0 && (
                  <p
                    className="mt-1.5"
                    style={{
                      fontSize: "var(--text-sm)",
                      color: "rgb(var(--brand-primary))",
                    }}
                  >
                    {hashtags.map((t) => `#${t}`).join(" ")}
                  </p>
                )}
              </div>
            </div>

            {/* Desktop title block */}
            <div className="hidden md:block mb-4">
              <h3
                className="font-bold mb-1"
                style={{
                  fontSize: "var(--text-xl)",
                  color: "rgb(var(--color-text))",
                }}
              >
                {title || "Untitled"}
              </h3>
              {caption && (
                <p
                  style={{
                    fontSize: "var(--text-base)",
                    color: "rgb(var(--color-text-muted))",
                    lineHeight: 1.6,
                  }}
                >
                  {caption}
                </p>
              )}
            </div>

            {/* Meta rows */}
            <div className="mt-4 flex flex-col gap-2">
              <MetaRow
                icon="👁"
                label="Audience"
                value={
                  visibilityMode === "public"
                    ? "Everyone"
                    : visibilityMode === "friends_only"
                      ? "Friends only"
                      : "Only me"
                }
              />
              <MetaRow
                icon="💰"
                label="Price"
                value={isFree ? "Free" : `${currency} ${price}`}
              />
              <MetaRow
                icon="🖼"
                label="Media"
                value={`${mediaItems.length} ${mediaItems.length === 1 ? "photo" : "photos"}`}
              />
            </div>

            {error && (
              <div
                className="mt-4 rounded-xl px-4 py-3"
                style={{
                  backgroundColor: "rgb(var(--color-error) / 0.08)",
                  border: "1px solid rgb(var(--color-error) / 0.2)",
                  color: "rgb(var(--color-error))",
                  fontSize: "var(--text-sm)",
                }}
              >
                {error}
              </div>
            )}
          </div>

          {/* Bottom actions */}
          <div
            className="px-4 pb-6 pt-3 flex gap-3 shrink-0"
            style={{ borderTop: "1px solid rgb(var(--color-border))" }}
          >
            <button
              onClick={handleSaveDraft}
              disabled={saving || publishing}
              className="flex-1 h-13 rounded-2xl font-semibold flex items-center justify-center gap-2 active:scale-[0.98] transition-transform"
              style={{
                backgroundColor: "rgb(var(--color-bg-elevated))",
                border: "1px solid rgb(var(--color-border))",
                color: "rgb(var(--color-text))",
                fontSize: "var(--text-base)",
                opacity: saving ? 0.6 : 1,
              }}
            >
              {saving ? (
                <MiniSpinnerDark />
              ) : (
                <>
                  <SaveIcon dark /> Save draft
                </>
              )}
            </button>
            <button
              onClick={handlePublish}
              disabled={publishing || saving}
              className="flex-1 h-13 rounded-2xl font-semibold flex items-center justify-center gap-2 active:scale-[0.98] transition-transform"
              style={{
                background: publishing
                  ? "rgb(var(--color-border))"
                  : "linear-gradient(135deg, rgb(var(--brand-primary)), rgb(var(--brand-secondary)))",
                color: "white",
                fontSize: "var(--text-base)",
                boxShadow: publishing
                  ? "none"
                  : "0 6px 20px rgb(var(--brand-primary) / 0.4)",
              }}
            >
              {publishing ? (
                <MiniSpinner />
              ) : (
                <>
                  <SendIcon /> Post
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Sub-components ─────────────────────────────────────────────────────────────

function CountBadge({ count }: { count: number }) {
  return (
    <div
      className="absolute top-3 right-3 rounded-full px-2.5 py-1"
      style={{
        backgroundColor: "rgb(0 0 0 / 0.55)",
        backdropFilter: "blur(8px)",
      }}
    >
      <span
        style={{ color: "white", fontSize: "var(--text-xs)", fontWeight: 600 }}
      >
        1/{count}
      </span>
    </div>
  );
}

function PlaceholderIcon() {
  return (
    <svg width="40" height="40" viewBox="0 0 24 24" fill="none">
      <rect
        x="3"
        y="3"
        width="18"
        height="18"
        rx="3"
        stroke="currentColor"
        strokeWidth="1.5"
      />
      <circle cx="8.5" cy="8.5" r="1.5" fill="currentColor" />
      <path
        d="M3 15l5-5 4 4 3-3 6 6"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
        strokeLinecap="round"
      />
    </svg>
  );
}

function MetaRow({
  icon,
  label,
  value,
}: {
  icon: string;
  label: string;
  value: string;
}) {
  return (
    <div
      className="flex items-center justify-between rounded-xl px-4 py-3"
      style={{ backgroundColor: "rgb(var(--color-bg-subtle))" }}
    >
      <div className="flex items-center gap-2.5">
        <span style={{ fontSize: 16 }}>{icon}</span>
        <span
          style={{
            fontSize: "var(--text-sm)",
            color: "rgb(var(--color-text-muted))",
          }}
        >
          {label}
        </span>
      </div>
      <span
        style={{
          fontSize: "var(--text-sm)",
          fontWeight: 600,
          color: "rgb(var(--color-text))",
        }}
      >
        {value}
      </span>
    </div>
  );
}

function SaveIcon({ dark }: { dark?: boolean }) {
  return (
    <svg
      width="17"
      height="17"
      viewBox="0 0 24 24"
      fill="none"
      stroke={dark ? "currentColor" : "white"}
      strokeWidth="2"
      strokeLinejoin="round"
    >
      <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2Z" />
      <path d="M17 21v-8H7v8M7 3v5h8" />
    </svg>
  );
}

function SendIcon() {
  return (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none">
      <path
        d="M22 2L11 13"
        stroke="white"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M22 2L15 22l-4-9-9-4 20-7Z"
        stroke="white"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function fmt(secs: number): string {
  if (!isFinite(secs) || secs < 0) return "0:00";
  const m = Math.floor(secs / 60);
  const s = Math.floor(secs % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}

function MiniSpinner() {
  return (
    <svg
      className="animate-spin"
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
    >
      <circle
        cx="12"
        cy="12"
        r="10"
        stroke="white"
        strokeOpacity="0.3"
        strokeWidth="3"
      />
      <path
        d="M12 2a10 10 0 0 1 10 10"
        stroke="white"
        strokeWidth="3"
        strokeLinecap="round"
      />
    </svg>
  );
}

function MiniSpinnerDark() {
  return (
    <svg
      className="animate-spin"
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
    >
      <circle
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeOpacity="0.2"
        strokeWidth="3"
      />
      <path
        d="M12 2a10 10 0 0 1 10 10"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
      />
    </svg>
  );
}
