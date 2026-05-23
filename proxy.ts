import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { locales, defaultLocale, isValidLocale } from "@/i18n/config";

function getPreferredLocale(request: NextRequest): string {
  // 1. Cookie takes priority — user explicitly chose a language
  const cookie = request.cookies.get("shopi_locale")?.value;
  if (cookie && isValidLocale(cookie)) return cookie;

  // 2. Browser Accept-Language header
  const acceptLang = request.headers.get("accept-language") ?? "";
  for (const part of acceptLang.split(",")) {
    const tag = part.split(";")[0].trim().toLowerCase();
    // Match full tag (e.g. "sw-KE") or just language (e.g. "sw")
    for (const locale of locales) {
      if (tag === locale || tag.startsWith(`${locale}-`)) return locale;
    }
  }

  return defaultLocale;
}

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Check if the pathname already has a supported locale prefix
  const pathnameLocale = locales.find(
    (locale) =>
      pathname === `/${locale}` || pathname.startsWith(`/${locale}/`)
  );

  if (pathnameLocale) {
    // Already has a locale — pass through, but sync the cookie
    const response = NextResponse.next();
    response.cookies.set("shopi_locale", pathnameLocale, {
      path: "/",
      maxAge: 60 * 60 * 24 * 365, // 1 year
      sameSite: "lax",
    });
    return response;
  }

  // No locale in path — detect and redirect
  const locale = getPreferredLocale(request);
  const newUrl = request.nextUrl.clone();
  newUrl.pathname = `/${locale}${pathname}`;

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
    // Skip Next.js internals, static files, and API routes
    "/((?!_next|api|favicon.ico|manifest.json|og-default.png|robots.txt|sitemap.xml|.*\\..*).*)",
  ],
};
