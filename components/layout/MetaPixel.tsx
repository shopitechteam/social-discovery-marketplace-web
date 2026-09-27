"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import Script from "next/script";

const pixelId = process.env.NEXT_PUBLIC_META_PIXEL_ID;

/**
 * Meta Pixel. Renders nothing until NEXT_PUBLIC_META_PIXEL_ID is set.
 *
 * lazyOnload for the same reason GTM is in AppDocument: a third-party tag must
 * never queue ahead of the feed's LCP image. Conversion events are fired from
 * lib/analytics.ts; this only loads the pixel and records pageviews.
 */
export function MetaPixel() {
  const pathname = usePathname();
  const isLanding = useRef(true);

  useEffect(() => {
    // The base code tracks the landing pageview itself; this covers client-side
    // navigations, which never reload the pixel.
    if (isLanding.current) {
      isLanding.current = false;
      return;
    }
    window.fbq?.("track", "PageView");
  }, [pathname]);

  if (!pixelId) return null;

  return (
    <Script id="meta-pixel" strategy="lazyOnload">
      {`!function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,document,'script','https://connect.facebook.net/en_US/fbevents.js');fbq('init','${pixelId}');fbq('track','PageView');`}
    </Script>
  );
}
