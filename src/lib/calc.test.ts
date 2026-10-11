import { describe, expect, it } from "vitest";
import { buildDays, fuelComparison, monthForecast, perKm, sumDays } from "@/lib/calc";
import { buildReportCsv, csvCell } from "@/lib/csv";
import { netProfit } from "@/lib/store";
import { appData, expense, income, settings, trip } from "@/test/fixtures";

describe("daily calculation", () => {
  // Fuel: 12 km/l at 7 ₪/l.
  const d = appData({
    incomes: [
      income({ date: "2026-10-01", amount: 500, commissionPct: 20, km: 120, hours: 5 }),
      income({ date: "2026-10-02", amount: 300, hours: 3 }),
    ],
    expenses: [
      expense({ date: "2026-10-02", amount: 300 }), // refuel — comparison only
      expense({ date: "2026-10-02", category: "parking", amount: 20 }),
    ],
    trips: [trip({ date: "2026-10-02", km: 24 })],
  });
  const days = buildDays(d);

  it("computes each day: net = income after commission − fuel by km − other expenses", () => {
    const d1 = days.get("2026-10-01")!;
    expect(d1.incomeNet).toBe(400);
    expect(d1.fuelEstimated).toBeCloseTo(70);
    expect(d1.net).toBeCloseTo(330);
    const d2 = days.get("2026-10-02")!;
    expect(d2.km).toBe(24);
    expect(d2.fuelEstimated).toBeCloseTo(14);
    expect(d2.fuelActual).toBe(300);
    expect(d2.net).toBeCloseTo(300 - 14 - 20);
  });

  it("the sum of the days equals the month, and matches netProfit", () => {
    const month = sumDays(days, "2026-10-01", "2026-10-31");
    const dayTotal = [...days.values()].reduce((s, x) => s + x.net, 0);
    expect(month.net).toBeCloseTo(dayTotal);
    expect(month.net).toBeCloseTo(netProfit(d.incomes, d.expenses, d.vehicle, d.settings, d.trips));
    expect(month.km).toBe(144);
    expect(month.daysWorked).toBe(2);
  });

  it("per-km uses GPS and manual km together", () => {
    const month = sumDays(days, "2026-10-01", "2026-10-31");
    expect(perKm(month)).toBeCloseTo(month.net / 144);
    expect(perKm({ net: 10, km: 0 })).toBeNull();
  });
});

describe("monthly forecast", () => {
  it("earned so far + average per work day × work days left", () => {
    const d = appData({
      settings: settings({ workDaysPerMonth: 20 }),
      incomes: [
        income({ date: "2026-10-01", amount: 400 }),
        income({ date: "2026-10-02", amount: 600 }),
      ],
    });
    const f = monthForecast(buildDays(d), d, "2026-10-10");
    expect(f.soFar).toBe(1000);
    expect(f.avgPerWorkDay).toBe(500);
    expect(f.workDaysLeft).toBe(18);
    expect(f.forecast).toBe(1000 + 500 * 18);
  });

  it("work days left never exceed the calendar days left", () => {
    const d = appData({
      settings: settings({ workDaysPerMonth: 26 }),
      incomes: [income({ date: "2026-10-01", amount: 100 })],
    });
    const f = monthForecast(buildDays(d), d, "2026-10-30");
    expect(f.workDaysLeft).toBe(2); // 30th (not worked yet) + 31st
  });
});

describe("refuels vs estimate", () => {
  it("suggests the consumption implied by the refuels when they differ clearly", () => {
    // 120 km at 12 km/l = 70 ₪ estimated; refuels 105 ₪ = 15 l → 8 km/l.
    const d = appData({ incomes: [income({ km: 120 })], expenses: [expense({ amount: 105 })] });
    const c = fuelComparison(sumDays(buildDays(d), "2026-10-01", "2026-10-31"), d);
    expect(c.diff).toBeCloseTo(35);
    expect(c.suggestedConsumption).toBe(8);
  });

  it("no suggestion when they are close", () => {
    const d = appData({ incomes: [income({ km: 120 })], expenses: [expense({ amount: 72 })] });
    expect(
      fuelComparison(sumDays(buildDays(d), "2026-10-01", "2026-10-31"), d).suggestedConsumption,
    ).toBeNull();
  });
});

describe("CSV export", () => {
  it("quotes commas, quotes and new lines", () => {
    expect(csvCell("a,b")).toBe('"a,b"');
    expect(csvCell('say "hi"')).toBe('"say ""hi"""');
    expect(csvCell("line\nbreak")).toBe('"line\nbreak"');
    expect(csvCell(7)).toBe("7");
  });

  it("includes trips and the estimated fuel", () => {
    const d = appData({
      incomes: [income({ km: 120, note: "שדה, תעופה" })],
      trips: [trip({ km: 24 })],
    });
    const csv = buildReportCsv(d, d);
    const lines = csv.split("\r\n");
    expect(lines).toHaveLength(3);
    expect(lines[1]).toContain('"שדה, תעופה"');
    expect(lines[1]).toContain("70.00");
    expect(lines[2].startsWith("נסיעה,")).toBe(true);
    expect(lines[2]).toContain("14.00");
  });
});
