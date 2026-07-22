import { GoogleTagManager } from "@next/third-parties/google";
import { Bricolage_Grotesque, JetBrains_Mono, Manrope } from "next/font/google";
import { PwaSplash } from "@/components/layout/PwaSplash";
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
    if (sessionStorage.getItem('shopi-pwa-splash-seen') === 'true') {
      document.documentElement.classList.add('shopi-pwa-splash-seen');
    } else {
      document.documentElement.classList.add('shopi-pwa-splash-pending');
    }
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
      lang={lang}
      suppressHydrationWarning
      className={`${manrope.variable} ${bricolage.variable} ${jetbrainsMono.variable} h-full antialiased`}
    >
      {gtmId && <GoogleTagManager gtmId={gtmId} />}
      <body className="min-h-full flex flex-col bg-app text-default">
        <script
          id="theme-script"
          dangerouslySetInnerHTML={{ __html: themeScript }}
        />
        <PwaSplash />
        <RouteProviders>{children}</RouteProviders>
      </body>
    </html>
  );
}
