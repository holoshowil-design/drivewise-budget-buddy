import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useAppData, todayISO, sumIncomes, fmt, type ExpenseCategory, categoryLabel } from "@/lib/store";
import { PageHeader } from "@/components/PageHeader";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { z } from "zod";
import { ChevronDown } from "lucide-react";

const searchSchema = z.object({ tab: z.enum(["income", "expense", "fuel"]).optional() });

export const Route = createFileRoute("/add")({
  validateSearch: searchSchema,
  head: () => ({ meta: [{ title: "הוספת רשומה - דרייבר" }, { name: "description", content: "הוסף הכנסה, הוצאה או תדלוק." }] }),
  component: AddPage,
});

function AddPage() {
  const { tab } = Route.useSearch();
  const [active, setActive] = useState<string>(tab || "income");

  return (
    <div className="mx-auto max-w-xl">
      <PageHeader title="הוספת רשומה" subtitle="מהיר וקל — שלוש שניות וזה נשמר" />
      <div className="px-4">
        <Tabs value={active} onValueChange={setActive}>
          <TabsList className="grid w-full grid-cols-3 h-11">
            <TabsTrigger value="income" className="text-sm font-semibold">הכנסה</TabsTrigger>
            <TabsTrigger value="expense" className="text-sm font-semibold">הוצאה</TabsTrigger>
            <TabsTrigger value="fuel" className="text-sm font-semibold">תדלוק</TabsTrigger>
          </TabsList>
          <TabsContent value="income"><IncomeForm /></TabsContent>
          <TabsContent value="expense"><ExpenseForm /></TabsContent>
          <TabsContent value="fuel"><FuelForm /></TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

/** Quick "+amount" chips so a value can be entered without typing. */
function QuickAmounts({ steps, onPick, onClear }: { steps: number[]; onPick: (v: number) => void; onClear: () => void }) {
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
      <button type="button" onClick={onClear} className="rounded-full px-3 py-1.5 text-sm text-muted-foreground">
        נקה
      </button>
    </div>
  );
}

function IncomeForm() {
  const { data, addIncome, removeIncome } = useAppData();
  const [showMore, setShowMore] = useState(false);
  const [form, setForm] = useState({
    date: todayISO(),
    amount: "",
    commissionPct: String(data.settings.defaultCommissionPct),
    tip: "",
    hours: "",
    km: "",
    note: "",
  });

  const c = data.settings.currency;
  const dayIncomes = data.incomes.filter((i) => i.date === form.date);
  const dayNet = sumIncomes(dayIncomes);
  const dayGross = dayIncomes.reduce((s, i) => s + i.amount, 0);
  const dayHours = dayIncomes.reduce((s, i) => s + (i.hours || 0), 0);
  const dayKm = dayIncomes.reduce((s, i) => s + (i.km || 0), 0);

  const amountNum = parseFloat(form.amount) || 0;
  const commission = parseFloat(form.commissionPct) || 0;
  const previewNet = amountNum > 0 ? amountNum * (1 - commission / 100) + (parseFloat(form.tip) || 0) : 0;

  const bump = (v: number) => setForm((f) => ({ ...f, amount: String((parseFloat(f.amount) || 0) + v) }));

  const submit = () => {
    const amount = parseFloat(form.amount);
    if (!amount || amount <= 0) return toast.error("הכנס סכום תקין");
    const id = addIncome({
      date: form.date,
      amount,
      platform: "פרטי",
      commissionPct: commission,
      tip: parseFloat(form.tip) || 0,
      hours: parseFloat(form.hours) || 0,
      km: parseFloat(form.km) || 0,
      note: form.note.trim() || undefined,
    });
    toast.success(`נוספה הכנסה · נטו ${fmt(previewNet, c)}`, {
      action: { label: "ביטול", onClick: () => removeIncome(id) },
    });
    setForm({ ...form, amount: "", tip: "", hours: "", km: "", note: "" });
  };

  return (
    <Card className="mt-4"><CardContent className="p-4 space-y-3">
      <Field label="תאריך"><Input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} /></Field>
      <Field label="סכום ברוטו ₪">
        <Input className="num text-xl font-bold" style={{ height: "3.25rem" }} inputMode="decimal" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} placeholder="0" />
      </Field>
      <QuickAmounts steps={[20, 50, 100, 200]} onPick={bump} onClear={() => setForm({ ...form, amount: "" })} />
      {amountNum > 0 && (
        <div className="num text-sm font-medium text-primary">נטו אחרי עמלה: {fmt(previewNet, c)}</div>
      )}
      <div className="grid grid-cols-3 gap-3">
        <Field label="עמלה %"><Input inputMode="decimal" value={form.commissionPct} onChange={(e) => setForm({ ...form, commissionPct: e.target.value })} /></Field>
        <Field label="שעות"><Input inputMode="decimal" value={form.hours} onChange={(e) => setForm({ ...form, hours: e.target.value })} placeholder="0" /></Field>
        <Field label="ק״מ"><Input inputMode="decimal" value={form.km} onChange={(e) => setForm({ ...form, km: e.target.value })} placeholder="0" /></Field>
      </div>

      <button type="button" onClick={() => setShowMore((v) => !v)} className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground">
        <ChevronDown className={`h-3.5 w-3.5 transition-transform ${showMore ? "rotate-180" : ""}`} />
        פרטים נוספים
      </button>
      {showMore && (
        <div className="space-y-3 pt-1">
          <Field label="תשר ₪"><Input inputMode="decimal" value={form.tip} onChange={(e) => setForm({ ...form, tip: e.target.value })} placeholder="0" /></Field>
          <Field label="הערה"><Textarea value={form.note} onChange={(e) => setForm({ ...form, note: e.target.value })} rows={2} /></Field>
        </div>
      )}

      <Button onClick={submit} className="w-full h-12 text-base font-semibold" size="lg">
        {dayIncomes.length > 0 ? "הוסף לסכום היום" : "שמירת הכנסה"}
      </Button>

      {dayIncomes.length > 0 && (
        <div className="rounded-xl border border-primary/15 bg-primary/5 p-3 text-center">
          <div className="text-xs text-muted-foreground">סה״כ מצטבר לתאריך זה ({dayIncomes.length} רשומות)</div>
          <div className="num mt-0.5 text-2xl font-extrabold text-primary">{fmt(dayNet, c)}</div>
          <div className="text-xs text-muted-foreground">
            ברוטו {fmt(dayGross, c)}
            {dayHours > 0 && ` · ${dayHours} שעות · ${fmt(Math.round(dayNet / dayHours), c)} לשעה`}
            {dayKm > 0 && ` · ${dayKm} ק״מ`}
          </div>
        </div>
      )}
    </CardContent></Card>
  );
}


