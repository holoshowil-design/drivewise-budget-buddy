import type { ActiveTrip } from "@/lib/active-trip";
import { closeStop } from "@/lib/trip-stops";

/**
 * A trip that started by itself when driving was detected (`auto`). It measures
 * from the moment the car started moving, and the driver says later what it was:
 * work keeps it as a work trip, "on the way" makes it a drive between trips, and
 * private keeps it as a private drive (km and fuel only, outside the work numbers).
 */

export const isUnconfirmedAuto = (trip: ActiveTrip | null | undefined) =>
  trip?.auto === true && (!trip.kind || trip.kind === "work");

/** Yes, it is a work trip: from here on it is an ordinary trip. */
export function confirmAuto(cur: ActiveTrip): ActiveTrip {
  return cur.auto ? { ...cur, auto: false } : cur;
}

/** Not a work trip: keep measuring it as a drive between trips or a private drive. */
export function autoToSide(
  cur: ActiveTrip,
  kind: "between" | "private",
  now = Date.now(),
): ActiveTrip {
  const closed = closeStop(cur, now);
  return {
    ...closed,
    kind,
    auto: false,
    stop: undefined,
    stops: undefined,
    // A work trip's waiting is not "waiting for a ride"; standing is counted afresh.
    waitSeconds: undefined,
  };
}
