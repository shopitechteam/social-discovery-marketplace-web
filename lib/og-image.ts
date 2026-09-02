/**
 * Helpers for the `next/og` share cards.
 *
 * ImageResponse renders through satori, which decodes PNG, JPEG and GIF only —
 * it has no WebP/AVIF decoder. Shopi serves most avatars and several R2 media
 * variants as .webp, and satori draws those as an empty box rather than
 * failing loudly, which is how seller cards ended up with a blank avatar
 * circle. Filter sources through these helpers so an undecodable image falls
 * back to the branded placeholder instead.
 */

const DECODABLE = /\.(png|jpe?g|gif)(\?|#|$)/i;

/** The URL if satori can decode it, otherwise null. */
export function ogDecodableImage(url?: string | null): string | null {
  const trimmed = url?.trim();
  if (!trimmed) return null;
  return DECODABLE.test(trimmed) ? trimmed : null;
}

/** The first candidate satori can decode. */
export function firstOgDecodableImage(
  candidates: (string | null | undefined)[],
): string | null {
  for (const candidate of candidates) {
    const usable = ogDecodableImage(candidate);
    if (usable) return usable;
  }
  return null;
}
