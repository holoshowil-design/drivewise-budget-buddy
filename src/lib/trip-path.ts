import { haversine } from "@/lib/active-trip";
import { nearestPlace } from "@/lib/places";

/**
 * The drawn route of a trip, kept small enough to sync: [lat, lon] pairs rounded
 * to 4 decimals (about 11 m), one point every PATH_STEP_KM of real movement.
 */
export type PathPoint = [number, number];

export const PATH_STEP_KM = 0.25;
/** A longer route is thinned to half its points, so a trip never stores more than this. */
export const MAX_PATH_POINTS = 300;

const round = (n: number) => Math.round(n * 10_000) / 10_000;

/** The path with this position added, or the same path when it is too close to the last point. */
export function addPathPoint(
  path: PathPoint[] | undefined,
  at: { lat: number; lon: number },
  force = false,
): PathPoint[] {
  const p: PathPoint = [round(at.lat), round(at.lon)];
  const list = path ?? [];
  const last = list[list.length - 1];
  if (last) {
    const d = haversine({ lat: last[0], lon: last[1] }, { lat: p[0], lon: p[1] });
    if (d < (force ? 0.02 : PATH_STEP_KM)) return list;
  }
  const next = [...list, p];
  return next.length > MAX_PATH_POINTS ? thin(next) : next;
}

/** Every other point, always keeping the first and the last. */
export function thin(path: PathPoint[]): PathPoint[] {
  const out = path.filter((_, i) => i % 2 === 0);
  const last = path[path.length - 1];
  if (out[out.length - 1] !== last) out.push(last);
  return out;
}

/**
 * The path to save when a trip ends: what was recorded plus the last fix, or
 * undefined when there is nothing to draw (no GPS, or the car never moved).
 */
export function finishPath(cur: {
  path?: PathPoint[];
  last?: { lat: number; lon: number };
}): PathPoint[] | undefined {
  const path = cur.last ? addPathPoint(cur.path, cur.last, true) : (cur.path ?? []);
  return path.length >= 2 ? path : undefined;
}

/**
 * Two points further apart than this cannot come from steady GPS (a point is
 * kept every PATH_STEP_KM), so the phone sent no location in between: the app
 * was stopped or the location was off. That stretch is a straight guess.
 */
export const GAP_KM = 1.5;

/** The route split into stretches that GPS followed and straight gaps where it did not. */
export function splitGaps(path: PathPoint[]): { line: PathPoint[]; gap: boolean }[] {
  const parts: { line: PathPoint[]; gap: boolean }[] = [];
  for (let i = 1; i < path.length; i++) {
    const a = path[i - 1];
    const b = path[i];
    const gap = haversine({ lat: a[0], lon: a[1] }, { lat: b[0], lon: b[1] }) > GAP_KM;
    const cur = parts[parts.length - 1];
    if (cur && cur.gap === gap) cur.line.push(b);
    else parts.push({ line: [a, b], gap });
  }
  return parts;
}

type DrawnTrip = { date: string; time?: string; path?: PathPoint[] };

/** The trips that have a route, oldest first. */
export function routedTrips<T extends DrawnTrip>(trips: T[]): (T & { path: PathPoint[] })[] {
  return trips
    .filter((t): t is T & { path: PathPoint[] } => Array.isArray(t.path) && t.path.length >= 2)
    .sort((a, b) => `${a.date} ${a.time ?? ""}`.localeCompare(`${b.date} ${b.time ?? ""}`));
}

/**
 * The places along the trips in order, e.g. ["ירושלים", "בני ברק", "אשדוד"]:
 * each trip's start and end, with a place repeated in a row named once.
 */
export function routeStops(trips: DrawnTrip[]): string[] {
  const stops: string[] = [];
  const push = (p: PathPoint) => {
    const name = nearestPlace(p[0], p[1])?.name;
    if (name && stops[stops.length - 1] !== name) stops.push(name);
  };
  for (const t of routedTrips(trips)) {
    push(t.path[0]);
    push(t.path[t.path.length - 1]);
  }
  return stops;
}

/** How many trips started or ended in each place, most visited first. */
export function placeCounts(trips: DrawnTrip[]) {
  const counts = new Map<string, { name: string; lat: number; lon: number; count: number }>();
  for (const t of routedTrips(trips)) {
    for (const p of [t.path[0], t.path[t.path.length - 1]]) {
      const place = nearestPlace(p[0], p[1]);
      if (!place) continue;
      const cur = counts.get(place.name) ?? { ...place, count: 0 };
      cur.count += 1;
      counts.set(place.name, cur);
    }
  }
  return [...counts.values()].sort((a, b) => b.count - a.count);
}
