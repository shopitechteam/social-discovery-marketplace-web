/**
 * Generates a base64-encoded SVG shimmer placeholder for use with
 * Next.js <Image placeholder="blur" blurDataURL={shimmerDataURL(w, h)} />.
 *
 * Two variants:
 *   - light: for light-theme backgrounds (#f0f0f5 → #e4e4ef)
 *   - dark:  for dark-theme backgrounds  (#1e1e2a → #2a2a3a)
 *
 * We ship both and pick via CSS using a data-URI trick — but since
 * blurDataURL is a single string we use a mid-grey that looks acceptable
 * on both themes and is clearly visible as a loading state.
 */
function makeShimmer(w: number, h: number): string {
  // Mid-grey palette visible on both light and dark backgrounds
  const base = "#d1d1db";
  const highlight = "#e8e8f0";

  const svg = `<svg width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" xmlns="http://www.w3.org/2000/svg">
  <rect width="${w}" height="${h}" fill="${base}"/>
  <rect id="s" width="${w}" height="${h}" fill="url(#g)"/>
  <defs>
    <linearGradient id="g" x1="-100%" y1="0" x2="200%" y2="0">
      <stop offset="0%"   stop-color="${base}"/>
      <stop offset="50%"  stop-color="${highlight}"/>
      <stop offset="100%" stop-color="${base}"/>
      <animateTransform attributeName="gradientTransform" type="translate" from="-2 0" to="2 0" dur="1.2s" repeatCount="indefinite"/>
    </linearGradient>
  </defs>
</svg>`;

  // btoa works in both browser and Node (Next.js server)
  const b64 =
    typeof btoa !== "undefined"
      ? btoa(svg)
      : Buffer.from(svg).toString("base64");

  return `data:image/svg+xml;base64,${b64}`;
}

/** Square shimmer — image posts, gallery thumbnails. */
export const SHIMMER = makeShimmer(700, 700);

/** Portrait 9:16 shimmer — video cards, feed thumbnails. */
export const SHIMMER_PORTRAIT = makeShimmer(400, 711);

/** Small square shimmer — avatars (40–80 px). */
export const SHIMMER_AVATAR = makeShimmer(80, 80);
