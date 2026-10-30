import { describe, expect, it } from "vitest";
import type { ActiveTrip } from "@/lib/active-trip";
import { startBetween } from "@/lib/between-trip";
import { workStatus } from "@/lib/work-status";

const T0 = 1_760_000_000_000;
const work: ActiveTrip = { startedAt: T0, date: "2026-10-26", time: "10:00", km: 2.5 };

describe("workStatus", () => {
  it("is off with nothing measured", () => {
    expect(workStatus(null, T0)).toEqual({ kind: "off" });
  });

  it("shows a work trip with its time and km", () => {
    expect(workStatus(work, T0 + 90_000)).toEqual({ kind: "work", seconds: 90, km: 2.5 });
  });

  it("tells driving from waiting between trips", () => {
    const between = startBetween(T0, "2026-10-26", "10:00");
    expect(workStatus(between, T0 + 600_000).kind).toBe("between-waiting");
    const moving = { ...between, km: 1.2, lastMoveAt: T0 + 590_000 };
    expect(workStatus(moving, T0 + 600_000)).toEqual({
      kind: "between-driving",
      seconds: 600,
      km: 1.2,
    });
  });
});
