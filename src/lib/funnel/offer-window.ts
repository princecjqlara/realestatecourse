import type { UrgencyState } from "./urgency";

export const OFFER_WINDOW_COOKIE_NAME = "offer_window";
export const OFFER_WINDOW_COOKIE_MAX_AGE = 60 * 60 * 24 * 30;

function toBase64Url(bytes: Uint8Array) {
  let binary = "";

  for (const byte of bytes) {
    binary += String.fromCharCode(byte);
  }

  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

function fromBase64Url(value: string) {
  const normalized = value.replace(/-/g, "+").replace(/_/g, "/");
  const padding = normalized.length % 4 === 0 ? "" : "=".repeat(4 - (normalized.length % 4));
  const binary = atob(`${normalized}${padding}`);
  const bytes = new Uint8Array(binary.length);

  for (let index = 0; index < binary.length; index += 1) {
    bytes[index] = binary.charCodeAt(index);
  }

  return bytes;
}

function encodePayload(input: UrgencyState) {
  return toBase64Url(new TextEncoder().encode(JSON.stringify(input)));
}

async function signPayload(payload: string, secret: string) {
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    {
      name: "HMAC",
      hash: "SHA-256",
    },
    false,
    ["sign"],
  );

  const signature = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(payload));
  return toBase64Url(new Uint8Array(signature));
}

function constantTimeEqual(left: string, right: string) {
  if (left.length !== right.length) {
    return false;
  }

  let mismatch = 0;

  for (let index = 0; index < left.length; index += 1) {
    mismatch |= left.charCodeAt(index) ^ right.charCodeAt(index);
  }

  return mismatch === 0;
}

export function decodeOfferWindow(value: string | undefined) {
  if (!value) {
    return null;
  }

  try {
    const parsed = JSON.parse(new TextDecoder().decode(fromBase64Url(value))) as Partial<UrgencyState>;

    if (typeof parsed.expiresAtMs !== "number" || typeof parsed.slotsLeft !== "number") {
      return null;
    }

    return {
      expiresAtMs: parsed.expiresAtMs,
      slotsLeft: parsed.slotsLeft,
    } satisfies UrgencyState;
  } catch {
    return null;
  }
}

export async function writeSignedOfferWindow(input: UrgencyState, secret: string) {
  const payload = encodePayload(input);
  const signature = await signPayload(payload, secret);

  return `${payload}.${signature}`;
}

export async function readSignedOfferWindow(value: string | undefined, secret: string) {
  if (!value) {
    return null;
  }

  const [payload, signature] = value.split(".");
  if (!payload || !signature) {
    return null;
  }

  const expectedSignature = await signPayload(payload, secret);
  if (!constantTimeEqual(expectedSignature, signature)) {
    return null;
  }

  return decodeOfferWindow(payload);
}

export function readOfferWindowFromCookieString(cookieString: string) {
  const match = cookieString.match(/(?:^|;\s*)offer_window=([^;]+)/);

  if (!match?.[1]) {
    return null;
  }

  const [payload] = match[1].split(".");
  return decodeOfferWindow(payload);
}
