import { describe, expect, it } from "vitest";

import { parseLeadFormInput } from "./schema";

describe("parseLeadFormInput", () => {
  it("normalizes a valid lead submission", () => {
    const result = parseLeadFormInput({
      fullName: "  Jane Smith  ",
      email: "  JANE@example.com  ",
      phone: " +1 (555) 123-4567 ",
    });

    expect(result).toEqual({
      fullName: "Jane Smith",
      email: "jane@example.com",
      phone: "+15551234567",
      companies: [],
      propertyTypes: [],
      salesFocus: "",
    });
  });

  it("rejects invalid lead submissions", () => {
    expect(() =>
      parseLeadFormInput({
        fullName: "John Smith",
        email: "not-an-email",
        phone: "+1 555 555 5555",
      }),
    ).toThrow(/valid email/i);
  });
});
