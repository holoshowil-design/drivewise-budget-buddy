import { j as jsxRuntimeExports, r as reactExports } from "../_libs/react.mjs";
import { L as Link, d as useNavigate } from "../_libs/tanstack__react-router.mjs";
import { as as Route, B as Button, u as useAppData, a9 as writeActive, aa as betweenToTrip, r as readActive, o as isSideDrive, Q as nowHHMM, t as todayISO, ab as requestNotifyPermission, h as haptic, p as playSound, ac as hushSound, ad as closeStop, ae as cleanStops, A as ACTIVE_EVENT, af as GPS_ERROR_EVENT, a3 as isPrivate, O as effectiveFuelParams, $ as idlePerHour, ag as workSecondsOn, a0 as hasBackgroundTracking, l as fmtDuration, f as fmt, ah as stopLabel, ai as trackBetweenOn, aj as readGpsError, ak as isUnconfirmedAuto, al as notifyIfHidden, am as looksForgotten, an as autoToSide, ao as startStop, ap as confirmAuto, a4 as STOP_REASONS, a1 as stopsText, aq as finishPath, ar as startBetween, a6 as STAND_AFTER_MS, a7 as engineOn, a8 as chargingNow, a5 as sumStops, w as workTrips, j as isBetween, a2 as tripEnergy, e as energyUnitLabel } from "./router-CcPEcE51.mjs";
import { P as PageHeader, a as PageStage } from "./PageHeader-507zMUYd.mjs";
import { f as fmtDurationWords } from "./duration-BNQpD9Px.mjs";
import { C as Card, a as CardContent } from "./MovieStage-0WygtrCr.mjs";
import { t as toast } from "../_libs/sonner.mjs";
import { D as Dialog, a as DialogContent, b as DialogHeader, c as DialogTitle, f as DialogDescription, g as groupByDay, d as dayLabel } from "./day-groups-ZcaNk8yr.mjs";
import { I as Input, L as Label } from "./label-Bywo-lhz.mjs";
import { n as numberOr, c as checkNumber, N as NumberField, b as checkDate } from "./validate-BG-MbmZ3.mjs";
import { C as CommonAmounts, a as CommissionChips, b as crossedDailyGoal, d as celebrate } from "./CommonAmounts-DTDnPGNq.mjs";
import { t as tripMotivation, a as calculateWorkStreak } from "./motivation-COcvTU2q.mjs";
import "../_libs/react-dom.mjs";
import { z as Map, a4 as Minimize2, M as MapPin, a5 as Timer, G as Gauge, C as Car, a6 as Pause, a7 as Square, a8 as Play, a9 as Flag, aa as Hourglass, X, r as TriangleAlert, o as ChevronDown, i as Fuel, u as Trash2 } from "../_libs/lucide-react.mjs";

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
import "../_libs/radix-ui__react-dialog.mjs";
import "../_libs/radix-ui__primitive.mjs";
import "../_libs/radix-ui__react-context.mjs";
import "../_libs/radix-ui__react-id.mjs";
import "../_libs/@radix-ui/react-use-layout-effect+[...].mjs";
import "../_libs/@radix-ui/react-use-controllable-state+[...].mjs";
import "../_libs/@radix-ui/react-use-effect-event+[...].mjs";
import "../_libs/@radix-ui/react-dismissable-layer+[...].mjs";
import "../_libs/radix-ui__react-primitive.mjs";
import "../_libs/@radix-ui/react-use-callback-ref+[...].mjs";
import "../_libs/radix-ui__react-focus-scope.mjs";
import "../_libs/radix-ui__react-portal.mjs";
import "../_libs/radix-ui__react-presence.mjs";
import "../_libs/radix-ui__react-focus-guards.mjs";
import "../_libs/react-remove-scroll.mjs";
import "../_libs/tslib.mjs";
import "../_libs/react-remove-scroll-bar.mjs";
import "../_libs/react-style-singleton.mjs";
import "../_libs/get-nonce.mjs";
import "../_libs/use-sidecar.mjs";
import "../_libs/use-callback-ref.mjs";
import "../_libs/aria-hidden.mjs";
import "../_libs/radix-ui__react-label.mjs";
function TripEndDialog({
  open,
  onOpenChange,
  mode,
  initial,
  initialIncome,
  onSave,
  onDiscard,
  onSaveAndNext,
  betweenTrip = false,
  stops,
  privateTrip = false
}) {
  const { data, ready } = useAppData();
  const c = data.settings.currency;
  const [date, setDate] = reactExports.useState(initial.date);
  const [time, setTime] = reactExports.useState(initial.time);
  const [km, setKm] = reactExports.useState("");
  const [driveMin, setDriveMin] = reactExports.useState("");
  const [waitMin, setWaitMin] = reactExports.useState("");
  const [amount, setAmount] = reactExports.useState("");
  const [tip, setTip] = reactExports.useState("");
  const [commission, setCommission] = reactExports.useState("");
  const [showErrors, setShowErrors] = reactExports.useState(false);
  const [showDetails, setShowDetails] = reactExports.useState(mode === "edit" || betweenTrip);
  const initKey = JSON.stringify([
    initial,
    initialIncome?.id ?? null,
    initialIncome?.updatedAt ?? null
  ]);
  const defaultCommission = data.settings.defaultCommissionPct;
  reactExports.useEffect(() => {
    if (!open || !ready) return;
    setShowErrors(false);
    setShowDetails(mode === "edit" || betweenTrip);
    setDate(initial.date);
    setTime(initial.time);
    setKm(initial.km ? initial.km.toFixed(1) : "0");
    setDriveMin(String(Math.round(Math.max(0, initial.seconds - initial.waitSeconds) / 60)));
    setWaitMin(String(Math.round(initial.waitSeconds / 60)));
    setAmount(initialIncome ? String(initialIncome.amount) : "");
    setTip(initialIncome?.tip ? String(initialIncome.tip) : "");
    setCommission(String(initialIncome?.commissionPct ?? defaultCommission));
  }, [open, ready, initKey]);
  const kmN = Math.max(0, numberOr(km, 0));
  const amountN = Math.max(0, numberOr(amount, 0));
  const tipN = Math.max(0, numberOr(tip, 0));
  const comN = Math.min(100, Math.max(0, numberOr(commission, 0)));
  const errors = {
    date: checkDate(date),
    km: checkNumber(km, { min: 0, max: 2e3 }),
    driveMin: checkNumber(driveMin, { min: 0, max: 24 * 60 }),
    waitMin: checkNumber(waitMin, { min: 0, max: 24 * 60 }),
    commission: checkNumber(commission, { min: 0, max: 100 }),
    amount: checkNumber(amount, { min: 0 }),
    tip: checkNumber(tip, { min: 0 })
  };
  const hasErrors = Object.values(errors).some(Boolean);
  const err = (k) => showErrors ? errors[k] : void 0;
  const p = effectiveFuelParams(date, data.vehicle, data.settings, time);
  const fuel = kmN / (p.consumption || 1) * p.price;
  const net = amountN * (1 - comN / 100) + tipN - fuel;
  const waitS = Math.max(0, numberOr(waitMin, 0) * 60);
  const totalS = Math.max(0, numberOr(driveMin, 0) * 60) + waitS;
  const tripValues = () => ({
    date,
    time,
    km: Math.round(kmN * 100) / 100,
    seconds: totalS,
    waitSeconds: waitS
  });
  const save = (withIncome, next = false) => {
    if (hasErrors) {
      setShowErrors(true);
      if (Object.entries(errors).some(([k, e]) => e && k !== "amount" && k !== "tip"))
        setShowDetails(true);
      return;
    }
    const income = withIncome && amountN > 0 ? {
      date,
      time,
      amount: amountN,
      tip: tipN,
      commissionPct: comN,
      platform: initialIncome?.platform ?? "פרטי",
      hours: Math.round(totalS / 3600 * 100) / 100,
      note: initialIncome?.note ?? "נסיעת GPS"
    } : null;
    if (next && onSaveAndNext) onSaveAndNext(tripValues(), income);
    else onSave(tripValues(), income);
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open, onOpenChange, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { className: "max-h-[92vh] overflow-y-auto sm:max-w-md", dir: "rtl", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogHeader, { className: "text-right", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { className: "text-xl font-extrabold", children: privateTrip ? "נסיעה פרטית" : betweenTrip ? "נסיעה בין נסיעות" : mode === "end" ? "הנסיעה הסתיימה" : "עריכת נסיעה" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogDescription, { children: privateTrip ? "נשמרת לק״מ ולדלק שלך, ולא נכנסת לחישובי העבודה." : betweenTrip ? "נשמר לחישוב הדלק, לא כנסיעת עבודה. אפשר לתקן ק״מ וזמן." : mode === "end" ? "הק״מ והזמן נמדדו. נשאר רק להוסיף סכום." : "אפשר לתקן כל פרט." })
    ] }),
    !betweenTrip && /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(F, { label: `סכום שקיבלת (${c})`, children: /* @__PURE__ */ jsxRuntimeExports.jsx(
          NumberField,
          {
            autoFocus: mode === "end",
            placeholder: "0",
            className: "h-14 text-2xl font-bold",
            value: amount,
            onValueChange: setAmount,
            error: err("amount"),
            enterKeyHint: "done",
            onKeyDown: (e) => {
              if (e.key === "Enter" && amountN > 0) save(true);
            }
          }
        ) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(F, { label: `טיפ (${c})`, children: /* @__PURE__ */ jsxRuntimeExports.jsx(
          NumberField,
          {
            placeholder: "0",
            className: "h-14 text-xl",
            value: tip,
            onValueChange: setTip,
            error: err("tip")
          }
        ) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(CommonAmounts, { onPick: setAmount }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs text-muted-foreground", children: "עמלה:" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          CommissionChips,
          {
            value: commission,
            defaultPct: defaultCommission,
            onPick: setCommission
          }
        )
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "num flex items-center justify-between rounded-2xl bg-muted/60 px-4 py-3 text-sm", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-muted-foreground", children: [
          "דלק משוער ",
          fmt(fuel, c)
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(
          "span",
          {
            className: `text-lg font-extrabold ${net >= 0 ? "text-success" : "text-destructive"}`,
            children: [
              "נטו ",
              fmt(net, c)
            ]
          }
        )
      ] })
    ] }),
    !betweenTrip && /* @__PURE__ */ jsxRuntimeExports.jsxs(
      "button",
      {
        type: "button",
        onClick: () => setShowDetails((v) => !v),
        "aria-expanded": showDetails,
        className: "num flex w-full items-center justify-between rounded-xl border border-border px-3 py-2 text-xs text-muted-foreground",
        children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-semibold text-foreground", children: "פרטי הנסיעה" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "flex items-center gap-1", children: [
            kmN.toFixed(1),
            " ק״מ · ",
            Math.round(totalS / 60),
            " דק׳ · עמלה ",
            comN,
            "%",
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              ChevronDown,
              {
                className: `h-3.5 w-3.5 transition-transform ${showDetails ? "rotate-180" : ""}`
              }
            )
          ] })
        ]
      }
    ),
    (showDetails || betweenTrip) && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(F, { label: "תאריך", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          Input,
          {
            type: "date",
            value: date,
            onChange: (e) => setDate(e.target.value),
            "aria-invalid": err("date") ? true : void 0
          }
        ),
        err("date") && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[11px] font-medium text-destructive", role: "alert", children: err("date") })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(F, { label: "שעת התחלה", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "time", value: time, onChange: (e) => setTime(e.target.value) }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(F, { label: "ק״מ", children: /* @__PURE__ */ jsxRuntimeExports.jsx(NumberField, { value: km, onValueChange: setKm, error: err("km") }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(F, { label: "דקות נהיגה", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
        NumberField,
        {
          inputMode: "numeric",
          value: driveMin,
          onValueChange: setDriveMin,
          error: err("driveMin")
        }
      ) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(F, { label: "דקות המתנה", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
        NumberField,
        {
          inputMode: "numeric",
          value: waitMin,
          onValueChange: setWaitMin,
          error: err("waitMin")
        }
      ) }),
      !betweenTrip && /* @__PURE__ */ jsxRuntimeExports.jsx(F, { label: "עמלה %", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
        NumberField,
        {
          value: commission,
          onValueChange: setCommission,
          error: err("commission")
        }
      ) })
    ] }),
    (showDetails || betweenTrip) && stopsText(stops) && /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "num text-xs text-muted-foreground", children: [
      "עצירות: ",
      stopsText(stops)
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid gap-2", children: [
      betweenTrip && /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { className: "h-14 text-lg font-bold", onClick: () => save(false), children: "שמור" }),
      !betweenTrip && /* @__PURE__ */ jsxRuntimeExports.jsx(
        Button,
        {
          className: "reward-action h-14 text-lg font-bold",
          onClick: () => save(true),
          disabled: amountN <= 0,
          children: "שמור עם הסכום"
        }
      ),
      mode === "end" && onSaveAndNext && /* @__PURE__ */ jsxRuntimeExports.jsx(
        Button,
        {
          variant: "secondary",
          className: "reward-action h-12 font-bold",
          onClick: () => save(true, true),
          disabled: amountN <= 0,
          children: "שמור והתחל נסיעה הבאה"
        }
      ),
      !betweenTrip && /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", className: "reward-action h-12", onClick: () => save(false), children: mode === "end" ? "שמור בלי סכום" : initialIncome ? "שמור והסר סכום" : "שמור בלי סכום" }),
      onDiscard && /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "ghost", className: "h-10 text-destructive", onClick: onDiscard, children: mode === "end" ? "בטל נסיעה (לא לשמור)" : "מחק נסיעה" })
    ] })
  ] }) });
}
function F({ label, children }) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-xs text-muted-foreground", children: label }),
    children
  ] });
}
const PAGE_TRIPS = 12;
const TripHistory = reactExports.memo(function TripHistory2({
  data,
  onEdit,
  onDelete
}) {
  const c = data.settings.currency;
  const unit = energyUnitLabel(data.vehicle);
  const today = todayISO();
  const trips = reactExports.useMemo(
    () => [...data.trips ?? []].sort(
      (a, b) => `${b.date} ${b.time ?? ""}`.localeCompare(`${a.date} ${a.time ?? ""}`)
    ),
    [data.trips]
  );
  const [shown, setShown] = reactExports.useState(PAGE_TRIPS);
  let end = Math.min(shown, trips.length);
  while (end > 0 && end < trips.length && trips[end].date === trips[end - 1].date) end++;
  const hidden = trips.length - end;
  return /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { className: "p-4", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("h3", { className: "mb-3 flex items-center gap-1.5 text-sm font-semibold", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Fuel, { className: "h-4 w-4 text-primary" }),
      " נסיעות שהסתיימו"
    ] }),
    trips.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: "עדיין אין נסיעות שמורות." }) : /* @__PURE__ */ jsxRuntimeExports.jsx("ul", { className: "divide-y", children: groupByDay(trips.slice(0, end), (t) => t.date).map((day) => /* @__PURE__ */ jsxRuntimeExports.jsxs(reactExports.Fragment, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("li", { className: "pb-1 pt-3 text-xs font-semibold text-muted-foreground", children: dayLabel(day.date, today) }),
      day.rows.map((t) => {
        const p = effectiveFuelParams(t.date, data.vehicle, data.settings, t.time);
        const units = tripEnergy(t, data.vehicle, data.settings).units;
        const inc = t.incomeId ? data.incomes.find((i) => i.id === t.incomeId) : void 0;
        return /* @__PURE__ */ jsxRuntimeExports.jsxs("li", { className: "flex items-center justify-between gap-2 py-2.5", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs(
            "button",
            {
              type: "button",
              className: "min-w-0 flex-1 text-start",
              onClick: () => onEdit(t),
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "num text-sm font-semibold", children: [
                  isBetween(t) && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "me-1.5 rounded-full bg-muted px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground", children: "בין נסיעות" }),
                  isPrivate(t) && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "me-1.5 rounded-full bg-muted px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground", children: "פרטית" }),
                  t.km.toFixed(1),
                  " ק״מ · ",
                  fmtDurationWords(t.seconds),
                  inc && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-success", children: [
                    " · ",
                    fmt(inc.amount, c)
                  ] })
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "num text-[11px] text-muted-foreground", children: [
                  t.time ? `${t.time} · ` : "",
                  "≈ ",
                  fmt(units * p.price, c),
                  " (",
                  units.toFixed(1),
                  " ",
                  unit,
                  ")",
                  (t.waitSeconds ?? 0) > 0 && ` · המתנה ${Math.round((t.waitSeconds ?? 0) / 60)} ד׳`,
                  (t.idleSeconds ?? 0) >= 60 && ` · מנוע דלוק בעמידה ${Math.round((t.idleSeconds ?? 0) / 60)} ד׳`,
                  stopsText(t.stops) && ` · ${stopsText(t.stops)}`,
                  t.auto && " · זוהתה לבד"
                ] })
              ]
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            Button,
            {
              variant: "ghost",
              size: "icon",
              className: "h-10 w-10 shrink-0 text-muted-foreground/70 hover:text-destructive active:text-destructive",
              "aria-label": "מחק נסיעה",
              onClick: () => onDelete(t),
              children: /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { className: "h-4 w-4" })
            }
          )
        ] }, t.id);
      })
    ] }, day.date)) }),
    hidden > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs(
      "button",
      {
        type: "button",
        onClick: () => setShown(end + PAGE_TRIPS * 2),
        className: "w-full pt-3 text-center text-sm font-semibold text-primary",
        children: [
          "הצג עוד (",
          hidden,
          " נסיעות)"
        ]
      }
    )
  ] }) });
});
function StopPicker({
  sinceLabel,
  onPick,
  onClose
}) {
  return /* @__PURE__ */ jsxRuntimeExports.jsx(
    "div",
    {
      className: "fixed inset-0 z-[75] flex items-end justify-center bg-black/70 p-4 pb-10 backdrop-blur-sm",
      role: "dialog",
      "aria-modal": "true",
      "aria-label": "סיבת העצירה",
      onClick: onClose,
      children: /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { className: "w-full max-w-md border-2", onClick: (e) => e.stopPropagation(), children: /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { className: "p-5 text-center", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Pause, { className: "mx-auto h-9 w-9 text-primary" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "mt-1 text-xl font-extrabold", children: "למה עצרת?" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "mt-1 text-xs text-muted-foreground", children: [
          "הזמן ממשיך להיספר בנסיעה",
          sinceLabel ? ` ${sinceLabel}` : "",
          ", ונרשם לפי הסיבה. כשתמשיך לנסוע העצירה תיסגר לבד."
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-4 grid grid-cols-2 gap-2", children: [
          STOP_REASONS.map((r) => /* @__PURE__ */ jsxRuntimeExports.jsx(
            Button,
            {
              variant: r.id === "wait" ? "default" : "secondary",
              className: "h-14 text-base font-bold",
              onClick: () => onPick(r.id),
              children: r.label
            },
            r.id
          )),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "ghost", className: "h-14", onClick: onClose, children: "חזרה" })
        ] })
      ] }) })
    }
  );
}
const DAYS = 7;
function daysAgoISO(days) {
  const d = /* @__PURE__ */ new Date(`${todayISO()}T12:00:00`);
  d.setDate(d.getDate() - days);
  return d.toISOString().slice(0, 10);
}
const StopsSummary = reactExports.memo(function StopsSummary2({ data }) {
  const s = reactExports.useMemo(() => {
    const from = daysAgoISO(DAYS - 1);
    const week = (data.trips ?? []).filter((t) => t.date >= from);
    const sums = sumStops(workTrips(week), from);
    const rows = [
      {
        id: "between-wait",
        label: "ממתין לנסיעה (בין נסיעות)",
        seconds: week.filter(isBetween).reduce((n, t) => n + (t.waitSeconds ?? 0), 0)
      },
      ...STOP_REASONS.map((r) => ({ id: r.id, label: r.label, seconds: sums[r.id] ?? 0 }))
    ].map((r) => ({ ...r, seconds: Math.round(r.seconds) })).filter((r) => r.seconds >= 60).sort((a, b) => b.seconds - a.seconds);
    const work = week.filter((t) => !isPrivate(t));
    const idleSeconds = work.reduce((n, t) => n + (t.idleSeconds ?? 0), 0);
    const idleCost = work.reduce(
      (n, t) => n + tripEnergy({ ...t, km: 0 }, data.vehicle, data.settings).cost,
      0
    );
    const priv = week.filter(isPrivate);
    const privKm = priv.reduce((n, t) => n + (t.km || 0), 0);
    const privCost = priv.reduce((n, t) => n + tripEnergy(t, data.vehicle, data.settings).cost, 0);
    return { rows, idleSeconds, idleCost, privCount: priv.length, privKm, privCost };
  }, [data.trips, data.vehicle, data.settings]);
  if (s.rows.length === 0 && s.idleSeconds < 60 && s.privCount === 0) return null;
  const total = s.rows.reduce((n, r) => n + r.seconds, 0);
  const c = data.settings.currency;
  return /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { className: "p-4", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("h3", { className: "mb-2 flex items-center gap-1.5 text-sm font-semibold", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Pause, { className: "h-4 w-4 text-primary" }),
      " המתנות ועצירות ב-",
      DAYS,
      " הימים האחרונים",
      total > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "num ms-auto text-xs font-normal text-muted-foreground", children: [
        "סה״כ ",
        fmtDurationWords(total)
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("ul", { className: "space-y-1.5", children: s.rows.map((r) => /* @__PURE__ */ jsxRuntimeExports.jsxs("li", { className: "num text-xs", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: r.label }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-semibold", children: fmtDurationWords(r.seconds) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-0.5 h-1.5 overflow-hidden rounded-full bg-muted", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
        "div",
        {
          className: "h-full rounded-full bg-primary",
          style: { width: `${Math.max(4, r.seconds / total * 100)}%` }
        }
      ) })
    ] }, r.id)) }),
    s.idleSeconds >= 60 && /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "num mt-3 text-xs text-muted-foreground", children: [
      "מנוע דלוק בעמידה ",
      fmtDurationWords(s.idleSeconds),
      " · ≈ ",
      fmt(s.idleCost, c),
      " דלק"
    ] }),
    s.privCount > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "num mt-1 text-xs text-muted-foreground", children: [
      "נסיעות פרטיות: ",
      s.privCount,
      " · ",
      s.privKm.toFixed(1),
      " ק״מ · ≈ ",
      fmt(s.privCost, c),
      " דלק (לא נכנס לחישובי העבודה)"
    ] })
  ] }) });
});
function EngineChip({ active, byCharger }) {
  const now = Date.now();
  const standing = now - (active.lastMoveAt ?? active.startedAt) >= STAND_AFTER_MS;
  const idle = active.idleSeconds ?? 0;
  if (!standing && idle < 60) return null;
  const on = engineOn(active, byCharger, chargingNow());
  const set = (value) => {
    const cur = readActive();
    if (cur) writeActive({ ...cur, engine: { on: value, at: Date.now() } });
  };
  const state = on === true ? active.engine ? "דלוק" : "דלוק (המטען עובד)" : on === false ? active.engine ? "כבוי" : "כבוי (המטען לא עובד)" : "לא ידוע";
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "num mt-2 flex items-center justify-between gap-2 rounded-xl bg-muted/40 px-3 py-2 text-xs", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-muted-foreground", children: [
      standing ? `עומד · מנוע ${state}` : "מנוע",
      idle >= 60 && ` · בעמידה עם מנוע דלוק ${fmtDurationWords(idle)}`
    ] }),
    standing && /* @__PURE__ */ jsxRuntimeExports.jsx(
      "button",
      {
        type: "button",
        onClick: () => set(on !== true),
        className: "shrink-0 rounded-lg border px-2.5 py-1.5 font-semibold",
        children: on === true ? "כיביתי מנוע" : "המנוע דלוק"
      }
    )
  ] });
}
const WAIT_ASK_MS = 4 * 60 * 1e3;
const WAIT_SNOOZE_MS = 15 * 60 * 1e3;
const FORGOT_SNOOZE_MS = 30 * 60 * 1e3;
const STOP_QUIET_MS = 3 * 60 * 60 * 1e3;
const hhmm = (ms) => new Date(ms).toLocaleTimeString("he-IL", { hour: "2-digit", minute: "2-digit", hour12: false });
function TripTracker({
  autoStart = false,
  driveMode = false,
  stage
}) {
  const navigate = useNavigate();
  const {
    data,
    ready,
    addTrip,
    removeTrip,
    restoreRecords,
    saveTripWithIncome,
    updateTripWithIncome
  } = useAppData();
  const [active, setActive] = reactExports.useState(null);
  const [elapsed, setElapsed] = reactExports.useState(0);
  const [error, setError] = reactExports.useState(null);
  const [askWait, setAskWait] = reactExports.useState(false);
  const [askForgot, setAskForgot] = reactExports.useState(false);
  const [askAuto, setAskAuto] = reactExports.useState(false);
  const [picking, setPicking] = reactExports.useState(null);
  const endingMetaRef = reactExports.useRef({});
  const [ending, setEnding] = reactExports.useState(null);
  const [editing, setEditing] = reactExports.useState(null);
  const activeRef = reactExports.useRef(null);
  const c = data.settings.currency;
  const askWaiting = data.settings.askWaiting !== false;
  const persist = reactExports.useCallback((t) => {
    activeRef.current = t;
    setActive(t);
    writeActive(t);
  }, []);
  const closeBetween = reactExports.useCallback(
    (cur, endAt = Date.now()) => {
      const trip = betweenToTrip(cur, endAt);
      if (trip) addTrip(trip);
    },
    [addTrip]
  );
  const start = reactExports.useCallback(() => {
    const cur = readActive();
    if (cur && !isSideDrive(cur)) return;
    if (cur) closeBetween(cur);
    const now = Date.now();
    persist({ startedAt: now, date: todayISO(), time: nowHHMM(), km: 0, lastMoveAt: now });
    requestNotifyPermission();
    haptic("success");
    playSound("turbo-start");
    toast.success("נסיעת עבודה התחילה", {
      duration: 4e3,
      action: {
        label: "ביטול",
        onClick: () => {
          if (activeRef.current?.startedAt === now) persist(null);
        }
      }
    });
  }, [persist, closeBetween]);
  const startBetweenNow = () => {
    if (activeRef.current) return;
    persist(startBetween(Date.now(), todayISO(), nowHHMM()));
    toast.success("מודד ק״מ וזמן בין נסיעות");
  };
  const stopBetween = () => {
    const cur = readActive();
    if (!cur || !isSideDrive(cur)) return;
    persist(null);
    closeBetween(cur);
    const seconds = Math.round((Date.now() - cur.startedAt) / 1e3);
    toast(
      isPrivate(cur) ? `נסיעה פרטית נשמרה · ${cur.km.toFixed(1)} ק״מ` : `יום העבודה נסגר · ${fmtDurationWords(seconds)} בין נסיעות · ${cur.km.toFixed(1)} ק״מ`
    );
  };
  reactExports.useEffect(() => {
    if (driveMode) hushSound();
  }, [driveMode]);
  const end = reactExports.useCallback(
    (endAt) => {
      const running = activeRef.current;
      if (!running) return;
      const until = Math.max(running.startedAt, Math.min(Date.now(), endAt ?? Date.now()));
      haptic("tap");
      const cur = closeStop(running, until);
      persist({ ...cur, pausedAt: Date.now() });
      setAskWait(false);
      setAskForgot(false);
      setAskAuto(false);
      setPicking(null);
      const seconds = Math.round((until - cur.startedAt) / 1e3);
      endingMetaRef.current = {
        stops: cleanStops(cur.stops),
        auto: cur.auto !== void 0,
        idleSeconds: cur.idleSeconds ? Math.min(seconds, Math.round(cur.idleSeconds)) : void 0
      };
      setEnding({
        date: cur.date,
        time: cur.time,
        km: Math.round(cur.km * 100) / 100,
        seconds,
        waitSeconds: Math.min(seconds, Math.round(cur.waitSeconds ?? 0))
      });
    },
    [persist]
  );
  const finishEnding = () => {
    persist(null);
    setElapsed(0);
    setEnding(null);
  };
  const resumeAfterCancel = () => {
    setEnding(null);
    if (activeRef.current) persist({ ...activeRef.current, pausedAt: void 0 });
  };
  const stillDriving = () => {
    const cur = activeRef.current;
    setAskForgot(false);
    if (cur) persist({ ...cur, forgotSnoozeUntil: Date.now() + FORGOT_SNOOZE_MS });
  };
  const confirmWaiting = () => {
    const cur = activeRef.current;
    setAskWait(false);
    if (!cur) return;
    const now = Date.now();
    const stoodFor = Math.max(0, (now - (cur.lastMoveAt ?? now)) / 1e3);
    persist({
      ...cur,
      waitSeconds: (cur.waitSeconds ?? 0) + stoodFor,
      lastMoveAt: now,
      waitSnoozeUntil: now + WAIT_SNOOZE_MS
    });
    toast("ההמתנה נרשמת · נשאל שוב בעוד 15 דקות");
  };
  const pickStop = (reason) => {
    const cur = activeRef.current;
    const from = picking?.from;
    setPicking(null);
    setAskWait(false);
    if (!cur) return;
    const at = Math.min(Date.now(), Math.max(cur.startedAt, from ?? Date.now()));
    persist(startStop(confirmAuto(cur), reason, at));
  };
  const resumeDriving = () => {
    const cur = activeRef.current;
    if (cur?.stop) persist(closeStop(cur, Date.now()));
  };
  const answerAuto = (answer) => {
    const cur = activeRef.current;
    setAskAuto(false);
    if (!cur) return;
    const stoppedAt = cur.lastMoveAt ?? Date.now();
    if (answer === "private") {
      persist(null);
      closeBetween(autoToSide(cur, "private", stoppedAt), stoppedAt);
      toast.success(`נסיעה פרטית נשמרה · ${cur.km.toFixed(1)} ק״מ`);
    } else if (answer === "between") {
      persist(autoToSide(cur, "between", stoppedAt));
    } else if (answer === "wait") {
      persist(startStop(confirmAuto(cur), "wait", cur.lastMoveAt ?? Date.now()));
    } else {
      activeRef.current = confirmAuto(cur);
      end(cur.lastMoveAt ?? cur.startedAt);
    }
  };
  reactExports.useEffect(() => {
    const saved = readActive();
    if (saved?.pausedAt) persist({ ...saved, pausedAt: void 0 });
    else if (saved && !(autoStart && isSideDrive(saved))) {
      activeRef.current = saved;
      setActive(saved);
    } else if (autoStart) {
      start();
      void navigate({
        to: "/trip",
        search: { mode: driveMode ? "drive" : void 0 },
        replace: true
      });
    }
    const sync = () => {
      const t = readActive();
      activeRef.current = t;
      setActive(t);
    };
    const syncError = () => setError(readGpsError());
    syncError();
    window.addEventListener(ACTIVE_EVENT, sync);
    window.addEventListener("storage", sync);
    window.addEventListener(GPS_ERROR_EVENT, syncError);
    return () => {
      window.removeEventListener(ACTIVE_EVENT, sync);
      window.removeEventListener("storage", sync);
      window.removeEventListener(GPS_ERROR_EVENT, syncError);
    };
  }, []);
  reactExports.useEffect(() => {
    if (!active) return;
    const tick = () => {
      setElapsed(Math.round((Date.now() - active.startedAt) / 1e3));
      const cur = activeRef.current;
      if (!cur || ending) return;
      if (isSideDrive(cur)) {
        setAskWait(false);
        setAskForgot(false);
        setAskAuto(false);
        return;
      }
      const now = Date.now();
      const stoodMs = now - (cur.lastMoveAt ?? cur.startedAt);
      if (isUnconfirmedAuto(cur)) {
        setAskWait(false);
        setAskForgot(false);
        setAskAuto((was) => {
          const ask = stoodMs >= WAIT_ASK_MS;
          if (ask && !was) {
            notifyIfHidden("הנסיעה שזוהתה נעצרה", "זו הייתה נסיעת עבודה? פתח כדי לענות.");
            if (navigator.vibrate) navigator.vibrate([200, 100, 200]);
          }
          return ask;
        });
        return;
      }
      setAskAuto(false);
      if (cur.stop && now - cur.stop.at < STOP_QUIET_MS) {
        setAskWait(false);
        setAskForgot(false);
        return;
      }
      if (stoodMs < WAIT_ASK_MS) setAskWait(false);
      if (!looksForgotten(cur, now)) setAskForgot(false);
      if (looksForgotten(cur, now)) {
        setAskWait(false);
        setAskForgot((was) => {
          if (!was) notifyIfHidden("שכחת לסיים את הנסיעה?", "לא זוהתה תנועה כבר הרבה זמן");
          return true;
        });
        return;
      }
      if (!askWaiting) return;
      if (stoodMs >= WAIT_ASK_MS && now >= (cur.waitSnoozeUntil ?? 0)) {
        setAskWait((was) => {
          if (!was) {
            notifyIfHidden("עומד במקום כמה דקות", "אתה בהמתנה או שהנסיעה הסתיימה?");
            if (navigator.vibrate) navigator.vibrate([200, 100, 200]);
          }
          return true;
        });
      }
    };
    tick();
    const id = setInterval(tick, 1e3);
    return () => clearInterval(id);
  }, [active, askWaiting, ending]);
  const deleteTrip = (t) => {
    const linked = data.incomes.filter((i) => i.tripId === t.id);
    removeTrip(t.id);
    toast("הנסיעה נמחקה", {
      duration: 5e3,
      action: { label: "ביטול", onClick: () => restoreRecords({ trips: [t], incomes: linked }) }
    });
  };
  const deleteRef = reactExports.useRef(deleteTrip);
  deleteRef.current = deleteTrip;
  const onDelete = reactExports.useCallback((t) => deleteRef.current(t), []);
  const saveEnded = (trip, income) => {
    const reachedGoal = income ? crossedDailyGoal(data, { ...income, km: 0, tripId: "reward-trip-preview" }, trip) : false;
    const feedback = tripMotivation(data, trip, income);
    const nextStreak = income ? calculateWorkStreak([
      ...data.incomes,
      { ...income, km: 0, tripId: "streak-preview", id: "streak-preview" }
    ]) : calculateWorkStreak(data.incomes);
    const trigger = document.activeElement;
    const meta = endingMetaRef.current;
    const path = activeRef.current ? finishPath(activeRef.current) : void 0;
    saveTripWithIncome(
      {
        ...trip,
        ...meta.stops ? { stops: meta.stops } : {},
        ...meta.auto ? { auto: true } : {},
        ...meta.idleSeconds ? { idleSeconds: meta.idleSeconds } : {},
        endedAt: (/* @__PURE__ */ new Date()).toISOString(),
        path
      },
      income
    );
    const firstIncomeToday = Boolean(income) && trip.date === todayISO() && !data.incomes.some((item) => item.date === trip.date);
    const kind = reachedGoal ? "goal" : feedback.milestone === "break-even" ? "break-even" : firstIncomeToday && nextStreak.milestone ? "streak" : "trip";
    finishEnding();
    if (trackBetweenOn(data.settings)) persist(startBetween(Date.now(), todayISO(), nowHHMM()));
    celebrate(kind, trigger, income?.amount, data.settings.currency, {
      title: kind === "streak" ? `רצף של ${nextStreak.current} ימים` : feedback.title,
      message: feedback.message,
      streak: nextStreak.current
    });
    toast.success(
      income ? `נסיעה והכנסה נשמרו · ${trip.km.toFixed(1)} ק״מ` : `נסיעה נשמרה · ${trip.km.toFixed(1)} ק״מ`
    );
  };
  if (!ready) return null;
  const betweenNow = isSideDrive(active);
  const privateNow = isPrivate(active);
  const liveParams = effectiveFuelParams(todayISO(), data.vehicle, data.settings, nowHHMM());
  const liveCost = active ? (active.km / (liveParams.consumption || 1) + (active.idleSeconds ?? 0) / 3600 * idlePerHour(data.vehicle, data.settings)) * liveParams.price : 0;
  const avgSpeed = active && elapsed > 0 ? active.km / (elapsed / 3600) : 0;
  const today = todayISO();
  const todayIncomes = data.incomes.filter((item) => item.date === today);
  const grossToday = todayIncomes.reduce(
    (sum, item) => sum + item.amount * (1 - item.commissionPct / 100) + (item.tip || 0),
    0
  );
  const liveNet = grossToday - liveCost;
  const workToday = workSecondsOn(
    data.trips,
    today,
    active ? { date: active.date, seconds: elapsed } : null
  );
  const editIncome = editing?.incomeId ? data.incomes.find((i) => i.id === editing.incomeId) ?? null : null;
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4", children: [
    driveMode && /* @__PURE__ */ jsxRuntimeExports.jsxs(
      "section",
      {
        className: "drive-hud fixed inset-0 z-50 flex flex-col p-5 pb-[calc(1.25rem+env(safe-area-inset-bottom,0px))] pt-[calc(1.25rem+env(safe-area-inset-top,0px))]",
        "aria-label": "מצב נהיגה",
        children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 text-xs font-bold text-hud-accent", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                "span",
                {
                  className: `h-2.5 w-2.5 rounded-full ${active ? "animate-pulse bg-hud-accent" : "bg-hud-muted"}`
                }
              ),
              privateNow ? "נסיעה פרטית" : betweenNow ? "מודד בין נסיעות" : active ? hasBackgroundTracking() ? "GPS פעיל · ממשיך גם כשהמסך נעול" : "GPS פעיל · המסך נשאר דלוק" : "מוכן לנסיעה"
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { to: "/trip", search: {}, "aria-label": "צא ממצב נהיגה", className: "hud-icon-button", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Minimize2, { className: "h-5 w-5" }) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-1 flex-col items-center justify-center gap-8", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-center", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(MapPin, { className: "mx-auto mb-2 h-6 w-6 text-hud-accent" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "num font-display text-[clamp(4rem,18vw,7rem)] font-extrabold leading-none text-hud-foreground", children: active?.km.toFixed(2) ?? "0.00" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-2 text-lg font-semibold text-hud-muted", children: "קילומטר" })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid w-full max-w-xl grid-cols-2 gap-3", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "hud-metric", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Timer, { className: "h-5 w-5 text-hud-accent" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "num font-display mt-2 text-4xl font-bold text-hud-foreground", children: fmtDuration(elapsed) }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs text-hud-muted", children: "זמן נסיעה" })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "hud-metric", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Gauge, { className: "h-5 w-5 text-hud-accent" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "num font-display mt-2 text-4xl font-bold text-hud-foreground", children: fmt(liveNet, c) }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs text-hud-muted", children: "נטו היום אחרי דלק" })
              ] })
            ] })
          ] }),
          active && !betweenNow ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid gap-3", children: [
            active.stop ? /* @__PURE__ */ jsxRuntimeExports.jsxs(
              Button,
              {
                className: "h-16 w-full rounded-2xl text-lg font-extrabold",
                onClick: resumeDriving,
                children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(Car, { className: "h-6 w-6" }),
                  " ",
                  stopLabel(active.stop.reason),
                  " · המשך נסיעה"
                ]
              }
            ) : /* @__PURE__ */ jsxRuntimeExports.jsxs(
              Button,
              {
                variant: "secondary",
                className: "h-14 w-full rounded-2xl text-lg font-bold",
                onClick: () => setPicking({}),
                children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(Pause, { className: "h-6 w-6" }),
                  " עצירה"
                ]
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(
              Button,
              {
                variant: "destructive",
                className: "h-20 w-full rounded-2xl text-xl font-extrabold",
                onClick: () => end(),
                children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(Square, { className: "h-7 w-7" }),
                  " סיים נסיעה"
                ]
              }
            )
          ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { className: "h-20 w-full rounded-2xl text-xl font-extrabold", onClick: start, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Play, { className: "h-7 w-7" }),
            " התחל נסיעה"
          ] })
        ]
      }
    ),
    askAuto && active && !ending && !picking && /* @__PURE__ */ jsxRuntimeExports.jsx(
      "div",
      {
        className: "fixed inset-0 z-[75] flex items-end justify-center bg-black/70 p-4 pb-10 backdrop-blur-sm",
        role: "dialog",
        "aria-modal": "true",
        children: /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { className: "w-full max-w-md border-2", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { className: "p-6 text-center", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Car, { className: "mx-auto h-10 w-10 text-primary" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "mt-2 text-2xl font-extrabold", children: "זו הייתה נסיעת עבודה?" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "num mt-1 text-sm text-muted-foreground", children: [
            "זוהתה לבד · ",
            active.time,
            "–",
            hhmm(active.lastMoveAt ?? active.startedAt),
            " ·",
            " ",
            active.km.toFixed(1),
            " ק״מ"
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-5 grid gap-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { className: "h-16 text-lg font-bold", onClick: () => answerAuto("end"), children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Flag, { className: "h-6 w-6" }),
              " כן, הנסיעה הסתיימה"
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { variant: "secondary", className: "h-12", onClick: () => answerAuto("wait"), children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Hourglass, { className: "h-5 w-5" }),
              " כן, אני בהמתנה לנוסע"
            ] }),
            trackBetweenOn(data.settings) && /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", className: "h-12", onClick: () => answerAuto("between"), children: "בדרך לנסיעה (רק ק״מ וזמן)" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(
              Button,
              {
                variant: "ghost",
                className: "h-12 text-destructive",
                onClick: () => answerAuto("private"),
                children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(X, { className: "h-5 w-5" }),
                  " לא, נסיעה פרטית (לא לשמור)"
                ]
              }
            )
          ] })
        ] }) })
      }
    ),
    picking && active && !ending && /* @__PURE__ */ jsxRuntimeExports.jsx(
      StopPicker,
      {
        sinceLabel: picking.from ? `מ-${hhmm(picking.from)}` : void 0,
        onPick: pickStop,
        onClose: () => setPicking(null)
      }
    ),
    askForgot && active && !ending && /* @__PURE__ */ jsxRuntimeExports.jsx(
      "div",
      {
        className: "fixed inset-0 z-[60] flex items-end justify-center bg-black/70 p-4 pb-10 backdrop-blur-sm",
        role: "dialog",
        "aria-modal": "true",
        children: /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { className: "w-full max-w-md border-2", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { className: "p-6 text-center", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Flag, { className: "mx-auto h-10 w-10 text-primary" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "mt-2 text-2xl font-extrabold", children: "שכחת לסיים את הנסיעה?" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "mt-1 text-sm text-muted-foreground", children: [
            "לא זוהתה תנועה מאז ",
            hhmm(active.lastMoveAt ?? active.startedAt),
            "."
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-5 grid gap-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs(
              Button,
              {
                className: "h-16 text-lg font-bold",
                onClick: () => end(active.lastMoveAt ?? active.startedAt),
                children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(Flag, { className: "h-6 w-6" }),
                  " סיים בשעה",
                  " ",
                  hhmm(active.lastMoveAt ?? active.startedAt)
                ]
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", className: "h-12", onClick: () => end(), children: "סיים עכשיו" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "ghost", className: "h-12", onClick: stillDriving, children: "אני עדיין בנסיעה" })
          ] })
        ] }) })
      }
    ),
    askWait && active && !askForgot && !ending && /* @__PURE__ */ jsxRuntimeExports.jsx(
      "div",
      {
        className: "fixed inset-0 z-[60] flex items-end justify-center bg-black/70 p-4 pb-10 backdrop-blur-sm",
        role: "dialog",
        "aria-modal": "true",
        children: /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { className: "w-full max-w-md border-2", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { className: "p-6 text-center", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Hourglass, { className: "mx-auto h-10 w-10 text-primary" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "mt-2 text-2xl font-extrabold", children: "עומד במקום כמה דקות" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-1 text-sm text-muted-foreground", children: "אתה בהמתנה ללקוח, או שהנסיעה הסתיימה?" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-5 grid gap-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { className: "h-16 text-lg font-bold", onClick: confirmWaiting, children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Hourglass, { className: "h-6 w-6" }),
              " בהמתנה — המשך לחשב"
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(
              Button,
              {
                variant: "secondary",
                className: "h-12",
                onClick: () => {
                  setAskWait(false);
                  setPicking({ from: active.lastMoveAt ?? Date.now() });
                },
                children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(Pause, { className: "h-5 w-5" }),
                  " עצירה אחרת (תדלוק, אוכל, תפילה…)"
                ]
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(
              Button,
              {
                variant: "destructive",
                className: "h-14 text-base font-bold",
                onClick: () => end(),
                children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(Flag, { className: "h-5 w-5" }),
                  " סיימתי את הנסיעה"
                ]
              }
            )
          ] })
        ] }) })
      }
    ),
    ending && /* @__PURE__ */ jsxRuntimeExports.jsx(
      TripEndDialog,
      {
        open: true,
        mode: "end",
        initial: ending,
        stops: endingMetaRef.current.stops,
        onOpenChange: (o) => {
          if (!o) resumeAfterCancel();
        },
        onSave: saveEnded,
        onSaveAndNext: (trip, income) => {
          saveEnded(trip, income);
          start();
        },
        onDiscard: () => {
          const cancelled = activeRef.current;
          finishEnding();
          toast("הנסיעה בוטלה ולא נשמרה", {
            duration: 5e3,
            action: cancelled ? {
              label: "ביטול",
              onClick: () => {
                if (activeRef.current) return;
                persist({ ...cancelled, pausedAt: void 0 });
              }
            } : void 0
          });
        }
      }
    ),
    editing && /* @__PURE__ */ jsxRuntimeExports.jsx(
      TripEndDialog,
      {
        open: true,
        mode: "edit",
        initial: {
          date: editing.date,
          time: editing.time ?? "00:00",
          km: editing.km,
          seconds: editing.seconds,
          waitSeconds: editing.waitSeconds ?? 0
        },
        initialIncome: editIncome,
        stops: editing.stops,
        betweenTrip: isSideDrive(editing),
        privateTrip: isPrivate(editing),
        onOpenChange: (o) => {
          if (!o) setEditing(null);
        },
        onSave: (trip, income) => {
          updateTripWithIncome(editing.id, trip, income);
          setEditing(null);
          toast.success("הנסיעה עודכנה");
        },
        onDiscard: () => {
          deleteTrip(editing);
          setEditing(null);
        }
      }
    ),
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      Card,
      {
        className: "border-2",
        style: active && !betweenNow ? { borderColor: "var(--success)" } : void 0,
        children: /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { className: "p-5", children: [
          betweenNow && active ? /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-center gap-2 text-xs font-bold tracking-wide text-muted-foreground", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "h-2.5 w-2.5 animate-pulse rounded-full bg-muted-foreground" }),
              privateNow ? "נסיעה פרטית · ק״מ ודלק בלבד" : "בין נסיעות · הזמן ממשיך לרוץ"
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "num mt-3 grid grid-cols-3 gap-2 text-center", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-xl bg-muted/50 p-2.5", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[11px] text-muted-foreground", children: "ק״מ" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-2xl font-extrabold", children: active.km.toFixed(1) })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-xl bg-muted/50 p-2.5", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[11px] text-muted-foreground", children: "זמן" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-2xl font-extrabold", children: fmtDuration(elapsed) })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-xl bg-muted/50 p-2.5", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[11px] text-muted-foreground", children: "דלק משוער" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-2xl font-extrabold", children: fmt(liveCost, c) })
              ] })
            ] }),
            !privateNow && /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "num mt-2 text-center text-sm font-semibold", children: [
              "זמן עבודה היום ",
              fmtDuration(workToday),
              (active.waitSeconds ?? 0) >= 60 && ` · ממתין לנסיעה ${fmtDuration(active.waitSeconds ?? 0)}`
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(EngineChip, { active, byCharger: data.settings.engineByCharger === true }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-1 text-center text-[11px] text-muted-foreground", children: privateNow ? "לא נכנס לחישובי העבודה. נשמר לבד אחרי 10 דקות חניה." : 'רץ עד הנסיעה הבאה או עד שתלחץ "סיימתי לעבוד". לא נחשב נסיעת עבודה. אם שכחת, נעצר לבד אחרי 4 שעות בלי תנועה.' }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { className: "mt-3 h-20 w-full text-xl font-extrabold", onClick: start, children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Play, { className: "ms-2 h-7 w-7" }),
              " התחל נסיעת עבודה"
            ] }),
            privateNow ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-2 grid grid-cols-2 gap-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                Button,
                {
                  variant: "outline",
                  className: "h-12",
                  onClick: () => persist({ ...active, kind: void 0 }),
                  children: "זו נסיעת עבודה"
                }
              ),
              /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { variant: "outline", className: "h-12", onClick: stopBetween, children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Flag, { className: "ms-2 h-5 w-5" }),
                " סיים ושמור"
              ] })
            ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { variant: "outline", className: "mt-2 h-12 w-full", onClick: stopBetween, children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Flag, { className: "ms-2 h-5 w-5" }),
              " סיימתי לעבוד"
            ] })
          ] }) : active ? /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-center gap-2 text-xs font-bold uppercase tracking-wide text-success", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "h-2.5 w-2.5 animate-pulse rounded-full bg-success" }),
              " נסיעה פעילה",
              active.auto !== void 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "rounded-full bg-muted px-1.5 py-0.5 text-[10px] font-medium normal-case text-muted-foreground", children: "התחילה לבד" })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-4 grid grid-cols-2 gap-3 text-center", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-2xl bg-muted/60 p-4", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-center gap-1 text-[11px] text-muted-foreground", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(MapPin, { className: "h-3.5 w-3.5" }),
                  " ק״מ"
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "num text-4xl font-extrabold tracking-tight", children: active.km.toFixed(2) })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-2xl bg-muted/60 p-4", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-center gap-1 text-[11px] text-muted-foreground", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(Timer, { className: "h-3.5 w-3.5" }),
                  " זמן"
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "num text-4xl font-extrabold tracking-tight", children: fmtDuration(elapsed) })
              ] })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "num mt-3 flex justify-between rounded-xl bg-muted/40 px-3 py-2 text-xs text-muted-foreground", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
                "מהירות ממוצעת ",
                avgSpeed.toFixed(0),
                " קמ״ש"
              ] }),
              (active.waitSeconds ?? 0) > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
                "המתנה ",
                fmtDuration(active.waitSeconds ?? 0)
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
                "דלק משוער ",
                fmt(liveCost, c)
              ] })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(EngineChip, { active, byCharger: data.settings.engineByCharger === true }),
            active.stop ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-3 rounded-2xl border-2 border-primary/40 bg-primary/5 p-3 text-center", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "num text-sm font-bold", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Pause, { className: "me-1 inline h-4 w-4" }),
                stopLabel(active.stop.reason),
                " ·",
                " ",
                fmtDuration(Math.max(0, Math.round((Date.now() - active.stop.at) / 1e3)))
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-0.5 text-[11px] text-muted-foreground", children: "נסגרת לבד כשממשיכים לנסוע" }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { className: "mt-2 h-14 w-full text-base font-bold", onClick: resumeDriving, children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Car, { className: "ms-2 h-5 w-5" }),
                " המשך נסיעה"
              ] })
            ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs(
              Button,
              {
                variant: "secondary",
                className: "mt-3 h-14 w-full text-base font-bold",
                onClick: () => setPicking({}),
                children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(Pause, { className: "ms-2 h-5 w-5" }),
                  " עצירה (תדלוק, אוכל, תפילה, המתנה…)"
                ]
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(
              Button,
              {
                variant: "destructive",
                className: "mt-3 h-20 w-full text-xl font-extrabold",
                onClick: () => end(),
                children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(Square, { className: "ms-2 h-7 w-7" }),
                  " סיים נסיעת עבודה"
                ]
              }
            )
          ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-center text-sm text-muted-foreground", children: "מדידה אוטומטית של ק״מ וזמן נהיגה, שנכנסת ישירות לחישוב עלות הדלק שלך." }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { className: "mt-4 h-20 w-full text-xl font-extrabold", onClick: start, children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Play, { className: "ms-2 h-7 w-7" }),
              " התחל נסיעת עבודה"
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", className: "mt-2 h-11 w-full", onClick: startBetweenNow, children: "מדוד גם בין נסיעות (לא עבודה)" })
          ] }),
          error && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-3 flex items-start gap-2 rounded-xl border border-destructive/40 bg-destructive/10 p-3 text-xs text-destructive", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(TriangleAlert, { className: "mt-0.5 h-4 w-4 shrink-0" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: error })
          ] })
        ] })
      }
    ),
    stage,
    /* @__PURE__ */ jsxRuntimeExports.jsx(StopsSummary, { data }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(TripHistory, { data, onEdit: setEditing, onDelete })
  ] });
}
function TripPage() {
  const {
    action,
    mode
  } = Route.useSearch();
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mx-auto max-w-xl", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(PageHeader, { title: "נסיעת עבודה", subtitle: "מדידת ק״מ וזמן בזמן אמת", action: /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { asChild: true, size: "sm", variant: "outline", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Link, { to: "/map", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Map, { className: "ml-1 h-4 w-4" }),
      "מפה"
    ] }) }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "px-4", children: /* @__PURE__ */ jsxRuntimeExports.jsx(TripTracker, { autoStart: action === "start_trip", driveMode: mode === "drive", stage: /* @__PURE__ */ jsxRuntimeExports.jsx(PageStage, { scene: {
      mood: "excited",
      prop: "wheel",
      line: "חגורות! טורבו מתניע",
      taxi: "zoom",
      driving: true,
      backdrop: "road",
      rewards: true
    } }) }) })
  ] });
}
export {
  TripPage as component
};
