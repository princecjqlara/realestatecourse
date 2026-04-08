import { describe, expect, it } from "vitest";

import { resolveSubmittedSubtopicButtons, sanitizeStoredSubtopicButtons } from "./subtopic-buttons";

describe("resolveSubmittedSubtopicButtons", () => {
  it("keeps multiple valid lesson buttons", () => {
    expect(
      resolveSubmittedSubtopicButtons([
        { label: " Get tools here ", url: " https://example.com/tools " },
        { label: " Book setup ", url: " https://example.com/setup " },
      ]),
    ).toEqual([
      { label: "Get tools here", url: "https://example.com/tools" },
      { label: "Book setup", url: "https://example.com/setup" },
    ]);
  });

  it("drops incomplete or unsafe button rows", () => {
    expect(
      resolveSubmittedSubtopicButtons([
        { label: "Get tools here", url: "javascript:alert(1)" },
        { label: "", url: "https://example.com/setup" },
        { label: "Book setup", url: "https://example.com/setup" },
      ]),
    ).toEqual([{ label: "Book setup", url: "https://example.com/setup" }]);
  });
});

describe("sanitizeStoredSubtopicButtons", () => {
  it("removes unsafe stored button values", () => {
    expect(
      sanitizeStoredSubtopicButtons([
        { label: "Open tools", url: "javascript:alert(1)" },
        { label: "Book setup", url: "https://example.com/setup" },
      ]),
    ).toEqual([{ label: "Book setup", url: "https://example.com/setup" }]);
  });
});
