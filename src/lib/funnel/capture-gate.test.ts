import { describe, expect, it } from "vitest";

import { getLeadCaptureGateCopy } from "./capture-gate";

describe("getLeadCaptureGateCopy", () => {
  it("returns the locked state copy before the user presses play", () => {
    expect(getLeadCaptureGateCopy(false)).toEqual({
      description: "Pindutin mo muna ang play button sa video thumbnail. Pag ready ka na, saka lalabas ang short form.",
      kicker: "Step 2",
      title: "Play muna bago lumabas ang form",
    });
  });

  it("returns the unlocked state copy after the user presses play", () => {
    expect(getLeadCaptureGateCopy(true)).toEqual({
      description: "Short form lang ito. Pag-submit mo, unlocked na agad ang FREE course.",
      kicker: "Step 2",
      title: "Ilagay ang details mo para makuha ang FREE course",
    });
  });
});
