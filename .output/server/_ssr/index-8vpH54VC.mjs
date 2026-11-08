import { r as reactExports } from "../_libs/react.mjs";
import { w as workTrips, m as monthRange, t as todayISO, N as netFromIncome, P as fuelCostFor, s as sumHours, j as isBetween, d as drivenKm } from "./router-DjatMlVs.mjs";
const EMPTY = {
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
  recordCount: 0
};
function calcDay(date, incomes, expenses, trips, data) {
  const gross = incomes.reduce((s, i) => s + i.amount, 0);
  const commission = incomes.reduce((s, i) => s + i.amount * (i.commissionPct / 100), 0);
  const incomeNet = incomes.reduce((s, i) => s + netFromIncome(i), 0);
  const fuel = fuelCostFor(incomes, expenses, data.vehicle, data.settings, trips);
  const otherExpenses = expenses.filter((e) => e.category !== "fuel").reduce((s, e) => s + e.amount, 0);
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
    hours: sumHours(incomes, trips),
    incomes,
    expenses,
    trips
  };
}
function buildDays(data) {
  const groups = /* @__PURE__ */ new Map();
  const at = (date) => {
    let g = groups.get(date);
    if (!g) groups.set(date, g = { incomes: [], expenses: [], trips: [] });
    return g;
  };
  for (const i of data.incomes) at(i.date).incomes.push(i);
  for (const e of data.expenses) at(e.date).expenses.push(e);
  for (const t of data.trips ?? []) at(t.date).trips.push(t);
  const out = /* @__PURE__ */ new Map();
  for (const [date, g] of groups)
    out.set(date, calcDay(date, g.incomes, g.expenses, g.trips, data));
  return out;
}
function dayOf(days, date, data) {
  return days.get(date) ?? calcDay(date, [], [], [], data);
}
function sumDays(days, from, to) {
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
const perKm = (t) => t.km > 0 ? t.net / t.km : null;
function monthForecast(days, data, today = todayISO()) {
  const [y, m, d] = today.split("-").map(Number);
  const { from, to } = monthRange(y, m - 1);
  const soFar = sumDays(days, from, today);
  const daysInMonth = Number(to.slice(8, 10));
  const workedToday = (days.get(today)?.incomes.length ?? 0) > 0;
  const calendarDaysLeft = daysInMonth - d + (workedToday ? 0 : 1);
  const workDaysLeft = Math.max(
    0,
    Math.min(calendarDaysLeft, data.settings.workDaysPerMonth - soFar.daysWorked)
  );
  const avgPerWorkDay = soFar.daysWorked > 0 ? soFar.net / soFar.daysWorked : 0;
  return {
    soFar: soFar.net,
    avgPerWorkDay,
    workDaysLeft,
    forecast: soFar.net + avgPerWorkDay * workDaysLeft
  };
}
function fuelComparison(t, data) {
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
    suggestedConsumption: off >= 0.15 && implied > 0 ? Math.round(implied * 10) / 10 : null
  };
}
const daysCache = /* @__PURE__ */ new WeakMap();
function daysOf(data) {
  let days = daysCache.get(data);
  if (!days) daysCache.set(data, days = buildDays(data));
  return days;
}
function useDays(data) {
  return reactExports.useMemo(() => daysOf(data), [data]);
}
export {
  daysOf as a,
  dayOf as d,
  fuelComparison as f,
  monthForecast as m,
  perKm as p,
  sumDays as s,
  useDays as u
};
