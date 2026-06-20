"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Play a video, surviving the browser's autoplay policy. An UNMUTED autoplay
 * (e.g. the next in-view feed video after the user has unmuted) can be rejected
 * when there isn't fresh user activation — which would leave the video stuck
 * paused. So on rejection we retry MUTED (always allowed), then attempt to
 * restore sound once it's actually playing. Net effect: in-view videos always
 * autoplay, and stay unmuted whenever the browser permits — TikTok/IG behaviour.
 */
function playWithUnmuteFallback(v: HTMLVideoElement): void {
  const wantedMuted = v.muted;
  v.play().catch(() => {
    if (wantedMuted) return; // already muted and still blocked — nothing to do
    // Retry muted so it at least plays, then try to unmute again.
    v.muted = true;
    v.play()
      .then(() => {
        // Restore the user's unmuted intent now that playback has started.
        v.muted = false;
        // If unmuting re-pauses it (rare), fall back to muted playback.
        v.play().catch(() => {
          v.muted = true;
          v.play().catch(() => {});
        });
      })
      .catch(() => {});
  });
}

export function useHlsVideo(
  hlsUrl: string | null,
  active: boolean,
  paused = false,
) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [buffering, setBuffering] = useState(false);
  const activeRef = useRef(active);
  const pausedRef = useRef(paused);
  // Track whether HLS has parsed the manifest so we can play/pause safely
  const readyRef = useRef(false);
  // Bumped to force a re-init of the HLS source. Needed when the component is
  // kept alive across a route change: the cleanup below destroys the hls.js
  // instance and strips the <video> src, but the init effect won't re-run on
  // its own because hlsUrl is unchanged — leaving the player dead (tap-to-play
  // does nothing) until a full refresh. The recovery effect bumps this when we
  // want to play but the manifest isn't ready, re-attaching the source.
  const [reinitKey, setReinitKey] = useState(0);

  // Keep refs in sync without re-running the init effect
  useEffect(() => { activeRef.current = active; }, [active]);
  useEffect(() => { pausedRef.current = paused; }, [paused]);

  // ── Init: load HLS source, wire buffering events, trigger first play ────────
  // IMPORTANT: only attach hls.js (which immediately downloads the manifest and
  // prebuffers segments) when the video is ACTIVE (in view). Otherwise every
  // mounted card off-screen would start pulling .m4s chunks — wasting huge
  // amounts of data. When the card leaves view (active=false) the cleanup tears
  // the player down, stopping all downloads. Only the visible video streams,
  // exactly like TikTok.
  useEffect(() => {
    const vid = videoRef.current;
    if (!vid || !hlsUrl || !active) return;

    const v = vid;
    const url = hlsUrl;
    readyRef.current = false;

    let hls: import("hls.js").default | null = null;
    let destroyed = false;

    // Reset video element state fully before attaching new source
    v.pause();
    v.removeAttribute("src");
    v.load();

    const onWaiting = () => { if (!destroyed) setBuffering(true); };
    const onPlaying = () => { if (!destroyed) setBuffering(false); };
    const onCanPlay = () => { if (!destroyed) setBuffering(false); };
    v.addEventListener("waiting", onWaiting);
    v.addEventListener("playing", onPlaying);
    v.addEventListener("canplay", onCanPlay);

    async function init() {
      const Hls = (await import("hls.js")).default;
      if (destroyed) return;

      if (Hls.isSupported()) {
        hls = new Hls({
          startLevel: 0,           // lowest quality first → first frame fastest
          capLevelToPlayerSize: true,
          maxBufferLength: 10,
          maxMaxBufferLength: 30,
          maxBufferSize: 20 * 1024 * 1024,
          backBufferLength: 4,
          abrEwmaFastLive: 3,
          abrEwmaSlowLive: 9,
          abrBandWidthFactor: 0.8,
          manifestLoadingTimeOut: 6000,
          manifestLoadingMaxRetry: 3,
          manifestLoadingRetryDelay: 500,
          fragLoadingTimeOut: 10000,
          fragLoadingMaxRetry: 3,
          nudgeMaxRetry: 5,
          nudgeOffset: 0.2,
        });

        hls.loadSource(url);
        hls.attachMedia(v);

        hls.on(Hls.Events.MANIFEST_PARSED, () => {
          if (destroyed) return;
          readyRef.current = true;
          if (activeRef.current && !pausedRef.current) {
            playWithUnmuteFallback(v);
          }
        });

        hls.on(Hls.Events.FRAG_BUFFERED, () => {
          if (!destroyed) setBuffering(false);
        });

        hls.on(Hls.Events.ERROR, (_e, data) => {
          if (data.fatal && !destroyed) {
            hls?.destroy();
          }
        });
      } else if (v.canPlayType("application/vnd.apple.mpegurl")) {
        // Safari native HLS
        v.src = url;
        v.load();
        readyRef.current = true;
        if (activeRef.current && !pausedRef.current) {
          playWithUnmuteFallback(v);
        }
      }
    }

    init();

    return () => {
      destroyed = true;
      readyRef.current = false;
      v.removeEventListener("waiting", onWaiting);
      v.removeEventListener("playing", onPlaying);
      v.removeEventListener("canplay", onCanPlay);
      v.pause();
      v.removeAttribute("src");
      v.load();
      hls?.destroy();
      hls = null;
    };
    // `active` is a dep so the player initialises when the card enters view and
    // tears down (stopping downloads) when it leaves. reinitKey forces a
    // re-attach after the cleanup destroyed the player while the component
    // stayed mounted across a route change.
  }, [hlsUrl, active, reinitKey]);

  // ── Play / pause: only act once HLS has the manifest ────────────────────────
  useEffect(() => {
    const vid = videoRef.current;
    if (!vid) return;
    if (active && !paused) {
      // If the manifest isn't ready yet, the init effect (which runs whenever
      // `active` is true) will start playback on MANIFEST_PARSED — don't force a
      // redundant reinit here.
      if (!readyRef.current) return;
      playWithUnmuteFallback(vid);
    } else {
      if (!readyRef.current) return;
      vid.pause();
      if (!active) Promise.resolve().then(() => setBuffering(false));
    }
  }, [active, paused]);

  // ── Recovery: re-init if the player was torn down while we should be playing.
  // Covers bfcache restore / tab return where active didn't change so the
  // play/pause effect above never re-ran. Without this the video stays dead
  // until the user taps or refreshes.
  useEffect(() => {
    const recover = () => {
      if (
        document.visibilityState === "visible" &&
        activeRef.current &&
        !pausedRef.current &&
        !readyRef.current
      ) {
        setReinitKey((k) => k + 1);
      }
    };
    document.addEventListener("visibilitychange", recover);
    window.addEventListener("pageshow", recover);
    return () => {
      document.removeEventListener("visibilitychange", recover);
      window.removeEventListener("pageshow", recover);
    };
  }, []);

  return { videoRef, buffering };
}
