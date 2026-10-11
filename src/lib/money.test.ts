import { afterEach, describe, expect, it } from "vitest";
import {
  effectiveFuelParams,
  filterByDate,
  fmt,
  fuelCostFor,
  load,
  netFromIncome,
  netProfit,
  todayISO,
} from "@/lib/store";
import { buildInsights } from "@/lib/insights";
import {
  appData,
  appDataApi,
  expense,
  income,
  installBrowser,
  settings,
  trip,
  vehicle,
} from "@/test/fixtures";

// Tests marked `it.fails` document bugs verified in the review. They pass while
// the bug exists; the stage that fixes the bug flips them to a plain `it`.

let uninstall: (() => void) | undefined;
afterEach(() => {
  uninstall?.();
  uninstall = undefined;
});

describe("net from income", () => {
  it("deducts commission from the gross and adds the tip", () => {
    expect(netFromIncome(income({ amount: 100, commissionPct: 25, tip: 10 }))).toBe(85);
  });

  it("treats a missing tip as zero", () => {
    expect(netFromIncome(income({ amount: 200, commissionPct: 10, tip: undefined as never }))).toBe(
      180,
    );
  });
});

describe("fuel price by date and hour", () => {
  const s = settings({
    fuelPrice: 8,
    fuelPriceHistory: [
      { date: "2026-10-01", time: "00:00", price: 7, consumption: 12 },
      { date: "2026-10-05", time: "14:00", price: 8, consumption: 10 },
    ],
  });

  it("uses the entry in effect at the record's moment", () => {
    expect(effectiveFuelParams("2026-10-03", vehicle, s, "10:00")).toMatchObject({
      price: 7,
      consumption: 12,
    });
    expect(effectiveFuelParams("2026-10-06", vehicle, s, "10:00")).toMatchObject({
      price: 8,
      consumption: 10,
    });
  });

  it("a change made at 14:00 does not affect a record from 09:00 the same day", () => {
    expect(effectiveFuelParams("2026-10-05", vehicle, s, "09:00").price).toBe(7);
    expect(effectiveFuelParams("2026-10-05", vehicle, s, "15:00").price).toBe(8);
  });

  it("the first price change is not retroactive (review bug 4)", () => {
    // Fuel was 7 ₪ when a 120 km income was logged; later the price changes to 8.
    uninstall = installBrowser(
      appData({ incomes: [income({ date: "2026-10-01", time: "09:00", km: 120 })] }),
    );
    appDataApi().recordFuelPriceChange(8, 12);
    const d = load();
    expect(
      fuelCostFor(d.incomes, d.expenses, d.vehicle, d.settings, d.trips).estimated,
    ).toBeCloseTo(70);
  });
});

describe("fuel cost for a period", () => {
  it("estimates fuel from manual km at the price in effect", () => {
    const d = appData({ incomes: [income({ km: 120 })] });
    const f = fuelCostFor(d.incomes, d.expenses, d.vehicle, d.settings, d.trips);
    expect(f.estimated).toBeCloseTo(70);
    expect(f.charged).toBeCloseTo(70);
  });

  it("does not count km of an income linked to a GPS trip twice", () => {
    const t = trip({ km: 120 });
    const d = appData({ trips: [t], incomes: [income({ km: 0, tripId: t.id })] });
    expect(
      fuelCostFor(d.incomes, d.expenses, d.vehicle, d.settings, d.trips).estimated,
    ).toBeCloseTo(70);
  });

  it.fails("a GPS trip does not erase manual km from other incomes (review bug 8)", () => {
    // 120 manual km on day 1 + 6 GPS km on day 2 = 126 km = 73.5 ₪.
    const d = appData({
      incomes: [income({ date: "2026-10-01", km: 120 })],
      trips: [trip({ date: "2026-10-02", km: 6 })],
    });
    expect(
      fuelCostFor(d.incomes, d.expenses, d.vehicle, d.settings, d.trips).estimated,
    ).toBeCloseTo(73.5);
  });

  it.fails("the sum of daily profits equals the monthly profit (review bug 8)", () => {
    // Day 1: drove 120 km (≈70 ₪ fuel), no refuel. Day 2: refuelled 300 ₪, no driving.
    const d = appData({
      incomes: [income({ date: "2026-10-01", amount: 500, km: 120 })],
      expenses: [expense({ date: "2026-10-02", amount: 300 })],
    });
    const dayNet = (day: string) =>
      netProfit(
        filterByDate(d.incomes, day),
        filterByDate(d.expenses, day),
        d.vehicle,
        d.settings,
        filterByDate(d.trips, day),
      );
    const month = netProfit(d.incomes, d.expenses, d.vehicle, d.settings, d.trips);
    expect(dayNet("2026-10-01") + dayNet("2026-10-02")).toBeCloseTo(month);
  });
});

describe("per-km figures", () => {
  it.fails("insights include GPS km in the cost per km (review bug 9)", () => {
    const today = todayISO();
    const t = trip({ date: today, km: 100 });
    const d = appData({
      trips: [t],
      incomes: [income({ date: today, km: 0, tripId: t.id, hours: 2 })],
      expenses: [expense({ date: today, amount: 70 })],
    });
    expect(buildInsights(d).find((i) => i.id === "perkm")).toBeDefined();
  });

  it.fails("small per-km amounts keep their agorot (review bug 9)", () => {
    // Reports show "ממוצע לק״מ" through fmt, so 0.85 ₪ is displayed as "1 ₪".
    // Stage 3 may route this through a dedicated per-km formatter instead.
    expect(fmt(0.85)).toContain("0.85");
  });

  it("whole-shekel amounts stay readable in RTL", () => {
    expect(fmt(1234)).toBe(`${(1234).toLocaleString("he-IL")} ₪`);
    expect(fmt(-320)).toBe("-320 ₪");
  });
});
