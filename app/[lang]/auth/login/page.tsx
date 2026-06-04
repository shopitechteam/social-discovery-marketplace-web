import { LoginForm } from "@/features/auth/components/LoginForm";
import { isValidLocale } from "@/i18n/config";
import { notFound } from "next/navigation";
import Link from "next/link";

import { SocialButtons } from "@/features/auth/components/SocialButtons";
import { AuthDesktopShell } from "@/features/auth/components/AuthDesktopShell";
import { ChevronLeftIcon } from "lucide-react";
import { Divider, ShopiLogo } from "@/features/auth/components/AuthIcons";

export const metadata = { title: "Sign in · Shopi" };

export default async function LoginPage({
  params,
  searchParams,
}: PageProps<"/[lang]/auth/login">) {
  const { lang } = await params;
  if (!isValidLocale(lang)) notFound();

  const sp = await searchParams;
  const from = typeof sp?.["from"] === "string" ? sp["from"] : undefined;

  const registerHref = from
    ? `/${lang}/auth/register?from=${encodeURIComponent(from)}`
    : `/${lang}/auth/register`;

  const SocialTop = (
    <div className="flex flex-col gap-3 mb-5">
      <SocialButtons lang={lang} from={from} verb="Sign in" />
      <Divider label="or use email" />
    </div>
  );

  const Footer = (
    <div className="mt-5">
      <p className="text-center text-sm text-muted">
        New to Shopi?{" "}
        <Link href={registerHref} className="font-semibold text-primary">
          Create an account
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
        <Link
          href={`/${lang}/auth/auth-welcome`}
          aria-label="Back"
          className="inline-flex items-center justify-center w-9 h-9 rounded-full bg-surface text-muted active:opacity-70 transition-opacity"
        >
          <ChevronLeftIcon />
        </Link>
        <div
          aria-hidden
          className="pointer-events-none absolute -top-20 -right-20 w-64 h-64 rounded-full blur-3xl"
          style={{ background: "rgb(var(--brand-primary) / 0.07)" }}
        />

        {/* Top bar */}
        <div className="flex w-full justify-center items-center  px-5 pt-5 pb-1 shrink-0">
          <ShopiLogo height={150} width={150} />
        </div>

        {/* Heading */}
        <div className="px-6 pt-4 pb-3 shrink-0 text-center">
          <h1 className="text-[26px] font-bold leading-tight text-default font-display tracking-tight">
            Welcome back
          </h1>
          <p className="mt-1 text-[14px] text-muted">
            Sign in to keep your feed personalized.
          </p>
        </div>

        {/* Scrollable area */}
        <div className="flex-1 overflow-y-auto px-6 pb-6">
          {SocialTop}
          <LoginForm from={from} lang={lang} />
          {Footer}
        </div>
      </div>

      {/* ── Desktop right-panel content ───────────────────────── */}
      <div className="hidden lg:flex flex-col gap-6">
        <div className="text-center">
          <h1 className="text-[26px] font-bold text-default font-display tracking-tight">
            Welcome back
          </h1>
          <p className="mt-1.5 text-[15px] text-muted leading-relaxed">
            Sign in to keep your feed personalized.
          </p>
        </div>
        {SocialTop}
        <LoginForm from={from} lang={lang} />
        {Footer}
      </div>
    </AuthDesktopShell>
  );
}
