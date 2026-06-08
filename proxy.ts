import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { locales, defaultLocale } from "@/i18n/config";

// Routes that require a valid accessToken cookie.
// Matched after locale prefix is stripped, so "/profile" covers "/{locale}/profile".
const PROTECTED_PATHS = ["/profile", "/upload", "/notifications", "/settings"];

function isProtected(pathname: string): boolean {
  // Strip locale prefix to get the bare path
  const locale = locales.find(
    (l) => pathname === `/${l}` || pathname.startsWith(`/${l}/`),
  );
  const bare = locale ? pathname.slice(`/${locale}`.length) || "/" : pathname;
  return PROTECTED_PATHS.some((p) => bare === p || bare.startsWith(`${p}/`));
}

function getPathLocale(pathname: string) {
  return locales.find(
    (locale) => pathname === `/${locale}` || pathname.startsWith(`/${locale}/`),
  );
}

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const pathnameLocale = getPathLocale(pathname);

  // ── Auth guard ────────────────────────────────────────────────────────────
  // accessToken is stored in localStorage by Zustand, so the proxy can't read
  // it directly. We rely on a lightweight "shopi-auth-hint" cookie that the
  // client sets on login and clears on logout (see stores/auth.ts).
  if (isProtected(pathname)) {
    const hasSession = !!request.cookies.get("shopi-auth-hint")?.value;
    if (!hasSession) {
      const locale = pathnameLocale ?? defaultLocale;

      const loginUrl = request.nextUrl.clone();
      loginUrl.pathname = `/${locale}/auth/auth-welcome`;
      loginUrl.search = `?from=${encodeURIComponent(pathname)}`;
      return NextResponse.redirect(loginUrl);
    }
  }

  // ── Locale prefix ─────────────────────────────────────────────────────────
  if (pathnameLocale) {
    const response = NextResponse.next();
    response.cookies.set("shopi_locale", pathnameLocale, {
      path: "/",
      maxAge: 60 * 60 * 24 * 365,
      sameSite: "lax",
    });
    return response;
  }

  // No locale in path — redirect to the default English prefix.
  const locale = defaultLocale;
  const newUrl = request.nextUrl.clone();
  const bare = pathname === "/" ? "" : pathname;
  newUrl.pathname = `/${locale}${bare}`;

  const response = NextResponse.redirect(newUrl);
  response.cookies.set("shopi_locale", locale, {
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
    sameSite: "lax",
  });
  return response;
}

export const config = {
  matcher: [
    // Match all paths including root "/", skip Next.js internals and static files
    "/",
    "/((?!_next|api|favicon.ico|manifest.json|og-default.png|robots.txt|sitemap.xml|.*\\..*).*)",
  ],
};
