import { describe, expect, it } from "vitest";
import type { ActiveTrip } from "@/lib/active-trip";
import { isDrivingNow } from "@/lib/active-trip";
import {
  BETWEEN_IDLE_MS,
  MIN_BETWEEN_KM,
  MIN_BETWEEN_SECONDS,
  betweenIdleEnd,
  betweenToTrip,
  startBetween,
  trackBetweenOn,
  workSecondsOn,
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

  it("drops a measurement that is both under the minimum km and under a minute", () => {
    const short = T0 + (MIN_BETWEEN_SECONDS - 1) * 1000;
    expect(betweenToTrip(between({ km: MIN_BETWEEN_KM - 0.01 }), short, short)).toBeNull();
    expect(betweenToTrip(between({ km: MIN_BETWEEN_KM }), short, short)).not.toBeNull();
  });

  it("keeps the time spent waiting for the next customer without driving", () => {
    const trip = betweenToTrip(between(), T0 + 40 * 60_000, T0 + 40 * 60_000);
    expect(trip).toMatchObject({ kind: "between", km: 0, seconds: 40 * 60 });
  });

  it("never counts more waiting than the whole time", () => {
    const trip = betweenToTrip(between({ km: 1, waitSeconds: 9999 }), T0 + 60_000, T0 + 60_000)!;
    expect(trip.waitSeconds).toBe(60);
  });
});

describe("betweenIdleEnd", () => {
  it("keeps counting while the car stands for an hour (waiting for a customer)", () => {
    expect(betweenIdleEnd(between(), T0 + 60 * 60_000)).toBeNull();
  });

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

describe("workSecondsOn", () => {
  it("adds the day's trips of both kinds and the running measurement", () => {
    const trips = [
      { date: "2026-10-19", seconds: 600 },
      { date: "2026-10-19", seconds: 300, kind: "between" },
      { date: "2026-10-18", seconds: 9999 },
    ];
    expect(workSecondsOn(trips, "2026-10-19")).toBe(900);
    expect(workSecondsOn(trips, "2026-10-19", { date: "2026-10-19", seconds: 60 })).toBe(960);
    expect(workSecondsOn(trips, "2026-10-19", { date: "2026-10-18", seconds: 60 })).toBe(900);
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
    const cur = between({ km: 0.4, lastMoveAt: T0 });
    expect(isDrivingNow(cur, T0 + 30_000)).toBe(true);
    expect(isDrivingNow(cur, T0 + 61_000)).toBe(false);
  });

  it("does not count a between measurement that has not moved yet (a trip was just saved)", () => {
    const fresh = between();
    expect(fresh.km).toBe(0);
    expect(isDrivingNow(fresh, T0)).toBe(false);
    expect(isDrivingNow(fresh, T0 + 5_000)).toBe(false);
  });

  it("is false with no trip", () => {
    expect(isDrivingNow(null)).toBe(false);
  });
});
