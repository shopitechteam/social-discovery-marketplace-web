"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { ShopiLogo } from "@/features/auth/components/AuthIcons";

export function LegalNav({ lang }: { lang: string }) {
  const router = useRouter();

  return (
    <header
      className="sticky top-0 z-40 w-full border-b border-border backdrop-blur-md"
      style={{ backgroundColor: "rgb(var(--color-bg) / 0.92)" }}
    >
      <div
        className="flex items-center justify-between px-4 h-14"
        style={{ maxWidth: 860, margin: "0 auto" }}
      >
        {/* Back button */}
        <button
          type="button"
          onClick={() => router.back()}
          aria-label="Go back"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-muted active:opacity-60 transition-opacity"
        >
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M15 18l-6-6 6-6" />
          </svg>
          Back
        </button>

        {/* Logo → home */}
        <Link href={`/${lang}`} aria-label="Shopi home" className="absolute left-1/2 -translate-x-1/2">
          <ShopiLogo className="h-6 w-auto" />
        </Link>

        {/* Spacer to balance the back button */}
        <div className="w-16" aria-hidden />
      </div>
    </header>
  );
}
