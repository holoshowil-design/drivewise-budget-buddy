import { describe, expect, it } from "vitest";
import type { ActiveTrip } from "@/lib/active-trip";
import { countStanding, engineOn } from "@/lib/engine";
import { betweenToTrip, workSecondsOn, workTrips } from "@/lib/between-trip";
import { sumHours, sumTripKm } from "@/lib/store";

const MIN = 60_000;
const between: ActiveTrip = {
  kind: "between",
  startedAt: 0,
  date: "2026-10-30",
  time: "10:00",
  km: 2,
  lastMoveAt: 0,
};

describe("standing time", () => {
  it("counts waiting for a ride after two minutes still", () => {
    const t = countStanding(between, 10 * MIN, null);
    expect(t.waitSeconds).toBe(8 * 60);
    expect(t.idleSeconds).toBeUndefined();
    // counted once: the next count adds only the new time
    expect(countStanding(t, 11 * MIN, null).waitSeconds).toBe(9 * 60);
  });

  it("counts idle fuel time only with the engine on", () => {
    expect(countStanding(between, 10 * MIN, true).idleSeconds).toBe(8 * 60);
    const off = { ...between, engine: { on: false, at: 3 * MIN } };
    expect(countStanding(off, 10 * MIN, true).idleSeconds).toBeUndefined();
  });

  it("forgets the engine tap once the car drives again", () => {
    const t = countStanding(
      { ...between, engine: { on: false, at: 0 }, lastMoveAt: 5 * MIN },
      6 * MIN,
      null,
    );
    expect(t.engine).toBeUndefined();
  });

  it("does not add waiting to a work trip", () => {
    const t = countStanding({ ...between, kind: undefined }, 10 * MIN, true);
    expect(t.waitSeconds).toBeUndefined();
    expect(t.idleSeconds).toBe(8 * 60);
  });

  it("reads the engine: tap first, then the charger", () => {
    expect(engineOn({}, true, true)).toBe(true);
    expect(engineOn({}, false, true)).toBeNull();
    expect(engineOn({ engine: { on: false, at: 0 } }, true, true)).toBe(false);
  });
});

describe("private drives", () => {
  it("are saved as private and left out of the work numbers", () => {
    const saved = betweenToTrip({ ...between, kind: "private", km: 7 }, 20 * MIN, 20 * MIN);
    expect(saved?.kind).toBe("private");
    const trips = [
      { id: "a", date: "2026-10-30", km: 5, seconds: 600 },
      { id: "b", date: "2026-10-30", km: 7, seconds: 1200, kind: "private" as const },
    ];
    expect(sumTripKm(trips)).toBe(5);
    expect(workTrips(trips)).toHaveLength(1);
    expect(workSecondsOn(trips, "2026-10-30")).toBe(600);
    expect(sumHours([], trips)).toBe(0);
  });
});
