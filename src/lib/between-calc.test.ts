import { describe, expect, it } from "vitest";
import { buildDays, perKm, sumDays } from "@/lib/calc";
import { netProfit } from "@/lib/store";
import { appData, income, trip } from "@/test/fixtures";

// Fuel in the fixtures: 12 km/l at 7 ₪/l, so 24 km cost 14 ₪.
describe("driving between work trips", () => {
  const data = appData({
    incomes: [income({ date: "2026-10-01", amount: 100, commissionPct: 10, tripId: "w1" })],
    trips: [
      trip({ id: "w1", date: "2026-10-01", km: 12, seconds: 900 }),
      trip({ id: "b1", date: "2026-10-01", km: 24, seconds: 1800, kind: "between" }),
    ],
  });
  const days = buildDays(data);
  const day = days.get("2026-10-01")!;

  it("charges fuel for the between km as well as the work km", () => {
    // 36 km in all: 12 work + 24 between
    expect(day.km).toBe(36);
    expect(day.fuelEstimated).toBeCloseTo(21);
    expect(day.net).toBeCloseTo(90 - 21);
  });

  it("tells the between km and time apart", () => {
    expect(day.betweenKm).toBe(24);
    expect(day.betweenSeconds).toBe(1800);
  });

  it("does not count a between drive as a work trip", () => {
    const month = sumDays(days, "2026-10-01", "2026-10-31");
    expect(month.tripCount).toBe(1);
    expect(month.betweenKm).toBe(24);
  });

  it("keeps the sum of the days equal to netProfit", () => {
    const month = sumDays(days, "2026-10-01", "2026-10-31");
    expect(month.net).toBeCloseTo(
      netProfit(data.incomes, data.expenses, data.vehicle, data.settings, data.trips),
    );
    expect(perKm(month)).toBeCloseTo(69 / 36);
  });

  it("treats a trip with no kind as a work trip", () => {
    const old = appData({ trips: [trip({ date: "2026-10-02", km: 5 })] });
    const d = buildDays(old).get("2026-10-02")!;
    expect(d.betweenKm).toBe(0);
    expect(sumDays(buildDays(old), "2026-10-01", "2026-10-31").tripCount).toBe(1);
  });
});
