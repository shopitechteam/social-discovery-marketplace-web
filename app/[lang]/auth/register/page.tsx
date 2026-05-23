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

  /** Bottom social + switch link — shared */
  const Footer = (
    <div className="flex flex-col gap-4">
      <Divider label="or sign up with" />
      <SocialButtons lang={lang} from={from} />
      <p className="text-center text-sm text-muted">
        Already have an account?{" "}
        <Link href={loginHref} className="text-primary font-semibold">
          Sign in
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
          <h1 className="text-[30px] font-bold leading-[1.2] text-default font-display tracking-tight">
            Create your
            <br />
            Shopi account
          </h1>
          <p className="mt-2 text-[15px] text-muted leading-relaxed">
            Takes less than a minute.
          </p>
        </div>

        <div className="px-6">
          <RegisterForm
            from={from}
            lang={lang}
            footer={<div className="mt-6">{Footer}</div>}
          />
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
        <RegisterForm from={from} lang={lang} footer={Footer} />
      </div>
    </AuthDesktopShell>
  );
}
