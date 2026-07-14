"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Play a video, surviving the browser's autoplay policy. An UNMUTED autoplay
 * (e.g. the next in-view feed video after the user has unmuted) can be rejected
 * when there isn't fresh user activation — which would leave the video stuck
 * paused. So on rejection we retry MUTED (always allowed), then attempt to
 * restore sound once it's actually playing. Net effect: in-view videos always
 * autoplay, and stay unmuted whenever the browser permits — TikTok/IG behaviour.
 *
 * `onMutedChange` is fired whenever we end up forcing the element muted against
 * the caller's wishes (autoplay was blocked unmuted). The caller uses it to keep
 * its own mute UI/state in sync with the element's REAL muted state — otherwise
 * the speaker icon shows "unmuted" while the video plays silently, and the user
 * has to tap twice to actually get sound.
 */
function playWithUnmuteFallback(
  v: HTMLVideoElement,
  onMutedChange?: (muted: boolean) => void,
): void {
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
          onMutedChange?.(true);
          v.play().catch(() => {});
        });
      })
      .catch(() => {
        // Couldn't unmute at all — we're stuck playing muted. Tell the caller so
        // its mute state matches reality (single tap then unmutes correctly).
        onMutedChange?.(true);
      });
  });
}

export function useHlsVideo(
  hlsUrl: string | null,
  active: boolean,
  paused = false,
  onMutedChange?: (muted: boolean) => void,
) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [buffering, setBuffering] = useState(false);
  const [playing, setPlaying] = useState(false);
  const activeRef = useRef(active);
  const pausedRef = useRef(paused);
  // Keep the latest callback in a ref so passing an inline fn doesn't re-run the
  // init effect (which would tear down and re-create the hls.js player).
  const onMutedChangeRef = useRef(onMutedChange);
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
  useEffect(() => { onMutedChangeRef.current = onMutedChange; }, [onMutedChange]);

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

    // Does this browser play HLS natively (iOS/macOS Safari)? If so we must NOT
    // do the "empty source + load()" reset below: on iOS, calling load() on a
    // src-less element and THEN reassigning src wedges the native media loader
    // at networkState=2/readyState=0 — it starts loading and never commits to
    // the new source (the video spins forever, no error). We also skip the
    // hls.js dynamic import entirely on that path (it's unsupported there), so
    // playback isn't delayed behind a chunk download that can't help.
    const canNativeHls = v.canPlayType("application/vnd.apple.mpegurl") !== "";

    // Reset video element state fully before attaching new source. Native HLS
    // gets a direct, single src assignment instead (see below).
    v.pause();
    if (!canNativeHls) {
      v.removeAttribute("src");
      v.load();
    }

    const onWaiting = () => { if (!destroyed) setBuffering(true); };
    const onPlaying = () => {
      if (!destroyed) {
        setPlaying(true);
        setBuffering(false);
      }
    };
    const onPause = () => { if (!destroyed) setPlaying(false); };
    const onCanPlay = () => { if (!destroyed) setBuffering(false); };
    v.addEventListener("waiting", onWaiting);
    v.addEventListener("playing", onPlaying);
    v.addEventListener("pause", onPause);
    v.addEventListener("canplay", onCanPlay);
    queueMicrotask(() => {
      if (!destroyed) setPlaying(false);
    });

    // ── iOS/macOS Safari: attach native HLS synchronously ────────────────────
    // Handle the native path FIRST, before (and without) the async hls.js
    // import. A single, direct src assignment + one load() is all iOS needs and
    // all it tolerates — see canNativeHls note above.
    if (canNativeHls) {
      // Cap the rendition so iOS starts on a SMALL segment → fast first frame.
      // Unlike the hls.js path (startLevel:0 + capLevelToPlayerSize), the native
      // player has no such control and will otherwise pick a high rendition and
      // buffer a large chunk before playing. 540p is plenty in the small feed
      // box and keeps startup snappy. Mux serves this via ?max_resolution.
      const nativeUrl = url.includes("?")
        ? `${url}&max_resolution=540p`
        : `${url}?max_resolution=540p`;
      v.src = nativeUrl;
      v.load();
      readyRef.current = true;
      if (activeRef.current && !pausedRef.current) {
        playWithUnmuteFallback(v, onMutedChangeRef.current);
      }
    }

    async function init() {
      // Native HLS was already wired up synchronously above; nothing to do here.
      if (canNativeHls) return;

      // Mux commonly publishes audio as a separate EXT-X-MEDIA rendition.
      // The hls.js light build omits AudioStreamController, so it can display
      // those videos but cannot produce sound when the user unmutes them.
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
            playWithUnmuteFallback(v, onMutedChangeRef.current);
          }
        });

        hls.on(Hls.Events.FRAG_BUFFERED, () => {
          if (!destroyed) setBuffering(false);
        });

        // A fatal error must NOT just destroy the player — that leaves the
        // buffer spinner up forever (the `waiting` event already set it) and
        // playback never recovers. On weaker networks (typically a physical
        // phone on cellular, not a fast laptop) a manifest/fragment load can
        // exhaust its retries and go fatal; hls.js can recover from those.
        // Follow hls.js's recommended recovery: retry the network for network
        // errors, swap the decode pipeline for media errors, and only give up
        // after a couple of failed recovery attempts.
        let recoverAttempts = 0;
        hls.on(Hls.Events.ERROR, (_e, data) => {
          if (!data.fatal || destroyed) return;
          if (data.type === Hls.ErrorTypes.NETWORK_ERROR) {
            // Kick the loaders back off; also clear the spinner so a transient
            // stall doesn't leave it stuck if the retry succeeds silently.
            hls?.startLoad();
            setBuffering(false);
            return;
          }
          if (data.type === Hls.ErrorTypes.MEDIA_ERROR && recoverAttempts < 2) {
            recoverAttempts += 1;
            hls?.recoverMediaError();
            return;
          }
          // Unrecoverable — tear down and clear buffering so the spinner
          // doesn't spin forever over a dead player.
          hls?.destroy();
          setBuffering(false);
        });
      }
      // Native HLS is handled synchronously before this async init (see above).
    }

    init();

    return () => {
      destroyed = true;
      readyRef.current = false;
      v.removeEventListener("waiting", onWaiting);
      v.removeEventListener("playing", onPlaying);
      v.removeEventListener("pause", onPause);
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
      playWithUnmuteFallback(vid, onMutedChangeRef.current);
    } else {
      if (!active) {
        if (readyRef.current) vid.pause();
        Promise.resolve().then(() => {
          setBuffering(false);
          setPlaying(false);
        });
        return;
      }
      if (!readyRef.current) return;
      vid.pause();
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

  return { videoRef, buffering, playing };
}
