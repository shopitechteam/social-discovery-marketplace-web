import type { MediaItem } from "@/stores/create";

export function getMediaPreviewSrc(item: MediaItem | null | undefined): string | null {
  if (!item) return null;

  return (
    item.localUri ||
    item.r2Variants?.find((v) => v.variant === "original")?.url ||
    item.r2Variants?.find((v) => v.variant === "large")?.url ||
    item.r2Variants?.find((v) => v.variant === "medium")?.url ||
    item.r2Variants?.[0]?.url ||
    item.thumbnailUrl ||
    null
  );
}

export function shouldUnoptimizeMedia(src: string | null | undefined): boolean {
  return !!src && (src.startsWith("blob:") || src.startsWith("http"));
}
