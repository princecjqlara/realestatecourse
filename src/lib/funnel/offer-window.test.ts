import { describe, expect, it } from "vitest";

import {
  decodeOfferWindow,
  readOfferWindowFromCookieString,
  readSignedOfferWindow,
  writeSignedOfferWindow,
} from "./offer-window";

describe("offer window encoding", () => {
  it("round-trips a signed offer window payload", async () => {
    const encoded = await writeSignedOfferWindow(
      {
        expiresAtMs: 123_456,
        slotsLeft: 7,
      },
      "top-secret",
    );

    expect(await readSignedOfferWindow(encoded, "top-secret")).toEqual({
      expiresAtMs: 123_456,
      slotsLeft: 7,
    });
  });

  it("rejects tampered signed offer window tokens", async () => {
    const encoded = await writeSignedOfferWindow(
      {
        expiresAtMs: 123_456,
        slotsLeft: 7,
      },
      "top-secret",
    );

    expect(await readSignedOfferWindow(`${encoded}tampered`, "top-secret")).toBeNull();
  });

  it("returns null for invalid offer window payloads", () => {
    expect(decodeOfferWindow("not-valid")).toBeNull();
  });

  it("extracts the offer window payload from a cookie string", async () => {
    const token = await writeSignedOfferWindow(
      {
        expiresAtMs: 999,
        slotsLeft: 6,
      },
      "top-secret",
    );

    expect(readOfferWindowFromCookieString(`foo=1; offer_window=${token}; bar=2`)).toEqual({
      expiresAtMs: 999,
      slotsLeft: 6,
    });
  });
});
