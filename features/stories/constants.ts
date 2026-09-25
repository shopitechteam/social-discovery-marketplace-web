/**
 * Longest a video story plays. The API cuts longer uploads to their first 60s
 * (a Mux clip), and the viewer stops here too — so a story is never longer,
 * even if the cut couldn't be made. Keep in step with MAX_STORY_VIDEO_SECONDS
 * in the API's story.constants.ts.
 */
export const MAX_STORY_VIDEO_SECONDS = 60;

/** How long a photo story stays on screen. */
export const IMAGE_STORY_MS = 5_000;

/** Longest caption the API accepts. */
export const MAX_STORY_CAPTION = 200;

export const MAX_STORY_IMAGE_BYTES = 25 * 1024 * 1024;
export const MAX_STORY_VIDEO_BYTES = 500 * 1024 * 1024;
