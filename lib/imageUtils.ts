/**
 * Domains configured in next.config.ts remotePatterns.
 * Next.js Image optimization only works for these — everything else
 * must use unoptimized={true} or the image will fail to load.
 */
const ALLOWED_HOSTNAMES = [
  "image.mux.com",
  "storage.shopi.co.ke",
  "media.shopi.co.ke",
  "lh3.googleusercontent.com",
];

const ALLOWED_WILDCARD_SUFFIXES = [".tiktokcdn.com", ".tiktokcdn-us.com"];

export function isAllowedImageHost(src: string): boolean {
  try {
    const { hostname, protocol } = new URL(src);
    if (protocol !== "https:") return false;
    if (ALLOWED_HOSTNAMES.includes(hostname)) return true;
    return ALLOWED_WILDCARD_SUFFIXES.some((s) => hostname.endsWith(s));
  } catch {
    return false;
  }
}

/** Pass as unoptimized prop — true for blobs, unknown CDNs, gifs */
export function shouldUnoptimize(src: string | null | undefined): boolean {
  if (!src) return false;
  if (src.startsWith("blob:") || src.startsWith("data:")) return true;
  if (src.endsWith(".gif")) return true;
  return !isAllowedImageHost(src);
}
