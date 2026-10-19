import { Fragment, useState } from "react";
import {
  useAppData,
  categoryLabel,
  netFromIncome,
  fmt,
  todayISO,
  effectiveFuelParams,
  type Income,
  type Expense,
  type ExpenseCategory,
} from "@/lib/store";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Pencil, Trash2, TrendingUp, TrendingDown } from "lucide-react";
import { toast } from "sonner";
import { NumberField } from "@/components/NumberField";
import { numberOr, parseNumber } from "@/lib/number";
import { validateExpense, validateIncome, type FieldErrors } from "@/lib/validate";
import { dayLabel, groupByDay } from "@/lib/day-groups";

const expenseCats: ExpenseCategory[] = [
  "fuel",
  "insurance",
  "license",
  "maintenance",
  "parking",
  "food",
  "wash",
  "other",
];

type Row = { type: "income"; item: Income } | { type: "expense"; item: Expense };

/** Rows shown before "show more"; whole days are kept together. */
const PAGE_ROWS = 40;

const rowNet = (r: Row) =>
  r.type === "income" ? netFromIncome(r.item as Income) : -(r.item as Expense).amount;

export function RecordsList({ incomes, expenses }: { incomes: Income[]; expenses: Expense[] }) {
  const { data, removeIncome, removeExpense, updateIncome, updateExpense, restoreRecords } =
    useAppData();
  const c = data.settings.currency;
  const [editing, setEditing] = useState<Row | null>(null);
  const [shown, setShown] = useState(PAGE_ROWS);

  const rows: Row[] = [
    ...incomes.map((item) => ({ type: "income" as const, item })),
    ...expenses.map((item) => ({ type: "expense" as const, item })),
  ].sort((a, b) => {
    // Newest first: by date, then by time within the day.
    const ka = `${a.item.date} ${a.item.time ?? ""}`;
    const kb = `${b.item.date} ${b.item.time ?? ""}`;
    return ka < kb ? 1 : ka > kb ? -1 : 0;
  });

  const del = (r: Row) => {
    if (r.type === "income") removeIncome(r.item.id);
    else removeExpense(r.item.id);
    const back =
      r.type === "income" ? { incomes: [r.item as Income] } : { expenses: [r.item as Expense] };
    toast("הרשומה נמחקה", {
      duration: 8000,
      action: { label: "ביטול", onClick: () => restoreRecords(back) },
    });
  };

  const days = groupByDay(rows, (r) => r.item.date);
  const manyDays = days.length > 1;
  const today = todayISO();
  // Whole days up to the row budget (always at least one day).
  let budget = shown;
  const visibleDays = days.filter((d, i) => {
    if (i > 0 && budget <= 0) return false;
    budget -= d.rows.length;
    return true;
  });
  const hidden = days.length - visibleDays.length;

  if (rows.length === 0) {
    return (
      <Card>
        <CardContent className="p-6 text-center text-sm text-muted-foreground">
          אין רשומות בטווח הזה
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardContent className="p-0 divide-y divide-border">
          {visibleDays.map((day) => (
            <Fragment key={day.date}>
              {manyDays && (
                <div className="num flex items-center justify-between bg-muted/40 px-3 py-1.5 text-xs font-semibold text-muted-foreground">
                  <span>{dayLabel(day.date, today)}</span>
                  <span>
                    {fmt(
                      day.rows.reduce((sum, r) => sum + rowNet(r), 0),
                      c,
                    )}
                  </span>
                </div>
              )}
              {day.rows.map((r) => {
                const isIncome = r.type === "income";
                const amount = isIncome
                  ? netFromIncome(r.item as Income)
                  : (r.item as Expense).amount;
                const incomeItem = isIncome ? (r.item as Income) : null;
                // A trip's income keeps its km on the trip, so show the trip's km and time.
                const trip = incomeItem?.tripId
                  ? data.trips.find((t) => t.id === incomeItem.tripId)
                  : undefined;
                const km = trip ? trip.km : incomeItem?.km || 0;
                const energy =
                  incomeItem && km > 0
                    ? (() => {
                        const { price, consumption } = effectiveFuelParams(
                          incomeItem.date,
                          data.vehicle,
                          data.settings,
                          incomeItem.time,
                        );
                        const cons = consumption > 0 ? consumption : 1;
                        return (km / cons) * price;
                      })()
                    : 0;
                const title = trip
                  ? "נסיעה"
                  : isIncome
                    ? "הכנסה"
                    : categoryLabel((r.item as Expense).category);

                return (
                  <div key={r.item.id} className="flex items-center">
                    <button
                      type="button"
                      onClick={() => setEditing(r)}
                      aria-label={`פרטי ${title}`}
                      className="flex min-w-0 flex-1 items-center gap-3 p-3 text-start active:bg-muted/40"
                    >
                      <span
                        className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${isIncome ? "bg-success/10 text-success" : "bg-destructive/10 text-destructive"}`}
                      >
                        {isIncome ? (
                          <TrendingUp className="h-4 w-4" />
                        ) : (
                          <TrendingDown className="h-4 w-4" />
                        )}
                      </span>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5">
                          <span className="text-sm font-medium">{title}</span>
                          {km > 0 && (
                            <span className="rounded-full bg-muted px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground">
                              {km.toLocaleString("he-IL", { maximumFractionDigits: 1 })} ק״מ
                            </span>
                          )}
                          {trip && trip.seconds > 0 && (
                            <span className="num rounded-full bg-muted px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground">
                              {Math.max(1, Math.round(trip.seconds / 60))} דק׳
                            </span>
                          )}
                        </div>
                        <div className="truncate text-xs text-muted-foreground">
                          {[
                            manyDays
                              ? ""
                              : new Date(r.item.date).toLocaleDateString("he-IL", {
                                  day: "numeric",
                                  month: "short",
                                }),
                            trip?.time ?? r.item.time,
                            km > 0 ? `דלק משוער ${fmt(energy, c)}` : "",
                            r.item.note && r.item.note !== "נסיעת GPS" ? r.item.note : "",
                          ]
                            .filter(Boolean)
                            .join(" · ")}
                        </div>
                      </div>

                      <div
                        className={`text-sm font-bold ${isIncome ? "text-success" : "text-destructive"}`}
                      >
                        {isIncome ? "+" : "−"}
                        {fmt(amount, c)}
                      </div>
                    </button>
                    <div className="flex shrink-0 gap-1 pe-3">
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-8 w-8"
                        onClick={() => setEditing(r)}
                        aria-label="עריכה"
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-8 w-8 text-destructive"
                        onClick={() => del(r)}
                        aria-label="מחיקה"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                );
              })}
            </Fragment>
          ))}
          {hidden > 0 && (
            <button
              type="button"
              onClick={() => setShown((n) => n + PAGE_ROWS)}
              className="w-full p-3 text-center text-sm font-semibold text-primary"
            >
              הצג עוד ({hidden} ימים)
            </button>
          )}
        </CardContent>
      </Card>

      <EditDialog
        row={editing}
        onClose={() => setEditing(null)}
        onSaveIncome={(id, patch) => {
          updateIncome(id, patch);
          toast.success("הרשומה עודכנה");
          setEditing(null);
        }}
        onSaveExpense={(id, patch) => {
          updateExpense(id, patch);
          toast.success("הרשומה עודכנה");
          setEditing(null);
        }}
      />
    </>
  );
}

function EditDialog({
  row,
  onClose,
  onSaveIncome,
  onSaveExpense,
}: {
  row: Row | null;
  onClose: () => void;
  onSaveIncome: (id: string, patch: Partial<Income>) => void;
  onSaveExpense: (id: string, patch: Partial<Expense>) => void;
}) {
  if (!row) return null;
  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent
        className="max-h-[92vh] max-w-sm overflow-y-auto"
        // Opened by a tap to look at the record: don't jump into the first field.
        onOpenAutoFocus={(e) => e.preventDefault()}
      >
        <DialogHeader>
          <DialogTitle>פרטי רשומה</DialogTitle>
        </DialogHeader>
        <DetailSummary row={row} />
        <h3 className="text-xs font-semibold text-muted-foreground">עריכה</h3>
        {row.type === "income" ? (
          <IncomeEdit item={row.item as Income} onSave={onSaveIncome} />
        ) : (
          <ExpenseEdit item={row.item as Expense} onSave={onSaveExpense} />
        )}
      </DialogContent>
    </Dialog>
  );
}

const localDate = (iso: string) => {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(y, m - 1, d);
};

/** What the record is made of: the gross, commission and tip, and for a trip its km, time and fuel. */
function DetailSummary({ row }: { row: Row }) {
  const { data } = useAppData();
  const c = data.settings.currency;
  const item = row.item;
  const income = row.type === "income" ? (row.item as Income) : null;
  const expense = row.type === "expense" ? (row.item as Expense) : null;
  const trip = income?.tripId ? data.trips.find((t) => t.id === income.tripId) : undefined;
  const time = trip?.time ?? item.time;
  const km = trip ? trip.km : income?.km || 0;
  const fuel = (() => {
    if (!income || km <= 0) return 0;
    const { price, consumption } = effectiveFuelParams(
      income.date,
      data.vehicle,
      data.settings,
      income.time,
    );
    return (km / (consumption > 0 ? consumption : 1)) * price;
  })();

  const lines: { label: string; value: string; strong?: boolean; tone?: "good" | "bad" }[] = [];
  if (income) {
    const commission = (income.amount * income.commissionPct) / 100;
    lines.push({ label: "ברוטו", value: fmt(income.amount, c) });
    if (income.commissionPct > 0)
      lines.push({
        label: `עמלה ${income.commissionPct}%`,
        value: `−${fmt(commission, c)}`,
        tone: "bad",
      });
    if (income.tip > 0) lines.push({ label: "טיפ", value: `+${fmt(income.tip, c)}`, tone: "good" });
    lines.push({ label: "נטו", value: fmt(netFromIncome(income), c), strong: true });
    if (km > 0)
      lines.push({ label: "ק״מ", value: km.toLocaleString("he-IL", { maximumFractionDigits: 1 }) });
    if (trip && trip.seconds > 0)
      lines.push({
        label: "זמן נסיעה",
        value: `${Math.max(1, Math.round(trip.seconds / 60))} דק׳`,
      });
    if (trip && (trip.waitSeconds ?? 0) > 0)
      lines.push({ label: "המתנה", value: `${Math.round((trip.waitSeconds ?? 0) / 60)} דק׳` });
    if (income.hours > 0) lines.push({ label: "שעות", value: String(income.hours) });
    if (km > 0) {
      lines.push({ label: "דלק משוער", value: `−${fmt(fuel, c)}`, tone: "bad" });
      lines.push({
        label: "נטו אחרי דלק",
        value: fmt(netFromIncome(income) - fuel, c),
        strong: true,
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

  return (
    <div className="space-y-2 rounded-xl bg-muted/50 p-3">
      <div className="text-xs font-semibold text-muted-foreground">
        {localDate(item.date).toLocaleDateString("he-IL", {
          weekday: "long",
          day: "numeric",
          month: "long",
        })}
        {time ? ` · ${time}` : ""}
      </div>
      <dl className="num space-y-1 text-sm">
        {lines.map((l) => (
          <div key={l.label} className="flex justify-between gap-3">
            <dt className="text-muted-foreground">{l.label}</dt>
            <dd
              dir="ltr"
              className={`${l.strong ? "font-extrabold" : "font-semibold"} ${
                l.tone === "good" ? "text-success" : l.tone === "bad" ? "text-destructive" : ""
              }`}
            >
              {l.value}
            </dd>
          </div>
        ))}
      </dl>
      {item.note && item.note !== "נסיעת GPS" && (
        <p className="border-t border-border pt-2 text-xs text-muted-foreground">{item.note}</p>
      )}
    </div>
  );
}

function IncomeEdit({
  item,
  onSave,
}: {
  item: Income;
  onSave: (id: string, patch: Partial<Income>) => void;
}) {
  const [f, setF] = useState({
    date: item.date,
    amount: String(item.amount),
    commissionPct: String(item.commissionPct),
    tip: String(item.tip || ""),
    hours: String(item.hours || ""),
    km: String(item.km || ""),
    note: item.note || "",
  });
  const [errors, setErrors] = useState<FieldErrors>({});
  const save = () => {
    const errs = validateIncome(f);
    setErrors(errs);
    if (Object.keys(errs).length > 0) return toast.error("יש שדה שצריך לתקן");
    onSave(item.id, {
      date: f.date,
      amount: parseNumber(f.amount)!,
      commissionPct: numberOr(f.commissionPct, 0),
      tip: numberOr(f.tip, 0),
      hours: numberOr(f.hours, 0),
      km: numberOr(f.km, 0),
      note: f.note.trim() || undefined,
    });
  };
  return (
    <div className="space-y-3">
      <F label="תאריך">
        <Input type="date" value={f.date} onChange={(e) => setF({ ...f, date: e.target.value })} />
        {errors.date && (
          <p className="text-[11px] font-medium text-destructive" role="alert">
            {errors.date}
          </p>
        )}
      </F>
      <F label="סכום ברוטו">
        <NumberField
          value={f.amount}
          onValueChange={(amount) => setF({ ...f, amount })}
          error={errors.amount}
        />
      </F>
      <div className="grid grid-cols-3 gap-2">
        <F label="עמלה %">
          <NumberField
            value={f.commissionPct}
            onValueChange={(commissionPct) => setF({ ...f, commissionPct })}
            error={errors.commissionPct}
          />
        </F>
        <F label="שעות">
          <NumberField
            value={f.hours}
            onValueChange={(hours) => setF({ ...f, hours })}
            error={errors.hours}
          />
        </F>
        <F label="ק״מ">
          <NumberField value={f.km} onValueChange={(km) => setF({ ...f, km })} error={errors.km} />
        </F>
      </div>
      <F label="תשר">
        <NumberField
          value={f.tip}
          onValueChange={(tip) => setF({ ...f, tip })}
          error={errors.tip}
        />
      </F>
      <F label="הערה">
        <Textarea rows={2} value={f.note} onChange={(e) => setF({ ...f, note: e.target.value })} />
      </F>
      <DialogFooter>
        <Button onClick={save} className="w-full">
          שמירה
        </Button>
      </DialogFooter>
    </div>
  );
}

function ExpenseEdit({
  item,
  onSave,
}: {
  item: Expense;
  onSave: (id: string, patch: Partial<Expense>) => void;
}) {
  const [f, setF] = useState({
    date: item.date,
    category: item.category,
    amount: String(item.amount),
    note: item.note || "",
  });
  const [errors, setErrors] = useState<FieldErrors>({});
  const save = () => {
    const errs = validateExpense(f);
    setErrors(errs);
    if (Object.keys(errs).length > 0) return toast.error("יש שדה שצריך לתקן");
    onSave(item.id, {
      date: f.date,
      category: f.category,
      amount: parseNumber(f.amount)!,
      note: f.note.trim() || undefined,
    });
  };
  return (
    <div className="space-y-3">
      <F label="תאריך">
        <Input type="date" value={f.date} onChange={(e) => setF({ ...f, date: e.target.value })} />
        {errors.date && (
          <p className="text-[11px] font-medium text-destructive" role="alert">
            {errors.date}
          </p>
        )}
      </F>
      <F label="קטגוריה">
        <Select
          dir="rtl"
          value={f.category}
          onValueChange={(v) => setF({ ...f, category: v as ExpenseCategory })}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {expenseCats.map((cat) => (
              <SelectItem key={cat} value={cat}>
                {categoryLabel(cat)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </F>
      <F label="סכום">
        <NumberField
          value={f.amount}
          onValueChange={(amount) => setF({ ...f, amount })}
          error={errors.amount}
        />
      </F>
      <F label="הערה">
        <Textarea rows={2} value={f.note} onChange={(e) => setF({ ...f, note: e.target.value })} />
      </F>
      <DialogFooter>
        <Button onClick={save} className="w-full">
          שמירה
        </Button>
      </DialogFooter>
    </div>
  );
}

function F({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <Label className="text-xs font-medium text-muted-foreground">{label}</Label>
      {children}
    </div>
  );
}
