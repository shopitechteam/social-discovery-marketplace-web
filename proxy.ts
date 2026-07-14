import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { locales, defaultLocale } from "@/i18n/config";

// Routes that require a valid accessToken cookie.
// Matched after locale prefix is stripped, so "/profile" covers "/{locale}/profile".
const PROTECTED_PATHS = ["/profile", "/upload", "/notifications", "/settings"];

// Routes a logged-in user shouldn't see — the marketing landing root and the
// auth flows. They're redirected straight to the feed instead.
const GUEST_ONLY_PATHS = ["/", "/auth"];

// …except the OAuth callback, which must run even when a session already exists
// (it finalizes tokens and posts them back to the login popup's opener).
const GUEST_ONLY_EXCEPTIONS = ["/auth/tiktok-callback"];

function getBarePath(pathname: string): string {
  const locale = locales.find(
    (l) => pathname === `/${l}` || pathname.startsWith(`/${l}/`),
  );
  return locale ? pathname.slice(`/${locale}`.length) || "/" : pathname;
}

function isProtected(pathname: string): boolean {
  const bare = getBarePath(pathname);
  return PROTECTED_PATHS.some((p) => bare === p || bare.startsWith(`${p}/`));
}

function isGuestOnly(pathname: string): boolean {
  const bare = getBarePath(pathname);
  if (GUEST_ONLY_EXCEPTIONS.some((p) => bare === p || bare.startsWith(`${p}/`))) {
    return false;
  }
  return GUEST_ONLY_PATHS.some((p) =>
    p === "/" ? bare === "/" : bare === p || bare.startsWith(`${p}/`),
  );
}

function getPathLocale(pathname: string) {
  return locales.find(
    (locale) => pathname === `/${locale}` || pathname.startsWith(`/${locale}/`),
  );
}

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const pathnameLocale = getPathLocale(pathname);

  // accessToken is stored in localStorage by Zustand, so the proxy can't read
  // it directly. We rely on a lightweight "shopi-auth-hint" cookie that the
  // client sets on login and clears on logout (see stores/auth.ts).
  const hasSession = !!request.cookies.get("shopi-auth-hint")?.value;

  // ── Auth guard ────────────────────────────────────────────────────────────
  if (isProtected(pathname) && !hasSession) {
    const locale = pathnameLocale ?? defaultLocale;

    const loginUrl = request.nextUrl.clone();
    loginUrl.pathname = `/${locale}/auth/auth-welcome`;
    loginUrl.search = `?from=${encodeURIComponent(pathname)}`;
    return NextResponse.redirect(loginUrl);
  }

  // ── Logged-in guard ───────────────────────────────────────────────────────
  // A signed-in user shouldn't land on the marketing page or the auth flows.
  // Send them back to wherever they came from — the auth route itself may
  // carry a "from" param (e.g. an old login link), otherwise fall back to the
  // same-origin Referer, otherwise the feed.
  if (hasSession && isGuestOnly(pathname)) {
    const locale = pathnameLocale ?? defaultLocale;

    const from = request.nextUrl.searchParams.get("from");
    const referer = request.headers.get("referer");

    let backTo: string | null = null;
    if (from?.startsWith("/")) {
      backTo = from;
    } else if (referer) {
      try {
        const refererUrl = new URL(referer);
        if (
          refererUrl.origin === request.nextUrl.origin &&
          !isGuestOnly(refererUrl.pathname)
        ) {
          backTo = `${refererUrl.pathname}${refererUrl.search}`;
        }
      } catch {
        // malformed referer — ignore
      }
    }

    const redirectUrl = request.nextUrl.clone();
    if (backTo) {
      const target = new URL(backTo, request.nextUrl.origin);
      redirectUrl.pathname = target.pathname;
      redirectUrl.search = target.search;
    } else {
      redirectUrl.pathname = `/${locale}/feed`;
      redirectUrl.search = "";
    }
    return NextResponse.redirect(redirectUrl);
  }

  // ── Locale prefix ─────────────────────────────────────────────────────────
  if (pathnameLocale) return NextResponse.next();

  // No locale in path — redirect to the default English prefix.
  const locale = defaultLocale;
  const newUrl = request.nextUrl.clone();
  const bare = pathname === "/" ? "" : pathname;
  newUrl.pathname = `/${locale}${bare}`;

  return NextResponse.redirect(newUrl);
}

export const config = {
  matcher: [
    // Match all paths including root "/", skip Next.js internals and static files
    "/",
    "/((?!_next|api|favicon.ico|manifest.json|og-default.png|robots.txt|sitemap.xml|.*\\..*).*)",
  ],
};
