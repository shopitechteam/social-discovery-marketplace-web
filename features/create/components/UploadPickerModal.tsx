"use client";

import { useIsDesktop } from "@/hooks/useIsDesktop";
import { UploadPickerPage } from "./UploadPickerPage";

/**
 * Intercepted-route wrapper around {@link UploadPickerPage}.
 *
 * Desktop is the target for the "open over the current page" experience: the
 * picker renders as a Radix dialog, so the page behind it stays mounted and
 * visible — tapping "Create" no longer swaps out the whole page.
 *
 * On mobile the interception still fires, but the mobile picker is a normal
 * in-flow full-height card (not a dialog). Rendered inside the parallel-route
 * slot it would otherwise stack *under* the current page, so we pin it to a
 * fixed, full-screen layer that covers the page like a real navigation would.
 */
export function UploadPickerModal({ lang }: { lang: string }) {
  const isDesktop = useIsDesktop();

  // Avoid a layout flash before the breakpoint is known.
  if (isDesktop === null) return null;

  // Desktop: UploadPickerPage renders its own dialog (portaled + overlaid), so
  // no wrapper positioning is needed.
  if (isDesktop) return <UploadPickerPage lang={lang} />;

  // Mobile: cover the underlying page so the intercepted picker reads as a
  // full-screen route rather than content stacked below the feed.
  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-app">
      <UploadPickerPage lang={lang} />
    </div>
  );
}
