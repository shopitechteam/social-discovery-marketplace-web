"use client";

import { useCallback, useEffect, useRef, type RefObject } from "react";
import { gql } from "@apollo/client";
import { useMutation } from "@apollo/client/react";
import { shouldFire, hasFired } from "@/lib/interactionDedup";
import { clearFeedVideoTime } from "../lib/videoResume";

const TrackInteractionFeedDocument = gql`
  mutation TrackInteractionFeed(
    $contentId: String!
    $type: InteractionType!
    $watchDuration: Float
    $completionRate: Float
  ) {
    trackInteraction(
      input: {
        contentId: $contentId
        type: $type
        watchDuration: $watchDuration
        completionRate: $completionRate
      }
    )
  }
`;

/** Watched at least this long to count as engagement rather than a glance. */
const MIN_WATCH_SECONDS = 1;
/** Below half the runtime, leaving before the end reads as a skip. */
const SKIP_COMPLETION_RATIO = 0.5;

interface Options {
  videoRef: RefObject<HTMLVideoElement | null>;
  contentId: string;
  /** Whether this video currently owns playback. Going false ends the watch. */
  active: boolean;
  /** Called when the element fires `ended`, so the surface can show replay UI. */
  onEnded?: () => void;
}

/**
 * Watch-behaviour reporting for a single video element, shared by the feed card
 * and the immersive slide.
 *
 * One implementation on purpose: these events feed the seen-decay term in the
 * server's personalized ranking, so two surfaces measuring "watched" or
 * "skipped" differently would quietly skew the feed. `lib/interactionDedup` is
 * module-scoped, so a video watched in the feed and again in the viewer still
 * reports completion once.
 */
export function useVideoAnalytics({
  videoRef,
  contentId,
  active,
  onEnded,
}: Options) {
  const [trackInteraction] = useMutation(TrackInteractionFeedDocument);
  // Distinguishes the first finish from every later one. A replay is real
  // signal, so it is deliberately exempt from session dedup.
  const endedCountRef = useRef(0);
  const onEndedRef = useRef(onEnded);

  useEffect(() => {
    onEndedRef.current = onEnded;
  }, [onEnded]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleEnded = () => {
      clearFeedVideoTime(contentId);
      const duration = video.duration || 0;
      const watched = video.currentTime || duration;
      const completionRate = duration > 0 ? Math.min(watched / duration, 1) : 1;

      if (!Number.isFinite(video.duration) || video.duration <= 0) {
        // Metadata not yet loaded — completionRate falls back to 1 and won't
        // reflect real watch ratio. Surface it so it's catchable in dev.
        console.warn(
          `[useVideoAnalytics] video 'ended' fired without a valid duration for content ${contentId} ` +
            `(duration=${video.duration}); completionRate defaulted to ${completionRate}.`,
        );
      }

      endedCountRef.current += 1;
      const type =
        endedCountRef.current === 1 ? "VIDEO_COMPLETED" : "VIDEO_REPLAYED";
      if (shouldFire(contentId, type)) {
        trackInteraction({
          variables: {
            contentId,
            type,
            completionRate,
            watchDuration: watched,
          },
        }).catch(() => {});
      }
      onEndedRef.current?.();
    };

    video.addEventListener("ended", handleEnded);
    return () => video.removeEventListener("ended", handleEnded);
  }, [videoRef, contentId, trackInteraction]);

  // Leaving a video before halfway, having watched a real amount of it, is a
  // skip — unless it was already completed this session, where completion is
  // the stronger signal and wins.
  useEffect(() => {
    if (active) return;
    const video = videoRef.current;
    if (!video) return;

    const duration = video.duration || 0;
    const watched = video.currentTime || 0;
    if (
      duration > 0 &&
      watched >= MIN_WATCH_SECONDS &&
      watched < duration * SKIP_COMPLETION_RATIO &&
      !hasFired(contentId, "VIDEO_COMPLETED") &&
      shouldFire(contentId, "SKIPPED")
    ) {
      trackInteraction({
        variables: {
          contentId,
          type: "SKIPPED",
          watchDuration: watched,
          completionRate: watched / duration,
        },
      }).catch(() => {});
    }
  }, [active, videoRef, contentId, trackInteraction]);

  /** Reports a replay started from a UI control rather than the `ended` event. */
  const trackReplay = useCallback(() => {
    // VIDEO_REPLAYED is never session-deduped — each replay is distinct signal.
    trackInteraction({
      variables: { contentId, type: "VIDEO_REPLAYED" },
    }).catch(() => {});
  }, [contentId, trackInteraction]);

  return { trackReplay, endedCountRef };
}
