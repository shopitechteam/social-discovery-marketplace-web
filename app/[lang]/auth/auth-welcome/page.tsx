import { isValidLocale } from "@/i18n/config";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ShopiLogo, Divider } from "@/features/auth/components/AuthIcons";
import { SocialButtons } from "@/features/auth/components/SocialButtons";
import {
  AuthDesktopShell,
  CardStack,
} from "@/features/auth/components/AuthDesktopShell";

export const metadata = { title: "Welcome to Shopi" };

export default async function WelcomePage({
  params,
  searchParams,
}: PageProps<"/[lang]/auth/auth-welcome">) {
  const { lang } = await params;
  if (!isValidLocale(lang)) notFound();

  const sp = await searchParams;
  const from = typeof sp?.["from"] === "string" ? sp["from"] : undefined;
  const qs = from ? `?from=${encodeURIComponent(from)}` : "";

  /** Shared CTA block used in both mobile and desktop */
  const CTAs = (
    <div className="flex flex-col gap-3">
      <Link
        href={`/${lang}/auth/register${qs}`}
        className="flex items-center justify-center h-14 rounded-2xl font-semibold text-[16px] text-white active:scale-[0.98] transition-all"
        style={{
          background:
            "linear-gradient(95deg, rgb(var(--brand-primary)), rgb(var(--brand-primary) / 0.82))",
        }}
      >
        Create account
      </Link>
      <Link
        href={`/${lang}/auth/login${qs}`}
        className="flex items-center justify-center h-14 rounded-2xl font-semibold text-[16px] text-default border border-border bg-elevated active:scale-[0.98] transition-all"
      >
        I already have an account
      </Link>
      <div className="mt-1">
        <Divider />
      </div>
      <SocialButtons lang={lang} from={from} />
      <p className="text-center text-xs text-placeholder leading-relaxed">
        By continuing you agree to our{" "}
        <Link
          href={`/${lang}/terms`}
          className="text-muted underline underline-offset-2"
        >
          Terms
        </Link>{" "}
        and{" "}
        <Link
          href={`/${lang}/privacy`}
          className="text-muted underline underline-offset-2"
        >
          Privacy Policy
        </Link>
        .
      </p>
    </div>
  );

  return (
    <AuthDesktopShell lang={lang}>
      {/* ── Mobile layout ─────────────────────────────────────── */}
      <div
        className="relative flex flex-col min-h-svh bg-app overflow-hidden lg:hidden"
        style={{ maxWidth: 430, margin: "0 auto" }}
      >
        {/* Glows */}
        <div
          aria-hidden
          className="pointer-events-none absolute -top-32 -right-32 w-80 h-80 rounded-full blur-3xl"
          style={{ background: "rgb(var(--brand-primary) / 0.08)" }}
        />
        <div
          aria-hidden
          className="pointer-events-none absolute top-40 -left-20 w-56 h-56 rounded-full blur-3xl"
          style={{ background: "rgb(var(--brand-accent) / 0.06)" }}
        />

        {/* Hero */}
        <div className="flex-1 flex flex-col items-center justify-center px-8 pt-16 pb-4">
          <CardStack />
          <ShopiLogo className="h-8 w-auto mt-8" />
          <h1 className="mt-5 text-[32px] font-bold text-default font-display text-center leading-[1.15] tracking-tight">
            Shop what your
            <br />
            friends love.
          </h1>
          <p className="mt-3 text-[15px] text-muted text-center leading-relaxed max-w-65">
            Discover, share and shop with creators. Built for the social-first
            generation.
          </p>
        </div>

        {/* CTAs */}
        <div className="px-6 pb-10">{CTAs}</div>
      </div>

      {/* ── Desktop right-panel content ───────────────────────── */}
      <div className="hidden lg:flex flex-col gap-6">
        {/* Heading */}
        <div>
          <ShopiLogo className="h-8 w-auto mb-6" />
          <h1 className="text-[28px] font-bold text-default font-display leading-tight tracking-tight">
            Join Shopi today
          </h1>
          <p className="mt-2 text-[15px] text-muted leading-relaxed">
            Discover and shop what your friends love.
          </p>
        </div>
        {CTAs}
      </div>
    </AuthDesktopShell>
  );
}
