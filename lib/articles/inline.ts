/**
 * The two inline marks article text supports: `[label](/path)` and `**bold**`.
 * Parsed here rather than with a Markdown library because that is all the
 * body copy needs, and the SEO audit uses the same parser to find and check
 * every inline link.
 */

export type InlineToken =
  | { type: "text"; text: string }
  | { type: "bold"; text: string }
  | { type: "link"; text: string; href: string };

const INLINE = /\[([^\]]+)\]\(([^)\s]+)\)|\*\*([^*]+)\*\*/g;

export function parseInline(text: string): InlineToken[] {
  const tokens: InlineToken[] = [];
  let last = 0;
  for (const match of text.matchAll(INLINE)) {
    const index = match.index ?? 0;
    if (index > last) tokens.push({ type: "text", text: text.slice(last, index) });
    if (match[1] !== undefined) {
      tokens.push({ type: "link", text: match[1], href: match[2] });
    } else {
      tokens.push({ type: "bold", text: match[3] });
    }
    last = index + match[0].length;
  }
  if (last < text.length) tokens.push({ type: "text", text: text.slice(last) });
  return tokens;
}

/** The text a reader sees, with the marks removed. */
export function plainText(text: string): string {
  return parseInline(text)
    .map((token) => token.text)
    .join("");
}

/** Every inline link href in a piece of text. */
export function inlineLinks(text: string): string[] {
  return parseInline(text).flatMap((token) =>
    token.type === "link" ? [token.href] : [],
  );
}
