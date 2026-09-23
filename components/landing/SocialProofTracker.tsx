"use client";

import { useEffect, useRef } from "react";
import {
  markSocialProofVisit,
  trackSellerEvent,
} from "@/lib/seller-analytics";

const IMPRESSION_KEY = "shopi:seller-analytics:impressions";

/**
 * Measures the homepage featured-seller section without turning it into a
 * client component: the section stays server-rendered (crawlable), and this
 * wrapper only observes it.
 *
 * - Impression: a seller block at least half in view, once per seller per tab
 *   session.
 * - Click: any link inside a seller block. The click also marks the session as
 *   arriving via social proof, so the profile/listing views and contact actions
 *   that follow are attributed to the homepage section, not "internal".
 *
 * Seller blocks carry `data-sp-seller`; listing links sit inside
 * `data-sp-content` so a listing click is recorded against that listing.
 */
export function SocialProofTracker({ children }: { children: React.ReactNode }) {
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    let seen: Set<string>;
    try {
      seen = new Set(JSON.parse(sessionStorage.getItem(IMPRESSION_KEY) ?? "[]"));
    } catch {
      seen = new Set();
    }

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          const sellerId = (entry.target as HTMLElement).dataset.spSeller;
          if (!entry.isIntersecting || !sellerId || seen.has(sellerId)) continue;
          seen.add(sellerId);
          observer.unobserve(entry.target);
          try {
            sessionStorage.setItem(IMPRESSION_KEY, JSON.stringify([...seen]));
          } catch {
            // Private mode: the impression may repeat next load; the API dedupes.
          }
          trackSellerEvent({ type: "SOCIAL_PROOF_IMPRESSION", sellerId });
        }
      },
      { threshold: 0.5 },
    );
    root.querySelectorAll<HTMLElement>("[data-sp-seller]").forEach((block) => {
      if (!seen.has(block.dataset.spSeller ?? "")) observer.observe(block);
    });

    const onClick = (event: MouseEvent) => {
      const link = (event.target as HTMLElement | null)?.closest("a[href]");
      const block = link?.closest<HTMLElement>("[data-sp-seller]");
      if (!link || !block?.dataset.spSeller) return;
      markSocialProofVisit();
      trackSellerEvent({
        type: "SOCIAL_PROOF_CLICK",
        sellerId: block.dataset.spSeller,
        contentId: link.closest<HTMLElement>("[data-sp-content]")?.dataset.spContent,
      });
    };
    // Capture phase + auxclick: records middle-clicks and new-tab opens too.
    root.addEventListener("click", onClick, true);
    root.addEventListener("auxclick", onClick, true);

    return () => {
      observer.disconnect();
      root.removeEventListener("click", onClick, true);
      root.removeEventListener("auxclick", onClick, true);
    };
  }, []);

  return <div ref={rootRef}>{children}</div>;
}
