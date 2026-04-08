import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

import { ADMIN_COOKIE_NAME, LEAD_COOKIE_NAME } from "@/lib/auth/constants";

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname.startsWith("/course") && !request.cookies.get(LEAD_COOKIE_NAME)) {
    return NextResponse.redirect(new URL("/resume", request.url));
  }

  const isAdminProtectedRoute =
    pathname.startsWith("/admin/dashboard") || pathname.startsWith("/admin/content");

  if (isAdminProtectedRoute && !request.cookies.get(ADMIN_COOKIE_NAME)) {
    return NextResponse.redirect(new URL("/admin", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/course/:path*", "/admin/dashboard/:path*", "/admin/content/:path*"],
};
