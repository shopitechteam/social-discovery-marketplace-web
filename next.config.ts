import type { NextConfig } from "next";

const isDev = process.env.NODE_ENV === "development";

// ── Content-Security-Policy ──────────────────────────────────────────────────
// A static (non-nonce) policy tuned to the origins this app actually uses. It
// keeps static rendering/CDN caching (no per-request nonce) while still passing
// security scanners and materially reducing XSS/clickjacking surface.
//
// `'unsafe-inline'` is retained for scripts and styles because the app relies on
// an inline theme-flash script (components/layout/AppDocument.tsx), the Mux player (injects inline
// styles), and the Google/Apple OAuth widgets. Moving to a nonce-based policy
// would require forcing every page dynamic and threading a nonce through all of
// these — a separate, larger change.
//
// connect-src derives the API/WebSocket origins from env vars so it works in
// every environment; the staging/prod origins are also listed explicitly so a
// build with a localhost .env still permits the deployed backends.
const apiUrl = process.env.NEXT_PUBLIC_API_URL || "";
const wsUrl = process.env.NEXT_PUBLIC_WEBSOCKET_URL || "";

// CSP source expressions match PATHS when one is present — an entry like
// "ws://localhost:4000/graphql" only permits that exact path and silently
// blocks Socket.IO's "/socket.io" endpoint (the browser then loops on
// "websocket error" and realtime never connects). Reduce every backend URL to
// its bare origin, and mirror the API origin onto the ws scheme, since
// browsers don't let an http: source authorize a ws: connection.
const toOrigin = (value: string): string => {
  try {
    return new URL(value).origin;
  } catch {
    return "";
  }
};
const toWsOrigin = (value: string): string =>
  toOrigin(value).replace(/^http/, "ws");

const connectSrc = [
  "'self'",
  toOrigin(apiUrl),
  toWsOrigin(apiUrl), // Socket.IO + any WS endpoint on the API origin
  toOrigin(wsUrl),
  // Deployed backends (in case the build's .env points at localhost)
  "https://api.shopi.co.ke",
  "https://staging.shopi.co.ke",
  "wss://api.shopi.co.ke",
  "wss://staging.shopi.co.ke",
  // Media + CDNs
  "https://storage.shopi.co.ke",
  "https://media.shopi.co.ke",
  "https://image.mux.com",
  "https://stream.mux.com",
  "https://*.litix.io", // Mux Data analytics
  // Direct browser uploads PUT straight to presigned URLs on these hosts:
  // images → the R2 bucket endpoint, videos → Mux direct-upload endpoints
  // (regional hosts like direct-uploads-*.mux.com). Without them the CSP
  // silently kills every upload from the post composer.
  "https://*.r2.cloudflarestorage.com",
  "https://*.mux.com",
  // Maps / geocoding
  "https://maps.googleapis.com",
  "https://nominatim.openstreetmap.org",
  "https://tile.openstreetmap.org",
  // OAuth
  "https://accounts.google.com",
  "https://appleid.apple.com",
  // Analytics
  "https://api.mixpanel.com",
]
  .filter(Boolean)
  .join(" ");

const cspHeader = `
  default-src 'self';
  script-src 'self' 'unsafe-inline'${isDev ? " 'unsafe-eval'" : ""} https://accounts.google.com https://appleid.cdn-apple.com https://maps.googleapis.com https://*.mux.com;
  style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;
  img-src 'self' blob: data: https: ;
  font-src 'self' data: https://fonts.gstatic.com;
  media-src 'self' blob: https://stream.mux.com https://*.mux.com;
  connect-src ${connectSrc};
  frame-src 'self' https://accounts.google.com https://appleid.apple.com https://www.tiktok.com;
  worker-src 'self' blob:;
  object-src 'none';
  base-uri 'self';
  form-action 'self';
  frame-ancestors 'self';
  upgrade-insecure-requests;
`
  .replace(/\s{2,}/g, " ")
  .trim();

// Security headers applied to every response. HSTS, X-Frame-Options,
// X-Content-Type-Options, Referrer-Policy, Permissions-Policy, and CSP are all
// standard hardening headers surfaced by security scanners.
const securityHeaders = [
  {
    key: "Content-Security-Policy",
    value: cspHeader,
  },
  {
    // Enforce HTTPS for 2 years incl. subdomains; eligible for preload list.
    key: "Strict-Transport-Security",
    value: "max-age=63072000; includeSubDomains; preload",
  },
  {
    key: "X-Frame-Options",
    value: "SAMEORIGIN",
  },
  {
    key: "X-Content-Type-Options",
    value: "nosniff",
  },
  {
    key: "Referrer-Policy",
    value: "strict-origin-when-cross-origin",
  },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=(self), browsing-topics=()",
  },
];

const nextConfig: NextConfig = {
  /* config options here */
  devIndicators: false,

  // Shopi is Tailwind-based and mobile-first. Inlining the ~23 KB compressed
  // stylesheet removes two render-blocking request round trips for first-time
  // visitors, directly addressing the Lighthouse CSS opportunity.
  experimental: {
    inlineCss: true,
  },

  // Send hardening headers on every route. Next prefixes each source with the
  // configured locales automatically, and "/(.*)" covers everything else.
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: securityHeaders,
      },
    ];
  },

  // The app is served under /[lang] (e.g. /en). Redirect the bare domain and
  // common non-locale paths to the default locale so the homepage, blog, etc.
  // are reachable (and indexable) at the root URL.
  async redirects() {
    const paths = [
      "blog",
      "blog/:slug",
      "about",
      "careers",
      "privacy",
      "terms",
      "cookies",
      "feed",
      "explore",
      "search",
      "contact",
      "community-guidelines",
      "prohibited-items",
      "safety-centre",
    ];
    return [
      { source: "/", destination: "/en", permanent: true },
      ...paths.map((p) => ({
        source: `/${p}`,
        destination: `/en/${p}`,
        permanent: true,
      })),
    ];
  },

  images: {
    // Serve AVIF first (≈20-30% smaller than WebP) then fall back to WebP.
    // Addresses Lighthouse "Improve image delivery" on the hero listing images.
    formats: ["image/avif", "image/webp"],
    // Restrict the quality values the optimizer will honor; 75 is the default
    // used across the app. 45/55 are reserved for small decorative imagery.
    qualities: [45, 55, 75, 82],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "image.mux.com",
      },
      // TikTok CDN — cover images served from various p*-sign.tiktokcdn.com hosts
      {
        protocol: "https",
        hostname: "**.tiktokcdn.com",
      },
      {
        protocol: "https",
        hostname: "**.tiktokcdn-us.com",
      },
      {
        protocol: "https",
        hostname: "storage.shopi.co.ke",
      },
      {
        protocol: "https",
        hostname: "media.shopi.co.ke",
      },

      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com",
      },
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        protocol: "https",
        hostname: "images.shopi.co.ke",
      },
    ],
  },
};

export default nextConfig;
