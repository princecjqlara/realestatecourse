import { describe, expect, it } from "vitest";

import { resolveSubmittedSubtopicCallToAction, sanitizeStoredSubtopicCallToAction } from "./subtopic-cta";

describe("resolveSubmittedSubtopicCallToAction", () => {
  it("returns a trimmed CTA when label and URL are both present", () => {
    expect(
      resolveSubmittedSubtopicCallToAction({
        ctaLabel: "  Get tools here  ",
        ctaUrl: "  https://example.com/tools  ",
      }),
    ).toEqual({
      ctaLabel: "Get tools here",
      ctaUrl: "https://example.com/tools",
    });
  });

  it("clears the CTA when either field is missing", () => {
    expect(
      resolveSubmittedSubtopicCallToAction({
        ctaLabel: "Get tools here",
        ctaUrl: "",
      }),
    ).toEqual({
      ctaLabel: null,
      ctaUrl: null,
    });
  });

  it("rejects non-http CTA schemes", () => {
    expect(
      resolveSubmittedSubtopicCallToAction({
        ctaLabel: "Get tools here",
        ctaUrl: "javascript:alert(1)",
      }),
    ).toEqual({
      ctaLabel: null,
      ctaUrl: null,
    });
  });

  it("sanitizes unsafe CTA values that already exist in storage", () => {
    expect(
      sanitizeStoredSubtopicCallToAction({
        ctaLabel: "Open tools",
        ctaUrl: "javascript:alert(1)",
      }),
    ).toEqual({
      ctaLabel: null,
      ctaUrl: null,
    });
  });
});
