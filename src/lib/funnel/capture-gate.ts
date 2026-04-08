export function getLeadCaptureGateCopy(isUnlocked: boolean) {
  if (isUnlocked) {
    return {
      kicker: "Step 2",
      title: "Ilagay ang details mo para makuha ang FREE course",
      description: "Short form lang ito. Pag-submit mo, unlocked na agad ang FREE course.",
    };
  }

  return {
    kicker: "Step 2",
    title: "Play muna bago lumabas ang form",
    description:
      "Pindutin mo muna ang play button sa video thumbnail. Pag ready ka na, saka lalabas ang short form.",
  };
}
