export const URGENCY_DURATION_MS = 3 * 24 * 60 * 60 * 1000;
export const URGENCY_SLOTS_LEFT = 7;

export type UrgencyState = {
  expiresAtMs: number;
  slotsLeft: number;
};

export function buildUrgencyState(input: { nowMs: number; visitorKey: string }): UrgencyState {
  return {
    expiresAtMs: input.nowMs + URGENCY_DURATION_MS,
    slotsLeft: URGENCY_SLOTS_LEFT,
  };
}

export function getUrgencyCountdown(state: UrgencyState, nowMs: number) {
  const totalMsLeft = Math.max(0, state.expiresAtMs - nowMs);
  const totalSecondsLeft = Math.floor(totalMsLeft / 1000);
  const days = Math.floor(totalSecondsLeft / 86_400);
  const hours = Math.floor((totalSecondsLeft % 86_400) / 3_600);
  const minutes = Math.floor((totalSecondsLeft % 3_600) / 60);
  const seconds = totalSecondsLeft % 60;

  return {
    days,
    hours,
    minutes,
    seconds,
    slotsLeft: URGENCY_SLOTS_LEFT,
    totalMsLeft,
    isExpired: totalMsLeft === 0,
  };
}
