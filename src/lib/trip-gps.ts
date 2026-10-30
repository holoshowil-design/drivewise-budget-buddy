import { haversine, type ActiveTrip } from "@/lib/active-trip";
import { classifyStep, MAX_ACCURACY_M } from "@/lib/gps";
import type { Fix } from "@/lib/location";
import { addPathPoint } from "@/lib/trip-path";

/**
 * The active trip after one GPS fix, or null when the fix changes nothing.
 * Real movement adds the distance from the last anchor; standing still keeps
 * the anchor (adopting a sharper accuracy), and an impossible jump only moves
 * the anchor.
 */
export function applyFix(cur: ActiveTrip, fix: Fix, now: number): ActiveTrip | null {
  const acc = fix.accuracy;
  if (acc > MAX_ACCURACY_M) return null;
  const point = { lat: fix.lat, lon: fix.lon, t: fix.time, acc };
  if (cur.last) {
    const d = haversine(cur.last, point);
    const step = classifyStep(d, (point.t - cur.last.t) / 1000, cur.last.acc, acc, fix.speedKmh);
    if (step === "move")
      return {
        ...cur,
        km: cur.km + d,
        last: point,
        lastMoveAt: now,
        path: addPathPoint(cur.path, point),
      };
    if (step === "stay") {
      return acc < (cur.last.acc ?? Infinity)
        ? { ...cur, last: { ...point, lat: cur.last.lat, lon: cur.last.lon } }
        : null;
    }
  }
  // The first fix starts the route; a jump only moves the anchor.
  return cur.last
    ? { ...cur, last: point }
    : { ...cur, last: point, path: addPathPoint(cur.path, point) };
}

/** Latest GPS problem of the running trip, for the trip screen to show. */
export const GPS_ERROR_EVENT = "driver-trip-gps-error";
let gpsError: string | null = null;

export function readGpsError() {
  return gpsError;
}

export function setGpsError(message: string | null) {
  if (message === gpsError) return;
  gpsError = message;
  if (typeof window !== "undefined") window.dispatchEvent(new Event(GPS_ERROR_EVENT));
}
