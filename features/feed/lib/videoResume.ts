/**
 * videoResume — where each video was left off, shared across surfaces.
 *
 * A module-level map rather than a store: it is transient per-session state
 * that nothing renders from, so it must never trigger a re-render. Feed cards
 * and immersive slides both read and write it, which is what makes the handoff
 * symmetric — open a video in the viewer and it resumes at the feed's frame,
 * close it and the card picks up wherever the viewer left off.
 */

const resumeTimes = new Map<string, number>();

/**
 * Remembers the current position, unless the video is at either edge: under a
 * quarter second in there is nothing worth restoring, and within half a second
 * of the end the next visit should start over rather than land on the last
 * frame.
 */
export function saveFeedVideoTime(
  contentId: string,
  video: HTMLVideoElement | null,
) {
  if (!video) return;
  const time = video.currentTime;
  if (!Number.isFinite(time) || time < 0.25) return;
  const duration = video.duration;
  if (Number.isFinite(duration) && duration > 0 && time >= duration - 0.5) {
    resumeTimes.delete(contentId);
    return;
  }
  resumeTimes.set(contentId, time);
}

export function restoreFeedVideoTime(
  contentId: string,
  video: HTMLVideoElement | null,
) {
  if (!video) return;
  const time = resumeTimes.get(contentId);
  if (!time || Math.abs(video.currentTime - time) < 0.4) return;
  try {
    video.currentTime = time;
  } catch {
    // Some native HLS implementations reject seeks before enough metadata loads.
  }
}

export function clearFeedVideoTime(contentId: string) {
  resumeTimes.delete(contentId);
}

export function peekFeedVideoTime(contentId: string): number {
  return resumeTimes.get(contentId) ?? 0;
}
