import { useMemo } from "react";
import { isBetween, workTrips } from "../between-trip";
import {
  drivenKm,
  fuelCostFor,
  monthRange,
  netFromIncome,
  todayISO,
  type AppData,
  type Expense,
  type Income,
  type Trip,
} from "../store";

/** Everything the screens need for one day, computed once per data change. */
export type DayCalc = {
  date: string;
  gross: number; // before commission
  commission: number;
  incomeNet: number; // after commission, with tips
  fuelEstimated: number; // by km — this is what is charged
  fuelActual: number; // refuels logged (comparison only)
  otherExpenses: number; // non-fuel expenses
  costs: number; // fuelEstimated + otherExpenses
  net: number; // incomeNet - costs
  km: number; // GPS + manual km not linked to a trip (between-trips drives included)
  betweenKm: number; // of km: driven between work trips
  betweenSeconds: number; // time spent driving between work trips
  hours: number;
  incomes: Income[];
  expenses: Expense[];
  trips: Trip[];
};

export type Totals = Omit<DayCalc, "date" | "incomes" | "expenses" | "trips"> & {
  daysWorked: number; // days with at least one income
  tripCount: number;
  recordCount: number;
};

const EMPTY: Totals = {
  gross: 0,
  commission: 0,
  incomeNet: 0,
  fuelEstimated: 0,
  fuelActual: 0,
  otherExpenses: 0,
  costs: 0,
  net: 0,
  km: 0,
  betweenKm: 0,
  betweenSeconds: 0,
  hours: 0,
  daysWorked: 0,
  tripCount: 0,
  recordCount: 0,
};

function calcDay(
  date: string,
  incomes: Income[],
  expenses: Expense[],
  trips: Trip[],
  data: AppData,
): DayCalc {
  const gross = incomes.reduce((s, i) => s + i.amount, 0);
  const commission = incomes.reduce((s, i) => s + i.amount * (i.commissionPct / 100), 0);
  const incomeNet = incomes.reduce((s, i) => s + netFromIncome(i), 0);
  const fuel = fuelCostFor(incomes, expenses, data.vehicle, data.settings, trips);
  const otherExpenses = expenses
    .filter((e) => e.category !== "fuel")
    .reduce((s, e) => s + e.amount, 0);
  const costs = fuel.estimated + otherExpenses;
  return {
    date,
    gross,
    commission,
    incomeNet,
    fuelEstimated: fuel.estimated,
    fuelActual: fuel.actual,
    otherExpenses,
    costs,
    net: incomeNet - costs,
    km: drivenKm(incomes, trips),
    betweenKm: trips.filter(isBetween).reduce((s, t) => s + (t.km || 0), 0),
    betweenSeconds: trips.filter(isBetween).reduce((s, t) => s + (t.seconds || 0), 0),
    hours: incomes.reduce((s, i) => s + (i.hours || 0), 0),
    incomes,
    expenses,
    trips,
  };
}

/** Groups all records by day and computes each day once. */
export function buildDays(data: AppData): Map<string, DayCalc> {
  const groups = new Map<string, { incomes: Income[]; expenses: Expense[]; trips: Trip[] }>();
  const at = (date: string) => {
    let g = groups.get(date);
    if (!g) groups.set(date, (g = { incomes: [], expenses: [], trips: [] }));
    return g;
  };
  for (const i of data.incomes) at(i.date).incomes.push(i);
  for (const e of data.expenses) at(e.date).expenses.push(e);
  for (const t of data.trips ?? []) at(t.date).trips.push(t);
  const out = new Map<string, DayCalc>();
  for (const [date, g] of groups)
    out.set(date, calcDay(date, g.incomes, g.expenses, g.trips, data));
  return out;
}

/** A day, or an empty day when nothing was recorded. */
export function dayOf(days: Map<string, DayCalc>, date: string, data: AppData): DayCalc {
  return days.get(date) ?? calcDay(date, [], [], [], data);
}

/** Sums the days in [from, to] (inclusive, YYYY-MM-DD). */
export function sumDays(days: Map<string, DayCalc>, from: string, to: string): Totals {
  const t = { ...EMPTY };
  for (const d of days.values()) {
    if (d.date < from || d.date > to) continue;
    t.gross += d.gross;
    t.commission += d.commission;
    t.incomeNet += d.incomeNet;
    t.fuelEstimated += d.fuelEstimated;
    t.fuelActual += d.fuelActual;
    t.otherExpenses += d.otherExpenses;
    t.costs += d.costs;
    t.net += d.net;
    t.km += d.km;
    t.betweenKm += d.betweenKm;
    t.betweenSeconds += d.betweenSeconds;
    t.hours += d.hours;
    t.tripCount += workTrips(d.trips).length;
    t.recordCount += d.incomes.length + d.expenses.length;
    if (d.incomes.length > 0) t.daysWorked++;
  }
  return t;
}

/** Net per km (null when no km were driven). */
export const perKm = (t: { net: number; km: number }) => (t.km > 0 ? t.net / t.km : null);

/**
 * The one monthly forecast: what was already earned this month, plus the
 * average net per work day times the work days still left (from the
 * "work days per month" setting, capped by the calendar days left).
 */
export function monthForecast(days: Map<string, DayCalc>, data: AppData, today = todayISO()) {
  const [y, m, d] = today.split("-").map(Number);
  const { from, to } = monthRange(y, m - 1);
  const soFar = sumDays(days, from, today);
  const daysInMonth = Number(to.slice(8, 10));
  const workedToday = (days.get(today)?.incomes.length ?? 0) > 0;
  const calendarDaysLeft = daysInMonth - d + (workedToday ? 0 : 1);
  const workDaysLeft = Math.max(
    0,
    Math.min(calendarDaysLeft, data.settings.workDaysPerMonth - soFar.daysWorked),
  );
  const avgPerWorkDay = soFar.daysWorked > 0 ? soFar.net / soFar.daysWorked : 0;
  return {
    soFar: soFar.net,
    avgPerWorkDay,
    workDaysLeft,
    forecast: soFar.net + avgPerWorkDay * workDaysLeft,
  };
}

/**
 * Compares logged refuels with the km-based estimate for a period and, when
 * they differ clearly, suggests the consumption that matches the refuels.
 */
export function fuelComparison(t: Totals, data: AppData) {
  const { fuelActual: actual, fuelEstimated: estimated, km } = t;
  if (actual <= 0 || estimated <= 0 || km <= 0)
    return { actual, estimated, diff: actual - estimated, suggestedConsumption: null };
  const price = data.settings.fuelPrice;
  const litres = price > 0 ? actual / price : 0;
  const implied = litres > 0 ? km / litres : 0;
  const off = Math.abs(actual - estimated) / estimated;
  return {
    actual,
    estimated,
    diff: actual - estimated,
    suggestedConsumption: off >= 0.15 && implied > 0 ? Math.round(implied * 10) / 10 : null,
  };
}

/** Memoized per-day calculation for a component. */
export function useDays(data: AppData) {
  return useMemo(() => buildDays(data), [data]);
}
