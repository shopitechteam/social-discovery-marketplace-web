/**
 * captureVideoFrames — grab a handful of still frames from a local video File
 * entirely in the browser (no upload, no Mux). Used to feed the instant AI
 * auto-fill for video posts: the moment a user picks a video we snapshot a few
 * frames and send them to the extraction endpoint, so title/description/category
 * come back immediately instead of waiting for Mux to finish processing.
 *
 * Frames are sampled at evenly-spaced fractions of the runtime (skipping the very
 * start/end, which are often black/intro/outro frames) and returned as JPEG Blobs
 * in temporal order.
 */

const DEFAULT_FRACTIONS = [0.1, 0.3, 0.5, 0.7, 0.9];
const MAX_DIMENSION = 640; // downscale long edge — keeps JPEGs small & upload fast
const JPEG_QUALITY = 0.7;

/**
 * In-memory cache of captured frames keyed by draftId. Lets us snapshot frames
 * at pick-time (where the File is available) and consume them later in the edit
 * step, decoupled from the background Mux upload. Not persisted — frames are
 * only needed within the same session, right after the video is chosen.
 */
const frameCache = new Map<string, Blob[]>();

export function setCachedVideoFrames(draftId: string, frames: Blob[]): void {
  frameCache.set(draftId, frames);
}

/**
 * Append frames for a draft — used by the image flow, where each picked image
 * contributes one frame and images can be added one at a time (gallery).
 */
export function appendCachedFrames(draftId: string, frames: Blob[]): void {
  const existing = frameCache.get(draftId) ?? [];
  frameCache.set(draftId, [...existing, ...frames]);
}

export function takeCachedVideoFrames(draftId: string): Blob[] | undefined {
  const frames = frameCache.get(draftId);
  if (frames) frameCache.delete(draftId); // one-shot: consumed once
  return frames;
}

/**
 * Downscale a picked image File to a small JPEG Blob — the image counterpart
 * of captureVideoFrames. Feeds the instant AI auto-fill so extraction starts
 * the moment the user picks a photo, with zero dependence on the R2 upload or
 * Sharp processing. Resolves null (never rejects) on undecodable files —
 * instant AI is best-effort and must not disturb the upload itself.
 */
export async function captureImageFrame(
  file: File,
  maxDimension: number = MAX_DIMENSION,
): Promise<Blob | null> {
  try {
    const bitmap = await createImageBitmap(file);
    try {
      const scale = Math.min(1, maxDimension / Math.max(bitmap.width, bitmap.height));
      const w = Math.max(1, Math.round(bitmap.width * scale));
      const h = Math.max(1, Math.round(bitmap.height * scale));

      const canvas = document.createElement("canvas");
      canvas.width = w;
      canvas.height = h;
      const ctx = canvas.getContext("2d");
      if (!ctx) return null;
      ctx.drawImage(bitmap, 0, 0, w, h);

      return await new Promise<Blob | null>((resolve) =>
        canvas.toBlob((blob) => resolve(blob), "image/jpeg", JPEG_QUALITY),
      );
    } finally {
      bitmap.close();
    }
  } catch {
    return null;
  }
}

export interface CaptureOptions {
  /** Fractions of the duration to sample (0..1). Defaults to 5 evenly-spaced. */
  fractions?: number[];
  /** Long-edge pixel cap for the captured frames. */
  maxDimension?: number;
}

/**
 * Capture frames from a video File. Resolves to an array of JPEG Blobs (may be
 * fewer than requested if some seeks fail). Never throws for individual frame
 * failures — it skips them. Rejects only if the video can't be loaded at all.
 */
export function captureVideoFrames(
  file: File,
  options: CaptureOptions = {},
): Promise<Blob[]> {
  const fractions = options.fractions ?? DEFAULT_FRACTIONS;
  const maxDim = options.maxDimension ?? MAX_DIMENSION;

  return new Promise<Blob[]>((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const video = document.createElement("video");
    video.muted = true;
    video.playsInline = true;
    video.preload = "auto";
    video.src = url;

    const cleanup = () => {
      URL.revokeObjectURL(url);
      video.removeAttribute("src");
      video.load();
    };

    const fail = (err: unknown) => {
      cleanup();
      reject(err instanceof Error ? err : new Error(String(err)));
    };

    video.onerror = () => fail(new Error("Could not load video for frame capture"));

    video.onloadedmetadata = async () => {
      const duration = video.duration;
      if (!duration || !Number.isFinite(duration) || duration <= 0) {
        // Some browsers report Infinity for blob durations until played a bit.
        // Fall back to a single frame at 0.
        try {
          const blob = await seekAndGrab(video, 0, maxDim);
          cleanup();
          resolve(blob ? [blob] : []);
        } catch (err) {
          fail(err);
        }
        return;
      }

      // Compute target timestamps, clamped inside the runtime.
      const times = fractions
        .map((f) => Math.min(duration - 0.05, Math.max(0, duration * f)))
        // de-dupe (very short clips can collapse fractions onto the same second)
        .filter((t, i, arr) => arr.indexOf(t) === i);

      const blobs: Blob[] = [];
      for (const t of times) {
        try {
          const blob = await seekAndGrab(video, t, maxDim);
          if (blob) blobs.push(blob);
        } catch {
          // skip a bad seek/frame — partial results are still useful
        }
      }
      cleanup();
      resolve(blobs);
    };
  });
}

/** Seek the video to `time` (seconds), wait for the frame, draw it to a canvas, return a JPEG Blob. */
function seekAndGrab(
  video: HTMLVideoElement,
  time: number,
  maxDim: number,
): Promise<Blob | null> {
  return new Promise<Blob | null>((resolve, reject) => {
    const onSeeked = () => {
      video.removeEventListener("seeked", onSeeked);
      try {
        const vw = video.videoWidth;
        const vh = video.videoHeight;
        if (!vw || !vh) {
          resolve(null);
          return;
        }
        const scale = Math.min(1, maxDim / Math.max(vw, vh));
        const w = Math.round(vw * scale);
        const h = Math.round(vh * scale);

        const canvas = document.createElement("canvas");
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext("2d");
        if (!ctx) {
          resolve(null);
          return;
        }
        ctx.drawImage(video, 0, 0, w, h);
        canvas.toBlob(
          (blob) => resolve(blob),
          "image/jpeg",
          JPEG_QUALITY,
        );
      } catch (err) {
        reject(err);
      }
    };

    video.addEventListener("seeked", onSeeked, { once: true });
    try {
      video.currentTime = time;
    } catch (err) {
      video.removeEventListener("seeked", onSeeked);
      reject(err);
    }
  });
}
