import { p as performance } from "../_libs/unenv.mjs";
import { r as reactExports, j as jsxRuntimeExports } from "../_libs/react.mjs";
import { L as Link, d as useNavigate } from "../_libs/tanstack__react-router.mjs";
import { u as useAppData, A as ACTIVE_EVENT, t as todayISO, m as monthRange, B as Button, f as fmt, r as readActive, o as isSideDrive, i as useAuthUser, l as fmtDuration, C as ComicBubble, s as sumHours, g as filterByDate, d as drivenKm, w as workTrips, b as fmtPrecise, e as energyUnitLabel, j as isBetween, k as isDrivingNow, h as haptic, c as cn, a as filterByRange, n as netProfit } from "./router-DhZGCYXD.mjs";
import { u as useDays, d as dayOf, s as sumDays, m as monthForecast, f as fuelComparison } from "./index-km_VJu7P.mjs";
import { C as Card, a as CardContent, M as MovieStage } from "./MovieStage-C7QmTclX.mjs";
import { t as toast } from "../_libs/sonner.mjs";
import { c as calculateDailyMomentum, a as calculateWorkStreak } from "./motivation-vlARsss4.mjs";
import { s as saveLastAccount } from "./last-account-KZyt_Mli.mjs";
import { useSyncState } from "./sync-client-DtnrSQTG.mjs";
import "../_libs/react-dom.mjs";
import { P as Plus, Z as Zap, d as CloudOff, e as CloudCheck, f as CloudUpload, N as Navigation, G as Gauge, A as ArrowLeft, g as TrendingUp, h as Award, i as Sparkles, j as ChevronDown, R as Route, k as Fuel, L as Lightbulb, I as Info, l as CircleAlert, m as TriangleAlert, n as ChevronsLeft, a as Check } from "../_libs/lucide-react.mjs";



import "../_libs/tanstack__router-core.mjs";
import "../_libs/tanstack__history.mjs";
import "../_libs/seroval.mjs";
import "../_libs/cookie-es.mjs";
import "../_libs/seroval-plugins.mjs";

