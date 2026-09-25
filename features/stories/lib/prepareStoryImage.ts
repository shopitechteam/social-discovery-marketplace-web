"use client";

/**
 * Shrink a story photo before it uploads.
 *
 * A phone photo is often 3–10 MB, and on mobile data that upload is most of
 * the wait between tapping Share and the story being live. The server keeps at
 * most a 1200px version anyway, so sending 1600px loses nothing and is usually
 * a tenth of the bytes.
 *
 * Anything that can't be decoded here (HEIC in Chrome, a corrupt file) or
 * wouldn't get smaller goes up untouched — the server handles it as before.
 */

const MAX_EDGE = 1600;
const QUALITY = 0.88;
/** Already small enough that re-encoding saves little. */
const SMALL_ENOUGH_BYTES = 600 * 1024;

export async function prepareStoryImage(file: File): Promise<File> {
  // Re-encoding would flatten an animated GIF to one frame.
  if (file.type === "image/gif" || file.size <= SMALL_ENOUGH_BYTES) return file;

  try {
    const bitmap = await createImageBitmap(file, { imageOrientation: "from-image" });
    const scale = Math.min(1, MAX_EDGE / Math.max(bitmap.width, bitmap.height));
    const width = Math.round(bitmap.width * scale);
    const height = Math.round(bitmap.height * scale);

    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d");
    if (!ctx) return file;
    // JPEG has no transparency; a transparent PNG gets white, not black.
    ctx.fillStyle = "#fff";
    ctx.fillRect(0, 0, width, height);
    ctx.drawImage(bitmap, 0, 0, width, height);
    bitmap.close();

    const blob = await new Promise<Blob | null>((resolve) =>
      canvas.toBlob(resolve, "image/jpeg", QUALITY),
    );
    if (!blob || blob.size >= file.size) return file;
    const name = file.name.replace(/\.[^.]+$/, "") || "story";
    return new File([blob], `${name}.jpg`, { type: "image/jpeg" });
  } catch {
    return file;
  }
}
