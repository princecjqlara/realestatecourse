import { cookies } from "next/headers";

import {
  ADMIN_COOKIE_MAX_AGE,
  ADMIN_COOKIE_NAME,
  LEAD_COOKIE_MAX_AGE,
  LEAD_COOKIE_NAME,
} from "./constants";
import { readSessionToken, writeSessionToken } from "./session";

const baseCookieOptions = {
  httpOnly: true,
  sameSite: "lax" as const,
  secure: process.env.NODE_ENV === "production",
  path: "/",
};

function getSessionSecret() {
  if (process.env.APP_SESSION_SECRET) {
    return process.env.APP_SESSION_SECRET;
  }

  if (process.env.NODE_ENV === "production") {
    throw new Error("APP_SESSION_SECRET must be configured in production.");
  }

  return "local-development-session-secret";
}

export function createSessionCookieValue(subject: string, role: "lead" | "admin") {
  return writeSessionToken({ subject, role }, getSessionSecret());
}

export function parseSessionCookieValue(
  value: string | undefined,
  role: "lead" | "admin",
) {
  if (!value) {
    return null;
  }

  const payload = readSessionToken(value, getSessionSecret());
  if (!payload || payload.role !== role) {
    return null;
  }

  return payload.subject;
}

export function getSessionCookieOptions(maxAge: number) {
  return {
    ...baseCookieOptions,
    maxAge,
  };
}

export async function setLeadSession(leadId: string) {
  const cookieStore = await cookies();
  cookieStore.set(
    LEAD_COOKIE_NAME,
    createSessionCookieValue(leadId, "lead"),
    getSessionCookieOptions(LEAD_COOKIE_MAX_AGE),
  );
}

export async function setAdminSession(subject = "admin") {
  const cookieStore = await cookies();
  cookieStore.set(
    ADMIN_COOKIE_NAME,
    createSessionCookieValue(subject, "admin"),
    getSessionCookieOptions(ADMIN_COOKIE_MAX_AGE),
  );
}

export async function clearLeadSession() {
  const cookieStore = await cookies();
  cookieStore.delete(LEAD_COOKIE_NAME);
}

export async function clearAdminSession() {
  const cookieStore = await cookies();
  cookieStore.delete(ADMIN_COOKIE_NAME);
}

export async function getLeadSessionId() {
  const cookieStore = await cookies();
  return parseSessionCookieValue(cookieStore.get(LEAD_COOKIE_NAME)?.value, "lead");
}

export async function getAdminSessionId() {
  const cookieStore = await cookies();
  return parseSessionCookieValue(cookieStore.get(ADMIN_COOKIE_NAME)?.value, "admin");
}
