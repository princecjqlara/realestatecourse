import { NextResponse } from "next/server";
import { cookies } from "next/headers";

import { getAppSessionSecret } from "@/lib/auth/secret";
import { OFFER_WINDOW_COOKIE_NAME, readSignedOfferWindow } from "@/lib/funnel/offer-window";

export async function GET() {
  const cookieStore = await cookies();
  const offerWindow = await readSignedOfferWindow(
    cookieStore.get(OFFER_WINDOW_COOKIE_NAME)?.value,
    getAppSessionSecret(),
  );

  if (!offerWindow) {
    return NextResponse.json({ error: "Offer window not found." }, { status: 404 });
  }

  return NextResponse.json(offerWindow);
}
