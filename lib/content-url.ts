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

export function contentPath(lang: string, content: SluggableContent): string {
  const segment =
    content.slug?.trim() ||
    `${slugifyContentTitle(content.title)}-${content.id}`;
  return `/${lang}/content/${segment}`;
}

export function absoluteContentUrl(
  origin: string,
  lang: string,
  content: SluggableContent,
): string {
  return `${origin}${contentPath(lang, content)}`;
}