import "../_libs/isbot.mjs";
import "../_libs/clsx.mjs";
import "../_libs/tailwind-merge.mjs";
import "../_libs/radix-ui__react-slot.mjs";
import "../_libs/radix-ui__react-compose-refs.mjs";
import "../_libs/class-variance-authority.mjs";
function isoOffset(days) {
  const d = /* @__PURE__ */ new Date();
  d.setDate(d.getDate() - days);
  return new Date(d.getTime() - d.getTimezoneOffset() * 6e4).toISOString().slice(0, 10);
}
function buildInsights(data) {
  const c = data.settings.currency;
  const out = [];
  const thisWeek = { from: isoOffset(6), to: isoOffset(0) };
  const lastWeek = { from: isoOffset(13), to: isoOffset(7) };
  const netIn = (r) => netProfit(
    filterByRange(data.incomes, r.from, r.to),
    filterByRange(data.expenses, r.from, r.to),
    data.vehicle,
    data.settings,
    filterByRange(data.trips ?? [], r.from, r.to)
  );
  const cur = netIn(thisWeek);
  const prev = netIn(lastWeek);
  if (prev > 0 || cur > 0) {
    const diff = cur - prev;
    const pct = prev > 0 ? Math.round(diff / prev * 100) : 100;
    out.push({
      id: "weekcmp",
      tone: diff >= 0 ? "good" : "warn",
      title: diff >= 0 ? `השבוע טוב ב-${Math.abs(pct)}% מהשבוע שעבר` : `השבוע נמוך ב-${Math.abs(pct)}% מהשבוע שעבר`,
      detail: `${fmt(cur, c)} מול ${fmt(prev, c)}`
    });
  }
  const from30 = isoOffset(29);
  const inc30 = filterByRange(data.incomes, from30, isoOffset(0));
  const exp30 = filterByRange(data.expenses, from30, isoOffset(0));
  const trips30 = filterByRange(data.trips ?? [], from30, isoOffset(0));
  const net30 = netProfit(inc30, exp30, data.vehicle, data.settings, trips30);
  const hours30 = sumHours(inc30, trips30);
  const km30 = drivenKm(inc30, trips30);
  if (hours30 > 0) {
    const perHour = Math.round(net30 / hours30);
    out.push({
      id: "perhour",
      tone: perHour >= 60 ? "good" : perHour >= 40 ? "info" : "warn",
      title: `${fmt(perHour, c)} רווח נקי לשעה`,
      detail: `לפי ${Math.round(hours30)} שעות ב-30 הימים האחרונים`
    });
  }
  if (km30 > 0) {
    const fuel30 = exp30.filter((e) => e.category === "fuel").reduce((s, e) => s + e.amount, 0);
    if (fuel30 > 0) {
      out.push({
        id: "perkm",
        tone: "info",
        title: `${fmtPrecise(fuel30 / km30, c)} אנרגיה לכל ק״מ`,
        detail: `${Math.round(km30)} ק״מ · ${fmt(fuel30, c)} דלק/חשמל`
      });
    }
  }
  const byDow = /* @__PURE__ */ new Map();
  for (const i of filterByRange(data.incomes, isoOffset(59), isoOffset(0))) {
    const dow = new Date(i.date).getDay();
    byDow.set(dow, (byDow.get(dow) || 0) + i.amount * (1 - i.commissionPct / 100) + (i.tip || 0));
  }
  if (byDow.size >= 3) {
    const best = [...byDow.entries()].sort((a, b) => b[1] - a[1])[0];
    const names = ["ראשון", "שני", "שלישי", "רביעי", "חמישי", "שישי", "שבת"];
    out.push({
      id: "bestday",
      tone: "good",
      title: `יום ${names[best[0]]} הוא היום החזק שלך`,
      detail: `סה״כ ${fmt(best[1], c)} בחודשיים האחרונים`
    });
  }
  const now = /* @__PURE__ */ new Date();
  const monthFrom = new Date(now.getFullYear(), now.getMonth(), 1);
  const mFrom = new Date(monthFrom.getTime() - monthFrom.getTimezoneOffset() * 6e4).toISOString().slice(0, 10);
  const monthNet = netProfit(
    filterByRange(data.incomes, mFrom, isoOffset(0)),
    filterByRange(data.expenses, mFrom, isoOffset(0)),
    data.vehicle,
    data.settings,
    filterByRange(data.trips ?? [], mFrom, isoOffset(0))
  );
  const fixed = data.settings.fixedMonthlyExpenses;
  if (fixed > 0) {
    const remaining = fixed - monthNet;
    out.push({
      id: "breakeven",
      tone: remaining <= 0 ? "good" : "info",
      title: remaining <= 0 ? "כיסית את ההוצאות הקבועות החודש" : `נשאר ${fmt(remaining, c)} עד כיסוי ההוצאות הקבועות`,
      detail: `הוצאות קבועות ${fmt(fixed, c)} · נטו עד כה ${fmt(monthNet, c)}`
    });
  }
  let streak = 0;
  for (let i = 0; i < 30; i++) {
    const day = isoOffset(i);
    const n = netProfit(
      data.incomes.filter((x) => x.date === day),
      data.expenses.filter((x) => x.date === day),
      data.vehicle,
      data.settings,
      (data.trips ?? []).filter((x) => x.date === day)
    );
    if (n >= data.settings.dailyGoal && data.settings.dailyGoal > 0) streak++;
    else break;
  }
  if (streak >= 2) {
    out.push({
      id: "streak",
      tone: "good",
      title: `${streak} ימים ברצף מעל היעד`,
      detail: "תמשיך ככה"
    });
  }
  const otherExp30 = exp30.filter((e) => e.category !== "fuel").reduce((s, e) => s + e.amount, 0);
  if (net30 > 0 && otherExp30 / Math.max(1, net30) > 0.3) {
    out.push({
      id: "spend",
      tone: "bad",
      title: "הוצאות שוטפות גבוהות",
      detail: `${fmt(otherExp30, c)} הוצאות (לא דלק) ב-30 יום — מעל 30% מהרווח`
    });
  }
  return out.slice(0, 5);
}
const toneStyles = {
  good: { cls: "bg-success/10 text-success", Icon: TrendingUp },
  warn: { cls: "bg-warning/10 text-warning", Icon: TriangleAlert },
  bad: { cls: "bg-destructive/10 text-destructive", Icon: CircleAlert },
  info: { cls: "bg-primary/10 text-primary", Icon: Info }
};
function InsightsCard({ data }) {
  const insights = buildInsights(data);
  if (insights.length === 0) return null;
  return /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { className: "p-4", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("h3", { className: "mb-3 flex items-center gap-1.5 text-sm font-semibold", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Lightbulb, { className: "h-4 w-4 text-primary" }),
      " תובנות חכמות"
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-2.5", children: insights.map((i) => {
      const { cls, Icon } = toneStyles[i.tone];
      return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start gap-2.5", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "span",
          {
            className: `mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full ${cls}`,
            children: /* @__PURE__ */ jsxRuntimeExports.jsx(Icon, { className: "h-3.5 w-3.5" })
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-w-0", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-sm font-medium leading-snug", children: i.title }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs text-muted-foreground", children: i.detail })
        ] })
      ] }, i.id);
    }) })
  ] }) });
}
function KmCostCard({ data }) {
  const { recordFuelPriceChange } = useAppData();
  const days = useDays(data);
  const c = data.settings.currency;
  const unit = energyUnitLabel(data.vehicle);
  const today = todayISO();
  const now = /* @__PURE__ */ new Date();
  const { from, to } = monthRange(now.getFullYear(), now.getMonth());
  const day = dayOf(days, today, data);
  const month = sumDays(days, from, to);
  const units = (cost) => data.settings.fuelPrice > 0 ? cost / data.settings.fuelPrice : 0;
  const costPerKm = month.km > 0 ? month.fuelEstimated / month.km : data.settings.fuelPrice / (data.vehicle.consumption || 1);
  const cmp = fuelComparison(month, data);
  const applyConsumption = (consumption) => {
    recordFuelPriceChange(data.settings.fuelPrice, consumption);
    toast.success(`הצריכה עודכנה ל-${consumption} ק״מ/${unit}, מהיום והלאה`);
  };
  if (month.km === 0 && day.km === 0) {
    return /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { className: "card-lift animate-fade-in-up", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { className: "p-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("h3", { className: "mb-1 flex items-center gap-1.5 text-sm font-semibold", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Route, { className: "h-4 w-4 text-primary" }),
        " קילומטרים ועלות דלק"
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: "הפעל מעקב נסיעה או הוסף ק״מ בהזנת ההכנסה כדי לראות כמה נסעת וכמה זה עלה לך באנרגיה." })
    ] }) });
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { className: "card-lift animate-fade-in-up", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { className: "p-4", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-3 flex items-center justify-between", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("h3", { className: "flex items-center gap-1.5 text-sm font-semibold", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Route, { className: "h-4 w-4 text-primary" }),
        " קילומטרים ועלות דלק"
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "num text-[11px] text-muted-foreground", children: [
        data.vehicle.consumption,
        " ק״מ/",
        unit,
        " · ",
        data.settings.fuelPrice,
        c,
        "/",
        unit
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        Block,
        {
          title: "היום",
          km: day.km,
          cost: day.fuelEstimated,
          units: units(day.fuelEstimated),
          unit,
          currency: c
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        Block,
        {
          title: "החודש",
          km: month.km,
          cost: month.fuelEstimated,
          units: units(month.fuelEstimated),
          unit,
          currency: c
        }
      )
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-3 rounded-xl border bg-muted/40 p-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-2 flex items-center gap-1.5 text-xs font-semibold", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Fuel, { className: "h-3.5 w-3.5 text-warning" }),
        " נטו אחרי דלק"
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          NetBlock,
          {
            label: "היום",
            net: day.incomeNet - day.fuelEstimated,
            fuel: day.fuelEstimated,
            currency: c
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          NetBlock,
          {
            label: "החודש",
            net: month.incomeNet - month.fuelEstimated,
            fuel: month.fuelEstimated,
            currency: c
          }
        )
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-2 text-[11px] leading-relaxed text-muted-foreground", children: "הדלק יורד מהנטו לפי הק״מ שנסעת (GPS וידני), גם בימים שלא תדלקת. התדלוקים עצמם משמשים להשוואה." })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-3 space-y-1 border-t pt-3 text-xs text-muted-foreground", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "עלות אנרגיה משוערת לק״מ" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "num font-semibold text-foreground", children: fmtPrecise(costPerKm, c) })
      ] }),
      month.betweenKm > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "מתוכם בין נסיעות (ללא נוסע)" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "num font-semibold text-foreground", children: [
          Math.round(month.betweenKm).toLocaleString("he-IL"),
          " ק״מ ·",
          " ",
          fmt(month.fuelEstimated * (month.betweenKm / month.km), c)
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "תדלוקים בפועל החודש" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "num font-semibold text-foreground", children: fmt(cmp.actual, c) })
      ] }),
      cmp.actual > 0 && month.km > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: cmp.diff >= 0 ? "תדלקת יותר מהמשוער" : "תדלקת פחות מהמשוער" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "span",
          {
            className: `num font-semibold ${cmp.diff >= 0 ? "text-destructive" : "text-success"}`,
            children: fmt(Math.abs(Math.round(cmp.diff)), c)
          }
        )
      ] }),
      cmp.suggestedConsumption !== null && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-2 rounded-lg bg-warning/10 p-2.5 text-foreground", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-[11px] leading-relaxed", children: [
          "לפי התדלוקים החודש הרכב עושה בערך ",
          cmp.suggestedConsumption,
          " ק״מ ל",
          unit,
          " (מוגדר",
          " ",
          data.vehicle.consumption,
          "). אם רשמת את כל הק״מ, כדאי לעדכן."
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(
          Button,
          {
            size: "sm",
            variant: "outline",
            className: "mt-2 h-8 w-full",
            onClick: () => applyConsumption(cmp.suggestedConsumption),
            children: [
              "עדכן צריכה ל-",
              cmp.suggestedConsumption
            ]
          }
        )
      ] })
    ] })
  ] }) });
}
function NetBlock({
  label,
  net,
  fuel,
  currency
}) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[11px] text-muted-foreground", children: label }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      "div",
      {
        className: `num text-lg font-bold tracking-tight ${net >= 0 ? "text-success" : "text-destructive"}`,
        children: fmt(net, currency)
      }
    ),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "num text-[11px] text-muted-foreground", children: [
      "דלק משוער −",
      fmt(fuel, currency)
    ] })
  ] });
}
function Block({
  title,
  km,
  cost,
  units,
  unit,
  currency
}) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-lg bg-muted/50 p-3", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[11px] text-muted-foreground", children: title }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "num text-xl font-bold tracking-tight", children: [
      Math.round(km).toLocaleString("he-IL"),
      " ",
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs font-medium", children: "ק״מ" })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "num mt-0.5 text-xs text-muted-foreground", children: [
      "≈ ",
      fmt(Math.round(cost), currency),
      " · ",
      units.toFixed(1),
      " ",
      unit
    ] })
  ] });
}
const DONE_AT = 0.8;
const FLICK = 0.9;
const PAD = 6;
const SPRING = "transform 420ms cubic-bezier(0.34, 1.56, 0.64, 1)";
const GLIDE = "transform 160ms cubic-bezier(0.22, 1, 0.36, 1)";
const still = () => typeof window !== "undefined" && (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ?? false);
function SwipeToConfirm({
  label,
  hint = "החליקו עד הסוף",
  icon,
  onConfirm,
  className
}) {
  const track = reactExports.useRef(null);
  const thumb = reactExports.useRef(null);
  const fill = reactExports.useRef(null);
  const text = reactExports.useRef(null);
  const drag = reactExports.useRef(null);
  const frame = reactExports.useRef(0);
  const moved = reactExports.useRef(false);
  const [done, setDone] = reactExports.useState(false);
  const [showHint, setShowHint] = reactExports.useState(false);
  reactExports.useEffect(() => () => cancelAnimationFrame(frame.current), []);
  const geometry = () => {
    const t = track.current;
    const w = thumb.current.offsetWidth;
    return {
      max: Math.max(1, t.clientWidth - w - PAD * 2),
      dir: getComputedStyle(t).direction === "rtl" ? -1 : 1,
      trackW: t.clientWidth,
      thumbW: w
    };
  };
  const paint = (x, transition) => {
    if (!track.current || !thumb.current || !fill.current) return;
    const { max, dir, trackW, thumbW } = geometry();
    const t = still() ? "none" : transition ?? "none";
    thumb.current.style.transition = t;
    fill.current.style.transition = t;
    thumb.current.style.transform = `translate3d(${dir * x}px,0,0)`;
    const hidden = trackW - (PAD * 2 + thumbW + x);
    fill.current.style.transform = `translate3d(${-dir * hidden}px,0,0)`;
    if (text.current) {
      text.current.style.transition = transition ? "opacity 200ms" : "none";
      text.current.style.opacity = String(Math.max(0, 1 - x / max * 1.8));
    }
  };
  reactExports.useEffect(() => {
    const ro = new ResizeObserver(() => !drag.current && !done && paint(0, null));
    if (track.current) ro.observe(track.current);
    return () => ro.disconnect();
  }, []);
  const finish = () => {
    if (done) return;
    setDone(true);
    const { max } = geometry();
    paint(max, GLIDE);
    window.setTimeout(onConfirm, still() ? 0 : 170);
  };
  const onDown = (e) => {
    if (done || !track.current) return;
    const { max, dir } = geometry();
    const now = performance.now();
    drag.current = { x0: e.clientX, max, dir, past: false, x: 0, lastX: 0, lastT: now, v: 0 };
    moved.current = false;
    e.currentTarget.setPointerCapture(e.pointerId);
    paint(0, null);
  };
  const onMove = (e) => {
    const d = drag.current;
    if (!d) return;
    const raw = (e.clientX - d.x0) * d.dir;
    if (!moved.current && raw > 4) {
      moved.current = true;
      setShowHint(false);
      haptic("light");
    }
    const x = raw < 0 ? raw * 0.15 : raw > d.max ? d.max + (raw - d.max) * 0.15 : raw;
    const now = performance.now();
    const dt = now - d.lastT;
    if (dt > 0) d.v = 0.7 * ((x - d.lastX) / dt) + 0.3 * d.v;
    d.lastX = x;
    d.lastT = now;
    d.x = x;
    const past = x / d.max >= DONE_AT;
    if (past !== d.past) {
      d.past = past;
      if (past) haptic("tap");
    }
    cancelAnimationFrame(frame.current);
    frame.current = requestAnimationFrame(() => paint(x, null));
  };
  const onUp = () => {
    const d = drag.current;
    drag.current = null;
    cancelAnimationFrame(frame.current);
    if (!d) return;
    const flick = d.v > FLICK && d.x / d.max > 0.4;
    if (d.past || flick) {
      if (!d.past) haptic("tap");
      finish();
    } else paint(0, SPRING);
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { ref: track, className: cn("swipe-track relative h-16 w-full select-none", className), children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      "div",
      {
        ref: fill,
        className: "swipe-fill absolute inset-y-0 start-0 w-full will-change-transform",
        "aria-hidden": "true"
      }
    ),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(
      "span",
      {
        ref: text,
        className: "swipe-label pointer-events-none absolute inset-0 flex items-center justify-center ps-16",
        "aria-hidden": "true",
        children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: showHint ? hint : label }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronsLeft, { className: "swipe-arrows ms-1 h-5 w-5 ltr:rotate-180" })
        ]
      }
    ),
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      "button",
      {
        ref: thumb,
        type: "button",
        "aria-label": label,
        className: "swipe-thumb absolute start-1.5 top-1.5 z-10 flex h-12 w-12 touch-none items-center justify-center will-change-transform focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
        onPointerDown: onDown,
        onPointerMove: onMove,
        onPointerUp: onUp,
        onPointerCancel: onUp,
        onClick: (e) => {
          if (e.detail === 0) return finish();
          if (!moved.current && !done) {
            setShowHint(true);
            haptic("light");
            paint(18, GLIDE);
            window.setTimeout(() => paint(0, SPRING), 170);
          }
        },
        children: done ? /* @__PURE__ */ jsxRuntimeExports.jsx(Check, { className: "h-6 w-6" }) : icon
      }
    )
  ] });
}
function CountUp({
  value,
  format,
  duration = 700,
  className
}) {
  const [shown, setShown] = reactExports.useState(value);
  const fromRef = reactExports.useRef(value);
  const rafRef = reactExports.useRef(void 0);
  reactExports.useEffect(() => {
    const reduce = typeof window !== "undefined" && window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    const from = fromRef.current;
    if (reduce || from === value) {
      fromRef.current = value;
      setShown(value);
      return;
    }
    const start = performance.now();
    const tick = (t) => {
      const p = Math.min(1, (t - start) / duration);
      const eased = 1 - Math.pow(1 - p, 3);
      setShown(from + (value - from) * eased);
      if (p < 1) rafRef.current = requestAnimationFrame(tick);
      else fromRef.current = value;
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      fromRef.current = value;
    };
  }, [value, duration]);
  return /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className, children: format(shown) });
}
const iso = (date) => new Date(date.getTime() - date.getTimezoneOffset() * 6e4).toISOString().slice(0, 10);
function DailyProfitGauge({
  net,
  goal,
  breakEven,
  currency,
  profitability,
  hourly
}) {
  const targetPct = goal > 0 ? Math.max(0, Math.min(100, net / goal * 100)) : 0;
  const passedBreakEven = net >= breakEven;
  const pathLength = 251.2;
  const dashOffset = pathLength * (1 - targetPct / 100);
  const goalReached = targetPct >= 100;
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(
    "section",
    {
      className: `profit-hero animate-scale-in ${goalReached ? "profit-hero-achieved" : ""}`,
      "aria-label": "מד רווח יומי",
      children: [
        goalReached && /* @__PURE__ */ jsxRuntimeExports.jsx(GoalSparkles, {}),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative z-10 flex items-center justify-between text-xs", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "flex items-center gap-1.5 font-semibold text-hud-muted", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Gauge, { className: "h-4 w-4 text-hud-accent" }),
            " רווח נקי היום"
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "span",
            {
              className: `status-chip ${passedBreakEven ? "status-chip-success" : "status-chip-neutral"}`,
              children: passedBreakEven ? "נקודת האיזון עברה" : `איזון ב־${fmt(breakEven, currency)}`
            }
          )
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative z-10 mx-auto mt-2 h-36 w-full max-w-[21rem]", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs(
            "svg",
            {
              viewBox: "0 0 220 126",
              className: "h-full w-full overflow-visible",
              role: "img",
              "aria-label": `${Math.round(targetPct)} אחוז מהיעד`,
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  "path",
                  {
                    d: "M 30 108 A 80 80 0 0 1 190 108",
                    className: "gauge-track",
                    pathLength
                  }
                ),
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  "path",
                  {
                    d: "M 30 108 A 80 80 0 0 1 190 108",
                    className: "gauge-value",
                    pathLength,
                    stroke: passedBreakEven ? "var(--hud-good)" : "var(--hud-accent)",
                    strokeDasharray: pathLength,
                    strokeDashoffset: dashOffset
                  }
                ),
                /* @__PURE__ */ jsxRuntimeExports.jsx("g", { className: "gauge-ticks", children: Array.from({ length: 11 }, (_, i) => {
                  const ang = Math.PI - i / 10 * Math.PI;
                  const r1 = i % 5 === 0 ? 62 : 67;
                  return /* @__PURE__ */ jsxRuntimeExports.jsx(
                    "line",
                    {
                      x1: 110 + Math.cos(ang) * r1,
                      y1: 108 - Math.sin(ang) * r1,
                      x2: 110 + Math.cos(ang) * 72,
                      y2: 108 - Math.sin(ang) * 72
                    },
                    i
                  );
                }) }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("g", { className: "gauge-needle", style: { transform: `rotate(${-90 + targetPct * 1.8}deg)` }, children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("path", { d: "M110 50 L104 16 L116 16 Z" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("circle", { cx: "110", cy: "16", r: "3" })
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("circle", { cx: "30", cy: "108", r: "3", fill: "var(--hud-accent)" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("circle", { cx: "190", cy: "108", r: "3", fill: "var(--hud-good)" })
              ]
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "absolute inset-x-0 bottom-0 text-center", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              CountUp,
              {
                value: net,
                format: (n) => fmt(n, currency),
                className: "num font-display block text-[2.65rem] font-extrabold leading-none text-hud-foreground"
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "mt-1 block text-xs font-semibold text-hud-muted", children: [
              Math.round(targetPct),
              "% מתוך יעד ",
              fmt(goal, currency)
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative z-10 mt-3 grid grid-cols-2 divide-x divide-x-reverse divide-hud-border rounded-xl border border-hud-border bg-hud-surface/60 py-2.5 text-center backdrop-blur-md", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "block text-[10px] text-hud-muted", children: "רווחיות" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("strong", { className: "num text-sm text-hud-foreground", children: [
              profitability,
              "%"
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "block text-[10px] text-hud-muted", children: "רווח לשעה" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { className: "num text-sm text-hud-foreground", children: hourly > 0 ? fmt(hourly, currency) : "—" })
          ] })
        ] })
      ]
    }
  );
}
function DriveModeAction({ active }) {
  const navigate = useNavigate();
  if (!active)
    return /* @__PURE__ */ jsxRuntimeExports.jsx(
      SwipeToConfirm,
      {
        label: "החליקו להתחלת נסיעה",
        icon: /* @__PURE__ */ jsxRuntimeExports.jsx(Navigation, { className: "h-6 w-6" }),
        onConfirm: () => void navigate({ to: "/trip", search: { action: "start_trip", mode: "drive" } })
      }
    );
  return /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { asChild: true, className: "drive-mode-button h-14 w-full justify-between rounded-2xl px-4", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(
    Link,
    {
      to: "/trip",
      search: { action: active ? void 0 : "start_trip", mode: "drive" },
      children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "flex items-center gap-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "flex h-8 w-8 items-center justify-center rounded-lg bg-primary-foreground/15", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Navigation, { className: "h-4 w-4" }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-right", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { className: "font-display block text-sm", children: active ? "חזרה למצב נהיגה" : "הפעל מצב נהיגה" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "block text-[10px] font-normal opacity-80", children: "מסך כהה, נתונים גדולים ומסך שנשאר פעיל" })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "span",
          {
            className: `h-3 w-3 shrink-0 rounded-full ${active ? "animate-pulse bg-primary-foreground" : "bg-primary-foreground/40"}`,
            "aria-hidden": "true"
          }
        )
      ]
    }
  ) });
}
function MomentumCoach({ data }) {
  const momentum = calculateDailyMomentum(data);
  const streak = calculateWorkStreak(data.incomes);
  const { net, goal, breakEven, remaining } = momentum;
  const progress = goal > 0 ? Math.max(0, Math.round(net / goal * 100)) : 0;
  const state = !streak.activeToday ? {
    tone: "start",
    emoji: "👋",
    title: streak.current > 0 ? `שומרים על רצף של ${streak.current} ימים` : "מתחילים רצף חדש",
    message: "רישום ההכנסה הראשונה היום ישמור את יום העבודה ברצף.",
    cta: "רשום הכנסה"
  } : net < 0 ? {
    tone: "warning",
    emoji: "🧭",
    title: "מכוונים מחדש",
    message: `הרצף נשמר. חסרים ${fmt(Math.max(0, breakEven - net), data.settings.currency)} כדי לחזור לאיזון.`,
    cta: "המשך לצבור"
  } : net < breakEven ? {
    tone: "warning",
    emoji: "⛽",
    title: "היום בתנועה",
    message: `הרצף נשמר. עוד ${fmt(Math.max(0, breakEven - net), data.settings.currency)} והיום עובר לרווח.`,
    cta: "המשך לצבור"
  } : progress < 70 ? {
    tone: "progress",
    emoji: "💪",
    title: "עברת לרווח",
    message: `${progress}% מהיעד הושלמו. התחנה הבאה היא ניצחון יומי.`,
    cta: "שמור על הקצב"
  } : progress < 100 ? {
    tone: "progress",
    emoji: "🚀",
    title: "היעד ממש קרוב",
    message: `נשארו ${fmt(remaining, data.settings.currency)} בלבד כדי להשלים את היום.`,
    cta: "סוגרים את היעד"
  } : {
    tone: "success",
    emoji: "🏆",
    title: "היום הושלם",
    message: `רצף של ${streak.current} ימים נשמר · כל מה שמכאן מגדיל את הרווח.`,
    cta: "ממשיכים חזק"
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(
    "section",
    {
      className: `momentum-coach momentum-coach-${state.tone}`,
      "aria-live": "polite",
      children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "coach-stage stage-bg stage-street", "aria-hidden": "true", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            MovieStage,
            {
              morning: true,
              base: {
                mood: state.tone === "start" ? "sleepy" : state.tone === "warning" ? "grumble" : state.tone === "success" ? "victory" : "smirk",
                taxi: state.tone === "start" ? "tired" : state.tone === "success" ? "zoom" : "happy",
                driving: state.tone === "success"
              },
              mascotClass: "coach-mascot",
              taxiClass: "coach-taxi"
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "coach-streak num", children: [
            "🔥 ",
            streak.current
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(
          ComicBubble,
          {
            tone: state.tone === "warning" ? "warn" : state.tone === "start" ? "default" : "win",
            className: "coach-bubble",
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "coach-bubble-emoji", "aria-hidden": "true", children: state.emoji }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "min-w-0 flex-1", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "font-display text-base font-extrabold", children: state.title }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: state.message })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                Link,
                {
                  to: streak.activeToday ? "/trip" : "/add",
                  search: streak.activeToday ? { action: "start_trip", mode: "drive" } : { tab: "income" },
                  className: "momentum-action",
                  "aria-label": state.cta,
                  children: /* @__PURE__ */ jsxRuntimeExports.jsx(ArrowLeft, { "aria-hidden": "true" })
                }
              )
            ]
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx(DailyJourney, { hasIncome: streak.activeToday, net, breakEven, goal })
      ]
    },
    `${state.tone}-${momentum.stage}`
  );
}
function DailyJourney({
  hasIncome,
  net,
  breakEven,
  goal
}) {
  const steps = ["התחלה", "איזון", "יעד"];
  const done = [hasIncome, hasIncome && net >= breakEven, hasIncome && net >= goal];
  const active = done.findIndex((value) => !value);
  const progressWidth = done[2] ? 100 : done[1] ? 67 : done[0] ? 33 : 0;
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(
    "div",
    {
      className: "daily-journey",
      "aria-label": active >= 0 ? `התחנה הבאה: ${steps[active]}` : "כל תחנות היום הושלמו",
      children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "daily-journey-line", children: /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: { width: `${progressWidth}%` } }) }),
        steps.map((label, index) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
          "span",
          {
            className: `daily-step ${done[index] ? "daily-step-done" : index === active ? "daily-step-active" : ""}`,
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("i", { children: done[index] ? "✓" : index + 1 }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("b", { children: label })
            ]
          },
          label
        ))
      ]
    }
  );
}
function PremiumStats({
  data,
  income,
  expense,
  breakEven,
  forecast
}) {
  const c = data.settings.currency;
  const hours = sumHours(
    filterByDate(data.incomes, iso(/* @__PURE__ */ new Date())),
    filterByDate(data.trips ?? [], iso(/* @__PURE__ */ new Date()))
  );
  const km = drivenKm(
    filterByDate(data.incomes, iso(/* @__PURE__ */ new Date())),
    filterByDate(data.trips ?? [], iso(/* @__PURE__ */ new Date()))
  );
  const hourly = hours > 0 ? (income - expense) / hours : 0;
  const kmRatio = km > 0 ? (income - expense) / km : 0;
  const badges = [
    hourly > 70 ? "🔥 תעריף שעה חזק" : "קצב היום",
    kmRatio > 4 ? "⚡ יחס ק״מ מיטבי" : "עלות מבוקרת"
  ];
  const stats = [
    {
      label: "הכנסות היום",
      value: income,
      icon: TrendingUp,
      badge: badges[0],
      tone: "text-success",
      fill: "green"
    },
    {
      label: "הוצאות כולל דלק",
      value: expense,
      icon: Zap,
      badge: badges[1],
      tone: "text-warning",
      fill: "mustard"
    },
    {
      label: "נקודת איזון",
      value: breakEven,
      icon: Award,
      badge: "יעד מינימום",
      tone: "text-muted-foreground",
      fill: "vermilion"
    },
    {
      label: "תחזית חודשית",
      value: forecast,
      icon: Sparkles,
      badge: forecast > 0 ? "לפי הקצב הנוכחי" : "ממתין לנתונים",
      tone: "text-primary",
      fill: "slate"
    }
  ];
  return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid grid-cols-2 gap-3", children: stats.map(({ label, value, icon: Icon, badge, tone, fill }) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "premium-stat group", "data-fill": fill, children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between gap-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Icon, { className: `h-4 w-4 ${tone}` }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "truncate text-[9px] font-semibold text-muted-foreground", children: badge })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      CountUp,
      {
        value,
        format: (n) => fmt(n, c),
        className: "num font-display mt-3 block text-xl font-bold"
      }
    ),
    /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "mt-0.5 block text-[11px] text-muted-foreground", children: label })
  ] }, label)) });
}
function InteractiveWeeklyEarnings({ data }) {
  const [selected, setSelected] = reactExports.useState(6);
  const c = data.settings.currency;
  const days = useDays(data);
  const series = reactExports.useMemo(() => {
    return Array.from({ length: 7 }, (_, index) => {
      const date = /* @__PURE__ */ new Date();
      date.setDate(date.getDate() - (6 - index));
      const d = dayOf(days, iso(date), data);
      return {
        date: d.date,
        label: date.toLocaleDateString("he-IL", { weekday: "short" }).replace("יום ", ""),
        net: d.net,
        km: d.km,
        trips: workTrips(d.trips).length,
        records: d.incomes.length
      };
    });
  }, [days, data]);
  const maxPos = Math.max(0, ...series.map((item) => item.net));
  const maxNeg = Math.max(0, ...series.map((item) => -item.net));
  const span = Math.max(1, maxPos + maxNeg);
  const posShare = maxNeg === 0 ? 100 : maxPos === 0 ? 0 : maxPos / span * 100;
  const current = series[selected] ?? series[6];
  const total = series.reduce((sum, item) => sum + item.net, 0);
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { className: "premium-panel animate-fade-in-up", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start justify-between gap-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "font-display text-sm font-bold", children: "רווח שבועי" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-0.5 text-[11px] text-muted-foreground", children: "לחיצה על יום מציגה את הפירוט" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        "span",
        {
          className: `status-chip ${total >= 0 ? "status-chip-success" : "status-chip-danger"}`,
          children: fmt(total, c)
        }
      )
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-5 flex h-40 gap-2", dir: "rtl", children: series.map((item, index) => {
      const active = selected === index;
      const negative = item.net < 0;
      const height = item.net === 0 ? 0 : Math.max(10, Math.abs(item.net) / (negative ? maxNeg : maxPos) * 100);
      const bar = /* @__PURE__ */ jsxRuntimeExports.jsx(
        "span",
        {
          className: `weekly-bar ${negative ? "weekly-bar-negative" : ""} ${active ? "weekly-bar-active" : ""} ${index === 6 ? "weekly-bar-today" : ""}`,
          style: {
            height: `${height}%`,
            ...negative ? { transformOrigin: "top", borderRadius: "3px 3px 8px 8px" } : {}
          },
          children: /* @__PURE__ */ jsxRuntimeExports.jsx(
            "span",
            {
              className: `weekly-bar-value num ${active ? "opacity-100" : "opacity-0 group-hover:opacity-100"}`,
              children: Math.round(item.net)
            }
          )
        }
      );
      return /* @__PURE__ */ jsxRuntimeExports.jsxs(
        "button",
        {
          type: "button",
          className: "group flex h-full min-w-0 flex-1 flex-col items-center gap-1",
          "aria-label": `${item.label}, ${fmt(item.net, c)}`,
          "aria-pressed": active,
          onClick: () => setSelected(index),
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "flex w-full min-h-0 flex-1 flex-col items-center", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                "span",
                {
                  className: "flex w-full items-end justify-center",
                  style: { height: `${posShare}%` },
                  children: !negative && item.net !== 0 && bar
                }
              ),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "w-full border-t border-muted-foreground/40", "aria-hidden": "true" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                "span",
                {
                  className: "flex w-full items-start justify-center",
                  style: { height: `${100 - posShare}%` },
                  children: negative && bar
                }
              )
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              "span",
              {
                className: `text-[10px] font-bold ${active ? "text-primary" : "text-muted-foreground"}`,
                children: item.label
              }
            )
          ]
        },
        item.date
      );
    }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "weekly-detail animate-fade-in", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[10px] text-muted-foreground", children: "נטו" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { className: "num block text-sm", children: fmt(current.net, c) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[10px] text-muted-foreground", children: "נסיעות / רשומות" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("strong", { className: "num block text-sm", children: [
          current.trips,
          " / ",
          current.records
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[10px] text-muted-foreground", children: "רווח לק״מ" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { className: "num block text-sm", children: current.km > 0 ? fmtPrecise(current.net / current.km, c) : "—" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronDown, { className: "h-4 w-4 self-center text-muted-foreground" })
    ] }, current.date)
  ] });
}
function GoalSparkles() {
  return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "goal-sparkles", "aria-hidden": "true", children: Array.from({ length: 12 }, (_, index) => /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: { "--spark": index } }, index)) });
}
function syncLabel(s, now = Date.now()) {
  if (s.status === "syncing") return "מסנכרן…";
  if (s.status === "pending") return "ממתין לסנכרון";
  if (s.status === "off" || !s.lastSyncedAt) return "מתחבר…";
  const min = Math.floor((now - s.lastSyncedAt) / 6e4);
  if (min < 1) return "נשמר עכשיו";
  if (min < 60) return `נשמר לפני ${min} דק׳`;
  const h = Math.floor(min / 60);
  return h < 24 ? `נשמר לפני ${h} שע׳` : "נשמר לפני יותר מיום";
}
function AccountBadge() {
  const { user, loading } = useAuthUser();
  const sync = useSyncState();
  const [, setTick] = reactExports.useState(0);
  reactExports.useEffect(() => {
    const t = setInterval(() => setTick((n) => n + 1), 3e4);
    return () => clearInterval(t);
  }, []);
  const meta = user?.user_metadata ?? {};
  const name = meta.full_name || meta.name || "";
  const avatar = meta.avatar_url || meta.picture || "";
  const provider = user?.app_metadata?.provider || "email";
  const email = user?.email || "";
  reactExports.useEffect(() => {
    if (email) saveLastAccount({ email, name, avatar, provider });
  }, [email, name, avatar, provider]);
  if (loading) return null;
  if (!user) {
    return /* @__PURE__ */ jsxRuntimeExports.jsxs(
      Link,
      {
        to: "/auth",
        className: "inline-flex items-center gap-1.5 rounded-full border bg-card px-3 py-1.5 text-xs font-medium text-muted-foreground pressable",
        children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(CloudOff, { className: "h-3.5 w-3.5" }),
          "לא מחובר"
        ]
      }
    );
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(
    Link,
    {
      to: "/settings",
      className: "inline-flex max-w-[9.5rem] items-center gap-2 rounded-full border bg-card px-2 py-1.5 pressable",
      children: [
        avatar ? /* @__PURE__ */ jsxRuntimeExports.jsx(
          "img",
          {
            src: avatar,
            alt: name || "תמונת פרופיל",
            className: "h-6 w-6 rounded-full object-cover"
          }
        ) : /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 text-[11px] font-bold text-primary", children: (name || email || "?").slice(0, 1).toUpperCase() }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "min-w-0 leading-tight", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { dir: "ltr", className: "block truncate text-[11px] font-semibold", children: email }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(
            "span",
            {
              className: `flex items-center gap-1 text-[10px] ${sync.status === "synced" ? "text-primary" : "text-muted-foreground"}`,
              children: [
                sync.status === "synced" ? /* @__PURE__ */ jsxRuntimeExports.jsx(CloudCheck, { className: "h-3 w-3" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(CloudUpload, { className: "h-3 w-3" }),
                syncLabel(sync)
              ]
            }
          )
        ] })
      ]
    }
  );
}
function workStatus(active, now = Date.now()) {
  if (!active) return { kind: "off" };
  const seconds = Math.max(0, Math.round((now - active.startedAt) / 1e3));
  const km = active.km;
  if (active.kind === "private") return { kind: "private", seconds, km };
  if (!isBetween(active)) return { kind: "work", seconds, km };
  return { kind: isDrivingNow(active, now) ? "between-driving" : "between-waiting", seconds, km };
}
const WORK_STATUS_LABEL = {
  work: "בנסיעת עבודה",
  "between-driving": "בין נסיעות · נוהג",
  "between-waiting": "בין נסיעות · ממתין",
  private: "נסיעה פרטית",
  off: "לא מודד כרגע"
};
const DOT = {
  work: "bg-success",
  "between-driving": "bg-primary",
  "between-waiting": "bg-primary",
  private: "bg-muted-foreground",
  off: "bg-muted-foreground/50"
};
function WorkStatus() {
  const [active, setActive] = reactExports.useState(null);
  const [now, setNow] = reactExports.useState(() => Date.now());
  reactExports.useEffect(() => {
    const sync = () => setActive(readActive());
    sync();
    window.addEventListener(ACTIVE_EVENT, sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener(ACTIVE_EVENT, sync);
      window.removeEventListener("storage", sync);
    };
  }, []);
  reactExports.useEffect(() => {
    if (!active) return;
    setNow(Date.now());
    const id = window.setInterval(() => setNow(Date.now()), 1e3);
    return () => window.clearInterval(id);
  }, [active]);
  const status = workStatus(active, now);
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(
    Link,
    {
      to: "/trip",
      className: "num flex items-center gap-2 rounded-full border bg-card px-3 py-1.5 text-xs font-semibold",
      "aria-label": `סטטוס: ${WORK_STATUS_LABEL[status.kind]}`,
      children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: `h-2.5 w-2.5 shrink-0 rounded-full ${DOT[status.kind]}` }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: WORK_STATUS_LABEL[status.kind] }),
        status.kind !== "off" ? /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "ms-auto text-muted-foreground", children: [
          "מודד ",
          fmtDuration(status.seconds),
          " · ",
          status.km.toFixed(1),
          " ק״מ"
        ] }) : /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "ms-auto text-muted-foreground", children: "הזמן לא נספר" })
      ]
    }
  );
}
const charts = () => import("./DashboardCharts-Cm1kuCtk.mjs");
const MonthPaceCard = reactExports.lazy(() => charts().then((m) => ({
  default: m.MonthPaceCard
})));
const IncomeVsExpenseCard = reactExports.lazy(() => charts().then((m) => ({
  default: m.IncomeVsExpenseCard
})));
const ProfitabilityGauge = reactExports.lazy(() => charts().then((m) => ({
  default: m.ProfitabilityGauge
})));
function ChartSlot({
  children
}) {
  return /* @__PURE__ */ jsxRuntimeExports.jsx(reactExports.Suspense, { fallback: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-56 animate-pulse rounded-2xl bg-muted/40", "aria-hidden": "true" }), children });
}
function Dashboard() {
  const {
    data,
    ready
  } = useAppData();
  const days = useDays(data);
  const [tripActive, setTripActive] = reactExports.useState(false);
  reactExports.useEffect(() => {
    const check = () => setTripActive(Boolean(readActive() && !isSideDrive(readActive())));
    check();
    window.addEventListener("storage", check);
    window.addEventListener(ACTIVE_EVENT, check);
    return () => {
      window.removeEventListener("storage", check);
      window.removeEventListener(ACTIVE_EVENT, check);
    };
  }, []);
  if (!ready) return null;
  const today = todayISO();
  const {
    settings
  } = data;
  const c = settings.currency;
  const day = dayOf(days, today, data);
  const incomeToday = day.incomeNet;
  const expenseToday = day.costs;
  const netToday = day.net;
  const hoursToday = day.hours;
  const profitabilityPct = incomeToday > 0 ? Math.round(netToday / incomeToday * 100) : 0;
  settings.dailyGoal > 0 ? Math.min(100, Math.round(netToday / settings.dailyGoal * 100)) : 0;
  const breakeven = Math.round(settings.fixedMonthlyExpenses / Math.max(1, settings.workDaysPerMonth) + expenseToday);
  const now = /* @__PURE__ */ new Date();
  const {
    from,
    to
  } = monthRange(now.getFullYear(), now.getMonth());
  const month = sumDays(days, from, to);
  const monthIncome = month.incomeNet;
  const monthExpense = month.costs;
  const monthNet = month.net;
  const daysWorked = month.daysWorked;
  const dayOfMonth = now.getDate();
  const forecast = Math.round(monthForecast(days, data, today).forecast);
  const hour = now.getHours();
  const greeting = hour < 5 ? "לילה טוב" : hour < 12 ? "בוקר טוב" : hour < 17 ? "צהריים טובים" : hour < 21 ? "ערב טוב" : "לילה טוב";
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mx-auto max-w-xl", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("header", { className: "flex items-center justify-between gap-3 px-4 pb-4 pt-[calc(1.5rem+env(safe-area-inset-top,0px))]", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs font-semibold text-primary", children: (/* @__PURE__ */ new Date()).toLocaleDateString("he-IL", {
          weekday: "long",
          day: "numeric",
          month: "long"
        }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "font-display mt-1 text-2xl font-bold", children: greeting })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(AccountBadge, {})
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-3 px-4 pb-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(WorkStatus, {}),
      /* @__PURE__ */ jsxRuntimeExports.jsx(DriveModeAction, { active: tripActive })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "stagger space-y-4 px-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(DailyProfitGauge, { net: netToday, goal: settings.dailyGoal, breakEven: breakeven, currency: c, profitability: profitabilityPct, hourly: hoursToday > 0 ? netToday / hoursToday : 0 }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(MomentumCoach, { data }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(PremiumStats, { data, income: incomeToday, expense: expenseToday, breakEven: breakeven, forecast }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(InteractiveWeeklyEarnings, { data }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(ChartSlot, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(ProfitabilityGauge, { data }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(ChartSlot, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(MonthPaceCard, { data }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(ChartSlot, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(IncomeVsExpenseCard, { data }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(KmCostCard, { data }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(InsightsCard, { data }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-3 gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { asChild: true, variant: "secondary", className: "w-full h-auto py-3 flex-col gap-1 rounded-xl", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Link, { to: "/add", search: {
          tab: "income"
        }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { className: "h-4 w-4 text-success" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs font-medium", children: "הכנסה" })
        ] }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { asChild: true, variant: "secondary", className: "w-full h-auto py-3 flex-col gap-1 rounded-xl", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Link, { to: "/add", search: {
          tab: "expense"
        }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { className: "h-4 w-4 text-destructive" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs font-medium", children: "הוצאה" })
        ] }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { asChild: true, variant: "secondary", className: "w-full h-auto py-3 flex-col gap-1 rounded-xl", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Link, { to: "/add", search: {
          tab: "fuel"
        }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Zap, { className: "h-4 w-4 text-warning" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs font-medium", children: "תדלוק" })
        ] }) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { className: "p-4 space-y-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "text-sm font-semibold", children: "סיכום חודשי" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-xs text-muted-foreground", children: [
            "יום ",
            dayOfMonth,
            " בחודש"
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-3 gap-2 text-center", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(MiniStat, { label: "הכנסות", value: fmt(monthIncome, c) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(MiniStat, { label: "הוצאות", value: fmt(monthExpense, c) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(MiniStat, { label: "נטו", value: fmt(monthNet, c), accent: true })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-xs text-muted-foreground text-center", children: [
          daysWorked,
          " ימי עבודה · ממוצע יומי",
          " ",
          fmt(daysWorked ? Math.round(monthNet / daysWorked) : 0, c)
        ] })
      ] }) })
    ] })
  ] });
}
function MiniStat({
  label,
  value,
  accent
}) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[11px] text-muted-foreground", children: label }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: `num text-base font-semibold ${accent ? "text-primary" : ""}`, children: value })
  ] });
}
export {
  Dashboard as component
};
