import Script from "next/script";
import { Bricolage_Grotesque, JetBrains_Mono, Manrope } from "next/font/google";
import { RouteProviders } from "@/components/providers/RouteProviders";
import { cultureCode } from "@/i18n/config";

const gtmId = process.env.NEXT_PUBLIC_GTM_ID;

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
  // This face is used for small supporting details, never the initial hero or
  // feed content. Keep it out of the critical mobile preload set.
  preload: false,
  variable: "--font-mono",
});

const themeScript = `
(function(){
  try {
    var s = JSON.parse(localStorage.getItem('shopi-theme') || '{}');
    var t = s.state?.theme || 'light';
    var dark = t === 'dark' || (t === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);
    if (dark) document.documentElement.classList.add('dark');
  } catch(e){}
})();
`;

export function AppDocument({
  children,
  lang,
}: {
  children: React.ReactNode;
  lang: string;
}) {
  return (
    <html
      lang={cultureCode(lang)}
      suppressHydrationWarning
      className={`${manrope.variable} ${bricolage.variable} ${jetbrainsMono.variable} h-full antialiased`}
    >
      {/* llms.txt discovery.
          The convention relies on crawlers guessing the well-known path, so a
          site that only *hosts* the file may never have it read. These links
          let anything parsing the HTML find it directly. No <head> wrapper —
          React 19 hoists link tags into the document head on its own, which is
          the App Router-safe way to do this. */}
      <link
        rel="alternate"
        type="text/plain"
        href="/llms.txt"
        title="LLM reference (summary)"
      />
      <link
        rel="alternate"
        type="text/plain"
        href="/llms-full.txt"
        title="LLM reference (full)"
      />
      <link
        rel="alternate"
        type="text/markdown"
        href="/catalog.md"
        title="Current Shopi marketplace catalog"
      />
      <link
        rel="alternate"
        type="application/json"
        href="/catalog.json"
        title="Current Shopi marketplace catalog (JSON)"
      />
      {/* Google Tag Manager.
          Loaded by hand rather than via @next/third-parties' <GoogleTagManager>
          because that component hard-codes next/script's default
          "afterInteractive" strategy, which emits a <link rel="preload"> for
          gtm.js into the document head. On the feed that put a third-party
          analytics container in front of the LCP thumbnail in the network
          queue. "lazyOnload" defers it until after the window load event, so
          tags still fire but never compete with feed content. The dataLayer
          shim is inline (and cheap) so anything queueing events before the
          container arrives is still captured. */}
      {gtmId && (
        <>
          <Script id="gtm-datalayer" strategy="lazyOnload">
            {`window.dataLayer=window.dataLayer||[];window.dataLayer.push({'gtm.start':new Date().getTime(),event:'gtm.js'});`}
          </Script>
          <Script
            id="gtm"
            strategy="lazyOnload"
            src={`https://www.googletagmanager.com/gtm.js?id=${gtmId}`}
          />
        </>
      )}
      <body className="min-h-full flex flex-col bg-app text-default">
        <script
          id="theme-script"
          dangerouslySetInnerHTML={{ __html: themeScript }}
        />
        <RouteProviders>{children}</RouteProviders>
      </body>
    </html>
  );
}
