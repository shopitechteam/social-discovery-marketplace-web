import { GoogleTagManager } from "@next/third-parties/google";
import { Bricolage_Grotesque, JetBrains_Mono, Manrope } from "next/font/google";
import { RouteProviders } from "@/components/providers/RouteProviders";

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

// Rendered by the server before React hydrates so installed PWAs never flash a
// blank white screen while Next loads. It deliberately uses only inline styles
// and the local app icon, which makes it reliable on slow mobile connections.
const splashScript = `
(function(){
  var splash = document.getElementById('shopi-pwa-splash');
  if (!splash) return;
  var started = Date.now();
  function dismiss() {
    var remaining = Math.max(0, 420 - (Date.now() - started));
    window.setTimeout(function() {
      splash.classList.add('shopi-splash--ready');
      window.setTimeout(function() { splash.remove(); }, 280);
    }, remaining);
  }
  if (document.readyState === 'complete') dismiss();
  else window.addEventListener('load', dismiss, { once: true });
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
      lang={lang}
      suppressHydrationWarning
      className={`${manrope.variable} ${bricolage.variable} ${jetbrainsMono.variable} h-full antialiased`}
    >
      {gtmId && <GoogleTagManager gtmId={gtmId} />}
      <body className="min-h-full flex flex-col bg-app text-default">
        <div id="shopi-pwa-splash" role="status" aria-label="Opening Shopi">
          <div className="shopi-splash__glow" />
          <div className="shopi-splash__content">
            {/* A plain image is intentional: this is the first paint, before the
                Next image runtime has hydrated, and the icon is already local. */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              className="shopi-splash__logo"
              src="/assets/shopi-logo.png"
              width="112"
              height="112"
              alt=""
            />
            <p className="shopi-splash__name">Shopi</p>
            <p className="shopi-splash__tagline">Discover what&apos;s nearby</p>
            <span className="shopi-splash__loader" aria-hidden="true" />
          </div>
        </div>
        <script
          id="theme-script"
          dangerouslySetInnerHTML={{ __html: themeScript }}
        />
        <script
          id="pwa-splash-script"
          dangerouslySetInnerHTML={{ __html: splashScript }}
        />
        <RouteProviders>{children}</RouteProviders>
      </body>
    </html>
  );
}
