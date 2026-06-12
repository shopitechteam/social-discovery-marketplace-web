"use client";

import { useEffect, useRef, useState } from "react";
import { Pause, Play, Volume2, VolumeX } from "lucide-react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { useHlsVideo } from "@/lib/useHlsVideo";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  hlsUrl: string | null;
  poster?: string | null;
  title?: string | null;
}

/**
 * A shadcn Dialog hosting an HLS video player with play/pause, mute/unmute, and
 * a scrubbable progress bar. Used to preview TikTok import-queue videos.
 */
export function HlsVideoDialog({ open, onOpenChange, hlsUrl, poster, title }: Props) {
  const [paused, setPaused] = useState(false);
  const [muted, setMuted] = useState(true);
  const [progress, setProgress] = useState(0); // 0–1
  const [duration, setDuration] = useState(0);

  // Only feed the URL to the player while the dialog is open so HLS tears down
  // when closed (the hook keys its init effect on hlsUrl).
  const { videoRef, buffering } = useHlsVideo(open ? hlsUrl : null, open, paused);

  // Reset transient UI whenever a new video opens. Done during render (React's
  // recommended pattern for deriving state from props) rather than in an effect.
  const lastKeyRef = useRef<string | null>(null);
  const openKey = open ? hlsUrl : null;
  if (openKey !== lastKeyRef.current) {
    lastKeyRef.current = openKey;
    if (paused) setPaused(false);
    if (progress !== 0) setProgress(0);
  }

  // Keep the muted attribute in sync (autoplay requires muted on most browsers)
  useEffect(() => {
    const v = videoRef.current;
    if (v) v.muted = muted;
  }, [muted, videoRef]);

  // Track playback progress
  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    const onTime = () => {
      setDuration(v.duration || 0);
      setProgress(v.duration ? v.currentTime / v.duration : 0);
    };
    v.addEventListener("timeupdate", onTime);
    v.addEventListener("loadedmetadata", onTime);
    return () => {
      v.removeEventListener("timeupdate", onTime);
      v.removeEventListener("loadedmetadata", onTime);
    };
  }, [videoRef, open]);

  function togglePlay() {
    setPaused((p) => !p);
  }

  function seek(e: React.MouseEvent<HTMLDivElement>) {
    const v = videoRef.current;
    if (!v || !duration) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const ratio = Math.min(Math.max((e.clientX - rect.left) / rect.width, 0), 1);
    v.currentTime = ratio * duration;
    setProgress(ratio);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[420px] overflow-hidden border-0 bg-black p-0">
        {/* DialogContent renders its own close button (top-right) */}
        <DialogTitle className="sr-only">{title ?? "Video preview"}</DialogTitle>

        <div className="relative" style={{ aspectRatio: "9/16" }}>
          {/* Video */}
          <video
            ref={videoRef}
            poster={poster ?? undefined}
            playsInline
            muted={muted}
            loop
            className="h-full w-full bg-black object-contain"
            onClick={togglePlay}
          />

          {/* Buffering spinner */}
          {buffering && (
            <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
              <span className="h-8 w-8 animate-spin rounded-full border-2 border-white/30 border-t-white" />
            </div>
          )}

          {/* Center play/pause hit-area indicator (only when paused) */}
          {paused && (
            <button
              type="button"
              onClick={togglePlay}
              className="absolute inset-0 z-10 flex items-center justify-center"
              aria-label="Play"
            >
              <span className="flex h-16 w-16 items-center justify-center rounded-full bg-black/45">
                <Play size={30} fill="currentColor" strokeWidth={0} className="ml-1 text-white" />
              </span>
            </button>
          )}

          {/* Bottom controls */}
          <div className="absolute inset-x-0 bottom-0 z-20 flex items-center gap-3 bg-gradient-to-t from-black/70 to-transparent px-3 pb-3 pt-6">
            <button
              type="button"
              onClick={togglePlay}
              className="shrink-0 text-white"
              aria-label={paused ? "Play" : "Pause"}
            >
              {paused ? (
                <Play size={20} fill="currentColor" strokeWidth={0} />
              ) : (
                <Pause size={20} fill="currentColor" strokeWidth={0} />
              )}
            </button>

            {/* Progress bar */}
            <div
              className="group relative h-3 flex-1 cursor-pointer"
              onClick={seek}
            >
              <div className="absolute top-1/2 h-1 w-full -translate-y-1/2 rounded-full bg-white/30">
                <div
                  className="h-full rounded-full bg-white"
                  style={{ width: `${progress * 100}%` }}
                />
              </div>
            </div>

            <button
              type="button"
              onClick={() => setMuted((m) => !m)}
              className="shrink-0 text-white"
              aria-label={muted ? "Unmute" : "Mute"}
            >
              {muted ? <VolumeX size={20} /> : <Volume2 size={20} />}
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
