export type SubtopicButton = {
  label: string;
  url: string;
};

function isSafeButtonUrl(value: string) {
  try {
    const parsedUrl = new URL(value);
    return parsedUrl.protocol === "http:" || parsedUrl.protocol === "https:";
  } catch {
    return false;
  }
}

function normalizeButton(input: { label: string; url: string }) {
  const label = input.label.trim();
  const url = input.url.trim();

  if (!label || !url || !isSafeButtonUrl(url)) {
    return null;
  }

  return {
    label,
    url,
  } satisfies SubtopicButton;
}

export function resolveSubmittedSubtopicButtons(buttons: Array<{ label: string; url: string }>) {
  return buttons.map(normalizeButton).filter((button): button is SubtopicButton => Boolean(button));
}

export function sanitizeStoredSubtopicButtons(buttons: Array<{ label: string; url: string }>) {
  return resolveSubmittedSubtopicButtons(buttons);
}
