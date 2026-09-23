type SluggableContent = {
  id: string;
  title?: string | null;
  slug?: string | null;
};

export function slugifyContentTitle(title?: string | null): string {
  const slug = (title ?? "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

  return slug || "listing";
}

/**
 * The URL segment identifying a piece of content.
 *
 * Prefers the stored slug. Falls back to `slugified-title-id`, which the API
 * also resolves (findByIdOrSlug matches a trailing ObjectId), so a post whose
 * slug has not been backfilled yet still gets a readable, working URL rather
 * than a bare id.
 */
export function contentSlugSegment(content: SluggableContent): string {
  return (
    content.slug?.trim() || `${slugifyContentTitle(content.title)}-${content.id}`
  );
}

export function contentPath(lang: string, content: SluggableContent): string {
  return `/${lang}/content/${contentSlugSegment(content)}`;
}

export function absoluteContentUrl(
  origin: string,
  lang: string,
  content: SluggableContent,
): string {
  return `${origin}${contentPath(lang, content)}`;
}

/**
 * The immersive video viewer's URL. Slug-based for the same SEO reason the
 * listing page is: a readable, keyword-bearing path indexes far better than an
 * opaque id, and both forms resolve server-side so old id links keep working
 * (the route redirects them here permanently).
 */
export function videoPath(lang: string, content: SluggableContent): string {
  return `/${lang}/video/${contentSlugSegment(content)}`;
}

/**
 * The slug out of a `/{lang}/video/{slug}` pathname, or null for anything else.
 *
 * The immersive viewer rewrites the address bar as the user swipes, so the URL
 * is the only record of which video they were actually on — Next's router tree
 * keeps pointing at the one the route was opened with. Reading the slug back
 * out is how the viewer recovers its position when it is restored.
 */
export function videoSlugFromPath(pathname: string): string | null {
  const match = /^\/[^/]+\/video\/([^/?#]+)/.exec(pathname);
  return match ? decodeURIComponent(match[1]) : null;
}

export function absoluteVideoUrl(
  origin: string,
  lang: string,
  content: SluggableContent,
): string {
  return `${origin}${videoPath(lang, content)}`;
}
