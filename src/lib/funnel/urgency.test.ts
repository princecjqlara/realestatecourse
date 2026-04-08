import { describe, expect, it } from "vitest";

import { buildUrgencyState, getUrgencyCountdown, URGENCY_DURATION_MS, URGENCY_SLOTS_LEFT } from "./urgency";

describe("buildUrgencyState", () => {
  it("creates a deterministic timer with a fixed slots value", () => {
    expect(buildUrgencyState({ nowMs: 1_000, visitorKey: "visitor-123" })).toEqual({
      expiresAtMs: 1_000 + URGENCY_DURATION_MS,
      slotsLeft: URGENCY_SLOTS_LEFT,
    });
  });
});

describe("getUrgencyCountdown", () => {
  it("returns countdown parts while the offer is active", () => {
    const countdown = getUrgencyCountdown(
        {
          expiresAtMs: 3 * 24 * 60 * 60 * 1000,
          slotsLeft: 10,
        },
      24 * 60 * 60 * 1000 + 61_000,
    );

    expect(countdown).toEqual({
      days: 1,
      hours: 23,
      minutes: 58,
      seconds: 59,
      slotsLeft: URGENCY_SLOTS_LEFT,
      totalMsLeft: 172_739_000,
      isExpired: false,
    });
  });

  it("clamps the countdown after expiry", () => {
    expect(
      getUrgencyCountdown(
        {
          expiresAtMs: 5_000,
          slotsLeft: 10,
        },
        8_000,
      ),
    ).toEqual({
      days: 0,
      hours: 0,
      minutes: 0,
      seconds: 0,
      slotsLeft: URGENCY_SLOTS_LEFT,
      totalMsLeft: 0,
      isExpired: true,
    });
  });
});
