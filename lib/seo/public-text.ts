/**
 * Seller-written text → text fit for a search snippet, AI answer or JSON-LD.
 *
 * Bios and captions are written for buyers scrolling the app, not for results
 * pages: they carry phone numbers ("Call/WhatsApp..0710694608.."), emoji
 * bullets, line breaks and runs of dots. Contact numbers are deliberately kept
 * out of public payloads everywhere else (see useSellerPhone), so they must not
 * leak through meta descriptions or structured data either — and a snippet that
 * reads "..Call/WhatsApp.." converts worse than a clean sentence.
 */

// Numbers: +254 / 07xx / 01xx and any other 8+ digit run with separators.
const PHONE = /(?:\+?\d[\d\s().-]{7,}\d)/g;
const EMAIL = /[^\s@]+@[^\s@]+\.[a-z]{2,}/gi;
const URL = /\b(?:https?:\/\/|www\.)\S+/gi;
const EMOJI = /[\p{Extended_Pictographic}\u{FE0F}\u{200D}]/gu;
// "Call/WhatsApp", "Tel:" etc. left dangling once the number is gone.
const DANGLING_CONTACT =
  /\b(?:call|whatsapp|whats\s?app|sms|text|tel|phone|mobile|contact)(?:\s*(?:\/|&|or|and)\s*(?:call|whatsapp|whats\s?app|sms|text|tel|phone))*\s*(?::|-)?\s*(?=[.,;!|]|$)/gi;

const hasContactDetails = (sentence: string) =>
  [EMAIL, URL, PHONE].some((pattern) => {
    pattern.lastIndex = 0;
    return pattern.test(sentence);
  });

/**
 * A sentence that carries a number, email or link is almost always only about
 * contact ("Contact me on 07…", "Call/WhatsApp 07…"), so the whole sentence is
 * dropped rather than leaving "Contact me on or email" behind.
 */
export function cleanPublicText(input?: string | null): string {
  if (!input) return "";
  const sentences = input
    .replace(EMOJI, " ")
    // Sentence breaks: line breaks, runs of dots, bullets, and ". " / "! " / "? ".
    .split(/\n+|\.{2,}|[•|]|(?<=[.!?])\s+/)
    .map((sentence) => sentence.replace(/\s+/g, " ").trim())
    .filter((sentence) => sentence && !hasContactDetails(sentence))
    .map((sentence) => sentence.replace(DANGLING_CONTACT, "").trim())
    .filter((sentence) => /[\p{L}\p{N}]/u.test(sentence));

  return sentences
    .map((sentence) => (/[.!?]$/.test(sentence) ? sentence : `${sentence}.`))
    .join(" ")
    .replace(/\s+([.,;:!?])/g, "$1")
    .trim();
}

/** Cut at a word boundary, ending on "…" only when something was removed. */
export function truncateAtWord(text: string, max: number): string {
  if (text.length <= max) return text;
  const cut = text.slice(0, max - 1);
  const lastSpace = cut.lastIndexOf(" ");
  return `${(lastSpace > max * 0.6 ? cut.slice(0, lastSpace) : cut).replace(/[\s.,;:!-]+$/, "")}…`;
}

/** Recommended ceiling for meta descriptions before engines truncate them. */
export const META_DESCRIPTION_MAX = 155;
