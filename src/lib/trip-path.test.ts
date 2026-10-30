import { describe, expect, it } from "vitest";
import type { ActiveTrip } from "@/lib/active-trip";
import { applyFix } from "@/lib/trip-gps";
import { nearestPlace } from "@/lib/places";
import {
  addPathPoint,
  finishPath,
  MAX_PATH_POINTS,
  placeCounts,
  routeStops,
  type PathPoint,
} from "@/lib/trip-path";

const T0 = 1_760_000_000_000;
const JERUSALEM: PathPoint = [31.778, 35.215];
const BNEI_BRAK: PathPoint = [32.084, 34.834];
const ASHDOD: PathPoint = [31.804, 34.655];

describe("addPathPoint", () => {
  it("starts the path and rounds to 4 decimals", () => {
    expect(addPathPoint(undefined, { lat: 32.123456, lon: 34.987654 })).toEqual([
      [32.1235, 34.9877],
    ]);
  });

  it("skips a point closer than the step and adds one past it", () => {
    const start = addPathPoint(undefined, { lat: 32, lon: 34.8 });
    expect(addPathPoint(start, { lat: 32.001, lon: 34.8 })).toBe(start); // ~110 m
    expect(addPathPoint(start, { lat: 32.003, lon: 34.8 })).toHaveLength(2); // ~330 m
  });

  it("never grows past the limit", () => {
    let path: PathPoint[] = [];
    for (let i = 0; i < 2000; i++) path = addPathPoint(path, { lat: 31 + i * 0.003, lon: 34.8 });
    expect(path.length).toBeLessThanOrEqual(MAX_PATH_POINTS);
    expect(path[0]).toEqual([31, 34.8]);
    expect(path[path.length - 1][0]).toBeCloseTo(31 + 1999 * 0.003, 4);
  });
});

describe("finishPath", () => {
  it("adds the last fix and needs two points", () => {
    expect(finishPath({ path: [[32, 34.8]], last: { lat: 32.002, lon: 34.8 } })).toEqual([
      [32, 34.8],
      [32.002, 34.8],
    ]);
    expect(finishPath({ path: [[32, 34.8]], last: { lat: 32, lon: 34.8 } })).toBeUndefined();
    expect(finishPath({})).toBeUndefined();
  });
});

describe("applyFix records the route", () => {
  const trip: ActiveTrip = { startedAt: T0, date: "2026-10-30", time: "10:00", km: 0 };
  const fix = (lat: number, secs: number) => ({
    lat,
    lon: 34.8,
    accuracy: 5,
    speedKmh: 40,
    time: T0 + secs * 1000,
  });

  it("starts at the first fix and adds real movement", () => {
    const a = applyFix(trip, fix(32, 0), T0)!;
    expect(a.path).toEqual([[32, 34.8]]);
    const b = applyFix(a, fix(32.003, 30), T0 + 30_000)!;
    expect(b.path).toHaveLength(2);
  });

  it("does not draw an impossible jump", () => {
    const a = applyFix(trip, fix(32, 0), T0)!;
    const b = applyFix(a, fix(32.5, 1), T0 + 1000)!;
    expect(b.path).toEqual([[32, 34.8]]);
  });
});

describe("places", () => {
  it("names the town a point is in", () => {
    expect(nearestPlace(...JERUSALEM)?.name).toBe("ירושלים");
    expect(nearestPlace(...BNEI_BRAK)?.name).toBe("בני ברק");
    expect(nearestPlace(...ASHDOD)?.name).toBe("אשדוד");
    expect(nearestPlace(30.5, 34.9)).toBeNull(); // the open desert
  });

  it("lists the stops in order, once in a row", () => {
    const trips = [
      { date: "2026-10-02", time: "09:00", path: [BNEI_BRAK, ASHDOD] },
      { date: "2026-10-01", time: "08:00", path: [JERUSALEM, BNEI_BRAK] },
      { date: "2026-10-01", time: "07:00" }, // a trip from before the map
    ];
    expect(routeStops(trips)).toEqual(["ירושלים", "בני ברק", "אשדוד"]);
    expect(placeCounts(trips)[0]).toMatchObject({ name: "בני ברק", count: 2 });
  });
});
