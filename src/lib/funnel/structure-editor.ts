export function resolveStructureEditorIntent(input: {
  entityId: string;
  entityType: string;
  intent: string;
}) {
  const entityId = input.entityId.trim();
  const entityType = input.entityType.trim();
  const intent = input.intent.trim();

  if (!entityId) {
    throw new Error("A valid entity id is required.");
  }

  if (entityType !== "topic" && entityType !== "subtopic") {
    throw new Error("A valid entity type is required.");
  }

  if (intent !== "edit" && intent !== "delete") {
    throw new Error("A valid editor intent is required.");
  }

  return {
    entityId,
    entityType,
    intent,
  } as {
    entityId: string;
    entityType: "topic" | "subtopic";
    intent: "edit" | "delete";
  };
}
