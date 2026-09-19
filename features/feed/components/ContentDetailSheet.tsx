"use client";

import { useCallback, useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { X } from "lucide-react";

import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetTitle,
} from "@/components/ui/sheet";
import { useIsDesktop } from "@/hooks/useIsDesktop";
import { ContentDetail } from "./ContentDetail";

export function ContentDetailSheet({
  id,
  lang,
}: {
  id: string;
  lang: string;
}) {
  const router = useRouter();
  const pathname = usePathname();
  // `null` until measured so we never flash the wrong layout (sheet vs. full
  // page) during hydration.
  const isDesktop = useIsDesktop();
  const [open, setOpen] = useState(false);
  // Widened to fit the in-place chat column when the user taps Message.
  const [chatOpen, setChatOpen] = useState(false);

  // Open on the next frame so the slide-in transition plays on mount.
  useEffect(() => {
    if (isDesktop !== true) return;

    const frame = window.requestAnimationFrame(() => setOpen(true));
    return () => window.cancelAnimationFrame(frame);
  }, [isDesktop]);

  // The browser/gesture back button changes the URL immediately via
  // popstate, before Next necessarily gets a chance to swap the @modal slot
  // back to its default (null) — that swap doesn't reliably happen for a
  // plain back navigation on an intercepted route, which is what left this
  // sheet's tree mounted and visible on top of whatever `back` actually
  // landed on (e.g. still seeing the PDP after "returning" to /feed).
  // Tying visibility to the pathname directly, instead of trusting the slot
  // to unmount us, means a stale mount can never stay on screen: the moment
  // the URL stops pointing at this exact piece of content, this renders
  // nothing — on both the desktop sheet and the mobile full-page branch.
  const isActiveRoute = pathname === `/${lang}/content/${id}`;

  // Drive the close from a single place: animate out, then pop the route.
  // Radix keeps the content mounted during the exit animation, so the
  // ContentDetail stays visible while it slides away.
  //
  // Always router.back() here, never a fallback path (compare
  // ContentDetail's own `useAppBack`, which does need one): this component
  // only ever renders via the intercepted @modal route, which by
  // construction can only be reached by a same-tab client navigation from
  // some prior page (e.g. /explore?category=...). That prior entry always
  // exists, so back() always lands there — a hardcoded fallback would only
  // ever paper over a bug, and previously did: it sent every close to
  // /feed regardless of where the user actually came from.
  const handleOpenChange = useCallback(
    (next: boolean) => {
      if (next) {
        setOpen(true);
        return;
      }
      setOpen(false);
      setChatOpen(false);
      // Delayed so the sheet finishes sliding out first.
      window.setTimeout(() => router.back(), 300);
    },
    [router]
  );

  const close = useCallback(() => handleOpenChange(false), [handleOpenChange]);

  if (isDesktop === null) return null;
  if (!isActiveRoute) return null;

  // Mobile: the interception still happens, but we render the detail full-page
  // (no overlay). The standalone /content/[id] route is the real destination.
  //
  // onRequestClose is passed here for the same reason as the desktop sheet:
  // without it, ContentDetail's own back button falls through to its
  // useAppBack('/feed') default — meant for a listing opened with no app
  // history behind it (a shared link) — which is never true for this,
  // the intercepted-modal render path, and was sending every mobile "back"
  // tap to /feed instead of back to wherever the user actually came from.
  if (!isDesktop) {
    return (
      <ContentDetail id={id} lang={lang} onRequestClose={() => router.back()} />
    );
  }

  return (
    <Sheet open={open} onOpenChange={handleOpenChange}>
      <SheetContent
        side="right"
        // ContentDetail renders its own header + close button, so we strip the
        // default sheet chrome (padding, gap, max-width) and let it fill. Width
        // grows to ~93vw when the in-place chat column is open.
        style={{
          width: chatOpen ? "93vw" : "min(1120px, calc(100vw - 72px))",
        }}
        className="max-w-none gap-0 rounded-l-md border-l border-gray-400 bg-app p-0 transition-[width] duration-300 ease-out sm:max-w-none [&>button]:hidden"
        overlayClassName="bg-black/45"
        onOpenAutoFocus={(e) => e.preventDefault()}
      >
        {/* Accessible name for the dialog; visually handled by the header inside. */}
        <SheetTitle className="sr-only">Post details</SheetTitle>

        {/* Persistent close affordance sitting on the overlay, just outside the
            panel's left edge — always visible regardless of inner scroll. */}
        <SheetClose
          aria-label="Close post"
          className="absolute -left-12 top-4 hidden h-9 w-9 items-center justify-center rounded-full bg-black/55 text-white shadow-lg outline-none ring-offset-0 transition-colors hover:bg-black/75 focus-visible:ring-2 focus-visible:ring-white/70 md:flex"
        >
          <X className="h-5 w-5" strokeWidth={2.2} />
        </SheetClose>

        <div className="h-full overflow-hidden rounded-l-md">
          <ContentDetail
            id={id}
            lang={lang}
            desktopMode="sheet"
            onRequestClose={close}
            onChatOpenChange={setChatOpen}
          />
        </div>
      </SheetContent>
    </Sheet>
  );
}
