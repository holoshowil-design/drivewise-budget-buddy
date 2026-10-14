import { createFileRoute } from "@tanstack/react-router";
import { useCallback, useEffect, useRef, useState, type MouseEvent } from "react";
import {
  useAppData,
  todayISO,
  sumIncomes,
  fmt,
  type Expense,
  type ExpenseCategory,
  categoryLabel,
} from "@/lib/store";
import { PageHeader } from "@/components/PageHeader";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { ChevronDown } from "lucide-react";
import { LiveReaction } from "@/components/LiveReaction";
import { celebrate, crossedDailyGoal } from "@/lib/rewards";
import { calculateWorkStreak, expenseMotivation, incomeMotivation } from "@/lib/motivation";
import { NumberField } from "@/components/NumberField";
import { numberOr, parseNumber } from "@/lib/number";
import { validateExpense, validateIncome, type FieldErrors } from "@/lib/validate";
import { useRollingDate } from "@/hooks/use-today";
import { CommissionChips } from "@/components/CommissionChips";
import { DayRecords } from "@/components/DayRecords";
import { CommonAmounts } from "@/components/CommonAmounts";

type AddSearch = {
  tab?: "income" | "expense" | "fuel";
  /** Pre-fills the form date (from the calendar "+" button). */
  date?: string;
};

// A plain check instead of a zod schema keeps zod (~50 KB) out of the first load.
const TABS = ["income", "expense", "fuel"] as const;
const validateAddSearch = (search: Record<string, unknown>): AddSearch => ({
  tab: TABS.find((t) => t === search.tab),
  date:
    typeof search.date === "string" && /^\d{4}-\d{2}-\d{2}$/.test(search.date)
      ? search.date
      : undefined,
});

