import { describe, expect, it } from "vitest";

import { getLeadFormSteps } from "./lead-form-steps";

describe("getLeadFormSteps", () => {
  it("returns the lead form as a one-field-per-step sequence", () => {
    expect(getLeadFormSteps().map((step) => step.name)).toEqual([
      "fullName",
      "email",
      "phone",
    ]);
  });
});
