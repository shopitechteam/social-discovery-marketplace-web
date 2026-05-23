import { LoginForm } from "@/features/auth/components/LoginForm";
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

  /** Bottom social + switch link — shared */
  const Footer = (
    <div className="flex flex-col gap-4">
      <Divider />
      <SocialButtons lang={lang} from={from} />
      <p className="text-center text-sm text-muted">
        New to Shopi?{" "}
        <Link href={registerHref} className="text-primary font-semibold">
          Create an account
        </Link>
      </p>
    </div>
  );

  return (
    <AuthDesktopShell lang={lang}>
      {/* ── Mobile layout ─────────────────────────────────────── */}
      <div
        className="relative flex flex-col min-h-svh bg-app lg:hidden"
        style={{ maxWidth: 430, margin: "0 auto" }}
      >
        {/* Top bar */}
        <div className="flex items-center justify-between px-5 pt-14 pb-2">
          <Link
            href={`/${lang}/auth/auth-welcome`}
            aria-label="Back"
            className="inline-flex items-center justify-center w-9 h-9 rounded-full bg-subtle text-muted active:opacity-70 transition-opacity"
          >
            <ChevronLeftIcon />
          </Link>
          <ShopiLogo className="h-7 w-auto" />
        </div>

        {/* Heading */}
        <div className="px-6 pt-8 pb-6">
          <h1 className="text-[30px] font-bold leading-tight text-default font-display tracking-tight">
            Welcome back
          </h1>
          <p className="mt-2 text-[15px] text-muted leading-relaxed">
            Sign in to keep your feed personalized.
          </p>
        </div>

        <div className="px-6 flex-1">
          <LoginForm from={from} lang={lang} />
        </div>

        <div className="px-6 pb-12 mt-8">{Footer}</div>
      </div>

      {/* ── Desktop right-panel content ───────────────────────── */}
      <div className="hidden lg:flex flex-col gap-6">
        <div>
          <h1 className="text-[26px] font-bold text-default font-display tracking-tight">
            Welcome back
          </h1>
          <p className="mt-1.5 text-[15px] text-muted leading-relaxed">
            Sign in to keep your feed personalized.
          </p>
        </div>
        <LoginForm from={from} lang={lang} />
        {Footer}
      </div>
    </AuthDesktopShell>
  );
}