export const Route = createFileRoute("/add")({
  validateSearch: validateAddSearch,
  head: () => ({
    meta: [
      { title: "הוספת רשומה - דרייבר" },
      { name: "description", content: "הוסף הכנסה, הוצאה או תדלוק." },
      { property: "og:title", content: "הוספת רשומה - דרייבר" },
      { property: "og:description", content: "הוסף הכנסה, הוצאה או תדלוק." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: AddPage,
});

function AddPage() {
  const { tab, date } = Route.useSearch();
  const [active, setActive] = useState<string>(tab || "income");

  return (
    <div className="mx-auto max-w-xl">
      <PageHeader title="הוספת רשומה" subtitle="מהיר וקל — שלוש שניות וזה נשמר" />
      <div className="px-4">
        <Tabs value={active} onValueChange={setActive}>
          <TabsList className="grid w-full grid-cols-3 h-11">
            <TabsTrigger value="income" className="text-sm font-semibold">
              הכנסה
            </TabsTrigger>
            <TabsTrigger value="expense" className="text-sm font-semibold">
              הוצאה
            </TabsTrigger>
            <TabsTrigger value="fuel" className="text-sm font-semibold">
              תדלוק
            </TabsTrigger>
          </TabsList>
          <TabsContent value="income">
            <IncomeForm initialDate={date} />
          </TabsContent>
          <TabsContent value="expense">
            <ExpenseForm initialDate={date} />
          </TabsContent>
          <TabsContent value="fuel">
            <FuelForm initialDate={date} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

/** Quick "+amount" chips so a value can be entered without typing. */
function QuickAmounts({
  steps,
  onPick,
  onClear,
}: {
  steps: number[];
  onPick: (v: number) => void;
  onClear: () => void;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {steps.map((s) => (
        <button
          key={s}
          type="button"
          onClick={() => onPick(s)}
          className="num rounded-full border border-border bg-muted/50 px-3 py-1.5 text-sm font-semibold text-foreground active:bg-muted"
        >
          +{s}
        </button>
      ))}
      <button
        type="button"
        onClick={onClear}
        className="rounded-full px-3 py-1.5 text-sm text-muted-foreground"
      >
        נקה
      </button>
    </div>
  );
}

function IncomeForm({ initialDate }: { initialDate?: string }) {
  const { data, ready, addIncome, removeIncome } = useAppData();
  const [showMore, setShowMore] = useState(false);
  const [errors, setErrors] = useState<FieldErrors>({});
  const commissionTouched = useRef(false);
  const saveButton = useRef<HTMLButtonElement>(null);
  const [form, setForm] = useState({
    date: initialDate ?? todayISO(),
    amount: "",
    commissionPct: String(data.settings.defaultCommissionPct),
    tip: "",
    hours: "",
    km: "",
    note: "",
  });

  // The settings load after the first render: take the default commission
  // from them unless the user already changed the field.
  useEffect(() => {
    if (ready && !commissionTouched.current) {
      setForm((f) => ({ ...f, commissionPct: String(data.settings.defaultCommissionPct) }));
    }
  }, [ready, data.settings.defaultCommissionPct]);
  useRollingDate(
    form.date,
    useCallback((date) => setForm((f) => ({ ...f, date })), []),
  );
  const set = (patch: Partial<typeof form>) => {
    setForm((f) => ({ ...f, ...patch }));
    setErrors((e) => {
      const next = { ...e };
      for (const k of Object.keys(patch)) delete next[k];
      return next;
    });
  };

  const c = data.settings.currency;
  const dayIncomes = data.incomes.filter((i) => i.date === form.date);
  const dayNet = sumIncomes(dayIncomes);
  const dayGross = dayIncomes.reduce((s, i) => s + i.amount, 0);
  const dayHours = dayIncomes.reduce((s, i) => s + (i.hours || 0), 0);
  const dayKm = dayIncomes.reduce((s, i) => s + (i.km || 0), 0);

  const amountNum = numberOr(form.amount, 0);
  const commission = numberOr(form.commissionPct, 0);
  const previewNet = amountNum > 0 ? amountNum * (1 - commission / 100) + numberOr(form.tip, 0) : 0;

  const bump = (v: number) => set({ amount: String(numberOr(form.amount, 0) + v) });

  const submit = (event: MouseEvent<HTMLButtonElement>) => {
    const errs = validateIncome(form);
    setErrors(errs);
    if (Object.keys(errs).length > 0) {
      if (errs.tip) setShowMore(true);
      return toast.error("יש שדה שצריך לתקן");
    }
    const amount = parseNumber(form.amount)!;
    const income = {
      date: form.date,
      amount,
      platform: "פרטי",
      commissionPct: commission,
      tip: numberOr(form.tip, 0),
      hours: numberOr(form.hours, 0),
      km: numberOr(form.km, 0),
      note: form.note.trim() || undefined,
    };
    const reachedGoal = crossedDailyGoal(data, income);
    const feedback = incomeMotivation(data, income);
    const nextStreak = calculateWorkStreak([...data.incomes, { ...income, id: "streak-preview" }]);
    const id = addIncome(income);
    const firstIncomeToday = form.date === todayISO() && dayIncomes.length === 0;
    const kind = reachedGoal
      ? "goal"
      : feedback.milestone === "break-even"
        ? "break-even"
        : firstIncomeToday && nextStreak.milestone
          ? "streak"
          : "income";
    if (form.date === todayISO())
      celebrate(kind, event.currentTarget, amount, c, {
        title:
          nextStreak.milestone && kind === "streak"
            ? `רצף של ${nextStreak.current} ימים`
            : feedback.title,
        message: feedback.message,
        streak: nextStreak.current,
      });
    toast.success(`נוספה הכנסה · נטו ${fmt(previewNet, c)}`, {
      action: { label: "ביטול", onClick: () => removeIncome(id) },
    });
    setForm((f) => ({ ...f, amount: "", tip: "", hours: "", km: "", note: "" }));
  };

  return (
    <Card className="mt-4">
      <CardContent className="p-4 space-y-3">
        <LiveReaction kind="income" amount={amountNum} />
        <Field label="סכום ברוטו ₪">
          <NumberField
            id="income-amount"
            className="num text-xl font-bold"
            style={{ height: "3.25rem" }}
            value={form.amount}
            onValueChange={(amount) => set({ amount })}
            error={errors.amount}
            placeholder="0"
            enterKeyHint="done"
            onKeyDown={(e) => {
              if (e.key === "Enter") saveButton.current?.click();
            }}
          />
        </Field>
        <QuickAmounts
          steps={[20, 50, 100, 200]}
          onPick={bump}
          onClear={() => set({ amount: "" })}
        />
        <CommonAmounts onPick={(amount) => set({ amount })} />
        {amountNum > 0 && (
          <div className="num text-sm font-medium text-primary">
            נטו אחרי עמלה: {fmt(previewNet, c)}
          </div>
        )}
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground">עמלה:</span>
          <CommissionChips
            value={form.commissionPct}
            defaultPct={data.settings.defaultCommissionPct}
            onPick={(commissionPct) => {
              commissionTouched.current = true;
              set({ commissionPct });
            }}
          />
        </div>
        <div className="grid grid-cols-3 gap-3">
          <Field label="עמלה %">
            <NumberField
              id="income-commission"
              value={form.commissionPct}
              onValueChange={(commissionPct) => {
                commissionTouched.current = true;
                set({ commissionPct });
              }}
              error={errors.commissionPct}
            />
          </Field>
          <Field label="שעות">
            <NumberField
              id="income-hours"
              value={form.hours}
              onValueChange={(hours) => set({ hours })}
              error={errors.hours}
              placeholder="0"
            />
          </Field>
          <Field label="ק״מ">
            <NumberField
              id="income-km"
              value={form.km}
              onValueChange={(km) => set({ km })}
              error={errors.km}
              placeholder="0"
            />
          </Field>
        </div>

        <Field label="תאריך">
          <DateInput value={form.date} onChange={(date) => set({ date })} error={errors.date} />
        </Field>

        <button
          type="button"
          onClick={() => setShowMore((v) => !v)}
          className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
        >
          <ChevronDown
            className={`h-3.5 w-3.5 transition-transform ${showMore ? "rotate-180" : ""}`}
          />
          פרטים נוספים
        </button>
        {showMore && (
          <div className="space-y-3 pt-1">
            <Field label="תשר ₪">
              <NumberField
                id="income-tip"
                value={form.tip}
                onValueChange={(tip) => set({ tip })}
                error={errors.tip}
                placeholder="0"
              />
            </Field>
            <Field label="הערה">
              <Textarea
                value={form.note}
                onChange={(e) => setForm({ ...form, note: e.target.value })}
                rows={2}
              />
            </Field>
          </div>
        )}

        <Button
          ref={saveButton}
          onClick={submit}
          className="reward-action w-full h-12 text-base font-semibold"
          size="lg"
        >
          {dayIncomes.length > 0 ? "הוסף לסכום היום" : "שמירת הכנסה"}
        </Button>

        {dayIncomes.length > 0 && (
          <div className="rounded-xl border border-primary/15 bg-primary/5 p-3 text-center">
            <div className="text-xs text-muted-foreground">
              סה״כ מצטבר לתאריך זה ({dayIncomes.length} רשומות)
            </div>
            <div className="num mt-0.5 text-2xl font-extrabold text-primary">{fmt(dayNet, c)}</div>
            <div className="text-xs text-muted-foreground">
              ברוטו {fmt(dayGross, c)}
              {dayHours > 0 &&
                ` · ${dayHours} שעות · ${fmt(Math.round(dayNet / dayHours), c)} לשעה`}
              {dayKm > 0 && ` · ${dayKm} ק״מ`}
            </div>
          </div>
        )}
        <DayRecords date={form.date} kind="income" />
      </CardContent>
    </Card>
  );
}

const expenseCats: ExpenseCategory[] = [
  "insurance",
  "license",
  "maintenance",
  "parking",
  "food",
  "wash",
  "other",
];

function ExpenseForm({ initialDate }: { initialDate?: string }) {
  const { data, addExpense, removeExpense } = useAppData();
  const [form, setForm] = useState({
    date: initialDate ?? todayISO(),
    category: "maintenance" as ExpenseCategory,
    amount: "",
    note: "",
  });
  const [errors, setErrors] = useState<FieldErrors>({});
  useRollingDate(
    form.date,
    useCallback((date) => setForm((f) => ({ ...f, date })), []),
  );
  const c = data.settings.currency;

  const bump = (v: number) => {
    setForm((f) => ({ ...f, amount: String(numberOr(f.amount, 0) + v) }));
    setErrors({});
  };

  const submit = () => {
    const errs = validateExpense(form);
    setErrors(errs);
    if (Object.keys(errs).length > 0) return toast.error("יש שדה שצריך לתקן");
    const amount = parseNumber(form.amount)!;
    const expense = {
      date: form.date,
      category: form.category,
      amount,
      note: form.note.trim() || undefined,
    };
    const feedback = expenseMotivation(data, expense);
    const id = addExpense(expense);
    if (form.date === todayISO())
      celebrate("corrective", document.activeElement, Math.abs(feedback.delta), c, {
        title: feedback.title,
        message: feedback.message,
      });
    toast.success(`נוספה הוצאה · ${fmt(amount, c)}`, {
      action: { label: "ביטול", onClick: () => removeExpense(id) },
    });
    setForm((f) => ({ ...f, amount: "", note: "" }));
  };

  return (
    <Card className="mt-4">
      <CardContent className="p-4 space-y-3">
        <LiveReaction kind="expense" amount={numberOr(form.amount, 0)} />
        <Field label="תאריך">
          <DateInput
            value={form.date}
            onChange={(date) => {
              setForm({ ...form, date });
              setErrors({});
            }}
            error={errors.date}
          />
        </Field>
        <Field label="קטגוריה">
          <div className="grid grid-cols-4 gap-2">
            {expenseCats.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setForm({ ...form, category: cat })}
                className={`rounded-xl border px-2 py-2 text-[11px] font-medium leading-tight transition-colors ${
                  form.category === cat
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-border bg-muted/40 text-muted-foreground"
                }`}
              >
                {categoryLabel(cat)}
              </button>
            ))}
          </div>
        </Field>
        <Field label="סכום ₪">
          <NumberField
            id="expense-amount"
            className="num text-xl font-bold"
            style={{ height: "3.25rem" }}
            value={form.amount}
            onValueChange={(amount) => {
              setForm({ ...form, amount });
              setErrors({});
            }}
            error={errors.amount}
            placeholder="0"
          />
        </Field>
        <QuickAmounts
          steps={[10, 20, 50, 100]}
          onPick={bump}
          onClear={() => setForm({ ...form, amount: "" })}
        />
        <Field label="הערה (אופציונלי)">
          <Textarea
            value={form.note}
            onChange={(e) => setForm({ ...form, note: e.target.value })}
            rows={2}
          />
        </Field>
        <Button onClick={submit} className="w-full h-12 text-base font-semibold" size="lg">
          שמירת הוצאה
        </Button>
        <DayRecords date={form.date} kind="expense" />
      </CardContent>
    </Card>
  );
}

function FuelForm({ initialDate }: { initialDate?: string }) {
  const { data, addExpense, removeExpense } = useAppData();
  const [form, setForm] = useState({ date: initialDate ?? todayISO(), amount: "", note: "" });
  const [errors, setErrors] = useState<FieldErrors>({});
  useRollingDate(
    form.date,
    useCallback((date) => setForm((f) => ({ ...f, date })), []),
  );
  const c = data.settings.currency;

  const amountNum = numberOr(form.amount, 0);
  const price = data.settings.fuelPrice || 0;
  const units = price > 0 ? amountNum / price : 0;
  const isElectric = data.vehicle.type === "electric";
  const unitLabel = isElectric ? "kWh" : "ליטר";

  const bump = (v: number) => {
    setForm((f) => ({ ...f, amount: String(numberOr(f.amount, 0) + v) }));
    setErrors({});
  };

  const submit = () => {
    const errs = validateExpense(form);
    setErrors(errs);
    if (Object.keys(errs).length > 0) return toast.error("יש שדה שצריך לתקן");
    const amount = parseNumber(form.amount)!;
    const expense = {
      date: form.date,
      category: "fuel" as const,
      amount,
      energyType: isElectric ? "electric" : "petrol95",
      note: form.note.trim() || undefined,
    } satisfies Omit<Expense, "id">;
    const feedback = expenseMotivation(data, expense);
    const id = addExpense(expense);
    if (form.date === todayISO())
      celebrate("corrective", document.activeElement, Math.abs(feedback.delta), c, {
        title: feedback.title,
        message: feedback.message,
      });
    toast.success(`${isElectric ? "טעינה נרשמה" : "תדלוק נרשם"} · ${fmt(amount, c)}`, {
      action: { label: "ביטול", onClick: () => removeExpense(id) },
    });
    setForm((f) => ({ ...f, amount: "", note: "" }));
  };

  const label = isElectric ? "כמה עלתה הטעינה?" : "כמה עלה התדלוק?";

  return (
    <Card className="mt-4">
      <CardContent className="p-4 space-y-3">
        <LiveReaction kind="fuel" amount={amountNum} />
        <Field label="תאריך">
          <DateInput
            value={form.date}
            onChange={(date) => {
              setForm({ ...form, date });
              setErrors({});
            }}
            error={errors.date}
          />
        </Field>
        <Field label={label}>
          <NumberField
            id="fuel-amount"
            className="num text-2xl font-bold text-center"
            style={{ height: "3.75rem" }}
            value={form.amount}
            onValueChange={(amount) => {
              setForm({ ...form, amount });
              setErrors({});
            }}
            error={errors.amount}
            placeholder="0"
          />
        </Field>
        <QuickAmounts
          steps={[50, 100, 200, 300]}
          onPick={bump}
          onClear={() => setForm({ ...form, amount: "" })}
        />
        {amountNum > 0 && price > 0 && (
          <div className="num text-center text-sm text-muted-foreground">
            ≈ {units.toFixed(1)} {unitLabel} לפי {price} ₪ ל{unitLabel}
          </div>
        )}
        <Field label="הערה (אופציונלי)">
          <Textarea
            value={form.note}
            onChange={(e) => setForm({ ...form, note: e.target.value })}
            rows={2}
          />
        </Field>
        <Button onClick={submit} className="w-full h-12 text-base font-semibold" size="lg">
          שמירה
        </Button>
        <DayRecords date={form.date} kind="fuel" />
      </CardContent>
    </Card>
  );
}

/** Date picker with a required-field message. */
function DateInput({
  value,
  onChange,
  error,
}: {
  value: string;
  onChange: (d: string) => void;
  error?: string;
}) {
  return (
    <>
      <Input
        type="date"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        aria-invalid={error ? true : undefined}
        className={error ? "border-destructive" : undefined}
      />
      {error && (
        <p className="text-[11px] font-medium text-destructive" role="alert">
          {error}
        </p>
      )}
    </>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <Label className="text-xs font-medium text-muted-foreground">{label}</Label>
      {children}
    </div>
  );
}
