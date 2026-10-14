import { describe, expect, it } from "vitest";
import type { ActiveTrip } from "@/lib/active-trip";
import type { Fix } from "@/lib/location";
import { applyFix } from "@/lib/trip-gps";

const T0 = 1_760_000_000_000;
/** About 11.1 m of latitude. */
const STEP = 0.0001;

const trip = (over: Partial<ActiveTrip> = {}): ActiveTrip => ({
  startedAt: T0,
  date: "2026-10-14",
  time: "10:00",
  km: 0,
  lastMoveAt: T0,
  last: { lat: 32, lon: 34.8, t: T0, acc: 5 },
  ...over,
});

const fix = (lat: number, secs: number, over: Partial<Fix> = {}): Fix => ({
  lat,
  lon: 34.8,
  accuracy: 5,
  speedKmh: null,
  time: T0 + secs * 1000,
  ...over,
});

describe("applyFix", () => {
  it("starts from the first fix without counting km", () => {
    const next = applyFix(trip({ last: undefined }), fix(32, 1), T0 + 1000);
    expect(next?.km).toBe(0);
    expect(next?.last?.lat).toBe(32);
  });

  it("counts real movement and marks the time", () => {
    const next = applyFix(trip(), fix(32 + 5 * STEP, 5, { speedKmh: 40 }), T0 + 5000)!;
    expect(next.km).toBeCloseTo(0.0556, 3);
    expect(next.lastMoveAt).toBe(T0 + 5000);
  });

  it("ignores very inaccurate fixes", () => {
    expect(applyFix(trip(), fix(32 + 50 * STEP, 5, { accuracy: 120 }), T0)).toBeNull();
  });

  it("keeps the anchor for jitter inside the accuracy radius", () => {
    expect(applyFix(trip(), fix(32 + 0.5 * STEP, 5), T0)).toBeNull();
  });

  it("treats a drift step as standing when the chip says the car is not moving", () => {
    // ~22 m away, outside the 8 m radius, but the chip reports 0 km/h
    expect(applyFix(trip(), fix(32 + 2 * STEP, 5, { speedKmh: 0 }), T0 + 5000)).toBeNull();
  });

  it("loses no km after a standing drift: the next move is measured from the anchor", () => {
    const standing = applyFix(trip(), fix(32 + 2 * STEP, 5, { speedKmh: 0 }), T0 + 5000) ?? trip();
    const moved = applyFix(standing, fix(32 + 10 * STEP, 20, { speedKmh: 30 }), T0 + 20000)!;
    expect(moved.km).toBeCloseTo(0.1112, 3);
  });

  it("still counts a long step even if the chip reports a low speed", () => {
    // ~100 m: far beyond drift, so it is real movement (e.g. a chip that always says 0)
    const next = applyFix(trip(), fix(32 + 9 * STEP, 20, { speedKmh: 0 }), T0 + 20000)!;
    expect(next.km).toBeCloseTo(0.1, 2);
  });

  it("moves the anchor on an impossible jump without counting it", () => {
    const next = applyFix(trip(), fix(32.1, 2), T0 + 2000)!;
    expect(next.km).toBe(0);
    expect(next.last?.lat).toBe(32.1);
  });
});
