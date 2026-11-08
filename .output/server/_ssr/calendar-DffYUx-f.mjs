import { r as reactExports, j as jsxRuntimeExports } from "../_libs/react.mjs";
import { f as fmtDurationWords } from "./duration-BNQpD9Px.mjs";
import { L as Link } from "../_libs/tanstack__react-router.mjs";
import { u as useAppData, m as monthRange, f as fmt, B as Button, c as cn } from "./router-DjatMlVs.mjs";
import { u as useDays, s as sumDays, d as dayOf } from "./index-8vpH54VC.mjs";
import { R as RecordsList } from "./RecordsList--zS0GXzH.mjs";
import { P as PageHeader } from "./PageHeader-C60dZNKN.mjs";
import { C as Card, a as CardContent } from "./MovieStage-BBwosCG9.mjs";
import "../_libs/sonner.mjs";
import "../_libs/react-dom.mjs";
import { s as ChevronLeft, t as ChevronRight, P as Plus, M as MapPin } from "../_libs/lucide-react.mjs";

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
import "./label-BSJvlS_H.mjs";
import "../_libs/radix-ui__react-label.mjs";
import "../_libs/radix-ui__react-primitive.mjs";
import "./select-zltnvMan.mjs";
import "../_libs/radix-ui__react-select.mjs";
import "../_libs/radix-ui__number.mjs";
import "../_libs/radix-ui__primitive.mjs";
import "../_libs/radix-ui__react-collection.mjs";
import "../_libs/radix-ui__react-context.mjs";
import "../_libs/radix-ui__react-direction.mjs";
import "../_libs/@radix-ui/react-dismissable-layer+[...].mjs";
import "../_libs/@radix-ui/react-use-callback-ref+[...].mjs";
import "../_libs/radix-ui__react-focus-guards.mjs";
import "../_libs/radix-ui__react-focus-scope.mjs";
import "../_libs/radix-ui__react-id.mjs";
import "../_libs/@radix-ui/react-use-layout-effect+[...].mjs";
import "../_libs/radix-ui__react-popper.mjs";
import "../_libs/floating-ui__react-dom.mjs";
import "../_libs/floating-ui__dom.mjs";
import "../_libs/floating-ui__core.mjs";
import "../_libs/floating-ui__utils.mjs";
import "../_libs/radix-ui__react-use-size.mjs";
import "../_libs/radix-ui__react-portal.mjs";
import "../_libs/radix-ui__react-presence.mjs";
import "../_libs/@radix-ui/react-use-controllable-state+[...].mjs";
import "../_libs/@radix-ui/react-use-effect-event+[...].mjs";
import "../_libs/radix-ui__react-use-previous.mjs";
import "../_libs/@radix-ui/react-visually-hidden+[...].mjs";
import "../_libs/aria-hidden.mjs";
import "../_libs/react-remove-scroll.mjs";
import "../_libs/tslib.mjs";
import "../_libs/react-remove-scroll-bar.mjs";
import "../_libs/react-style-singleton.mjs";
import "../_libs/get-nonce.mjs";
import "../_libs/use-sidecar.mjs";
import "../_libs/use-callback-ref.mjs";
import "./day-groups-D_Kb8Mnr.mjs";
import "../_libs/radix-ui__react-dialog.mjs";
import "./validate-C7bMxNbd.mjs";
const weekDays = ["א", "ב", "ג", "ד", "ה", "ו", "ש"];
function CalendarPage() {
  const {
    data,
    ready
  } = useAppData();
  const calcDays = useDays(data);
  const now = /* @__PURE__ */ new Date();
  const todayIso = new Date(now.getTime() - now.getTimezoneOffset() * 6e4).toISOString().slice(0, 10);
  const [year, setYear] = reactExports.useState(now.getFullYear());
  const [month, setMonth] = reactExports.useState(now.getMonth());
  const [selected, setSelected] = reactExports.useState(todayIso);
  const days = reactExports.useMemo(() => {
    const first = new Date(year, month, 1);
    const last = new Date(year, month + 1, 0);
    const startWeekday = first.getDay();
    const total = last.getDate();
    const arr = [];
    for (let i = 0; i < startWeekday; i++) arr.push({
      iso: null,
      day: null
    });
    for (let d = 1; d <= total; d++) {
      const dt = new Date(year, month, d);
      const iso = new Date(dt.getTime() - dt.getTimezoneOffset() * 6e4).toISOString().slice(0, 10);
      arr.push({
        iso,
        day: d
      });
    }
    return arr;
  }, [year, month]);
  if (!ready) return null;
  const c = data.settings.currency;
  const goal = data.settings.dailyGoal;
  const prev = () => {
    if (month === 0) {
      setMonth(11);
      setYear(year - 1);
    } else setMonth(month - 1);
  };
  const next = () => {
    if (month === 11) {
      setMonth(0);
      setYear(year + 1);
    } else setMonth(month + 1);
  };
  const monthLabel = new Date(year, month, 1).toLocaleDateString("he-IL", {
    month: "long",
    year: "numeric"
  });
  const {
    from,
    to
  } = monthRange(year, month);
  const monthNet = sumDays(calcDays, from, to).net;
  const sel = selected ? dayOf(calcDays, selected, data) : null;
  const selectedNet = sel?.net ?? 0;
  const looseTrips = sel ? sel.trips.filter((t) => !sel.incomes.some((i) => i.tripId === t.id)) : [];
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mx-auto max-w-xl", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(PageHeader, { title: "לוח שנה", subtitle: `רווח חודשי: ${fmt(monthNet, c)}`, scene: {
      mood: monthNet >= 0 ? "smirk" : "grumble",
      prop: "stamp",
      line: monthNet >= 0 ? "כל יום יעד מקבל חותמת! 🟢" : "החודש עוד ניתן להציל 💪",
      backdrop: "promenade"
    } }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "px-4 space-y-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { className: "calendar-flip", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { className: "p-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between mb-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "ghost", size: "icon", "aria-label": "החודש הבא", onClick: next, children: /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronLeft, { className: "h-4 w-4" }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-semibold", children: monthLabel }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "ghost", size: "icon", "aria-label": "החודש הקודם", onClick: prev, children: /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronRight, { className: "h-4 w-4" }) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid grid-cols-7 gap-1 text-center text-[11px] font-medium text-muted-foreground mb-1.5", "aria-hidden": "true", children: weekDays.map((w) => /* @__PURE__ */ jsxRuntimeExports.jsx("div", { children: w }, w)) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid grid-cols-7 gap-1", children: days.map((cell, idx) => {
          if (!cell.iso) return /* @__PURE__ */ jsxRuntimeExports.jsx("div", {}, idx);
          const d = dayOf(calcDays, cell.iso, data);
          const net = Math.round(d.net);
          const hasData = d.incomeNet > 0 || d.costs > 0 || d.trips.length > 0;
          let tone = "bg-muted/40 text-muted-foreground";
          if (hasData) {
            if (net < 0) tone = "bg-destructive/12 text-destructive border border-destructive/30";
            else if (net >= goal) tone = "bg-success/15 text-success border border-success/30";
            else tone = "bg-warning/15 text-warning border border-warning/30";
          }
          const isSelected = selected === cell.iso;
          const isToday = cell.iso === todayIso;
          const isFuture = !hasData && cell.iso > todayIso;
          return /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { onClick: () => setSelected(cell.iso), "aria-pressed": isSelected, "aria-label": `${(/* @__PURE__ */ new Date(`${cell.iso}T12:00:00`)).toLocaleDateString("he-IL", {
            weekday: "long",
            day: "numeric",
            month: "long"
          })}${hasData ? `, נטו ${fmt(net, c)}${net >= goal ? ", יעד הושג" : ""}` : ", אין רשומות"}`, className: cn("cal-cell relative aspect-square rounded-xl flex flex-col items-center justify-center text-[11px] font-medium transition-all", tone, isFuture && "opacity-45", isToday && !isSelected && "ring-1 ring-primary/50", isSelected && "ring-2 ring-primary ring-offset-1 ring-offset-card"), children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: cn("num text-xs", isToday && "font-extrabold text-primary"), "aria-hidden": "true", children: cell.day }),
            hasData && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "num mt-0.5 text-[11px] font-bold leading-none", "aria-hidden": "true", children: net }),
            hasData && net >= goal && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "ink-stamp", "aria-hidden": "true", children: "✓" })
          ] }, cell.iso);
        }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-3 flex flex-wrap items-center justify-center gap-x-3 gap-y-1 border-t pt-2.5 text-[11px] text-muted-foreground", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(LegendDot, { className: "bg-success/60", label: `יעד הושג (${fmt(goal, c)}+)` }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(LegendDot, { className: "bg-warning/70", label: "מתחת ליעד" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(LegendDot, { className: "bg-destructive/60", label: "הפסד" })
        ] })
      ] }) }, monthLabel),
      selected && sel && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between gap-2 px-1", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "font-semibold", children: new Date(selected).toLocaleDateString("he-IL", {
            weekday: "long",
            day: "numeric",
            month: "long"
          }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: cn("num font-bold", selectedNet >= 0 ? "text-success" : "text-destructive"), children: fmt(selectedNet, c) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { to: "/add", search: {
              tab: "income",
              date: selected
            }, "aria-label": "הוסף רשומה לתאריך הזה", className: "inline-flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { className: "h-4 w-4" }) })
          ] })
        ] }),
        looseTrips.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(CardContent, { className: "divide-y p-0", children: looseTrips.map((t) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3 p-3 text-sm", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary", children: /* @__PURE__ */ jsxRuntimeExports.jsx(MapPin, { className: "h-4 w-4" }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-w-0 flex-1", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-medium", children: t.kind === "between" ? "בין נסיעות" : "נסיעת GPS" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "num text-xs text-muted-foreground", children: [
              t.time ?? "",
              " · ",
              t.km.toFixed(1),
              " ק״מ · ",
              fmtDurationWords(t.seconds)
            ] })
          ] })
        ] }, t.id)) }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(RecordsList, { incomes: sel.incomes, expenses: sel.expenses })
      ] })
    ] })
  ] });
}
function LegendDot({
  className,
  label
}) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "flex items-center gap-1", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: cn("h-2 w-2 rounded-full", className) }),
    label
  ] });
}
export {
  CalendarPage as component
};
