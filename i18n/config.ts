export const locales = ["en", "sw"] as const;
export type Locale = (typeof locales)[number];
export const defaultLocale: Locale = "en";

export const localeLabels: Record<Locale, string> = {
  en: "English",
  sw: "Kiswahili",
};

/**
 * BCP-47 culture codes for the <html lang> attribute.
 *
 * Region-qualified rather than bare "en"/"sw": Shopi's audience is Kenyan, and
 * the country hint is what engines (Bing explicitly) use to decide which
 * region a page is intended for when the site isn't hosted there.
 *
 * Deliberately NOT reused for hreflang — those stay as bare "en"/"sw" so they
 * match any English or Kiswahili speaker rather than only Kenyan ones.
 */
export const localeCultureCodes: Record<Locale, string> = {
  en: "en-KE",
  sw: "sw-KE",
};

export function cultureCode(value: string): string {
  return isValidLocale(value) ? localeCultureCodes[value] : "en-KE";
}

export function isValidLocale(value: string): value is Locale {
  return (locales as readonly string[]).includes(value);
}
