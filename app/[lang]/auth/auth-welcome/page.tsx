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

  const CTAs = (
    <div className="flex flex-col gap-3">
      {/* Social sign-up buttons — top priority per design */}
      <SocialButtons lang={lang} from={from} verb="Continue" />

      <Divider label="or use email" />

      {/* Email CTA */}
      <Link
        href={`/${lang}/auth/register${qs}`}
        className="w-full flex items-center justify-center h-13 rounded-2xl font-semibold text-[15px] text-white active:opacity-80 transition-opacity"
        style={{
          background:
            "linear-gradient(95deg, rgb(var(--brand-primary)), rgb(var(--brand-primary) / 0.82))",
        }}
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
        className="relative flex flex-col h-svh overflow-hidden bg-app lg:hidden"
        style={{ maxWidth: 430, margin: "0 auto" }}
      >
        {/* Subtle brand glow top-right */}
        <div
          aria-hidden
          className="pointer-events-none absolute -top-24 -right-24 w-72 h-72 rounded-full blur-3xl"
          style={{ background: "rgb(var(--brand-primary) / 0.08)" }}
        />
        <div
          aria-hidden
          className="pointer-events-none absolute top-40 -left-20 w-56 h-56 rounded-full blur-3xl"
          style={{ background: "rgb(var(--brand-accent) / 0.06)" }}
        />

        {/* Hero — grows to fill space above CTAs */}
        <div className="flex-1 flex flex-col items-center justify-center px-8 pb-4 pt-12">
          {/* Card stack */}
          <div className="relative w-56 h-36 mb-1">
            <div
              className="absolute left-0 top-3 w-28 rounded-2xl rotate-[-10deg] shadow-lg overflow-hidden"
              style={{
                height: 108,
                background:
                  "linear-gradient(145deg, rgb(var(--brand-primary)), rgb(var(--brand-primary) / 0.55))",
              }}
            >
              <div className="absolute inset-0 bg-linear-to-b from-white/10 to-transparent" />
              <div className="absolute top-2 left-2.5">
                <span className="text-white/70 text-[9px] font-semibold tracking-wide uppercase">
                  Trending
                </span>
              </div>
              <div className="absolute bottom-2.5 left-2.5 flex items-center gap-1.5">
                <div className="w-5 h-5 rounded-full bg-white/25 flex items-center justify-center">
                  <span className="text-white text-[9px] font-bold">K</span>
                </div>
                <span className="text-white/80 text-[10px] font-medium">
                  @kali
                </span>
              </div>
            </div>
            <div
              className="absolute right-0 top-1 w-24 rounded-2xl rotate-[9deg] shadow-lg overflow-hidden"
              style={{
                height: 92,
                background:
                  "linear-gradient(145deg, rgb(var(--brand-accent)), rgb(var(--brand-accent) / 0.55))",
              }}
            >
              <div className="absolute inset-0 bg-gradient-to-b from-white/10 to-transparent" />
              <div className="absolute top-2 right-2 bg-white/20 backdrop-blur-sm rounded-full px-1.5 py-0.5">
                <span className="text-white text-[8px] font-bold">New</span>
              </div>
              <div className="absolute bottom-2.5 left-2.5 flex items-center gap-1.5">
                <div className="w-5 h-5 rounded-full bg-white/25 flex items-center justify-center">
                  <span className="text-white text-[9px] font-bold">M</span>
                </div>
                <span className="text-white/80 text-[10px] font-medium">
                  @marco
                </span>
              </div>
            </div>
            <div
              className="absolute left-10 top-3 w-36 rounded-2xl shadow-xl overflow-hidden"
              style={{
                height: 116,
                background:
                  "linear-gradient(145deg, rgb(var(--brand-secondary)), rgb(var(--brand-secondary) / 0.65))",
              }}
            >
              <div className="absolute inset-0 bg-gradient-to-b from-white/10 to-transparent" />
              <div className="absolute top-2.5 left-3 bg-black/20 backdrop-blur-sm rounded-full px-2 py-0.5">
                <span className="text-white text-[9px] font-bold">
                  🔥 Trending
                </span>
              </div>
              <div className="absolute top-2.5 right-2.5 bg-white/20 backdrop-blur-sm rounded-full px-1.5 py-0.5 flex items-center gap-0.5">
                <span className="text-white text-[9px]">♥</span>
                <span className="text-white text-[9px] font-bold">42K</span>
              </div>
              <div className="absolute bottom-2.5 left-3 flex items-center gap-1.5">
                <div className="w-6 h-6 rounded-full bg-white/25 flex items-center justify-center ring-2 ring-white/30">
                  <span className="text-white text-[10px] font-bold">N</span>
                </div>
                <span className="text-white/90 text-[10px] font-semibold">
                  @nia
                </span>
              </div>
            </div>
          </div>

          <ShopiLogo />
          <h1 className="mt-3 text-[28px] font-bold text-default font-display text-center leading-[1.15] tracking-tight">
            <br />
            Discover what people near you are selling
          </h1>
          <p className="mt-2 text-[13px] text-muted text-center leading-relaxed">
            Pick how you want to sign up.
          </p>
        </div>

        {/* CTAs pinned to bottom */}
        <div className="px-6 pb-10 shrink-0">{CTAs}</div>
      </div>

      {/* ── Desktop right-panel content ───────────────────────── */}
      <div className="hidden lg:flex flex-col gap-6">
        <div className="">
          <div className="w-full flex justify-center">
            {" "}
            <ShopiLogo />
          </div>
          <h1 className="text-[28px] text-center font-bold text-default font-display leading-tight tracking-tight">
            Join Shopi today
          </h1>
          <p className="mt-2 text-[15px] text-center text-muted leading-relaxed">
            Discover what people near you are selling
          </p>
        </div>
        {CTAs}
      </div>
    </AuthDesktopShell>
  );
}
