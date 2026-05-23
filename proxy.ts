import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function proxy(request: NextRequest) {
  const ua = request.headers.get("user-agent") ?? "";
  const isMobile = /Mobi|Android|iPhone|iPad|iPod/i.test(ua);
  const dest = isMobile ? "/feed" : "/home";
  return NextResponse.redirect(new URL(dest, request.url));
}

export const config = {
  matcher: ["/"],
};
