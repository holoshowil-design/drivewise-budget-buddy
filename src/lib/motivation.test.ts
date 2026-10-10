import { describe, expect, it } from "vitest";
import { calculateDailyMomentum, calculateWorkStreak, expenseMotivation } from "@/lib/motivation";
import type { AppData, Income } from "@/lib/store";

const income = (date: string, amount = 100): Income => ({
  id: date,
  date,
  amount,
  platform: "פרטי",
  commissionPct: 0,
  tip: 0,
  hours: 1,
  km: 0,
});

const data = (incomes: Income[] = []): AppData => ({
  incomes,
  expenses: [],
  trips: [],
  vehicle: { make: "", model: "", year: "", plate: "", type: "petrol", consumption: 12 },
  settings: { dailyGoal: 500, fixedMonthlyExpenses: 2_200, workDaysPerMonth: 22, defaultCommissionPct: 0, currency: "₪", fuelPrice: 7.4, fuelPriceHistory: [] },
});

describe("work streak", () => {
  it("counts only days with a recorded income", () => {
    expect(calculateWorkStreak([income("2026-10-06"), income("2026-10-07"), income("2026-10-08")], "2026-10-08").current).toBe(3);
  });

  it("does not require reaching the 500 daily goal", () => {
    const streak = calculateWorkStreak([income("2026-10-07", 1), income("2026-10-08", 1)], "2026-10-08");
    expect(streak.current).toBe(2);
    expect(streak.activeToday).toBe(true);
  });

  it("a trip without income does not preserve the streak", () => {
    expect(calculateWorkStreak([income("2026-10-06")], "2026-10-08").current).toBe(0);
  });
});

describe("daily journey", () => {
  it("moves from start to stability after the first income", () => {
    expect(calculateDailyMomentum(data(), "2026-10-08").stage).toBe("start");
    expect(calculateDailyMomentum(data([income("2026-10-08", 120)]), "2026-10-08").stage).toBe("stability");
  });

  it("marks victory at the concrete 500 goal", () => {
    expect(calculateDailyMomentum(data([income("2026-10-08", 500)]), "2026-10-08").stage).toBe("victory");
  });

  it("reports the exact recovery amount after an expense drops below break-even", () => {
    const before = data([income("2026-10-08", 250)]);
    const feedback = expenseMotivation(before, { date: "2026-10-08", category: "parking", amount: 100 });
    expect(feedback.tone).toBe("corrective");
    expect(feedback.message).toContain("50 ₪");
  });
});