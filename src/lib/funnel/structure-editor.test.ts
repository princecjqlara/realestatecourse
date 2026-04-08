import { describe, expect, it } from "vitest";

import { resolveStructureEditorIntent } from "./structure-editor";

describe("resolveStructureEditorIntent", () => {
  it("normalizes a topic delete action", () => {
    expect(
      resolveStructureEditorIntent({
        entityId: " topic-1 ",
        entityType: "topic",
        intent: "delete",
      }),
    ).toEqual({
      entityId: "topic-1",
      entityType: "topic",
      intent: "delete",
    });
  });

  it("rejects invalid editor actions", () => {
    expect(() =>
      resolveStructureEditorIntent({
        entityId: "",
        entityType: "subtopic",
        intent: "edit",
      }),
    ).toThrow(/entity/i);
  });
});
