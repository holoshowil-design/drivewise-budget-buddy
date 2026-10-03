import { filterByDate, netProfit, todayISO, type AppData, type Income, type Trip } from "@/lib/store";

export type RewardKind = "income" | "trip" | "goal";
export type RewardDetail = { kind: RewardKind; x?: number; y?: number };

/** Visual-only event; never affects storage or calculations. */
export function celebrate(kind: RewardKind, element?: Element | null) {
  if (typeof window === "undefined") return;
  const rect = element?.getBoundingClientRect();
  window.dispatchEvent(new CustomEvent<RewardDetail>("driver-reward", {
    detail: { kind, x: rect ? rect.left + rect.width / 2 : undefined, y: rect ? rect.top + rect.height / 2 : undefined },
  }));
}

export function crossedDailyGoal(data: AppData, income: Omit<Income, "id">, trip?: Omit<Trip, "id">) {
  if (income.date !== todayISO() || data.settings.dailyGoal <= 0) return false;
  const day = income.date;
  const incomes = filterByDate(data.incomes, day);
  const expenses = filterByDate(data.expenses, day);
  const trips = filterByDate(data.trips ?? [], day);
  const before = netProfit(incomes, expenses, data.vehicle, data.settings, trips);
  const after = netProfit([...incomes, { ...income, id: "reward-preview" }], expenses, data.vehicle, data.settings,
    trip ? [...trips, { ...trip, id: "reward-trip-preview" }] : trips);
  return before < data.settings.dailyGoal && after >= data.settings.dailyGoal;
}
