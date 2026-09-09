/**
 * One place that decides what a seller's profile URL looks like.
 *
 * Profiles live at `/{lang}/@{username}`. Handles are generated at sign-up and
 * backfilled for older accounts, so in practice every seller has one — but the
 * id fallback stays because a freshly created account can reach a card before
 * its handle is read back, and an id still resolves (the profile route accepts
 * either, and the legacy `/profile/*` path redirects here).
 */
export function profileHref(
  lang: string,
  user: { username?: string | null; id?: string | null } | null | undefined,
): string {
  const username = user?.username?.trim();
  if (username) return `/${lang}/@${encodeURIComponent(username)}`;
  return `/${lang}/profile/${user?.id ?? ""}`;
}
