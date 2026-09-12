/**
 * Helpers for the `next/og` share cards.
 *
 * ImageResponse renders through satori, which decodes PNG, JPEG and GIF only —
 * it has no WebP or AVIF decoder, and it draws an undecodable source as an
 * empty box rather than failing loudly.
 *
 * Shopi's image host (images.shopi.co.ke) serves *every* variant as .webp —
 * large.webp, original.webp, thumb.webp — and offers no format parameter, so
 * the original "pick a candidate satori can decode" approach found nothing to
 * pick and every share card fell back to its placeholder. Listings shared to
 * WhatsApp showed a shopping-bag emoji where the product photo should be.
 *
 * So we decode it ourselves: fetch the bytes, re-encode to JPEG with sharp, and
 * hand satori a data URI. Everything is best-effort — any failure returns null
 * and the caller's placeholder stands, because a card with no photo still beats
 * a route that 500s and leaves the share with no image at all.
 */

/** Formats satori can decode without help. */
const DECODABLE = /\.(png|jpe?g|gif)(\?|#|$)/i;

/** The URL if satori can decode it from the extension alone, otherwise null. */
export function ogDecodableImage(url?: string | null): string | null {
  const trimmed = url?.trim();
  if (!trimmed) return null;
  return DECODABLE.test(trimmed) ? trimmed : null;
}

/** The first candidate satori can decode from its extension. */
export function firstOgDecodableImage(
  candidates: (string | null | undefined)[],
): string | null {
  for (const candidate of candidates) {
    const usable = ogDecodableImage(candidate);
    if (usable) return usable;
  }
  return null;
}

/** First non-empty candidate, whatever its format. */
function firstUrl(candidates: (string | null | undefined)[]): string | null {
  for (const candidate of candidates) {
    const trimmed = candidate?.trim();
    if (trimmed) return trimmed;
  }
  return null;
}

/**
 * Re-encode a rendered card as JPEG.
 *
 * `ImageResponse` only ever emits PNG, which is the wrong codec for a card that
 * is three-quarters photograph: the listing card measured 64 KB with the
 * placeholder and 791 KB once a real photo was drawn into it. WhatsApp is
 * unreliable about fetching link images much above a couple of hundred KB, so
 * the photo fix would have swapped a missing image for a missing preview. JPEG
 * brings the same card back under 150 KB.
 *
 * Falls back to the original PNG response if the re-encode fails, because a
 * heavy card still previews on most platforms and a 500 previews on none.
 */
export async function ogJpegResponse(
  rendered: Response,
  { quality = 86 }: { quality?: number } = {},
): Promise<Response> {
  try {
    const png = Buffer.from(await rendered.clone().arrayBuffer());
    const sharp = (await import("sharp")).default;
    const jpeg = await sharp(png).jpeg({ quality, mozjpeg: true }).toBuffer();

    return new Response(new Uint8Array(jpeg), {
      headers: {
        "Content-Type": "image/jpeg",
        // Matches the route's own `revalidate`, and lets a CDN keep serving
        // the old card while a new one is generated.
        "Cache-Control":
          "public, max-age=3600, s-maxage=3600, stale-while-revalidate=86400",
      },
    });
  } catch {
    return rendered;
  }
}

/** Give up on a slow image host rather than hanging the whole card render. */
const FETCH_TIMEOUT_MS = 4000;
/** Source images above this are not worth the decode for a 1200×630 card. */
const MAX_SOURCE_BYTES = 12 * 1024 * 1024;

/**
 * Fetch an image and return a data URI satori can draw, converting when needed.
 *
 * `box` is the space the image will occupy on the card. The source is resized
 * to cover it before encoding, which is what keeps the conversion cheap and the
 * data URI small — a full-size original re-encoded as JPEG would add hundreds of
 * kilobytes to a card that only ever displays it at card size.
 *
 * Returns null when there is nothing usable, so callers keep their fallback.
 */
export async function ogImageDataUri(
  candidates: (string | null | undefined)[],
  box: { width: number; height: number },
): Promise<string | null> {
  const url = firstUrl(candidates);
  if (!url) return null;

  try {
    const response = await fetch(url, {
      signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
      // The card is regenerated on its own revalidate cadence, so there is
      // nothing to gain from Next caching the upstream bytes as well.
      cache: "no-store",
    });
    if (!response.ok) return null;

    const declaredLength = Number(response.headers.get("content-length") ?? 0);
    if (declaredLength > MAX_SOURCE_BYTES) return null;

    const source = Buffer.from(await response.arrayBuffer());
    if (source.byteLength === 0 || source.byteLength > MAX_SOURCE_BYTES) {
      return null;
    }

    // sharp ships with Next for image optimisation, but it is a native module
    // and this route must not fall over if it is ever absent. Imported here
    // rather than at module scope so that failure is catchable, and so a
    // caller that only needs the URL helpers above does not pull it in.
    const sharp = (await import("sharp")).default;

    const jpeg = await sharp(source, { failOn: "none" })
      .rotate() // honour EXIF orientation before we discard the metadata
      .resize(box.width, box.height, { fit: "cover", position: "centre" })
      .jpeg({ quality: 82, mozjpeg: true })
      .toBuffer();

    return `data:image/jpeg;base64,${jpeg.toString("base64")}`;
  } catch {
    return null;
  }
}
