import { describe, expect, it } from "vitest";

import { readSessionToken, writeSessionToken } from "./session";

describe("session tokens", () => {
  it("round-trips a signed session payload", () => {
    const token = writeSessionToken(
      {
        subject: "lead-1",
        role: "lead",
      },
      "top-secret",
    );

    expect(readSessionToken(token, "top-secret")).toEqual({
      subject: "lead-1",
      role: "lead",
    });
  });

  it("rejects tampered tokens", () => {
    const token = writeSessionToken(
      {
        subject: "admin-1",
        role: "admin",
      },
      "top-secret",
    );

    expect(readSessionToken(`${token}tampered`, "top-secret")).toBeNull();
  });
});