const expenseCats: ExpenseCategory[] = ["insurance", "license", "maintenance", "parking", "food", "wash", "other"];

function ExpenseForm() {
  const { data, addExpense, removeExpense } = useAppData();
  const [form, setForm] = useState({ date: todayISO(), category: "maintenance" as ExpenseCategory, amount: "", note: "" });
  const c = data.settings.currency;

  const bump = (v: number) => setForm((f) => ({ ...f, amount: String((parseFloat(f.amount) || 0) + v) }));

  const submit = () => {
    const amount = parseFloat(form.amount);
    if (!amount || amount <= 0) return toast.error("הכנס סכום תקין");
    const id = addExpense({ date: form.date, category: form.category, amount, note: form.note.trim() || undefined });
    toast.success(`נוספה הוצאה · ${fmt(amount, c)}`, { action: { label: "ביטול", onClick: () => removeExpense(id) } });
    setForm({ ...form, amount: "", note: "" });
  };

  return (
    <Card className="mt-4"><CardContent className="p-4 space-y-3">
      <Field label="תאריך"><Input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} /></Field>
      <Field label="קטגוריה">
        <div className="grid grid-cols-4 gap-2">
          {expenseCats.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setForm({ ...form, category: cat })}
              className={`rounded-xl border px-2 py-2 text-[11px] font-medium leading-tight transition-colors ${
                form.category === cat ? "border-primary bg-primary/10 text-primary" : "border-border bg-muted/40 text-muted-foreground"
              }`}
            >
              {categoryLabel(cat)}
            </button>
          ))}
        </div>
      </Field>
      <Field label="סכום ₪"><Input className="num text-xl font-bold" style={{ height: "3.25rem" }} inputMode="decimal" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} placeholder="0" /></Field>
      <QuickAmounts steps={[10, 20, 50, 100]} onPick={bump} onClear={() => setForm({ ...form, amount: "" })} />
      <Field label="הערה (אופציונלי)"><Textarea value={form.note} onChange={(e) => setForm({ ...form, note: e.target.value })} rows={2} /></Field>
      <Button onClick={submit} className="w-full h-12 text-base font-semibold" size="lg">שמירת הוצאה</Button>
    </CardContent></Card>
  );
}

function FuelForm() {
  const { data, addExpense, removeExpense } = useAppData();
  const [form, setForm] = useState({ date: todayISO(), amount: "", note: "" });
  const c = data.settings.currency;

  const amountNum = parseFloat(form.amount) || 0;
  const price = data.settings.fuelPrice || 0;
  const units = price > 0 ? amountNum / price : 0;
  const isElectric = data.vehicle.type === "electric";
  const unitLabel = isElectric ? "kWh" : "ליטר";

  const bump = (v: number) => setForm((f) => ({ ...f, amount: String((parseFloat(f.amount) || 0) + v) }));

  const submit = () => {
    const amount = parseFloat(form.amount);
    if (!amount || amount <= 0) return toast.error("הכנס סכום תקין");
    const id = addExpense({
      date: form.date,
      category: "fuel",
      amount,
      energyType: isElectric ? "electric" : "petrol95",
      note: form.note.trim() || undefined,
    });
    toast.success(`${isElectric ? "טעינה נרשמה" : "תדלוק נרשם"} · ${fmt(amount, c)}`, {
      action: { label: "ביטול", onClick: () => removeExpense(id) },
    });
    setForm({ ...form, amount: "", note: "" });
  };

  const label = isElectric ? "כמה עלתה הטעינה?" : "כמה עלה התדלוק?";

  return (
    <Card className="mt-4"><CardContent className="p-4 space-y-3">
      <Field label="תאריך"><Input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} /></Field>
      <Field label={label}>
        <Input className="num text-2xl font-bold text-center" style={{ height: "3.75rem" }} inputMode="decimal" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} placeholder="0" />
      </Field>
      <QuickAmounts steps={[50, 100, 200, 300]} onPick={bump} onClear={() => setForm({ ...form, amount: "" })} />
      {amountNum > 0 && price > 0 && (
        <div className="num text-center text-sm text-muted-foreground">
          ≈ {units.toFixed(1)} {unitLabel} לפי {price} ₪ ל{unitLabel}
        </div>
      )}
      <Field label="הערה (אופציונלי)"><Textarea value={form.note} onChange={(e) => setForm({ ...form, note: e.target.value })} rows={2} /></Field>
      <Button onClick={submit} className="w-full h-12 text-base font-semibold" size="lg">שמירה</Button>
    </CardContent></Card>
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
