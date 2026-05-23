import "server-only";
import { isValidLocale, defaultLocale, type Locale } from "./config";

const dictionaries = {
  en: () => import("@/dictionaries/en.json").then((m) => m.default),
  sw: () => import("@/dictionaries/sw.json").then((m) => m.default),
};

export type Dictionary = Awaited<ReturnType<typeof getDictionary>>;

export async function getDictionary(locale: string) {
  const safe: Locale = isValidLocale(locale) ? locale : defaultLocale;
  return dictionaries[safe]();
}
