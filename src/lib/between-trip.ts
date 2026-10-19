import type { ActiveTrip } from "@/lib/active-trip";
import type { Settings, Trip } from "@/lib/store";

/**
 * The drive between work trips (after dropping a customer, on the way to the next one):
 * it is measured for km, time and fuel, but it is not a work trip.
 */

/** No movement for this long closes the measurement, at the moment the car last moved. */
export const BETWEEN_IDLE_MS = 30 * 60 * 1000;
/** Less than this is GPS noise or a parking move, and is not kept (km). */
export const MIN_BETWEEN_KM = 0.1;

export const isBetween = (trip: { kind?: string } | null | undefined) => trip?.kind === "between";

/** Between-trips measuring is on unless the driver turned it off. */
export const trackBetweenOn = (settings: Pick<Settings, "trackBetween">) =>
  settings.trackBetween !== false;

/** Only the work trips (a trip without a kind is a work trip). */
export const workTrips = <T extends { kind?: string }>(trips: T[]) =>
  trips.filter((t) => t.kind !== "between");

export function startBetween(now: number, date: string, time: string): ActiveTrip {
  return { kind: "between", startedAt: now, date, time, km: 0, lastMoveAt: now };
}

/**
 * The trip to save when a between measurement ends at `endAt` (epoch ms), or null when
 * it was too short to matter. Time runs from the start to the end, never past it.
 */
export function betweenToTrip(
  cur: ActiveTrip,
  endAt: number,
  now = Date.now(),
): Omit<Trip, "id"> | null {
  if (cur.km < MIN_BETWEEN_KM) return null;
  const until = Math.max(cur.startedAt, Math.min(now, endAt));
  const seconds = Math.round((until - cur.startedAt) / 1000);
  return {
    kind: "between",
    date: cur.date,
    time: cur.time,
    km: Math.round(cur.km * 100) / 100,
    seconds,
    waitSeconds: Math.min(seconds, Math.round(cur.waitSeconds ?? 0)),
    endedAt: new Date(until).toISOString(),
  };
}

/** When a between measurement has stood still long enough to close: the last move, else null. */
export function betweenIdleEnd(cur: ActiveTrip, now: number): number | null {
  if (!isBetween(cur)) return null;
  const last = cur.lastMoveAt ?? cur.startedAt;
  return now - last >= BETWEEN_IDLE_MS ? last : null;
}
