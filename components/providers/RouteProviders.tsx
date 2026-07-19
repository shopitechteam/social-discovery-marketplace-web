"use client";

import dynamic from "next/dynamic";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { ThemeProvider } from "@/providers/ThemeProvider";
import { locales } from "@/i18n/config";
import { GlobalPushBootstrap } from "@/components/providers/GlobalPushBootstrap";
import { GlobalPushToastBridge } from "@/components/providers/GlobalPushToastBridge";

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
  const [toastPosition, setToastPosition] = useState<"top-center" | "bottom-center">(
    "bottom-center",
  );

  useEffect(() => {
    if (typeof window === "undefined") return;

    const mediaQuery = window.matchMedia("(max-width: 767px)");
    const syncPosition = () => {
      setToastPosition(mediaQuery.matches ? "top-center" : "bottom-center");
    };

    syncPosition();
    mediaQuery.addEventListener("change", syncPosition);
    return () => {
      mediaQuery.removeEventListener("change", syncPosition);
    };
  }, []);

  return (
    <ThemeProvider>
      <GlobalPushBootstrap lang={pathname.split("/")[1] || "en"} />
      <GlobalPushToastBridge />
      {isLandingPage ? (
        <main>{children}</main>
      ) : (
        <>
          <ApolloWrapper>
            <SessionAnalyticsTracker />
            <main>{children}</main>
          </ApolloWrapper>
        </>
      )}
      <Toaster position={toastPosition} richColors />
    </ThemeProvider>
  );
}
