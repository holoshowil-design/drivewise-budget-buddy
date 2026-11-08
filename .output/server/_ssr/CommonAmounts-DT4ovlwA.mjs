import { u as useAppData, t as todayISO, g as filterByDate, n as netProfit, h as haptic } from "./router-DjatMlVs.mjs";
import { r as reactExports, j as jsxRuntimeExports } from "../_libs/react.mjs";
import { n as numberOr } from "./validate-C7bMxNbd.mjs";
function celebrate(kind, element, amount, currency, copy) {
  if (typeof window === "undefined") return;
  haptic(kind === "goal" || kind === "break-even" || kind === "streak" ? "success" : "tap");
  const rect = element?.getBoundingClientRect();
  window.dispatchEvent(
    new CustomEvent("driver-reward", {
      detail: {
        kind,
        x: rect ? rect.left + rect.width / 2 : void 0,
        y: rect ? rect.top + rect.height / 2 : void 0,
        amount,
        currency,
        ...copy
      }
    })
  );
}
function crossedDailyGoal(data, income, trip) {
  if (income.date !== todayISO() || data.settings.dailyGoal <= 0) return false;
  const day = income.date;
  const incomes = filterByDate(data.incomes, day);
  const expenses = filterByDate(data.expenses, day);
  const trips = filterByDate(data.trips ?? [], day);
  const before = netProfit(incomes, expenses, data.vehicle, data.settings, trips);
  const after = netProfit(
    [...incomes, { ...income, id: "reward-preview" }],
    expenses,
    data.vehicle,
    data.settings,
    trip ? [...trips, { ...trip, id: "reward-trip-preview" }] : trips
  );
  return before < data.settings.dailyGoal && after >= data.settings.dailyGoal;
}
const QUICK_COMMISSION_PCT = 10;
function commissionChoices(defaultPct) {
  return [.../* @__PURE__ */ new Set([defaultPct, QUICK_COMMISSION_PCT, 0])].filter(
    (p) => Number.isFinite(p) && p >= 0 && p <= 100
  );
}
function CommissionChips({
  value,
  defaultPct,
  onPick
}) {
  const current = numberOr(value, Number.NaN);
  return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex flex-wrap gap-1.5", children: commissionChoices(defaultPct).map((pct) => {
    const on = current === pct;
    return /* @__PURE__ */ jsxRuntimeExports.jsxs(
      "button",
      {
        type: "button",
        "aria-pressed": on,
        onClick: () => onPick(String(pct)),
        className: `num rounded-full border px-2.5 py-1 text-xs font-semibold transition-colors ${on ? "border-primary bg-primary/10 text-primary" : "border-border bg-muted/50 text-foreground active:bg-muted"}`,
        children: [
          pct,
          "%"
        ]
      },
      pct
    );
  }) });
}
const RECENT = 200;
function commonAmounts(incomes, limit = 4) {
  const recent = [...incomes].sort((a, b) => `${b.date} ${b.time ?? ""}`.localeCompare(`${a.date} ${a.time ?? ""}`)).slice(0, RECENT);
  const stats = /* @__PURE__ */ new Map();
  recent.forEach((income, rank) => {
    const amount = Math.round(income.amount * 100) / 100;
    if (!(amount > 0)) return;
    const s = stats.get(amount);
    if (s) s.count += 1;
    else stats.set(amount, { count: 1, rank });
  });
  return [...stats.entries()].filter(([, s]) => s.count >= 2).sort((a, b) => b[1].count - a[1].count || a[1].rank - b[1].rank).slice(0, limit).map(([amount]) => amount);
}
function CommonAmounts({ onPick }) {
  const { data } = useAppData();
  const amounts = reactExports.useMemo(() => commonAmounts(data.incomes), [data.incomes]);
  if (amounts.length === 0) return null;
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap items-center gap-1.5", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs text-muted-foreground", children: "נפוצים:" }),
    amounts.map((amount) => /* @__PURE__ */ jsxRuntimeExports.jsx(
      "button",
      {
        type: "button",
        onClick: () => onPick(String(amount)),
        className: "num rounded-full border border-primary/30 bg-primary/5 px-3 py-1 text-sm font-semibold text-primary active:bg-primary/15",
        children: amount.toLocaleString("he-IL")
      },
      amount
    ))
  ] });
}
export {
  CommonAmounts as C,
  CommissionChips as a,
  crossedDailyGoal as b,
  commissionChoices as c,
  celebrate as d
};
