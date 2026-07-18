/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { X } from "lucide-react";
import { useAuthSession } from "@/hooks/useAuthSession";
import type { Dictionary } from "@/i18n/getDictionary";
import type { Locale } from "@/i18n/config";

const DISMISS_KEY = "shopi-welcome-back-dismissed";

/**
 * Floating "welcome back" pill for signed-in visitors on the landing page.
 * Gives them a one-tap route back into the feed without auto-redirecting or
 * hiding the marketing content. Dismissal is remembered for the session.
 */
export function WelcomeBackBanner({
  dict,
  lang,
}: {
  dict: Dictionary;
  lang: Locale;
}) {
  const { isAuthenticated, user } = useAuthSession();
  const [dismissed, setDismissed] = useState(true);

  useEffect(() => {
    setDismissed(sessionStorage.getItem(DISMISS_KEY) === "1");
  }, []);

  if (!isAuthenticated || dismissed) return null;

  const t = dict.landing.welcomeBack;
  const firstName = user?.profile?.firstName;
  const avatar = user?.profile?.avatar;
  const message = firstName
    ? t.message.replace("{name}", firstName)
    : t.messageNoName;

  function dismiss() {
    sessionStorage.setItem(DISMISS_KEY, "1");
    setDismissed(true);
  }

  return (
    <div className="fixed inset-x-4 bottom-4 z-50 mx-auto flex w-fit max-w-full items-center gap-3 rounded-full border border-border bg-elevated py-2 pr-2 pl-3 shadow-lg">
      {avatar ? (
        <Image
          src={avatar}
          alt=""
          width={32}
          height={32}
          className="h-8 w-8 shrink-0 rounded-full object-cover"
        />
      ) : (
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary-soft text-sm font-bold text-primary-strong">
          {(firstName?.[0] ?? "?").toUpperCase()}
        </span>
      )}
      <p className="min-w-0 truncate text-sm font-medium text-foreground">
        {message}
      </p>
      <Link
        href={`/${lang}/feed`}
        className="shrink-0 rounded-full bg-primary px-4 py-2 text-sm font-semibold whitespace-nowrap text-white no-underline"
      >
        {t.cta}
      </Link>
      <button
        onClick={dismiss}
        aria-label={t.dismiss}
        className="flex h-8 w-8 shrink-0 cursor-pointer items-center justify-center rounded-full text-muted hover:text-foreground"
      >
        <X size={16} />
      </button>
    </div>
  );
}
