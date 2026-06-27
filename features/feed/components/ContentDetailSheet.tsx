"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ContentDetail } from "./ContentDetail";

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

  useEffect(() => {
    if (isDesktop !== true) return;

    const frame = window.requestAnimationFrame(() => setOpen(true));
    return () => window.cancelAnimationFrame(frame);
  }, [isDesktop]);

  useEffect(() => {
    if (isDesktop !== true) return;

    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [isDesktop]);

  const close = useCallback(() => {
    setOpen(false);
    window.setTimeout(() => router.back(), 180);
  }, [router]);

  useEffect(() => {
    if (isDesktop !== true) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") close();
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [close, isDesktop]);

  if (isDesktop === null) return null;

  if (!isDesktop) {
    return <ContentDetail id={id} lang={lang} />;
  }

  return (
    <div className="fixed inset-0 z-[70] overflow-hidden" aria-live="polite">
      <button
        type="button"
        aria-label="Close post"
        onClick={close}
        className={[
          "absolute inset-0 bg-black/35 backdrop-blur-[1px] transition-opacity duration-200",
          open ? "opacity-100" : "opacity-0",
        ].join(" ")}
      />
      <section
        role="dialog"
        aria-modal="true"
        aria-label="Post details"
        className={[
          "absolute right-0 top-0 h-full w-[min(1120px,calc(100vw-72px))] overflow-hidden border-l border-default bg-app shadow-2xl transition-transform duration-200 ease-out",
          open ? "translate-x-0" : "translate-x-full",
        ].join(" ")}
      >
        <ContentDetail
          id={id}
          lang={lang}
          desktopMode="sheet"
          onRequestClose={close}
        />
      </section>
    </div>
  );
}
