function isSafeCtaUrl(value: string) {
  try {
    const parsedUrl = new URL(value);
    return parsedUrl.protocol === "http:" || parsedUrl.protocol === "https:";
  } catch {
    return false;
  }
}

export function resolveSubmittedSubtopicCallToAction(input: {
  ctaLabel: string;
  ctaUrl: string;
}) {
  const ctaLabel = input.ctaLabel.trim();
  const ctaUrl = input.ctaUrl.trim();

  if (!ctaLabel || !ctaUrl) {
    return {
      ctaLabel: null,
      ctaUrl: null,
    };
  }

  if (!isSafeCtaUrl(ctaUrl)) {
    return {
      ctaLabel: null,
      ctaUrl: null,
    };
  }

  return {
    ctaLabel,
    ctaUrl,
  };
}

export function sanitizeStoredSubtopicCallToAction(input: {
  ctaLabel: string | null;
  ctaUrl: string | null;
}) {
  const ctaLabel = input.ctaLabel?.trim() || null;
  const ctaUrl = input.ctaUrl?.trim() || null;

  if (!ctaLabel || !ctaUrl || !isSafeCtaUrl(ctaUrl)) {
    return {
      ctaLabel: null,
      ctaUrl: null,
    };
  }

  return {
    ctaLabel,
    ctaUrl,
  };
}
