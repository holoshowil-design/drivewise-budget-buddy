import { describe, expect, it } from "vitest";
import type { ActiveTrip } from "@/lib/active-trip";
import {
  cleanStops,
  closeStop,
  resumeIfDriving,
  startStop,
  stopsText,
  sumStops,
} from "@/lib/trip-stops";
import { autoToSide, confirmAuto, isUnconfirmedAuto } from "@/lib/auto-trip";

const base: ActiveTrip = { startedAt: 0, date: "2026-10-30", time: "10:00", km: 3, lastMoveAt: 0 };

describe("trip stops", () => {
  it("adds a closed stop to its reason", () => {
    const t = closeStop(startStop(base, "fuel", 60_000), 360_000);
    expect(t.stop).toBeUndefined();
    expect(t.stops).toEqual({ fuel: 300 });
    expect(t.lastMoveAt).toBe(360_000);
  });

  it("puts waiting into the trip's waiting time", () => {
    const t = closeStop(startStop({ ...base, waitSeconds: 10 }, "wait", 0), 120_000);
    expect(t.waitSeconds).toBe(130);
    expect(t.stops).toBeUndefined();
  });

  it("a new stop closes the running one", () => {
    const t = startStop(startStop(base, "food", 0), "prayer", 600_000);
    expect(t.stops).toEqual({ food: 600 });
    expect(t.stop?.reason).toBe("prayer");
  });

  it("ends by itself only after driving on", () => {
    const s = startStop(base, "fuel", 0);
    expect(resumeIfDriving({ ...s, km: 3.2, lastMoveAt: 100_000 }, 120_000).stop).toBeDefined();
    const r = resumeIfDriving({ ...s, km: 3.6, lastMoveAt: 100_000 }, 120_000);
    expect(r.stop).toBeUndefined();
    expect(r.stops).toEqual({ fuel: 100 });
  });

  it("sums the week and writes a short text", () => {
    const trips = [
      { date: "2026-10-20", waitSeconds: 999, stops: { fuel: 999 } },
      { date: "2026-10-29", waitSeconds: 60, stops: { fuel: 120, prayer: 600 } },
    ];
    expect(sumStops(trips, "2026-10-24")).toEqual({ wait: 60, fuel: 120, prayer: 600 });
    expect(stopsText({ fuel: 120, prayer: 600, wait: 300 })).toBe("תדלוק 2 ד׳ · תפילה 10 ד׳");
    expect(cleanStops({ fuel: 0 })).toBeUndefined();
  });
});

describe("auto-started trips", () => {
  it("stays known as detected after it is confirmed", () => {
    const t = confirmAuto({ ...base, auto: true });
    expect(t.auto).toBe(false);
    expect(isUnconfirmedAuto(t)).toBe(false);
    expect(isUnconfirmedAuto({ ...base, auto: true })).toBe(true);
  });

  it("turns into a drive between trips", () => {
    const t = autoToSide({ ...startStop({ ...base, auto: true }, "fuel", 0) }, "between", 60_000);
    expect(t.kind).toBe("between");
    expect(t.auto).toBe(false);
    expect(t.stop).toBeUndefined();
    expect(isUnconfirmedAuto(t)).toBe(false);
  });
});
