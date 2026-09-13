/**
 * Where a profile sub-page should send you when you back out of it.
 *
 * The profile's tabs live in `?tab=`, but its sub-pages (Edit profile, Change
 * password, Rate us) are separate routes and so lose that context. Their back
 * links used to point at a bare `/profile`, which always landed on Posts — so
 * anyone working through Settings was thrown out of it after every single row
 * they opened.
 *
 * The fix is to carry the origin in the sub-page's own URL. That makes it
 * survive a refresh and a shared link, not just an intact history stack.
 */

const RETURN_PARAM = "from";
const SETTINGS = "settings";

/** Link to a profile sub-page, remembering that Settings is where we started. */
export function settingsSubPageHref(lang: string, path: string): string {
  return `/${lang}${path}?${RETURN_PARAM}=${SETTINGS}`;
}

/**
 * The profile URL to return to. `from` is whatever the sub-page read out of
 * its own query string; anything unrecognised falls back to the default tab.
 */
export function profileReturnHref(lang: string, from: string | null): string {
  return from === SETTINGS
    ? `/${lang}/profile?tab=${SETTINGS}`
    : `/${lang}/profile`;
}
