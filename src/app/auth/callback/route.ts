import { NextResponse } from "next/server";

import { createSessionCookieValue, getSessionCookieOptions } from "@/lib/auth/cookies";
import { LEAD_COOKIE_MAX_AGE, LEAD_COOKIE_NAME } from "@/lib/auth/constants";
import { getLeadByEmail, recordAuthEvent } from "@/lib/funnel/repository";
import { getSupabaseServerClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");

  if (!code) {
    return NextResponse.redirect(new URL("/resume?status=invalid-link", request.url));
  }

  const supabase = await getSupabaseServerClient();
  if (!supabase) {
    return NextResponse.redirect(new URL("/resume?status=missing-config", request.url));
  }

  const { data, error } = await supabase.auth.exchangeCodeForSession(code);
  if (error) {
    return NextResponse.redirect(new URL("/resume?status=expired-link", request.url));
  }

  const email = data.user?.email;
  if (!email) {
    return NextResponse.redirect(new URL("/resume?status=email-not-found", request.url));
  }

  const lead = await getLeadByEmail(email);
  if (!lead) {
    return NextResponse.redirect(new URL("/resume?status=email-not-found", request.url));
  }

  await recordAuthEvent(lead.id, "magic-link-opened");
  await recordAuthEvent(lead.id, "resume-login");

  const response = NextResponse.redirect(new URL("/course", request.url));
  response.cookies.set(
    LEAD_COOKIE_NAME,
    createSessionCookieValue(lead.id, "lead"),
    getSessionCookieOptions(LEAD_COOKIE_MAX_AGE),
  );

  return response;
}
