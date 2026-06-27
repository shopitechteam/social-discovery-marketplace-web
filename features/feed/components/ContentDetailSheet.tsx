"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { X } from "lucide-react";

import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetTitle,
} from "@/components/ui/sheet";
import { ContentDetail } from "./ContentDetail";

/**
 * Tracks the desktop breakpoint. Returns `null` until the first measurement so
 * we never flash the wrong layout (sheet vs. full page) during hydration.
 */
function useIsDesktopRouteSheet() {
  const [isDesktop, setIsDesktop] = useState<boolean | null>(null);

  useEffect(() => {
    const query = window.matchMedia("(min-width: 768px)");
    const update = () => setIsDesktop(query.matches);

    update();
    query.addEventListener("change", update);
    return () => query.removeEventListener("change", update);
  }, []);

  return isDesktop;
}

export function ContentDetailSheet({
  id,
  lang,
}: {
  id: string;
  lang: string;
}) {
  const router = useRouter();
  const isDesktop = useIsDesktopRouteSheet();
  const [open, setOpen] = useState(false);
  // Widened to fit the in-place chat column when the user taps Message.
  const [chatOpen, setChatOpen] = useState(false);

  // Open on the next frame so the slide-in transition plays on mount.
  useEffect(() => {
    if (isDesktop !== true) return;

    const frame = window.requestAnimationFrame(() => setOpen(true));
    return () => window.cancelAnimationFrame(frame);
  }, [isDesktop]);

  // Drive the close from a single place: animate out, then pop the route.
  // Radix keeps the content mounted during the exit animation, so the
  // ContentDetail stays visible while it slides away.
  const handleOpenChange = useCallback(
    (next: boolean) => {
      if (next) {
        setOpen(true);
        return;
      }
      setOpen(false);
      setChatOpen(false);
      window.setTimeout(() => router.back(), 300);
    },
    [router]
  );

  const close = useCallback(() => handleOpenChange(false), [handleOpenChange]);

  if (isDesktop === null) return null;

  // Mobile: the interception still happens, but we render the detail full-page
  // (no overlay). The standalone /content/[id] route is the real destination.
  if (!isDesktop) {
    return <ContentDetail id={id} lang={lang} />;
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
