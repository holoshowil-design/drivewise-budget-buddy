/** GPS rules for the live trip tracker, kept pure so they can be tested. */

/** Fixes less accurate than this (meters) are ignored. */
export const MAX_ACCURACY_M = 60;
/** Minimum movement ever counted, in km (8 m). */
const MIN_STEP_KM = 0.008;
const MAX_SPEED_KMH = 220;
/** No movement for this long → ask "forgot to end the trip?". */
export const FORGOT_AFTER_MS = 45 * 60 * 1000;

/**
 * Distance that counts as real movement between two fixes. Standing still,
 * two fixes can disagree by up to their accuracy radius, so the threshold
 * grows with the worse of the two accuracies.
 */
export function movementThresholdKm(prevAccM: number | undefined, curAccM: number) {
  const worst = Math.max(prevAccM ?? curAccM, curAccM);
  return Math.max(MIN_STEP_KM, worst / 1000);
}

export type StepDecision = "move" | "stay" | "jump";

/** Classifies the step between the last anchor and a new fix. */
export function classifyStep(
  distKm: number,
  seconds: number,
  prevAccM: number | undefined,
  curAccM: number,
): StepDecision {
  if (distKm < movementThresholdKm(prevAccM, curAccM)) return "stay";
  const speed = (distKm / Math.max(0.001, seconds)) * 3600;
  return speed > MAX_SPEED_KMH ? "jump" : "move";
}

/** True when an active trip has not moved for a long time (likely forgotten). */
export function looksForgotten(
  trip: { startedAt: number; lastMoveAt?: number; forgotSnoozeUntil?: number },
  now: number,
) {
  if (now < (trip.forgotSnoozeUntil ?? 0)) return false;
  return now - (trip.lastMoveAt ?? trip.startedAt) >= FORGOT_AFTER_MS;
}
