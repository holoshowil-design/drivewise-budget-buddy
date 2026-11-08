import { r as reactExports, j as jsxRuntimeExports } from "../_libs/react.mjs";
import { R as Route$7, u as useAppData, t as todayISO, q as sumIncomes, s as sumHours, f as fmt, B as Button, v as categoryLabel, p as playSound, M as MOOD_MUMBLE, C as ComicBubble } from "./router-CcPEcE51.mjs";
import { P as PageHeader } from "./PageHeader-507zMUYd.mjs";
import { C as Card, a as CardContent, b as CaptainArt, R as REWARD_FILMS } from "./MovieStage-0WygtrCr.mjs";
import { T as Tabs, a as TabsList, b as TabsTrigger, c as TabsContent } from "./tabs-DIauUNjD.mjs";
import { L as Label, I as Input } from "./label-Bywo-lhz.mjs";
import { T as Textarea, R as RecordsList } from "./RecordsList-CzyCqE5D.mjs";
import { t as toast } from "../_libs/sonner.mjs";
import { c as commissionChoices, C as CommonAmounts, a as CommissionChips, b as crossedDailyGoal, d as celebrate } from "./CommonAmounts-DTDnPGNq.mjs";
import { i as incomeMotivation, a as calculateWorkStreak, e as expenseMotivation } from "./motivation-COcvTU2q.mjs";
import { n as numberOr, N as NumberField, v as validateIncome, p as parseNumber, a as validateExpense } from "./validate-BG-MbmZ3.mjs";
import "../_libs/react-dom.mjs";
import { o as ChevronDown } from "../_libs/lucide-react.mjs";

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
import "../_libs/radix-ui__react-tabs.mjs";
import "../_libs/radix-ui__primitive.mjs";
import "../_libs/radix-ui__react-context.mjs";
import "../_libs/radix-ui__react-roving-focus.mjs";
import "../_libs/radix-ui__react-collection.mjs";
import "../_libs/radix-ui__react-id.mjs";
import "../_libs/@radix-ui/react-use-layout-effect+[...].mjs";
import "../_libs/radix-ui__react-primitive.mjs";
import "../_libs/@radix-ui/react-use-callback-ref+[...].mjs";
import "../_libs/@radix-ui/react-use-controllable-state+[...].mjs";
import "../_libs/@radix-ui/react-use-effect-event+[...].mjs";
import "../_libs/radix-ui__react-direction.mjs";
import "../_libs/@radix-ui/react-use-is-hydrated+[...].mjs";
import "../_libs/radix-ui__react-presence.mjs";
import "../_libs/radix-ui__react-label.mjs";
import "./select-Cz6O0-QX.mjs";
import "../_libs/radix-ui__react-select.mjs";
import "../_libs/radix-ui__number.mjs";
import "../_libs/@radix-ui/react-dismissable-layer+[...].mjs";
import "../_libs/radix-ui__react-focus-guards.mjs";
import "../_libs/radix-ui__react-focus-scope.mjs";
import "../_libs/radix-ui__react-popper.mjs";
import "../_libs/floating-ui__react-dom.mjs";
import "../_libs/floating-ui__dom.mjs";
import "../_libs/floating-ui__core.mjs";
import "../_libs/floating-ui__utils.mjs";
import "../_libs/radix-ui__react-use-size.mjs";
import "../_libs/radix-ui__react-portal.mjs";
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
import "./day-groups-ZcaNk8yr.mjs";
import "../_libs/radix-ui__react-dialog.mjs";
function read(kind, amount) {
  if (kind === "income") {
    if (amount <= 0)
      return { mood: "sleepy", prop: "coffee", line: "נו, כמה עשינו?", tone: "default" };
    if (amount < 60)
      return { mood: "smirk", prop: "cash", line: "כל שקל נספר", tone: "default" };
    if (amount < 180)
      return {
        mood: "excited",
        prop: "cash",
        line: "יפה! זה כבר משהו",
        tone: "win",
        word: "צ׳ינג!"
      };
    return {
      mood: "victory",
      prop: "cash",
      line: "וואו! נסיעת זהב",
      tone: "win",
      word: "בּוּם!"
    };
  }
  if (kind === "fuel") {
    if (amount <= 0)
      return { mood: "smirk", prop: "pump", line: "כמה עלה התדלוק?", tone: "default" };
    return {
      mood: "grumble",
      prop: "pump",
      line: amount > 250 ? "אוּף... הדלק שותה הכל" : "נרשם. נחזיר את זה בנסיעה הבאה",
      tone: "warn",
      word: amount > 250 ? "גְּלוּק!" : void 0
    };
  }
  if (amount <= 0)
    return { mood: "smirk", prop: "none", line: "מה נכנס להוצאות?", tone: "default" };
  return {
    mood: "grumble",
    prop: "none",
    line: amount > 200 ? "כבד! שומרים על הכיס" : "קטן, נעבור את זה",
    tone: "warn"
  };
}
const BACKDROP = { income: "street", expense: "garage", fuel: "road" };
function LiveReaction({ kind, amount }) {
  const state = read(kind, amount);
  const [pop, setPop] = reactExports.useState(0);
  const prev = reactExports.useRef(state.line);
  reactExports.useEffect(() => {
    if (prev.current !== state.line) {
      prev.current = state.line;
      setPop((p) => p + 1);
    }
  }, [state.line]);
  const said = reactExports.useRef(state.mood);
  reactExports.useEffect(() => {
    if (said.current === state.mood) return;
    const t = window.setTimeout(() => {
      said.current = state.mood;
      playSound(MOOD_MUMBLE[state.mood]);
    }, 350);
    return () => window.clearTimeout(t);
  }, [state.mood]);
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(
    "div",
    {
      className: `live-reaction stage-bg stage-${BACKDROP[kind]} live-reaction-${state.tone}`,
      "aria-hidden": "true",
      children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          CaptainArt,
          {
            mood: state.mood,
            prop: state.prop,
            films: REWARD_FILMS[kind],
            className: "live-reaction-mascot"
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx(ComicBubble, { side: "start", tone: state.tone, className: "live-reaction-bubble", children: state.line }, pop),
        state.word && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "comic-word", children: state.word }, `w-${pop}`)
      ]
    }
  );
}
function useTodayISO() {
  const [today, setToday] = reactExports.useState(todayISO);
  reactExports.useEffect(() => {
    const check = () => setToday(todayISO());
    const id = setInterval(check, 6e4);
    document.addEventListener("visibilitychange", check);
    return () => {
      clearInterval(id);
      document.removeEventListener("visibilitychange", check);
    };
  }, []);
  return today;
}
function useRollingDate(date, setDate) {
  const today = useTodayISO();
  const prev = reactExports.useRef(today);
  reactExports.useEffect(() => {
    if (prev.current !== today && date === prev.current) setDate(today);
    prev.current = today;
  }, [today, date, setDate]);
}
const titles = {
  income: "הכנסות",
  expense: "הוצאות",
  fuel: "תדלוקים"
};
function DayRecords({ date, kind }) {
  const { data } = useAppData();
  const incomes = kind === "income" ? data.incomes.filter((i) => i.date === date) : [];
  const expenses = kind === "income" ? [] : data.expenses.filter(
    (e) => e.date === date && kind === "fuel" === (e.category === "fuel")
  );
  if (incomes.length + expenses.length === 0) return null;
  const day = date === todayISO() ? "היום" : new Date(date).toLocaleDateString("he-IL", { day: "numeric", month: "short" });
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { className: "space-y-2 pt-1", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("h3", { className: "px-1 text-sm font-semibold text-muted-foreground", children: [
      titles[kind],
      " · ",
      day
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(RecordsList, { incomes, expenses })
  ] });
}
function AddPage() {
  const {
    tab,
    date
  } = Route$7.useSearch();
  const [active, setActive] = reactExports.useState(tab || "income");
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mx-auto max-w-xl", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(PageHeader, { title: "הוספת רשומה", subtitle: "מהיר וקל — שלוש שניות וזה נשמר" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "px-4", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Tabs, { dir: "rtl", value: active, onValueChange: setActive, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(TabsList, { className: "grid w-full grid-cols-3 h-11", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(TabsTrigger, { value: "income", className: "text-sm font-semibold", children: "הכנסה" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TabsTrigger, { value: "expense", className: "text-sm font-semibold", children: "הוצאה" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TabsTrigger, { value: "fuel", className: "text-sm font-semibold", children: "תדלוק" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(TabsContent, { value: "income", children: /* @__PURE__ */ jsxRuntimeExports.jsx(IncomeForm, { initialDate: date }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(TabsContent, { value: "expense", children: /* @__PURE__ */ jsxRuntimeExports.jsx(ExpenseForm, { initialDate: date }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(TabsContent, { value: "fuel", children: /* @__PURE__ */ jsxRuntimeExports.jsx(FuelForm, { initialDate: date }) })
    ] }) })
  ] });
}
function QuickAmounts({
  steps,
  onPick,
  onClear
}) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap gap-2", children: [
    steps.map((s) => /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { type: "button", onClick: () => onPick(s), dir: "ltr", className: "num rounded-full border border-border bg-muted/50 px-3 py-1.5 text-sm font-semibold text-foreground active:bg-muted", children: [
      "+",
      s
    ] }, s)),
    /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "button", onClick: onClear, className: "rounded-full px-3 py-1.5 text-sm text-muted-foreground", children: "נקה" })
  ] });
}
function IncomeForm({
  initialDate
}) {
  const {
    data,
    ready,
    addIncome,
    removeIncome
  } = useAppData();
  const [showMore, setShowMore] = reactExports.useState(false);
  const [errors, setErrors] = reactExports.useState({});
  const commissionTouched = reactExports.useRef(false);
  const saveButton = reactExports.useRef(null);
  const [form, setForm] = reactExports.useState({
    date: initialDate ?? todayISO(),
    amount: "",
    commissionPct: String(data.settings.defaultCommissionPct),
    tip: "",
    hours: "",
    km: "",
    note: ""
  });
  reactExports.useEffect(() => {
    if (ready && !commissionTouched.current) {
      setForm((f) => ({
        ...f,
        commissionPct: String(data.settings.defaultCommissionPct)
      }));
    }
  }, [ready, data.settings.defaultCommissionPct]);
  useRollingDate(form.date, reactExports.useCallback((date) => setForm((f) => ({
    ...f,
    date
  })), []));
  const set = (patch) => {
    setForm((f) => ({
      ...f,
      ...patch
    }));
    setErrors((e) => {
      const next = {
        ...e
      };
      for (const k of Object.keys(patch)) delete next[k];
      return next;
    });
  };
  const c = data.settings.currency;
  const dayIncomes = data.incomes.filter((i) => i.date === form.date);
  const dayNet = sumIncomes(dayIncomes);
  const dayGross = dayIncomes.reduce((s, i) => s + i.amount, 0);
  const dayHours = Math.round(sumHours(dayIncomes, (data.trips ?? []).filter((t) => t.date === form.date)) * 10) / 10;
  const dayKm = dayIncomes.reduce((s, i) => s + (i.km || 0), 0);
  const amountNum = numberOr(form.amount, 0);
  const customCommission = !showMore && (!commissionChoices(data.settings.defaultCommissionPct).includes(numberOr(form.commissionPct, Number.NaN)) || Boolean(errors.commissionPct));
  const commissionField = /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "עמלה %", children: /* @__PURE__ */ jsxRuntimeExports.jsx(NumberField, { id: "income-commission", value: form.commissionPct, onValueChange: (commissionPct) => {
    commissionTouched.current = true;
    set({
      commissionPct
    });
  }, error: errors.commissionPct }) });
  const commission = numberOr(form.commissionPct, 0);
  const previewNet = amountNum > 0 ? amountNum * (1 - commission / 100) + numberOr(form.tip, 0) : 0;
  const bump = (v) => set({
    amount: String(numberOr(form.amount, 0) + v)
  });
  const submit = (event) => {
    const errs = validateIncome(form);
    setErrors(errs);
    if (Object.keys(errs).length > 0) {
      if (errs.tip) setShowMore(true);
      return toast.error("יש שדה שצריך לתקן");
    }
    const amount = parseNumber(form.amount);
    const income = {
      date: form.date,
      amount,
      platform: "פרטי",
      commissionPct: commission,
      tip: numberOr(form.tip, 0),
      hours: numberOr(form.hours, 0),
      km: numberOr(form.km, 0),
      note: form.note.trim() || void 0
    };
    const reachedGoal = crossedDailyGoal(data, income);
    const feedback = incomeMotivation(data, income);
    const nextStreak = calculateWorkStreak([...data.incomes, {
      ...income,
      id: "streak-preview"
    }]);
    const id = addIncome(income);
    const firstIncomeToday = form.date === todayISO() && dayIncomes.length === 0;
    const kind = reachedGoal ? "goal" : feedback.milestone === "break-even" ? "break-even" : firstIncomeToday && nextStreak.milestone ? "streak" : "income";
    if (form.date === todayISO()) celebrate(kind, event.currentTarget, amount, c, {
      title: nextStreak.milestone && kind === "streak" ? `רצף של ${nextStreak.current} ימים` : feedback.title,
      message: feedback.message,
      streak: nextStreak.current
    });
    toast.success(`נוספה הכנסה · נטו ${fmt(previewNet, c)}`, {
      duration: 4e3,
      action: {
        label: "ביטול",
        onClick: () => removeIncome(id)
      }
    });
    setForm((f) => ({
      ...f,
      amount: "",
      tip: "",
      hours: "",
      km: "",
      note: ""
    }));
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { className: "mt-4", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { className: "p-4 space-y-3", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(LiveReaction, { kind: "income", amount: amountNum }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "סכום ברוטו ₪", children: /* @__PURE__ */ jsxRuntimeExports.jsx(NumberField, { id: "income-amount", className: "num text-xl font-bold", style: {
      height: "3.25rem"
    }, value: form.amount, onValueChange: (amount) => set({
      amount
    }), error: errors.amount, placeholder: "0", enterKeyHint: "done", onKeyDown: (e) => {
      if (e.key === "Enter") saveButton.current?.click();
    } }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(QuickAmounts, { steps: [20, 50, 100, 200], onPick: bump, onClear: () => set({
      amount: ""
    }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(CommonAmounts, { onPick: (amount) => set({
      amount
    }) }),
    amountNum > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "num text-sm font-medium text-primary", children: [
      "נטו אחרי עמלה: ",
      fmt(previewNet, c)
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs text-muted-foreground", children: "עמלה:" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(CommissionChips, { value: form.commissionPct, defaultPct: data.settings.defaultCommissionPct, onPick: (commissionPct) => {
        commissionTouched.current = true;
        set({
          commissionPct
        });
      } })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: `grid gap-3 ${customCommission ? "grid-cols-3" : "grid-cols-2"}`, children: [
      customCommission && commissionField,
      /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "שעות", children: /* @__PURE__ */ jsxRuntimeExports.jsx(NumberField, { id: "income-hours", value: form.hours, onValueChange: (hours) => set({
        hours
      }), error: errors.hours, placeholder: "0" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "ק״מ", children: /* @__PURE__ */ jsxRuntimeExports.jsx(NumberField, { id: "income-km", value: form.km, onValueChange: (km) => set({
        km
      }), error: errors.km, placeholder: "0" }) })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "תאריך", children: /* @__PURE__ */ jsxRuntimeExports.jsx(DateInput, { value: form.date, onChange: (date) => set({
      date
    }), error: errors.date }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { type: "button", onClick: () => setShowMore((v) => !v), className: "flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronDown, { className: `h-3.5 w-3.5 transition-transform ${showMore ? "rotate-180" : ""}` }),
      "פרטים נוספים"
    ] }),
    showMore && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-3 pt-1", children: [
      !customCommission && commissionField,
      /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "תשר ₪", children: /* @__PURE__ */ jsxRuntimeExports.jsx(NumberField, { id: "income-tip", value: form.tip, onValueChange: (tip) => set({
        tip
      }), error: errors.tip, placeholder: "0" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "הערה", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Textarea, { value: form.note, onChange: (e) => setForm({
        ...form,
        note: e.target.value
      }), rows: 2 }) })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { ref: saveButton, onClick: submit, className: "reward-action w-full h-12 text-base font-semibold", size: "lg", children: dayIncomes.length > 0 ? "הוסף לסכום היום" : "שמירת הכנסה" }),
    dayIncomes.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-xl border border-primary/15 bg-primary/5 p-3 text-center", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-xs text-muted-foreground", children: [
        "סה״כ מצטבר לתאריך זה (",
        dayIncomes.length,
        " רשומות)"
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "num mt-0.5 text-2xl font-extrabold text-primary", children: fmt(dayNet, c) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-xs text-muted-foreground", children: [
        "ברוטו ",
        fmt(dayGross, c),
        dayHours > 0 && ` · ${dayHours} שעות · ${fmt(Math.round(dayNet / dayHours), c)} לשעה`,
        dayKm > 0 && ` · ${dayKm} ק״מ`
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(DayRecords, { date: form.date, kind: "income" })
  ] }) });
}
const expenseCats = ["insurance", "license", "maintenance", "parking", "food", "wash", "other"];
function ExpenseForm({
  initialDate
}) {
  const {
    data,
    addExpense,
    removeExpense
  } = useAppData();
  const [form, setForm] = reactExports.useState({
    date: initialDate ?? todayISO(),
    category: "maintenance",
    amount: "",
    note: ""
  });
  const [errors, setErrors] = reactExports.useState({});
  useRollingDate(form.date, reactExports.useCallback((date) => setForm((f) => ({
    ...f,
    date
  })), []));
  const c = data.settings.currency;
  const bump = (v) => {
    setForm((f) => ({
      ...f,
      amount: String(numberOr(f.amount, 0) + v)
    }));
    setErrors({});
  };
  const submit = () => {
    const errs = validateExpense(form);
    setErrors(errs);
    if (Object.keys(errs).length > 0) return toast.error("יש שדה שצריך לתקן");
    const amount = parseNumber(form.amount);
    const expense = {
      date: form.date,
      category: form.category,
      amount,
      note: form.note.trim() || void 0
    };
    const feedback = expenseMotivation(data, expense);
    const id = addExpense(expense);
    if (form.date === todayISO()) celebrate("corrective", document.activeElement, Math.abs(feedback.delta), c, {
      title: feedback.title,
      message: feedback.message
    });
    toast.success(`נוספה הוצאה · ${fmt(amount, c)}`, {
      duration: 4e3,
      action: {
        label: "ביטול",
        onClick: () => removeExpense(id)
      }
    });
    setForm((f) => ({
      ...f,
      amount: "",
      note: ""
    }));
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { className: "mt-4", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { className: "p-4 space-y-3", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(LiveReaction, { kind: "expense", amount: numberOr(form.amount, 0) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "תאריך", children: /* @__PURE__ */ jsxRuntimeExports.jsx(DateInput, { value: form.date, onChange: (date) => {
      setForm({
        ...form,
        date
      });
      setErrors({});
    }, error: errors.date }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "קטגוריה", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid grid-cols-4 gap-2", children: expenseCats.map((cat) => /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "button", onClick: () => setForm({
      ...form,
      category: cat
    }), className: `rounded-xl border px-2 py-2 text-[11px] font-medium leading-tight transition-colors ${form.category === cat ? "border-primary bg-primary/10 text-primary" : "border-border bg-muted/40 text-muted-foreground"}`, children: categoryLabel(cat) }, cat)) }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "סכום ₪", children: /* @__PURE__ */ jsxRuntimeExports.jsx(NumberField, { id: "expense-amount", className: "num text-xl font-bold", style: {
      height: "3.25rem"
    }, value: form.amount, onValueChange: (amount) => {
      setForm({
        ...form,
        amount
      });
      setErrors({});
    }, error: errors.amount, placeholder: "0" }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(QuickAmounts, { steps: [10, 20, 50, 100], onPick: bump, onClear: () => setForm({
      ...form,
      amount: ""
    }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "הערה (אופציונלי)", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Textarea, { value: form.note, onChange: (e) => setForm({
      ...form,
      note: e.target.value
    }), rows: 2 }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { onClick: submit, className: "w-full h-12 text-base font-semibold", size: "lg", children: "שמירת הוצאה" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(DayRecords, { date: form.date, kind: "expense" })
  ] }) });
}
function FuelForm({
  initialDate
}) {
  const {
    data,
    addExpense,
    removeExpense
  } = useAppData();
  const [form, setForm] = reactExports.useState({
    date: initialDate ?? todayISO(),
    amount: "",
    note: ""
  });
  const [errors, setErrors] = reactExports.useState({});
  useRollingDate(form.date, reactExports.useCallback((date) => setForm((f) => ({
    ...f,
    date
  })), []));
  const c = data.settings.currency;
  const amountNum = numberOr(form.amount, 0);
  const price = data.settings.fuelPrice || 0;
  const units = price > 0 ? amountNum / price : 0;
  const isElectric = data.vehicle.type === "electric";
  const unitLabel = isElectric ? "kWh" : "ליטר";
  const bump = (v) => {
    setForm((f) => ({
      ...f,
      amount: String(numberOr(f.amount, 0) + v)
    }));
    setErrors({});
  };
  const submit = () => {
    const errs = validateExpense(form);
    setErrors(errs);
    if (Object.keys(errs).length > 0) return toast.error("יש שדה שצריך לתקן");
    const amount = parseNumber(form.amount);
    const expense = {
      date: form.date,
      category: "fuel",
      amount,
      energyType: isElectric ? "electric" : "petrol95",
      note: form.note.trim() || void 0
    };
    const feedback = expenseMotivation(data, expense);
    const id = addExpense(expense);
    if (form.date === todayISO()) celebrate("corrective", document.activeElement, Math.abs(feedback.delta), c, {
      title: feedback.title,
      message: feedback.message
    });
    toast.success(`${isElectric ? "טעינה נרשמה" : "תדלוק נרשם"} · ${fmt(amount, c)}`, {
      duration: 4e3,
      action: {
        label: "ביטול",
        onClick: () => removeExpense(id)
      }
    });
    setForm((f) => ({
      ...f,
      amount: "",
      note: ""
    }));
  };
  const label = isElectric ? "כמה עלתה הטעינה?" : "כמה עלה התדלוק?";
  return /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { className: "mt-4", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { className: "p-4 space-y-3", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(LiveReaction, { kind: "fuel", amount: amountNum }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "תאריך", children: /* @__PURE__ */ jsxRuntimeExports.jsx(DateInput, { value: form.date, onChange: (date) => {
      setForm({
        ...form,
        date
      });
      setErrors({});
    }, error: errors.date }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label, children: /* @__PURE__ */ jsxRuntimeExports.jsx(NumberField, { id: "fuel-amount", className: "num text-2xl font-bold text-center", style: {
      height: "3.75rem"
    }, value: form.amount, onValueChange: (amount) => {
      setForm({
        ...form,
        amount
      });
      setErrors({});
    }, error: errors.amount, placeholder: "0" }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(QuickAmounts, { steps: [50, 100, 200, 300], onPick: bump, onClear: () => setForm({
      ...form,
      amount: ""
    }) }),
    amountNum > 0 && price > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "num text-center text-sm text-muted-foreground", children: [
      "≈ ",
      units.toFixed(1),
      " ",
      unitLabel,
      " לפי ",
      price,
      " ₪ ל",
      unitLabel
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "הערה (אופציונלי)", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Textarea, { value: form.note, onChange: (e) => setForm({
      ...form,
      note: e.target.value
    }), rows: 2 }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { onClick: submit, className: "w-full h-12 text-base font-semibold", size: "lg", children: "שמירה" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(DayRecords, { date: form.date, kind: "fuel" })
  ] }) });
}
function DateInput({
  value,
  onChange,
  error
}) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "date", value, onChange: (e) => onChange(e.target.value), "aria-invalid": error ? true : void 0, className: error ? "border-destructive" : void 0 }),
    error && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[11px] font-medium text-destructive", role: "alert", children: error })
  ] });
}
function Field({
  label,
  children
}) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-xs font-medium text-muted-foreground", children: label }),
    children
  ] });
}
export {
  AddPage as component
};
