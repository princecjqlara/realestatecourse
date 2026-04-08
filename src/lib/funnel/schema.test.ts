import { describe, expect, it } from "vitest";

import { parseLeadFormInput } from "./schema";

describe("parseLeadFormInput", () => {
  it("normalizes a valid lead submission", () => {
    const result = parseLeadFormInput({
      fullName: "  Jane Smith  ",
      email: "  JANE@example.com  ",
      phone: " +1 (555) 123-4567 ",
      companies: "HomeRise Realty, Skyline Estates",
      propertyTypes: "Condos\nLuxury villas",
      salesFocus: "  High-end residential  ",
    });

    expect(result).toEqual({
      fullName: "Jane Smith",
      email: "jane@example.com",
      phone: "+15551234567",
      companies: ["HomeRise Realty", "Skyline Estates"],
      propertyTypes: ["Condos", "Luxury villas"],
      salesFocus: "High-end residential",
    });
  });

  it("rejects invalid lead submissions", () => {
    expect(() =>
      parseLeadFormInput({
        fullName: "John Smith",
        email: "not-an-email",
        phone: "+1 555 555 5555",
        companies: "Skyline Estates",
        propertyTypes: "Condos",
        salesFocus: "Luxury listings",
      }),
    ).toThrow(/valid email/i);
  });
});
