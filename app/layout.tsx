import type { Metadata, Viewport } from "next";
import { Manrope, Bricolage_Grotesque, JetBrains_Mono } from "next/font/google";
import { RouteProviders } from "@/components/providers/RouteProviders";
import { siteConfig } from "@/config/site";
import { defaultLocale, isValidLocale } from "@/i18n/config";
import { cookies } from "next/headers";
import Script from "next/script";
import "./globals.css";

// ── Fonts ────────────────────────────────────────────────────────
const manrope = Manrope({
  weight: ["400", "500", "600", "700", "800"],
  subsets: ["latin"],
  display: "swap",
  variable: "--font-sans",
});

const bricolage = Bricolage_Grotesque({
  weight: ["500", "600", "700"],
  subsets: ["latin"],
  display: "swap",
  variable: "--font-display",
});

const jetbrainsMono = JetBrains_Mono({
  weight: ["400", "500"],
  subsets: ["latin"],
  display: "swap",
  variable: "--font-mono",
});

// ── Root metadata ────────────────────────────────────────────────
export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),

  title: {
    default: `${siteConfig.name} — ${siteConfig.tagline}`,
    // Per-page titles render as "Feed | Shopi"
    template: `%s | ${siteConfig.name}`,
  },

  description: siteConfig.description,

  keywords: [...siteConfig.keywords],

  authors: [{ name: siteConfig.name, url: siteConfig.url }],
  creator: siteConfig.name,
  publisher: siteConfig.name,

  // ── Open Graph ──────────────────────────────────────────────────
  openGraph: {
    type: "website",
    locale: siteConfig.locale,
    url: siteConfig.url,
    siteName: siteConfig.name,
    title: `${siteConfig.name} — ${siteConfig.tagline}`,
    description: siteConfig.description,
    images: [
      {
        url: siteConfig.ogImage,
        width: 1200,
        height: 630,
        alt: `${siteConfig.name} — ${siteConfig.tagline}`,
      },
    ],
  },

  // ── Twitter / X card ───────────────────────────────────────────
  twitter: {
    card: "summary_large_image",
    site: siteConfig.twitterHandle,
    creator: siteConfig.twitterHandle,
    title: `${siteConfig.name} — ${siteConfig.tagline}`,
    description: siteConfig.description,
    images: [siteConfig.ogImage],
  },

  // ── PWA / mobile ───────────────────────────────────────────────
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: siteConfig.name,
  },

  // ── Indexing ───────────────────────────────────────────────────
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true },
  },

  // ── Canonical ──────────────────────────────────────────────────
  alternates: {
    canonical: siteConfig.url,
  },
};

// ── Viewport (separate export — Next.js 14+ requirement) ────────
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  // Pinch-to-zoom is left enabled: blocking it (maximum-scale=1 /
  // user-scalable=no) fails WCAG 1.4.4 and is flagged by Lighthouse. Modern iOS
  // no longer double-tap-zooms inputs whose font-size is ≥16px, so the original
  // reason to disable zoom no longer applies.
  viewportFit: "cover",
  // Status bar (theme-color) matches the page background so it blends into the
  // top of pages — white in light mode, near-black in dark mode. Browsers don't
  // support gradient status bars, and the profile hero gradient is ~bg at its
  // top edge anyway, so this keeps the status bar consistent across pages.
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#0a0a0e" },
  ],
};

// ── Theme flash prevention — runs before React hydrates ─────────
const themeScript = `
(function(){
  try {
    var s = JSON.parse(localStorage.getItem('shopi-theme') || '{}');
    // Default to light when the user hasn't chosen a theme yet.
    var t = s.state?.theme || 'light';
    var dark = t === 'dark' || (t === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);
    if (dark) document.documentElement.classList.add('dark');
  } catch(e){}
})();
`;

export default async function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const cookieStore = await cookies();
  const cookieLang = cookieStore.get("shopi_locale")?.value ?? "";
  const lang = isValidLocale(cookieLang) ? cookieLang : defaultLocale;

  return (
    <html
      lang={lang}
      suppressHydrationWarning
      className={`${manrope.variable} ${bricolage.variable} ${jetbrainsMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-app text-default">
        <Script
          id="theme-script"
          strategy="beforeInteractive"
          dangerouslySetInnerHTML={{ __html: themeScript }}
        />
        <RouteProviders>{children}</RouteProviders>
      </body>
    </html>
  );
}
