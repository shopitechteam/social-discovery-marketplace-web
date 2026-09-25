import type { StoryFieldsFragment } from "@/types/__generated__/graphql";

/**
 * A small still of a story, for its circle in the tray — WhatsApp-style, the
 * story itself rather than the poster's avatar.
 *
 * Photos use their 160px thumb variant. Videos ask Mux for a square, smart-
 * cropped frame a second in (the very first frame is often black), sized for
 * the circle rather than the 720px poster.
 */
export function storyThumbnail(story: StoryFieldsFragment): string | null {
  const { media } = story;
  if (media.mediaType === "VIDEO" && media.muxPlaybackId) {
    const time = (media.duration ?? 2) >= 2 ? 1 : 0;
    return `https://image.mux.com/${media.muxPlaybackId}/thumbnail.webp?width=240&height=240&fit_mode=smartcrop&time=${time}`;
  }
  return media.thumbnailUrl ?? media.imageUrl ?? null;
}
