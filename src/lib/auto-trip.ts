import { writeActive, type ActiveTrip } from "@/lib/active-trip";
import { closeStop } from "@/lib/trip-stops";

/**
 * A trip that started by itself when driving was detected (`auto`). It measures
 * from the moment the car started moving, and the driver says later whether it
 * was a work trip: yes keeps it, no throws it away, "on the way" keeps only the
 * km as a drive between trips.
 */

export const SNOOZE_KEY = "driver-detect-snooze";
/** After "private drive", detection stays quiet until the car has stood this long. */
export const PRIVATE_QUIET_MS = 15 * 60 * 1000;

export const isUnconfirmedAuto = (trip: ActiveTrip | null | undefined) =>
  trip?.auto === true && trip.kind !== "between";

/** Detection is quiet until this time (epoch ms). */
export function snoozedUntil(): number {
  try {
    return Number(localStorage.getItem(SNOOZE_KEY) || 0);
  } catch {
    return 0;
  }
}

export function snoozeDetect(until: number) {
  try {
    localStorage.setItem(SNOOZE_KEY, String(until));
  } catch {
    /* storage blocked: detection may ask again */
  }
}

/** Yes, it is a work trip: from here on it is an ordinary trip. */
export function confirmAuto(cur: ActiveTrip): ActiveTrip {
  return cur.auto ? { ...cur, auto: false } : cur;
}

/** No, a private drive: nothing is saved, and detection stays quiet while it goes on. */
export function discardAuto(now = Date.now()) {
  writeActive(null);
  snoozeDetect(now + PRIVATE_QUIET_MS);
}

/** On the way to a customer: keep the km and time as a drive between trips. */
export function autoToBetween(cur: ActiveTrip, now = Date.now()): ActiveTrip {
  const closed = closeStop(cur, now);
  return { ...closed, kind: "between", auto: undefined, stop: undefined, stops: undefined };
}
