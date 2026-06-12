// Server component — no "use client" needed

import Link from "next/link";
import { ShopiLogo } from "./AuthIcons";

/** Floating social-product card stack — shared between welcome & desktop panel */
export function CardStack() {
  return (
    <div className="relative w-72 h-60">
      {/* Back-left — coral/red */}
      <div
        className="absolute left-0 top-6 w-36 h-44 rounded-3xl rotate-[-10deg] shadow-xl overflow-hidden"
        style={{
          background:
            "linear-gradient(145deg, rgb(var(--brand-primary)), rgb(var(--brand-primary) / 0.55))",
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-white/10 to-transparent" />
        <div className="absolute top-3 left-3">
          <span className="text-white/70 text-xs font-semibold tracking-wide uppercase">
            Trending
          </span>
        </div>
        <div className="absolute bottom-4 left-3 flex items-center gap-2">
          <div className="w-6 h-6 rounded-full bg-white/25 flex items-center justify-center">
            <span className="text-white text-xs font-bold">K</span>
          </div>
          <span className="text-white/80 text-xs font-medium">@kali</span>
        </div>
      </div>

      {/* Back-right — violet */}
      <div
        className="absolute right-0 top-2 w-32 h-40 rounded-3xl rotate-[9deg] shadow-xl overflow-hidden"
        style={{
          background:
            "linear-gradient(145deg, rgb(var(--brand-accent)), rgb(var(--brand-accent) / 0.55))",
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-white/10 to-transparent" />
        <div className="absolute top-3 right-3 bg-white/20 backdrop-blur-sm rounded-full px-2 py-0.5">
          <span className="text-white text-xs font-bold">New</span>
        </div>
        <div className="absolute bottom-4 left-3 flex items-center gap-2">
          <div className="w-6 h-6 rounded-full bg-white/25 flex items-center justify-center">
            <span className="text-white text-xs font-bold">M</span>
          </div>
          <span className="text-white/80 text-xs font-medium">@marco.s</span>
        </div>
      </div>

      {/* Front center — amber */}
      <div
        className="absolute left-14 top-6 w-44 h-48 rounded-3xl shadow-2xl overflow-hidden"
        style={{
          background:
            "linear-gradient(145deg, rgb(var(--brand-secondary)), rgb(var(--brand-secondary) / 0.65))",
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-white/10 to-transparent" />
        <div className="absolute top-4 left-4 bg-black/20 backdrop-blur-sm rounded-full px-2.5 py-0.5">
          <span className="text-white text-xs font-bold">🔥 Trending</span>
        </div>
        <div className="absolute top-4 right-4 bg-white/20 backdrop-blur-sm rounded-full px-2 py-0.5 flex items-center gap-1">
          <span className="text-white text-xs">♥</span>
          <span className="text-white text-xs font-bold">42K</span>
        </div>
        <div className="absolute bottom-4 left-4 flex items-center gap-2">
          <div className="w-7 h-7 rounded-full bg-white/25 flex items-center justify-center ring-2 ring-white/30">
            <span className="text-white text-xs font-bold">N</span>
          </div>
          <span className="text-white/90 text-xs font-semibold block">@nia</span>
        </div>
      </div>
    </div>
  );
}

/**
 * Desktop split-screen shell for auth pages.
 *
 * Mobile  (<lg): renders children directly — each page owns its own mobile layout.
 * Desktop (≥lg): left branded panel + right form card.
 */
export function AuthDesktopShell({
  lang,
  children,
}: {
  lang: string;
  children: React.ReactNode;
}) {
  return (
    <>
      {/* ── Mobile: just pass through — pages handle their own layout ── */}
      <div className="lg:hidden">{children}</div>

      {/* ── Desktop split ── */}
      <div className="hidden lg:flex min-h-svh">
        {/* Left panel — branded */}
        <div
          className="relative flex flex-col justify-between w-[52%] xl:w-[55%] overflow-hidden p-12"
          style={{
            background:
              "linear-gradient(150deg, rgb(var(--brand-primary) / 0.92) 0%, rgb(var(--brand-primary)) 40%, rgb(var(--brand-secondary) / 0.85) 100%)",
          }}
        >
          {/* Noise / depth glows */}
          <div
            aria-hidden
            className="pointer-events-none absolute -top-32 -left-32 w-96 h-96 rounded-full blur-3xl"
            style={{ background: "rgb(var(--brand-accent) / 0.25)" }}
          />
          <div
            aria-hidden
            className="pointer-events-none absolute bottom-0 right-0 w-80 h-80 rounded-full blur-3xl"
            style={{ background: "rgb(var(--brand-secondary) / 0.3)" }}
          />

          {/* Logo */}
          <div className="relative z-10">
            <Link href={`/${lang}`} className="inline-block">
              <ShopiLogo className="h-9 w-auto brightness-0 invert" />
            </Link>
          </div>

          {/* Center content */}
          <div className="relative z-10 flex flex-col items-start gap-8">
            <CardStack />
            <div>
              <h2 className="text-[42px] xl:text-[52px] font-bold text-white leading-[1.1] tracking-tight font-display">
                Shop what your<br />friends love.
              </h2>
              <p className="mt-4 text-lg text-white/75 leading-relaxed max-w-sm">
                Discover, share and buy with creators you trust.
                Built for the social-first generation.
              </p>
            </div>
          </div>

          {/* Footer */}
          <div className="relative z-10 flex gap-5 text-sm text-white/50">
            <Link href={`/${lang}/terms`} className="hover:text-white/80 transition-colors">Terms</Link>
            <Link href={`/${lang}/privacy`} className="hover:text-white/80 transition-colors">Privacy</Link>
            <Link href={`/${lang}/about`} className="hover:text-white/80 transition-colors">About</Link>
          </div>
        </div>

        {/* Right panel — form */}
        <div
          className="flex-1 flex items-center justify-center p-8 xl:p-16 overflow-y-auto"
          style={{ background: "rgb(var(--color-bg))" }}
        >
          {/* Card container — gives the form a lifted surface on large screens */}
          <div
            className="w-full max-w-[440px] rounded-3xl p-8 xl:p-10"
            style={{
              background: "rgb(var(--color-bg-elevated))",
              boxShadow: "var(--shadow-lg)",
              border: "1px solid rgb(var(--color-border))",
            }}
          >
            {children}
          </div>
        </div>
      </div>
    </>
  );
}
