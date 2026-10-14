import { describe, expect, it } from "vitest";
import { bestHours } from "./best-hours";
import type { AppData, Income } from "./store";

let n = 0;
const income = (
  date: string,
  time: string,
  amount: number,
  over: Partial<Income> = {},
): Income => ({
  id: `i${n++}`,
  date,
  time,
  amount,
  platform: "פרטי",
  commissionPct: 0,
  tip: 0,
  hours: 0,
  km: 0,
  ...over,
});
const data = (incomes: Income[], trips: AppData["trips"] = []) =>
  ({ incomes, expenses: [], trips }) as unknown as AppData;

// 2026-10-08 and 2026-10-15 are Thursdays (weekday 4); 2026-10-12 is a Monday (1).
describe("bestHours", () => {
  it("averages a slot over the days worked in it", () => {
    const { slots } = bestHours(
      data([
        income("2026-10-08", "19:10", 100),
        income("2026-10-08", "20:30", 50),
        income("2026-10-15", "18:05", 90),
      ]),
      "2026-10-15",
    );
    expect(slots).toEqual([{ weekday: 4, block: 3, total: 240, days: 2, avg: 120 }]);
  });

  it("uses net after commission and tip", () => {
    const { slots } = bestHours(
      data([income("2026-10-12", "07:00", 100, { commissionPct: 10, tip: 5 })]),
      "2026-10-15",
    );
    expect(slots[0]).toMatchObject({ weekday: 1, block: 0, total: 95 });
  });

  it("places a trip's income by the trip's start time", () => {
    const { slots } = bestHours(
      data(
        [income("2026-10-12", "23:10", 60, { tripId: "t1" })],
        [{ id: "t1", date: "2026-10-12", time: "21:40", km: 5, seconds: 900 }],
      ),
      "2026-10-15",
    );
    expect(slots[0].block).toBe(3);
  });

  it("puts late night hours in the 22-02 block", () => {
    const { slots } = bestHours(
      data([income("2026-10-12", "23:30", 10), income("2026-10-13", "01:15", 10)]),
      "2026-10-15",
    );
    expect(slots.map((s) => s.block)).toEqual([4, 4]);
  });

  it("only calls a slot the best after two worked days", () => {
    const { best } = bestHours(
      data([
        income("2026-10-12", "08:00", 500), // one great Monday morning
        income("2026-10-08", "19:00", 120),
        income("2026-10-15", "19:00", 100),
      ]),
      "2026-10-15",
    );
    expect(best).toMatchObject({ weekday: 4, block: 3, avg: 110 });
  });

  it("ignores incomes older than 90 days, from the future, or without a time", () => {
    const { slots } = bestHours(
      data([
        income("2026-06-01", "10:00", 100),
        income("2026-10-20", "10:00", 100),
        income("2026-10-12", "", 100),
      ]),
      "2026-10-15",
    );
    expect(slots).toEqual([]);
  });
});
