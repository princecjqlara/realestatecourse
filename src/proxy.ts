import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

import { ADMIN_COOKIE_NAME, LEAD_COOKIE_NAME } from "@/lib/auth/constants";
import { getAppSessionSecret } from "@/lib/auth/secret";
import { buildUrgencyState } from "@/lib/funnel/urgency";
import {
  OFFER_WINDOW_COOKIE_MAX_AGE,
  OFFER_WINDOW_COOKIE_NAME,
  readSignedOfferWindow,
  writeSignedOfferWindow,
} from "@/lib/funnel/offer-window";

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const response = NextResponse.next();

  if (pathname === "/") {
    const existingOfferWindow = await readSignedOfferWindow(
      request.cookies.get(OFFER_WINDOW_COOKIE_NAME)?.value,
      getAppSessionSecret(),
    );

    if (!existingOfferWindow || existingOfferWindow.slotsLeft !== 7) {
      response.cookies.set(
        OFFER_WINDOW_COOKIE_NAME,
        await writeSignedOfferWindow(
          buildUrgencyState({
            nowMs: Date.now(),
            visitorKey: crypto.randomUUID(),
          }),
          getAppSessionSecret(),
        ),
        {
          httpOnly: false,
          sameSite: "lax",
          secure: process.env.NODE_ENV === "production",
          path: "/",
          maxAge: OFFER_WINDOW_COOKIE_MAX_AGE,
        },
      );
    }
  }

  if (pathname.startsWith("/course") && !request.cookies.get(LEAD_COOKIE_NAME)) {
    return NextResponse.redirect(new URL("/resume", request.url));
  }

  const isAdminProtectedRoute =
    pathname.startsWith("/admin/dashboard") || pathname.startsWith("/admin/content");

  if (isAdminProtectedRoute && !request.cookies.get(ADMIN_COOKIE_NAME)) {
    return NextResponse.redirect(new URL("/admin", request.url));
  }

  return response;
}

export const config = {
  matcher: ["/", "/course/:path*", "/admin/dashboard/:path*", "/admin/content/:path*"],
};
