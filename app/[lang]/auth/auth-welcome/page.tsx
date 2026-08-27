import { isValidLocale } from "@/i18n/config";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Divider } from "@/features/auth/components/AuthIcons";
import { SocialButtons } from "@/features/auth/components/SocialButtons";
import { AuthDesktopShell } from "@/features/auth/components/AuthDesktopShell";
import { HomeIcon } from "lucide-react";

export const metadata = { title: "Welcome" };

export default async function WelcomePage({
  params,
  searchParams,
}: PageProps<"/[lang]/auth/auth-welcome">) {
  const { lang } = await params;
  if (!isValidLocale(lang)) notFound();

  const sp = await searchParams;
  const from = typeof sp?.["from"] === "string" ? sp["from"] : undefined;
  const qs = from ? `?from=${encodeURIComponent(from)}` : "";

  const CTAs = (
    <div className="flex flex-col gap-3">
      {/* Social sign-up buttons — top priority per design */}
      <SocialButtons lang={lang} from={from} verb="Continue" surface="welcome" />

      <Divider label="or use email" />

      {/* Email CTA */}
      <Link
        href={`/${lang}/auth/register${qs}`}
        className="w-full flex items-center justify-center h-13 rounded-2xl font-semibold text-base text-white bg-primary active:opacity-80 transition-opacity"
      >
        Sign up with Email
      </Link>

      <p className="text-center text-xs text-placeholder leading-relaxed pt-1">
        By continuing you agree to our{" "}
        <Link
          href={`/${lang}/terms`}
          className="text-muted underline underline-offset-2"
        >
          Terms
        </Link>{" "}
        &{" "}
        <Link
          href={`/${lang}/privacy`}
          className="text-muted underline underline-offset-2"
        >
          Privacy Policy
        </Link>
        .
      </p>

      <p className="text-center text-sm text-muted">
        Already a member?{" "}
        <Link
          href={`/${lang}/auth/login${qs}`}
          className="font-semibold text-primary"
        >
          Sign in
        </Link>
      </p>
    </div>
  );

  return (
    <AuthDesktopShell lang={lang}>
      {/* ── Mobile layout ─────────────────────────────────────── */}
      <div
        className="relative mx-auto flex h-svh max-w-107.5 flex-col overflow-hidden bg-app lg:hidden"
      >
        <div className="flex items-center justify-end px-6 pt-5 shrink-0">
          <Link
            href={`/${lang}`}
            className="inline-flex items-center gap-2 rounded-full bg-surface px-3 py-2 text-sm font-medium text-muted transition-opacity active:opacity-70"
          >
            <HomeIcon className="h-4 w-4" />
            Home
          </Link>
        </div>
        {/* Subtle brand glow top-right */}
        <div
          aria-hidden
          className="pointer-events-none absolute -top-24 -right-24 w-72 h-72 rounded-full blur-3xl bg-[rgb(var(--brand-primary)/0.08)]"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute top-40 -left-20 w-56 h-56 rounded-full blur-3xl bg-[rgb(var(--brand-accent)/0.06)]"
        />

        {/* Hero — grows to fill space above CTAs */}
        <div className="flex-1 flex flex-col items-center justify-center px-8 pb-2 pt-10">
          {/* Card stack — scaled up to fill the space where logo was */}
          <div className="relative w-80 h-52 mb-4">
            {/* Left card */}
            <div
              className="absolute left-0 top-4 h-37 w-36 rounded-2xl rotate-[-10deg] shadow-lg overflow-hidden bg-[linear-gradient(145deg,rgb(var(--brand-primary)),rgb(var(--brand-primary)/0.55))]"
            >
              <div className="absolute inset-0 bg-linear-to-b from-white/10 to-transparent" />
              <div className="absolute top-3 left-3">
                <span className="text-white/70 text-xs font-semibold tracking-wide uppercase">
                  Trending
                </span>
              </div>
              <div className="absolute bottom-3 left-3 flex items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-white/25 flex items-center justify-center">
                  <span className="text-white text-xs font-bold">K</span>
                </div>
                <span className="text-white/80 text-xs font-medium">@kali</span>
              </div>
            </div>
            {/* Right card */}
            <div
              className="absolute right-0 top-2 h-32 w-32 rounded-2xl rotate-[9deg] shadow-lg overflow-hidden bg-[linear-gradient(145deg,rgb(var(--brand-accent)),rgb(var(--brand-accent)/0.55))]"
            >
              <div className="absolute inset-0 bg-gradient-to-b from-white/10 to-transparent" />
              <div className="absolute top-2.5 right-2.5 bg-white/20 backdrop-blur-sm rounded-full px-2 py-0.5">
                <span className="text-white text-xs font-bold">New</span>
              </div>
              <div className="absolute bottom-3 left-3 flex items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-white/25 flex items-center justify-center">
                  <span className="text-white text-xs font-bold">M</span>
                </div>
                <span className="text-white/80 text-xs font-medium">
                  @marco
                </span>
              </div>
            </div>
            {/* Center card — largest, on top */}
            <div
              className="absolute left-1/2 -translate-x-1/2 top-2 h-40 w-44 rounded-2xl shadow-xl overflow-hidden bg-[linear-gradient(145deg,rgb(var(--brand-secondary)),rgb(var(--brand-secondary)/0.65))]"
            >
              <div className="absolute inset-0 bg-gradient-to-b from-white/10 to-transparent" />
              <div className="absolute top-3 left-3 bg-black/20 backdrop-blur-sm rounded-full px-2.5 py-1">
                <span className="text-white text-xs font-bold">
                  🔥 Trending
                </span>
              </div>
              <div className="absolute top-3 right-3 bg-white/20 backdrop-blur-sm rounded-full px-2 py-1 flex items-center gap-1">
                <span className="text-white text-xs">♥</span>
                <span className="text-white text-xs font-bold">42K</span>
              </div>
              <div className="absolute bottom-3 left-3 flex items-center gap-2">
                <div className="w-7 h-7 rounded-full bg-white/25 flex items-center justify-center ring-2 ring-white/30">
                  <span className="text-white text-xs font-bold">N</span>
                </div>
                <span className="text-white/90 text-xs font-semibold">
                  @nia
                </span>
              </div>
            </div>
          </div>

          <h1 className="text-2xl font-bold text-default font-display text-center leading-[1.2] tracking-tight text-balance">
            Everything for sale near you, in one feed.
          </h1>
          <p className="mt-2 text-sm text-muted text-center leading-relaxed">
            Create your free account to start scrolling.
          </p>
        </div>

        {/* CTAs pinned to bottom */}
        <div className="px-6 pb-10 shrink-0">{CTAs}</div>
      </div>

      {/* ── Desktop right-panel content ───────────────────────── */}
      <div className="hidden lg:flex flex-col gap-6">
        <div>
          <h1 className="text-[28px] text-center font-bold text-default font-display leading-tight tracking-tight">
            Create your free account
          </h1>
          <p className="mt-2 text-base text-center text-muted leading-relaxed">
            Start discovering what people near you are selling — in seconds.
          </p>
        </div>
        {CTAs}
      </div>
    </AuthDesktopShell>
  );
}
