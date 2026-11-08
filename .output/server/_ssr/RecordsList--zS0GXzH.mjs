import { r as reactExports, j as jsxRuntimeExports } from "../_libs/react.mjs";
import { u as useAppData, t as todayISO, f as fmt, N as netFromIncome, O as effectiveFuelParams, v as categoryLabel, B as Button, c as cn, h as haptic } from "./router-DjatMlVs.mjs";
import { C as Card, a as CardContent } from "./MovieStage-BBwosCG9.mjs";
import { I as Input, L as Label } from "./label-BSJvlS_H.mjs";
import { S as Select, a as SelectTrigger, b as SelectValue, c as SelectContent, d as SelectItem } from "./select-zltnvMan.mjs";
import { g as groupByDay, d as dayLabel, D as Dialog, a as DialogContent, b as DialogHeader, c as DialogTitle, e as DialogFooter } from "./day-groups-D_Kb8Mnr.mjs";
import { t as toast } from "../_libs/sonner.mjs";
import { N as NumberField, v as validateIncome, n as numberOr, p as parseNumber, a as validateExpense } from "./validate-C7bMxNbd.mjs";
import { g as TrendingUp, o as TrendingDown, p as Trash2, q as Pencil } from "../_libs/lucide-react.mjs";
const Textarea = reactExports.forwardRef(
  ({ className, ...props }, ref) => {
    return /* @__PURE__ */ jsxRuntimeExports.jsx(
      "textarea",
      {
        className: cn(
          "flex min-h-[60px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-base shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
          className
        ),
        ref,
        ...props
      }
    );
  }
);
Textarea.displayName = "Textarea";
const ACT_AT = 96;
function SwipeRow({
  children,
  onDelete,
  onEdit
}) {
  const start = reactExports.useRef(null);
  const locked = reactExports.useRef(null);
  const past = reactExports.useRef(false);
  const swiped = reactExports.useRef(false);
  const [dx, setDx] = reactExports.useState(0);
  const [moving, setMoving] = reactExports.useState(false);
  const reset = () => {
    start.current = null;
    locked.current = null;
    past.current = false;
    setMoving(false);
    setDx(0);
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative overflow-hidden", children: [
    dx !== 0 && /* @__PURE__ */ jsxRuntimeExports.jsx(
      "div",
      {
        className: `absolute inset-0 flex items-center px-5 text-sm font-bold ${dx < 0 ? "justify-end bg-destructive text-destructive-foreground" : "justify-start bg-primary text-primary-foreground"}`,
        dir: "ltr",
        "aria-hidden": "true",
        children: /* @__PURE__ */ jsxRuntimeExports.jsx(
          "span",
          {
            className: "flex items-center gap-1.5",
            style: { opacity: Math.min(1, Math.abs(dx) / ACT_AT) },
            children: dx < 0 ? /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
              "מחיקה ",
              /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { className: "h-4 w-4" })
            ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Pencil, { className: "h-4 w-4" }),
              " עריכה"
            ] })
          }
        )
      }
    ),
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      "div",
      {
        className: `relative bg-card ${moving ? "" : "transition-transform duration-150 motion-reduce:transition-none"}`,
        style: { transform: dx ? `translateX(${dx}px)` : void 0, touchAction: "pan-y" },
        onPointerDown: (e) => {
          if (e.pointerType === "mouse") return;
          start.current = { x: e.clientX, y: e.clientY, id: e.pointerId };
          locked.current = null;
          swiped.current = false;
        },
        onPointerMove: (e) => {
          const s = start.current;
          if (!s || s.id !== e.pointerId) return;
          const mx = e.clientX - s.x;
          const my = e.clientY - s.y;
          if (!locked.current) {
            if (Math.abs(my) > 8 && Math.abs(my) > Math.abs(mx)) locked.current = "y";
            else if (Math.abs(mx) > 12) {
              locked.current = "x";
              swiped.current = true;
              setMoving(true);
              e.currentTarget.setPointerCapture(e.pointerId);
            }
          }
          if (locked.current !== "x") return;
          const now = Math.abs(mx) >= ACT_AT;
          if (now !== past.current) {
            past.current = now;
            if (now) haptic("light");
          }
          setDx(mx);
        },
        onPointerUp: () => {
          const go = locked.current === "x" && past.current;
          const dir = dx;
          reset();
          if (!go) return;
          haptic(dir < 0 ? "warning" : "tap");
          if (dir < 0) onDelete();
          else onEdit();
        },
        onPointerCancel: reset,
        onClickCapture: (e) => {
          if (swiped.current) {
            e.stopPropagation();
            e.preventDefault();
            swiped.current = false;
          }
        },
        children
      }
    )
  ] });
}
const expenseCats = [
  "fuel",
  "insurance",
  "license",
  "maintenance",
  "parking",
  "food",
  "wash",
  "other"
];
const PAGE_ROWS = 40;
const rowNet = (r) => r.type === "income" ? netFromIncome(r.item) : -r.item.amount;
function RecordsList({ incomes, expenses }) {
  const { data, removeIncome, removeExpense, updateIncome, updateExpense, restoreRecords } = useAppData();
  const c = data.settings.currency;
  const [editing, setEditing] = reactExports.useState(null);
  const [shown, setShown] = reactExports.useState(PAGE_ROWS);
  const rows = [
    ...incomes.map((item) => ({ type: "income", item })),
    ...expenses.map((item) => ({ type: "expense", item }))
  ].sort((a, b) => {
    const ka = `${a.item.date} ${a.item.time ?? ""}`;
    const kb = `${b.item.date} ${b.item.time ?? ""}`;
    return ka < kb ? 1 : ka > kb ? -1 : 0;
  });
  const del = (r) => {
    if (r.type === "income") removeIncome(r.item.id);
    else removeExpense(r.item.id);
    const back = r.type === "income" ? { incomes: [r.item] } : { expenses: [r.item] };
    toast("הרשומה נמחקה", {
      duration: 5e3,
      action: { label: "ביטול", onClick: () => restoreRecords(back) }
    });
  };
  const days = groupByDay(rows, (r) => r.item.date);
  const manyDays = days.length > 1;
  const today = todayISO();
  let budget = shown;
  const visibleDays = days.filter((d, i) => {
    if (i > 0 && budget <= 0) return false;
    budget -= d.rows.length;
    return true;
  });
  const hidden = days.length - visibleDays.length;
  if (rows.length === 0) {
    return /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(CardContent, { className: "p-6 text-center text-sm text-muted-foreground", children: "אין רשומות בטווח הזה" }) });
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { className: "p-0 divide-y divide-border", children: [
      visibleDays.map((day) => /* @__PURE__ */ jsxRuntimeExports.jsxs(reactExports.Fragment, { children: [
        manyDays && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "num flex items-center justify-between bg-muted/40 px-3 py-1.5 text-xs font-semibold text-muted-foreground", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: dayLabel(day.date, today) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { title: "הכנסות פחות הוצאות שנרשמו ביום הזה. תדלוק נספר ביום ששילמת עליו, ולכן המספר יכול להיות שונה מהרווח בדשבורד", children: [
            "בקופה",
            " ",
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { dir: "ltr", children: fmt(
              day.rows.reduce((sum, r) => sum + rowNet(r), 0),
              c
            ) })
          ] })
        ] }),
        day.rows.map((r) => {
          const isIncome = r.type === "income";
          const amount = isIncome ? netFromIncome(r.item) : r.item.amount;
          const incomeItem = isIncome ? r.item : null;
          const trip = incomeItem?.tripId ? data.trips.find((t) => t.id === incomeItem.tripId) : void 0;
          const km = trip ? trip.km : incomeItem?.km || 0;
          const energy = incomeItem && km > 0 ? (() => {
            const { price, consumption } = effectiveFuelParams(
              incomeItem.date,
              data.vehicle,
              data.settings,
              incomeItem.time
            );
            const cons = consumption > 0 ? consumption : 1;
            return km / cons * price;
          })() : 0;
          const title = trip ? "נסיעה" : isIncome ? "הכנסה" : categoryLabel(r.item.category);
          return /* @__PURE__ */ jsxRuntimeExports.jsx(SwipeRow, { onDelete: () => del(r), onEdit: () => setEditing(r), children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs(
              "button",
              {
                type: "button",
                onClick: () => setEditing(r),
                "aria-label": `פרטי ${title}`,
                className: "flex min-w-0 flex-1 items-center gap-3 p-3 text-start active:bg-muted/40",
                children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(
                    "span",
                    {
                      className: `flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${isIncome ? "bg-success/10 text-success" : "bg-destructive/10 text-destructive"}`,
                      children: isIncome ? /* @__PURE__ */ jsxRuntimeExports.jsx(TrendingUp, { className: "h-4 w-4" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(TrendingDown, { className: "h-4 w-4" })
                    }
                  ),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-w-0 flex-1", children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-1.5", children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-sm font-medium", children: title }),
                      km > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "rounded-full bg-muted px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground", children: [
                        km.toLocaleString("he-IL", { maximumFractionDigits: 1 }),
                        " ק״מ"
                      ] }),
                      trip && trip.seconds > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "num rounded-full bg-muted px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground", children: [
                        Math.max(1, Math.round(trip.seconds / 60)),
                        " דק׳"
                      ] })
                    ] }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "truncate text-xs text-muted-foreground", children: [
                      manyDays ? "" : new Date(r.item.date).toLocaleDateString("he-IL", {
                        day: "numeric",
                        month: "short"
                      }),
                      trip?.time ?? r.item.time,
                      km > 0 ? `דלק משוער ${fmt(energy, c)}` : "",
                      r.item.note && r.item.note !== "נסיעת GPS" ? r.item.note : ""
                    ].filter(Boolean).join(" · ") })
                  ] }),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs(
                    "div",
                    {
                      className: `text-sm font-bold ${isIncome ? "text-success" : "text-destructive"}`,
                      children: [
                        isIncome ? "+" : "−",
                        fmt(amount, c)
                      ]
                    }
                  )
                ]
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              Button,
              {
                size: "icon",
                variant: "ghost",
                className: "me-1 h-10 w-10 shrink-0 text-muted-foreground/70 hover:text-destructive active:text-destructive",
                onClick: () => del(r),
                "aria-label": "מחיקה",
                children: /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { className: "h-4 w-4" })
              }
            )
          ] }) }, r.item.id);
        })
      ] }, day.date)),
      hidden > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs(
        "button",
        {
          type: "button",
          onClick: () => setShown((n) => n + PAGE_ROWS),
          className: "w-full p-3 text-center text-sm font-semibold text-primary",
          children: [
            "הצג עוד (",
            hidden,
            " ימים)"
          ]
        }
      )
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      EditDialog,
      {
        row: editing,
        onClose: () => setEditing(null),
        onSaveIncome: (id, patch) => {
          updateIncome(id, patch);
          toast.success("הרשומה עודכנה");
          setEditing(null);
        },
        onSaveExpense: (id, patch) => {
          updateExpense(id, patch);
          toast.success("הרשומה עודכנה");
          setEditing(null);
        }
      }
    )
  ] });
}
function EditDialog({
  row,
  onClose,
  onSaveIncome,
  onSaveExpense
}) {
  if (!row) return null;
  return /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open: true, onOpenChange: (o) => !o && onClose(), children: /* @__PURE__ */ jsxRuntimeExports.jsxs(
    DialogContent,
    {
      className: "max-h-[92vh] max-w-sm overflow-y-auto",
      onOpenAutoFocus: (e) => e.preventDefault(),
      children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { children: "פרטי רשומה" }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(DetailSummary, { row }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "text-xs font-semibold text-muted-foreground", children: "עריכה" }),
        row.type === "income" ? /* @__PURE__ */ jsxRuntimeExports.jsx(IncomeEdit, { item: row.item, onSave: onSaveIncome }) : /* @__PURE__ */ jsxRuntimeExports.jsx(ExpenseEdit, { item: row.item, onSave: onSaveExpense })
      ]
    }
  ) });
}
const localDate = (iso) => {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(y, m - 1, d);
};
function DetailSummary({ row }) {
  const { data } = useAppData();
  const c = data.settings.currency;
  const item = row.item;
  const income = row.type === "income" ? row.item : null;
  const expense = row.type === "expense" ? row.item : null;
  const trip = income?.tripId ? data.trips.find((t) => t.id === income.tripId) : void 0;
  const time = trip?.time ?? item.time;
  const km = trip ? trip.km : income?.km || 0;
  const fuel = (() => {
    if (!income || km <= 0) return 0;
    const { price, consumption } = effectiveFuelParams(
      income.date,
      data.vehicle,
      data.settings,
      income.time
    );
    return km / (consumption > 0 ? consumption : 1) * price;
  })();
  const lines = [];
  if (income) {
    const commission = income.amount * income.commissionPct / 100;
    lines.push({ label: "ברוטו", value: fmt(income.amount, c) });
    if (income.commissionPct > 0)
      lines.push({
        label: `עמלה ${income.commissionPct}%`,
        value: `−${fmt(commission, c)}`,
        tone: "bad"
      });
    if (income.tip > 0) lines.push({ label: "טיפ", value: `+${fmt(income.tip, c)}`, tone: "good" });
    lines.push({ label: "נטו", value: fmt(netFromIncome(income), c), strong: true });
    if (km > 0)
      lines.push({ label: "ק״מ", value: km.toLocaleString("he-IL", { maximumFractionDigits: 1 }) });
    if (trip && trip.seconds > 0)
      lines.push({
        label: "זמן נסיעה",
        value: `${Math.max(1, Math.round(trip.seconds / 60))} דק׳`
      });
    if (trip && (trip.waitSeconds ?? 0) > 0)
      lines.push({ label: "המתנה", value: `${Math.round((trip.waitSeconds ?? 0) / 60)} דק׳` });
    if (income.hours > 0) lines.push({ label: "שעות", value: String(income.hours) });
    if (km > 0) {
      lines.push({ label: "דלק משוער", value: `−${fmt(fuel, c)}`, tone: "bad" });
      lines.push({
        label: "נטו אחרי דלק",
        value: fmt(netFromIncome(income) - fuel, c),
        strong: true
      });
    }
  } else if (expense) {
    lines.push({ label: "קטגוריה", value: categoryLabel(expense.category) });
    lines.push({ label: "סכום", value: fmt(expense.amount, c), strong: true });
    if (expense.quantity)
      lines.push({ label: "כמות", value: expense.quantity.toLocaleString("he-IL") });
    if (expense.pricePerUnit)
      lines.push({ label: "מחיר ליחידה", value: fmt(expense.pricePerUnit, c) });
    if (expense.odometer)
      lines.push({ label: "מונה ק״מ", value: expense.odometer.toLocaleString("he-IL") });
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2 rounded-xl bg-muted/50 p-3", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-xs font-semibold text-muted-foreground", children: [
      localDate(item.date).toLocaleDateString("he-IL", {
        weekday: "long",
        day: "numeric",
        month: "long"
      }),
      time ? ` · ${time}` : ""
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("dl", { className: "num space-y-1 text-sm", children: lines.map((l) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between gap-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("dt", { className: "text-muted-foreground", children: l.label }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        "dd",
        {
          dir: "ltr",
          className: `${l.strong ? "font-extrabold" : "font-semibold"} ${l.tone === "good" ? "text-success" : l.tone === "bad" ? "text-destructive" : ""}`,
          children: l.value
        }
      )
    ] }, l.label)) }),
    item.note && item.note !== "נסיעת GPS" && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "border-t border-border pt-2 text-xs text-muted-foreground", children: item.note })
  ] });
}
function IncomeEdit({
  item,
  onSave
}) {
  const [f, setF] = reactExports.useState({
    date: item.date,
    amount: String(item.amount),
    commissionPct: String(item.commissionPct),
    tip: String(item.tip || ""),
    hours: String(item.hours || ""),
    km: String(item.km || ""),
    note: item.note || ""
  });
  const [errors, setErrors] = reactExports.useState({});
  const save = () => {
    const errs = validateIncome(f);
    setErrors(errs);
    if (Object.keys(errs).length > 0) return toast.error("יש שדה שצריך לתקן");
    onSave(item.id, {
      date: f.date,
      amount: parseNumber(f.amount),
      commissionPct: numberOr(f.commissionPct, 0),
      tip: numberOr(f.tip, 0),
      hours: numberOr(f.hours, 0),
      km: numberOr(f.km, 0),
      note: f.note.trim() || void 0
    });
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-3", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs(F, { label: "תאריך", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "date", value: f.date, onChange: (e) => setF({ ...f, date: e.target.value }) }),
      errors.date && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[11px] font-medium text-destructive", role: "alert", children: errors.date })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(F, { label: "סכום ברוטו", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
      NumberField,
      {
        value: f.amount,
        onValueChange: (amount) => setF({ ...f, amount }),
        error: errors.amount
      }
    ) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-3 gap-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(F, { label: "עמלה %", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
        NumberField,
        {
          value: f.commissionPct,
          onValueChange: (commissionPct) => setF({ ...f, commissionPct }),
          error: errors.commissionPct
        }
      ) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(F, { label: "שעות", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
        NumberField,
        {
          value: f.hours,
          onValueChange: (hours) => setF({ ...f, hours }),
          error: errors.hours
        }
      ) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(F, { label: "ק״מ", children: /* @__PURE__ */ jsxRuntimeExports.jsx(NumberField, { value: f.km, onValueChange: (km) => setF({ ...f, km }), error: errors.km }) })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(F, { label: "תשר", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
      NumberField,
      {
        value: f.tip,
        onValueChange: (tip) => setF({ ...f, tip }),
        error: errors.tip
      }
    ) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(F, { label: "הערה", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Textarea, { rows: 2, value: f.note, onChange: (e) => setF({ ...f, note: e.target.value }) }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(DialogFooter, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { onClick: save, className: "w-full", children: "שמירה" }) })
  ] });
}
function ExpenseEdit({
  item,
  onSave
}) {
  const [f, setF] = reactExports.useState({
    date: item.date,
    category: item.category,
    amount: String(item.amount),
    note: item.note || ""
  });
  const [errors, setErrors] = reactExports.useState({});
  const save = () => {
    const errs = validateExpense(f);
    setErrors(errs);
    if (Object.keys(errs).length > 0) return toast.error("יש שדה שצריך לתקן");
    onSave(item.id, {
      date: f.date,
      category: f.category,
      amount: parseNumber(f.amount),
      note: f.note.trim() || void 0
    });
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-3", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs(F, { label: "תאריך", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "date", value: f.date, onChange: (e) => setF({ ...f, date: e.target.value }) }),
      errors.date && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[11px] font-medium text-destructive", role: "alert", children: errors.date })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(F, { label: "קטגוריה", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(
      Select,
      {
        dir: "rtl",
        value: f.category,
        onValueChange: (v) => setF({ ...f, category: v }),
        children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, {}) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { children: expenseCats.map((cat) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: cat, children: categoryLabel(cat) }, cat)) })
        ]
      }
    ) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(F, { label: "סכום", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
      NumberField,
      {
        value: f.amount,
        onValueChange: (amount) => setF({ ...f, amount }),
        error: errors.amount
      }
    ) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(F, { label: "הערה", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Textarea, { rows: 2, value: f.note, onChange: (e) => setF({ ...f, note: e.target.value }) }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(DialogFooter, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { onClick: save, className: "w-full", children: "שמירה" }) })
  ] });
}
function F({ label, children }) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-xs font-medium text-muted-foreground", children: label }),
    children
  ] });
}
export {
  RecordsList as R,
  Textarea as T
};
