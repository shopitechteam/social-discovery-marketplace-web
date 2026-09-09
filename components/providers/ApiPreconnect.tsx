import { cookies } from "next/headers";

function apiOrigin() {
  const value = process.env.NEXT_PUBLIC_API_URL;
  if (!value) return null;
  try {
    return new URL(value).origin;
  } catch {
    return null;
  }
}

/**
 * Emit API connection hints only on app routes that actually query the API.
 *
 * The `preconnect` is issued only for signed-in visitors. Anonymous visitors
 * get their first feed page server-rendered (see the feed route's PreloadQuery
 * branch), so the browser makes no API request at all during the initial load —
 * for them the preconnect opened a TLS connection that was never used, which is
 * what Lighthouse flags, and it competed with the LCP image for the small pool
 * of parallel connections. Signed-in visitors take the client-fetching branch
 * and issue an API request immediately on hydration, so for them the same hint
 * is worth real time.
 *
 * `dns-prefetch` stays unconditional: it is a DNS lookup, not a connection, so
 * it costs essentially nothing and still helps the anonymous case as soon as
 * the user interacts.
 */
export async function ApiPreconnect() {
  const origin = apiOrigin();
  if (!origin) return null;

  const cookieStore = await cookies();
  const willQueryOnLoad = cookieStore.has("shopi-auth-hint");

  return (
    <>
      <link rel="dns-prefetch" href={origin} />
      {willQueryOnLoad && (
        <link rel="preconnect" href={origin} crossOrigin="anonymous" />
      )}
    </>
  );
}
