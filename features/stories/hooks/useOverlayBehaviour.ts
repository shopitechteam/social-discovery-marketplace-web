"use client";

import { useCallback, useEffect, useRef } from "react";
import { resumeVideoElection, suspendVideoElection } from "@/lib/activeVideo";

/**
 * What a full-screen story overlay needs from the page while it's open:
 *
 * - The phone's back gesture / browser back closes it instead of leaving the
 *   feed. Same approach as MediaCarouselDialog: one history entry is pushed on
 *   open, deferred a tick so Strict Mode's throwaway effect pass can't push and
 *   immediately pop it.
 * - The page underneath doesn't scroll, and its feed videos stop — they'd
 *   otherwise keep streaming behind the overlay.
 *
 * `requestClose` is what close buttons call: it unwinds the pushed entry, and
 * the resulting popstate is what actually closes.
 *
 * `releaseHistory` is for leaving the overlay by navigating (e.g. to the
 * creator's profile), after which the overlay must no longer unwind its entry —
 * that would undo the navigation. It returns whether the entry exists: if so,
 * `router.replace` it, so back from the new page lands on the feed; if not (a
 * tap within the first tick), `router.push` as usual.
 */
export function useOverlayBehaviour(onClose: () => void, key: string) {
  const onCloseRef = useRef(onClose);
  const closeRef = useRef<() => void>(() => onCloseRef.current());
  const releaseRef = useRef<() => boolean>(() => false);

  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);

  useEffect(() => {
    let pushed = false;
    let released = false;

    const onPop = () => {
      released = true;
      onCloseRef.current();
    };

    const t = setTimeout(() => {
      window.history.pushState({ ...window.history.state, [key]: true }, "");
      pushed = true;
      window.addEventListener("popstate", onPop);
    }, 0);

    closeRef.current = () => {
      if (pushed && !released) {
        released = true;
        window.history.back();
      } else {
        onCloseRef.current();
      }
    };

    releaseRef.current = () => {
      released = true;
      clearTimeout(t);
      window.removeEventListener("popstate", onPop);
      return pushed;
    };

    const { overflow } = document.body.style;
    document.body.style.overflow = "hidden";
    suspendVideoElection();

    return () => {
      clearTimeout(t);
      window.removeEventListener("popstate", onPop);
      if (pushed && !released) window.history.back();
      document.body.style.overflow = overflow;
      resumeVideoElection();
    };
  }, [key]);

  const requestClose = useCallback(() => closeRef.current(), []);
  const releaseHistory = useCallback(() => releaseRef.current(), []);
  return { requestClose, releaseHistory };
}
