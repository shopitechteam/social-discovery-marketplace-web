function apiOrigin() {
  const value = process.env.NEXT_PUBLIC_API_URL;
  if (!value) return null;
  try {
    return new URL(value).origin;
  } catch {
    return null;
  }
}

/** Emit API connection hints only on app routes that actually query the API. */
export function ApiPreconnect() {
  const origin = apiOrigin();
  if (!origin) return null;

  return (
    <>
      <link rel="dns-prefetch" href={origin} />
      <link rel="preconnect" href={origin} crossOrigin="anonymous" />
    </>
  );
}
