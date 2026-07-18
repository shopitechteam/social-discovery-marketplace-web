"use client";

import dynamic from "next/dynamic";
import { usePathname } from "next/navigation";
import { ThemeProvider } from "@/providers/ThemeProvider";
import { locales } from "@/i18n/config";

const ApolloWrapper = dynamic(() =>
  import("@/lib/apollo/ApolloWrapper").then((mod) => mod.ApolloWrapper),
);
const Toaster = dynamic(() =>
  import("@/components/ui/sonner").then((mod) => mod.Toaster),
);
const SessionAnalyticsTracker = dynamic(() =>
  import("@/components/providers/SessionAnalyticsTracker").then((mod) => mod.SessionAnalyticsTracker),
);

const landingPaths = new Set<string>(locales.map((locale) => `/${locale}`));

/**
 * Keep the locale homepages lightweight. They are fully server-rendered and do
 * not issue GraphQL requests or toasts, so loading Apollo/RxJS and Sonner there
 * only adds hydration work. Every other route retains the existing providers.
 */
export function RouteProviders({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isLandingPage = landingPaths.has(pathname.replace(/\/$/, ""));

  return (
    <ThemeProvider>
      {isLandingPage ? (
        <main>{children}</main>
      ) : (
        <>
          <ApolloWrapper>
            <SessionAnalyticsTracker />
            <main>{children}</main>
          </ApolloWrapper>
          <Toaster position="bottom-center" richColors />
        </>
      )}
    </ThemeProvider>
  );
}
