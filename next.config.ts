import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  devIndicators: false,

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
    ],
  },
};

export default nextConfig;
