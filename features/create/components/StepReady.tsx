"use client";

import { useState, useRef } from "react";
import { useMutation } from "@apollo/client/react";
import Image from "next/image";
import { MuxVideo } from "@/components/ui/MuxVideo";
import { useRouter } from "next/navigation";
import { useCreateStore } from "@/stores/create";
import { PublishDraftDocument } from "@/types/__generated__/graphql";

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
  const [progress, setProgress] = useState(0); // 0–1
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [scrubbing, setScrubbing] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const scrubBarRef = useRef<HTMLDivElement>(null);
  const pauseIconTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [published, setPublished] = useState(false);

  const [publishDraft] = useMutation(PublishDraftDocument);

  const cover = mediaItems[0];
  const isVideo = contentType === "video";

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
    // Draft is already persisted server-side — just leave
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

  // ── VIDEO — fullscreen TikTok layout ──────────────────────────────────────
  if (isVideo) {
    // Play / pause — called by tapping the transparent overlay (NOT the mute btn)
    function togglePlay() {
      const el = videoRef.current;
      if (!el) return;
      if (el.paused) {
        el.play().catch(() => {});
      } else {
        el.pause();
      }
    }

    // Mute — completely independent, stopPropagation so it never reaches overlay
    function handleMuteClick(e: React.MouseEvent) {
      e.stopPropagation();
      setMuted((m) => !m); // purely React state — MuxVideo syncs el.muted via its own effect
    }

    // Video event handlers wired via onPlay/onPause/onTimeUpdate/onLoadedMetadata
    function onPlay() {
      setPaused(false);
    }
    function onPause() {
      setPaused(true);
      // Flash pause icon, auto-hide after 600ms
      setShowPauseIcon(true);
    }
    function onTimeUpdate() {
      const el = videoRef.current;
      if (!el || scrubbing) return;
      setCurrentTime(el.currentTime);
      setProgress(el.duration ? el.currentTime / el.duration : 0);
    }
    function onLoadedMetadata() {
      const el = videoRef.current;
      if (el) setDuration(el.duration);
    }

    // Scrub helpers — touch + mouse
    function seekTo(clientX: number) {
      const bar = scrubBarRef.current;
      const el = videoRef.current;
      if (!bar || !el) return;
      const { left, width } = bar.getBoundingClientRect();
      const ratio = Math.max(0, Math.min(1, (clientX - left) / width));
      el.currentTime = ratio * el.duration;
      setProgress(ratio);
      setCurrentTime(ratio * el.duration);
    }

    function onScrubStart(clientX: number) {
      setScrubbing(true);
      seekTo(clientX);
    }
    function onScrubMove(clientX: number) {
      if (!scrubbing) return;
      seekTo(clientX);
    }
    function onScrubEnd() {
      setScrubbing(false);
    }

    const safeBottom = "env(safe-area-inset-bottom)";
    const safeTop = "env(safe-area-inset-top)";

    return (
      <div className="fixed inset-0 bg-black z-50">
        {/* ── Mute button — z-30, OUTSIDE tap overlay, stopPropagation for safety ── */}
        <button
          onClick={handleMuteClick}
          className="absolute z-30 flex items-center justify-center rounded-full"
          style={{
            top: `calc(40px + ${safeTop})`,
            right: 16,
            width: 36,
            height: 40,
            backgroundColor: "rgba(0,0,0,0.45)",
            backdropFilter: "blur(8px)",
            WebkitBackdropFilter: "blur(8px)",
            color: "white",
          }}
          aria-label={muted ? "Unmute" : "Mute"}
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

        {/* ── Video ── */}
        {cover ? (
          <MuxVideo
            key={cover.muxPlaybackId ?? cover.localUri}
            muxPlaybackId={cover.muxPlaybackId}
            src={!cover.muxPlaybackId ? cover.localUri : undefined}
            className="absolute inset-0 w-full h-full"
            objectFit="cover"
            videoRef={videoRef}
            autoPlay
            loop
            muted={muted}
            playsInline
            onPlay={onPlay}
            onPause={onPause}
            onTimeUpdate={onTimeUpdate}
            onLoadedMetadata={onLoadedMetadata}
          />
        ) : (
          <div className="absolute inset-0 bg-neutral-900" />
        )}

        {/* ── Tap-to-play/pause overlay (z-10, below all buttons) ── */}
        <div className="absolute inset-0 z-10" onClick={togglePlay} />

        {/* ── Pause icon — center flash ── */}
        {showPauseIcon && paused && (
          <div
            className="absolute inset-0 z-20 flex items-center justify-center pointer-events-none"
            onTransitionEnd={() => setShowPauseIcon(false)}
          >
            <div
              className="flex items-center justify-center rounded-full"
              style={{
                width: 72,
                height: 72,
                backgroundColor: "rgba(0,0,0,0.5)",
                backdropFilter: "blur(8px)",
                WebkitBackdropFilter: "blur(8px)",
              }}
            >
              <svg width="32" height="32" viewBox="0 0 24 24" fill="white">
                <rect x="6" y="4" width="4" height="16" rx="1" />
                <rect x="14" y="4" width="4" height="16" rx="1" />
              </svg>
            </div>
          </div>
        )}

        {/* ── Gradients (pointer-events-none so they don't eat taps) ── */}
        <div
          className="absolute inset-x-0 top-0 z-20 pointer-events-none"
          style={{
            height: 120,
            background:
              "linear-gradient(to bottom,rgba(0,0,0,0.55),transparent)",
          }}
        />
        <div
          className="absolute inset-x-0 bottom-0 z-20 pointer-events-none"
          style={{
            height: 220,
            background: "linear-gradient(to top,rgba(0,0,0,0.75),transparent)",
          }}
        />

        {/* ── Back button (z-30) ── */}
        <button
          onClick={() => setStep("options")}
          className="absolute z-30 flex items-center gap-1"
          style={{
            top: `calc(48px + ${safeTop})`,
            left: 16,
            color: "white",
            fontSize: "var(--text-sm)",
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

        {/* ── Caption ── */}
        <div
          className="absolute z-30 left-4 right-4"
          style={{ bottom: `calc(160px + ${safeBottom})` }}
        >
          {title && (
            <p
              className="font-semibold text-white mb-1"
              style={{ fontSize: "var(--text-md)" }}
            >
              {title}
            </p>
          )}
          {caption && (
            <p
              className="text-white/80 line-clamp-2"
              style={{ fontSize: "var(--text-sm)" }}
            >
              {caption}
            </p>
          )}
          {hashtags.length > 0 && (
            <p
              className="mt-1"
              style={{
                fontSize: "var(--text-sm)",
                color: "rgb(var(--brand-primary))",
              }}
            >
              {hashtags.map((t) => `#${t}`).join(" ")}
            </p>
          )}
        </div>

        {/* ── Progress scrubber ── */}
        <div
          className="absolute z-30 inset-x-4"
          style={{ bottom: `calc(120px + ${safeBottom})` }}
        >
          {/* Time labels */}
          <div
            className="flex justify-between mb-1.5"
            style={{ fontSize: 10, color: "rgba(255,255,255,0.7)" }}
          >
            <span>{fmt(currentTime)}</span>
            <span>{fmt(duration)}</span>
          </div>

          {/* Track — touch + mouse scrub */}
          <div
            ref={scrubBarRef}
            className="relative w-full rounded-full cursor-pointer"
            style={{ height: 3, backgroundColor: "rgba(255,255,255,0.3)" }}
            onClick={(e) => {
              e.stopPropagation();
              seekTo(e.clientX);
            }}
            onMouseDown={(e) => {
              e.stopPropagation();
              onScrubStart(e.clientX);
            }}
            onMouseMove={(e) => {
              if (scrubbing) {
                e.stopPropagation();
                onScrubMove(e.clientX);
              }
            }}
            onMouseUp={(e) => {
              e.stopPropagation();
              onScrubEnd();
            }}
            onTouchStart={(e) => {
              e.stopPropagation();
              onScrubStart(e.touches[0].clientX);
            }}
            onTouchMove={(e) => {
              e.stopPropagation();
              onScrubMove(e.touches[0].clientX);
            }}
            onTouchEnd={(e) => {
              e.stopPropagation();
              onScrubEnd();
            }}
          >
            {/* Fill */}
            <div
              className="absolute left-0 top-0 h-full rounded-full"
              style={{ width: `${progress * 100}%`, backgroundColor: "white" }}
            />
            {/* Thumb */}
            <div
              className="absolute top-1/2 -translate-y-1/2 rounded-full bg-white shadow"
              style={{
                width: scrubbing ? 14 : 10,
                height: scrubbing ? 14 : 10,
                left: `calc(${progress * 100}% - ${scrubbing ? 7 : 5}px)`,
                transition: scrubbing ? "none" : "width 0.1s, height 0.1s",
              }}
            />
          </div>
        </div>

        {/* ── Action buttons ── */}
        <div
          className="absolute z-30 inset-x-0 flex gap-3 px-4"
          style={{ bottom: `calc(32px + ${safeBottom})` }}
        >
          <button
            onClick={handleSaveDraft}
            disabled={saving || publishing}
            className="flex-1 h-13 rounded-2xl font-semibold flex items-center justify-center gap-2 active:scale-[0.97] transition-transform"
            style={{
              backgroundColor: "rgba(255,255,255,0.15)",
              backdropFilter: "blur(12px)",
              WebkitBackdropFilter: "blur(12px)",
              border: "1px solid rgba(255,255,255,0.25)",
              color: "white",
              fontSize: "var(--text-base)",
            }}
          >
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none">
              <path
                d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2Z"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinejoin="round"
              />
              <path
                d="M17 21v-8H7v8M7 3v5h8"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinejoin="round"
              />
            </svg>
            Save draft
          </button>
          <button
            onClick={handlePublish}
            disabled={publishing || saving}
            className="flex-1 h-13 rounded-2xl font-semibold flex items-center justify-center gap-2 active:scale-[0.97] transition-transform"
            style={{
              background: publishing
                ? "rgba(255,255,255,0.2)"
                : "linear-gradient(135deg,rgb(var(--brand-primary)),rgb(var(--brand-secondary)))",
              color: "white",
              fontSize: "var(--text-base)",
              boxShadow: publishing
                ? "none"
                : "0 4px 20px rgb(var(--brand-primary)/0.5)",
              opacity: publishing ? 0.7 : 1,
            }}
          >
            {publishing ? (
              <MiniSpinner />
            ) : (
              <>
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
                Post
              </>
            )}
          </button>
        </div>

        {/* Error */}
        {error && (
          <div
            className="absolute z-30 inset-x-4 rounded-xl px-4 py-3"
            style={{
              bottom: `calc(120px + ${safeBottom})`,
              backgroundColor: "rgb(var(--color-error)/0.9)",
              color: "white",
              fontSize: "var(--text-sm)",
            }}
          >
            {error}
          </div>
        )}
      </div>
    );
  }

  // ── IMAGES — card layout ───────────────────────────────────────────────────
  return (
    <div className="flex flex-col h-full">
      {/* Header */}
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
        {/* Post preview card */}
        <div
          className="rounded-2xl overflow-hidden"
          style={{
            border: "1px solid rgb(var(--color-border))",
            backgroundColor: "rgb(var(--color-bg-elevated))",
          }}
        >
          {/* Media */}
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
              <div
                className="absolute top-3 right-3 rounded-full px-2.5 py-1"
                style={{
                  backgroundColor: "rgb(0 0 0 / 0.55)",
                  backdropFilter: "blur(8px)",
                }}
              >
                <span
                  style={{
                    color: "white",
                    fontSize: "var(--text-xs)",
                    fontWeight: 600,
                  }}
                >
                  1/{mediaItems.length}
                </span>
              </div>
            )}
          </div>

          {/* Content */}
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
                style={{
                  fontSize: "var(--text-base)",
                  color: "rgb(var(--color-text-muted))",
                  lineHeight: 1.5,
                }}
                className="line-clamp-2"
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

        {/* Meta */}
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

      {/* Bottom actions — Save draft | Post */}
      <div className="px-4 pb-6 flex gap-3 shrink-0">
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
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none">
                <path
                  d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2Z"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinejoin="round"
                />
                <path
                  d="M17 21v-8H7v8M7 3v5h8"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinejoin="round"
                />
              </svg>
              Save draft
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
              Post
            </>
          )}
        </button>
      </div>
    </div>
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

/** Format seconds → m:ss */
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
