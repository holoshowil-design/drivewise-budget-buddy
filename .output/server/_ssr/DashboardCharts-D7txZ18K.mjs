import { r as reactExports, j as jsxRuntimeExports } from "../_libs/react.mjs";
import { C as Card, a as CardContent } from "./MovieStage-BBwosCG9.mjs";
import { f as fmt, m as monthRange, a as filterByRange, q as sumIncomes, at as totalCosts } from "./router-DjatMlVs.mjs";
import { a as daysOf, m as monthForecast } from "./index-8vpH54VC.mjs";
import { I as INK_GRID, a as INK_TICK, b as INK_TOOLTIP, c as InkBar, d as InkKey, i as inkPatterns } from "./chart-ink-mCe4iIqM.mjs";
import "../_libs/sonner.mjs";
import "../_libs/react-dom.mjs";
import { a2 as ChartLine, a3 as CalendarRange, G as Gauge } from "../_libs/lucide-react.mjs";
import { R as ResponsiveContainer, C as ComposedChart, a as CartesianGrid, X as XAxis, Y as YAxis, b as ReferenceLine, T as Tooltip, B as Bar, L as Line, A as AreaChart, c as Area, d as ReferenceDot, e as RadialBarChart, P as PolarAngleAxis, f as RadialBar } from "../_libs/recharts.mjs";

import "../_libs/tanstack__react-router.mjs";
import "../_libs/tanstack__router-core.mjs";
import "../_libs/tanstack__history.mjs";
import "../_libs/seroval.mjs";
import "../_libs/unenv.mjs";


import "../_libs/cookie-es.mjs";
import "../_libs/seroval-plugins.mjs";

