import { RegisterForm } from "@/features/auth/components/RegisterForm";
import { isValidLocale } from "@/i18n/config";
import { notFound } from "next/navigation";
import Link from "next/link";
import {
  ShopiLogo,
  ChevronLeftIcon,
  Divider,
} from "@/features/auth/components/AuthIcons";
import { SocialButtons } from "@/features/auth/components/SocialButtons";
import { AuthDesktopShell } from "@/features/auth/components/AuthDesktopShell";

export const metadata = { title: "Create account · Shopi" };

export default async function RegisterPage({
  params,
  searchParams,
}: PageProps<"/[lang]/auth/register">) {
  const { lang } = await params;
  if (!isValidLocale(lang)) notFound();

  const sp = await searchParams;
  const from = typeof sp?.["from"] === "string" ? sp["from"] : undefined;

  const loginHref = from
    ? `/${lang}/auth/login?from=${encodeURIComponent(from)}`
    : `/${lang}/auth/login`;

  const SocialTop = (
    <div className="flex flex-col gap-3 mb-5">
      <SocialButtons lang={lang} from={from} verb="Sign up" />
      <Divider label="or use email" />
    </div>
  );

  const Footer = (
    <div className="flex flex-col gap-3 mt-5">
      <p className="text-center text-xs text-placeholder leading-relaxed">
        By creating an account you agree to our{" "}
        <Link href={`/${lang}/terms`} className="text-muted underline underline-offset-2 font-semibold">
          Terms
        </Link>{" "}
        &{" "}
        <Link href={`/${lang}/privacy`} className="text-muted underline underline-offset-2 font-semibold">
          Privacy Policy
        </Link>
        .
      </p>
      <p className="text-center text-sm text-muted">
        Already a member?{" "}
        <Link href={loginHref} className="font-semibold text-primary">
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
        <div
          aria-hidden
          className="pointer-events-none absolute -top-20 -right-20 w-64 h-64 rounded-full blur-3xl"
          style={{ background: "rgb(var(--brand-primary) / 0.07)" }}
        />

        {/* Top bar */}
        <div className="flex items-center justify-between px-5 pt-12 pb-1 shrink-0">
          <Link
            href={`/${lang}/auth/auth-welcome`}
            aria-label="Back"
            className="inline-flex items-center justify-center w-9 h-9 rounded-full bg-surface text-muted active:opacity-70 transition-opacity"
          >
            <ChevronLeftIcon />
          </Link>
          <ShopiLogo className="h-7 w-auto" />
        </div>

        {/* Heading */}
        <div className="px-6 pt-4 pb-3 shrink-0">
          <h1 className="text-[26px] font-bold leading-[1.2] text-default font-display tracking-tight">
            Create your account
          </h1>
          <p className="mt-1 text-[14px] text-muted">
            Takes less than a minute.
          </p>
        </div>

        {/* Scrollable area */}
        <div className="flex-1 overflow-y-auto px-6 pb-6">
          {SocialTop}
          <RegisterForm from={from} lang={lang} footer={Footer} />
        </div>
      </div>

      {/* ── Desktop right-panel content ───────────────────────── */}
      <div className="hidden lg:flex flex-col gap-6">
        <div>
          <h1 className="text-[26px] font-bold text-default font-display tracking-tight">
            Create your Shopi account
          </h1>
          <p className="mt-1.5 text-[15px] text-muted leading-relaxed">
            Takes less than a minute.
          </p>
        </div>
        {SocialTop}
        <RegisterForm from={from} lang={lang} footer={Footer} />
      </div>
    </AuthDesktopShell>
  );
}
