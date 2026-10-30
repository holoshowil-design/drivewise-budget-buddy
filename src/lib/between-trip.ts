import type { ActiveTrip } from "@/lib/active-trip";
import type { Settings, Trip } from "@/lib/store";
import { finishPath } from "@/lib/trip-path";

/**
 * The time between work trips (after dropping a customer, until the next one or until the
 * driver says the work day is over): measured for km, time and fuel, but it is not a work
 * trip. Waiting for the next customer is work time too, so it runs while the car stands.
 */

/**
 * A safety net for a measurement left running (the driver forgot "finished work"): no
 * movement for this long closes it, at the moment the car last moved.
 */
export const BETWEEN_IDLE_MS = 4 * 60 * 60 * 1000;
/** Less than this is GPS noise or a parking move (km)... */
export const MIN_BETWEEN_KM = 0.1;
/** ...unless the time is worth keeping on its own (waiting for the next customer, seconds). */
export const MIN_BETWEEN_SECONDS = 60;

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
  const until = Math.max(cur.startedAt, Math.min(now, endAt));
  const seconds = Math.round((until - cur.startedAt) / 1000);
  if (cur.km < MIN_BETWEEN_KM && seconds < MIN_BETWEEN_SECONDS) return null;
  return {
    kind: "between",
    date: cur.date,
    time: cur.time,
    km: Math.round(cur.km * 100) / 100,
    seconds,
    waitSeconds: Math.min(seconds, Math.round(cur.waitSeconds ?? 0)),
    endedAt: new Date(until).toISOString(),
    path: finishPath(cur),
  };
}

/** When a between measurement has stood still long enough to close: the last move, else null. */
export function betweenIdleEnd(cur: ActiveTrip, now: number): number | null {
  if (!isBetween(cur)) return null;
  const last = cur.lastMoveAt ?? cur.startedAt;
  return now - last >= BETWEEN_IDLE_MS ? last : null;
}

/** Work time on `date` so far: saved trips of both kinds, plus the running one (seconds). */
export function workSecondsOn(
  trips: Pick<Trip, "date" | "seconds">[],
  date: string,
  running?: { date: string; seconds: number } | null,
) {
  const saved = trips.filter((t) => t.date === date).reduce((s, t) => s + (t.seconds || 0), 0);
  return saved + (running && running.date === date ? running.seconds : 0);
}