import "../_libs/isbot.mjs";
import "../_libs/clsx.mjs";
import "../_libs/tailwind-merge.mjs";
import "../_libs/radix-ui__react-slot.mjs";
import "../_libs/radix-ui__react-compose-refs.mjs";
import "../_libs/class-variance-authority.mjs";
import "../_libs/lodash.mjs";
import "../_libs/react-smooth.mjs";
import "../_libs/prop-types.mjs";
import "../_libs/fast-equals.mjs";
import "../_libs/tiny-invariant.mjs";
import "../_libs/react-is.mjs";
import "../_libs/d3-shape.mjs";
import "../_libs/d3-path.mjs";
import "../_libs/victory-vendor.mjs";
import "../_libs/d3-scale.mjs";
import "../_libs/internmap.mjs";
import "../_libs/d3-array.mjs";
import "../_libs/d3-time-format.mjs";
import "../_libs/d3-time.mjs";
import "../_libs/d3-interpolate.mjs";
import "../_libs/d3-color.mjs";
import "../_libs/d3-format.mjs";
import "../_libs/recharts-scale.mjs";
import "../_libs/decimal.js-light.mjs";
import "../_libs/eventemitter3.mjs";
const iso = (d) => new Date(d.getTime() - d.getTimezoneOffset() * 6e4).toISOString().slice(0, 10);
const tooltipStyle = INK_TOOLTIP;
function SectionTitle({
  icon,
  title,
  hint
}) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-3 flex items-center justify-between gap-2", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("h3", { className: "flex items-center gap-1.5 text-sm font-semibold", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-primary", children: icon }),
      title
    ] }),
    hint && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[11px] text-muted-foreground", children: hint })
  ] });
}
function MonthPaceCard({ data }) {
  const c = data.settings.currency;
  const now = /* @__PURE__ */ new Date();
  const { from, to } = monthRange(now.getFullYear(), now.getMonth());
  const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
  const today = now.getDate();
  const { series, cum, target, projected } = reactExports.useMemo(() => {
    const goalMonth = data.settings.dailyGoal * data.settings.workDaysPerMonth;
    const days = daysOf(data);
    let running = 0;
    const series2 = [];
    for (let d = 1; d <= daysInMonth; d++) {
      const date = iso(new Date(now.getFullYear(), now.getMonth(), d));
      if (d <= today) {
        running += days.get(date)?.net ?? 0;
      }
      series2.push({
        day: d,
        cum: d <= today ? Math.round(running) : null,
        pace: Math.round(goalMonth / daysInMonth * d)
      });
    }
    const projected2 = Math.round(monthForecast(days, data).forecast);
    return { series: series2, cum: Math.round(running), target: goalMonth, projected: projected2 };
  }, [data, daysInMonth, today]);
  const pct = target > 0 ? Math.round(cum / target * 100) : 0;
  const paceNow = Math.round(target / daysInMonth * today);
  const ahead = cum - paceNow;
  return /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { className: "p-4", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      SectionTitle,
      {
        icon: /* @__PURE__ */ jsxRuntimeExports.jsx(CalendarRange, { className: "h-4 w-4" }),
        title: "מצטבר החודש מול קצב היעד",
        hint: `${pct}% מהיעד`
      }
    ),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-3 flex items-end justify-between", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "num text-2xl font-extrabold tracking-tight", children: fmt(cum, c) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "div",
          {
            className: `text-xs font-medium ${ahead >= 0 ? "text-success" : "text-destructive"}`,
            children: ahead >= 0 ? `מקדים את הקצב ב-${fmt(ahead, c)}` : `מפגר אחרי הקצב ב-${fmt(-ahead, c)}`
          }
        )
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-left", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[11px] text-muted-foreground", children: "תחזית לסוף החודש" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "num text-base font-bold", children: fmt(projected, c) })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-44", children: /* @__PURE__ */ jsxRuntimeExports.jsx(ResponsiveContainer, { width: "100%", height: "100%", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(AreaChart, { data: series, margin: { top: 8, right: 8, left: 8, bottom: 0 }, children: [
      inkPatterns(),
      /* @__PURE__ */ jsxRuntimeExports.jsx(CartesianGrid, { ...INK_GRID, vertical: false }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        XAxis,
        {
          dataKey: "day",
          tick: INK_TICK,
          tickLine: false,
          axisLine: { stroke: "var(--ink)", strokeWidth: 1.2 },
          interval: 4
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        Tooltip,
        {
          contentStyle: tooltipStyle,
          labelFormatter: (v) => `יום ${v} בחודש`,
          formatter: (v, n) => [fmt(v || 0, c), n === "cum" ? "מצטבר" : "קצב יעד"]
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        Area,
        {
          type: "monotone",
          dataKey: "pace",
          stroke: "var(--ink)",
          strokeOpacity: 0.55,
          strokeDasharray: "5 5",
          strokeWidth: 1.5,
          fill: "none",
          activeDot: false
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        Area,
        {
          type: "monotone",
          dataKey: "cum",
          stroke: "var(--primary)",
          strokeWidth: 2.5,
          fill: "url(#ink-hatch)",
          fillOpacity: 1,
          connectNulls: true,
          activeDot: {
            r: 4.5,
            fill: "var(--mustard)",
            stroke: "var(--ink)",
            strokeWidth: 1.4
          }
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        ReferenceDot,
        {
          x: today,
          y: cum,
          r: 5,
          fill: "var(--mustard)",
          stroke: "var(--ink)",
          strokeWidth: 1.5,
          ifOverflow: "extendDomain"
        }
      )
    ] }) }) })
  ] }) });
}
function IncomeVsExpenseCard({ data }) {
  const c = data.settings.currency;
  const series = reactExports.useMemo(() => {
    const days = daysOf(data);
    const out = [];
    for (let i = 13; i >= 0; i--) {
      const d = /* @__PURE__ */ new Date();
      d.setDate(d.getDate() - i);
      const date = iso(d);
      const day = days.get(date);
      const income = day?.incomeNet ?? 0;
      const expense = day?.costs ?? 0;
      out.push({
        day: d.toLocaleDateString("he-IL", { day: "numeric", month: "numeric" }),
        income: Math.round(income),
        expense: -Math.round(expense),
        net: Math.round(income - expense)
      });
    }
    return out;
  }, [data]);
  const has = series.some((s) => s.income !== 0 || s.expense !== 0);
  return /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { className: "p-4", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      SectionTitle,
      {
        icon: /* @__PURE__ */ jsxRuntimeExports.jsx(ChartLine, { className: "h-4 w-4" }),
        title: "הכנסות מול הוצאות",
        hint: "14 ימים"
      }
    ),
    has ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-48", children: /* @__PURE__ */ jsxRuntimeExports.jsx(ResponsiveContainer, { width: "100%", height: "100%", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(
      ComposedChart,
      {
        data: series,
        margin: { top: 4, right: 4, left: 4, bottom: 0 },
        stackOffset: "sign",
        children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(CartesianGrid, { ...INK_GRID, vertical: false }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            XAxis,
            {
              dataKey: "day",
              tick: INK_TICK,
              tickLine: false,
              axisLine: false,
              interval: 2
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsx(YAxis, { hide: true }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(ReferenceLine, { y: 0, stroke: "var(--ink)", strokeWidth: 1.2 }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            Tooltip,
            {
              contentStyle: tooltipStyle,
              cursor: { fill: "var(--mustard-tint)", fillOpacity: 0.45 },
              formatter: (v, n) => [
                fmt(Math.abs(v), c),
                n === "income" ? "הכנסה" : n === "expense" ? "הוצאה" : "נטו"
              ]
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            Bar,
            {
              dataKey: "income",
              stackId: "a",
              fill: "var(--green-tint)",
              shape: (p) => /* @__PURE__ */ jsxRuntimeExports.jsx(InkBar, { ...p }),
              maxBarSize: 16
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            Bar,
            {
              dataKey: "expense",
              stackId: "a",
              fill: "var(--vermilion)",
              shape: (p) => /* @__PURE__ */ jsxRuntimeExports.jsx(InkBar, { ...p }),
              maxBarSize: 16
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            Line,
            {
              type: "monotone",
              dataKey: "net",
              stroke: "var(--ink)",
              strokeWidth: 1.8,
              dot: { r: 2.4, fill: "var(--mustard)", stroke: "var(--ink)", strokeWidth: 1 },
              activeDot: {
                r: 4,
                fill: "var(--mustard)",
                stroke: "var(--ink)",
                strokeWidth: 1.4
              }
            }
          )
        ]
      }
    ) }) }) : /* @__PURE__ */ jsxRuntimeExports.jsx(Empty, {}),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-3 flex items-center justify-center gap-4 text-[11px] font-semibold text-muted-foreground", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(InkKey, { fill: "var(--green-tint)", label: "הכנסות" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(InkKey, { fill: "var(--vermilion)", label: "הוצאות" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(InkKey, { fill: "var(--mustard)", label: "נטו", line: true })
    ] })
  ] }) });
}
function ProfitabilityGauge({ data }) {
  const c = data.settings.currency;
  const now = /* @__PURE__ */ new Date();
  const { from, to } = monthRange(now.getFullYear(), now.getMonth());
  const inc = filterByRange(data.incomes, from, to);
  const exp = filterByRange(data.expenses, from, to);
  const income = sumIncomes(inc);
  const costs = totalCosts(
    inc,
    exp,
    data.vehicle,
    data.settings,
    filterByRange(data.trips ?? [], from, to)
  );
  const pct = income > 0 ? Math.max(0, Math.min(100, Math.round((income - costs) / income * 100))) : 0;
  const tone = pct >= 65 ? "var(--success)" : pct >= 45 ? "var(--warning)" : "var(--destructive)";
  const msg = pct >= 65 ? "רווחיות מצוינת" : pct >= 45 ? "רווחיות סבירה — כדאי לצמצם הוצאות" : "רווחיות נמוכה — בדוק דלק ועמלות";
  return /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { className: "flex items-center gap-4 p-4", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative h-28 w-28 shrink-0", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(ResponsiveContainer, { width: "100%", height: "100%", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(
        RadialBarChart,
        {
          innerRadius: "72%",
          outerRadius: "100%",
          data: [{ value: pct }],
          startAngle: 90,
          endAngle: -270,
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(PolarAngleAxis, { type: "number", domain: [0, 100], tick: false }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              RadialBar,
              {
                dataKey: "value",
                cornerRadius: 12,
                fill: tone,
                stroke: "var(--ink)",
                strokeWidth: 1.2,
                background: {
                  fill: "var(--paper-shade)",
                  stroke: "var(--ink)",
                  strokeWidth: 1,
                  strokeOpacity: 0.35
                }
              }
            )
          ]
        }
      ) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "pointer-events-none absolute inset-0 flex items-center justify-center", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "num font-display text-xl font-extrabold", style: { color: tone }, children: [
        pct,
        "%"
      ] }) })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-w-0", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("h3", { className: "flex items-center gap-1.5 text-sm font-semibold", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Gauge, { className: "h-4 w-4 text-primary" }),
        "רווחיות החודש"
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-1 text-xs text-muted-foreground leading-snug", children: msg }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "mt-1.5 text-xs", children: [
        "מתוך ",
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "num font-semibold", children: fmt(income, c) }),
        " הכנסות · עלויות",
        " ",
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "num font-semibold text-destructive", children: fmt(costs, c) })
      ] })
    ] })
  ] }) });
}
function Empty() {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex h-32 flex-col items-center justify-center gap-1 rounded-xl bg-muted/40 text-center", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm font-medium", children: "אין עדיין מספיק נתונים" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: "הוסף רשומות והגרף יתמלא" })
  ] });
}
export {
  IncomeVsExpenseCard,
  MonthPaceCard,
  ProfitabilityGauge
};
