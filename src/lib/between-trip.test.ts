import { describe, expect, it } from "vitest";
import type { ActiveTrip } from "@/lib/active-trip";
import { isDrivingNow } from "@/lib/active-trip";
import {
  BETWEEN_IDLE_MS,
  MIN_BETWEEN_KM,
  betweenIdleEnd,
  betweenToTrip,
  startBetween,
  trackBetweenOn,
  workTrips,
} from "@/lib/between-trip";

const T0 = 1_760_000_000_000;
const between = (over: Partial<ActiveTrip> = {}): ActiveTrip => ({
  ...startBetween(T0, "2026-10-19", "10:00"),
  ...over,
});

describe("betweenToTrip", () => {
  it("keeps the km and time of the drive as a between trip", () => {
    const trip = betweenToTrip(between({ km: 3.456, waitSeconds: 60 }), T0 + 600_000, T0 + 700_000);
    expect(trip).toMatchObject({
      kind: "between",
      date: "2026-10-19",
      time: "10:00",
      km: 3.46,
      seconds: 600,
      waitSeconds: 60,
    });
  });

  it("never runs past the moment it was asked to end", () => {
    const trip = betweenToTrip(between({ km: 2 }), T0 + 5_000_000, T0 + 120_000)!;
    expect(trip.seconds).toBe(120);
  });

  it("drops a measurement under the minimum km", () => {
    expect(betweenToTrip(between({ km: MIN_BETWEEN_KM - 0.01 }), T0 + 60_000)).toBeNull();
    expect(betweenToTrip(between({ km: MIN_BETWEEN_KM }), T0 + 60_000)).not.toBeNull();
  });

  it("never counts more waiting than the whole time", () => {
    const trip = betweenToTrip(between({ km: 1, waitSeconds: 9999 }), T0 + 60_000, T0 + 60_000)!;
    expect(trip.waitSeconds).toBe(60);
  });
});

describe("betweenIdleEnd", () => {
  it("closes at the last movement once the car stood still long enough", () => {
    const cur = between({ lastMoveAt: T0 + 1000 });
    expect(betweenIdleEnd(cur, T0 + 1000 + BETWEEN_IDLE_MS - 1)).toBeNull();
    expect(betweenIdleEnd(cur, T0 + 1000 + BETWEEN_IDLE_MS)).toBe(T0 + 1000);
  });

  it("never closes a work trip", () => {
    const work: ActiveTrip = { ...between(), kind: undefined };
    expect(betweenIdleEnd(work, T0 + 10 * BETWEEN_IDLE_MS)).toBeNull();
  });
});

describe("workTrips and the setting", () => {
  it("keeps trips without a kind and drops between trips", () => {
    const trips = [{ id: "a" }, { id: "b", kind: "work" }, { id: "c", kind: "between" }];
    expect(workTrips(trips).map((t) => t.id)).toEqual(["a", "b"]);
  });

  it("is on unless turned off", () => {
    expect(trackBetweenOn({})).toBe(true);
    expect(trackBetweenOn({ trackBetween: true })).toBe(true);
    expect(trackBetweenOn({ trackBetween: false })).toBe(false);
  });
});

describe("isDrivingNow", () => {
  it("counts a work trip as driving, moving or not", () => {
    expect(isDrivingNow({ ...between(), kind: undefined }, T0 + 3_600_000)).toBe(true);
  });

  it("counts a between measurement as driving only while the car moves", () => {
    const cur = between({ lastMoveAt: T0 });
    expect(isDrivingNow(cur, T0 + 30_000)).toBe(true);
    expect(isDrivingNow(cur, T0 + 61_000)).toBe(false);
  });

  it("is false with no trip", () => {
    expect(isDrivingNow(null)).toBe(false);
  });
});
