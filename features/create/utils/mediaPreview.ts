import type { MediaItem } from "@/stores/create";

export function getMediaPreviewSrc(item: MediaItem | null | undefined): string | null {
  return item?.thumbnailUrl || item?.localUri || null;
}

export function shouldUnoptimizeMedia(src: string | null | undefined): boolean {
  return !!src && (src.startsWith("blob:") || src.startsWith("http"));
}
