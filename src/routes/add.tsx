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

function IncomeForm() {
  const { data, addIncome } = useAppData();
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

  const submit = () => {
    const amount = parseFloat(form.amount);
    if (!amount || amount <= 0) return toast.error("הכנס סכום תקין");
    addIncome({
      date: form.date,
      amount,
      platform: "פרטי",
      commissionPct: parseFloat(form.commissionPct) || 0,
      tip: parseFloat(form.tip) || 0,
      hours: parseFloat(form.hours) || 0,
      km: parseFloat(form.km) || 0,
      note: form.note.trim() || undefined,
    });
    toast.success("הכנסה נוספה");
    setForm({ ...form, amount: "", tip: "", hours: "", km: "", note: "" });
  };

  return (
    <Card className="mt-4"><CardContent className="p-4 space-y-3">
      <Field label="תאריך"><Input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} /></Field>
      <Field label="סכום ברוטו ₪"><Input className="h-13 text-xl font-bold" style={{ height: "3.25rem" }} inputMode="decimal" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} placeholder="0" /></Field>
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
  const { addExpense } = useAppData();
  const [form, setForm] = useState({ date: todayISO(), category: "maintenance" as ExpenseCategory, amount: "", note: "" });

  const submit = () => {
    const amount = parseFloat(form.amount);
    if (!amount || amount <= 0) return toast.error("הכנס סכום תקין");
    addExpense({ date: form.date, category: form.category, amount, note: form.note.trim() || undefined });
    toast.success("הוצאה נוספה");
    setForm({ ...form, amount: "", note: "" });
  };

  return (
    <Card className="mt-4"><CardContent className="p-4 space-y-3">
      <Field label="תאריך"><Input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} /></Field>
      <Field label="קטגוריה">
        <Select value={form.category} onValueChange={(v) => setForm({ ...form, category: v as ExpenseCategory })}>
          <SelectTrigger><SelectValue /></SelectTrigger>
          <SelectContent>
            {expenseCats.map((c) => (
              <SelectItem key={c} value={c}>{categoryLabel(c)}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </Field>
      <Field label="סכום ₪"><Input className="text-xl font-bold" style={{ height: "3.25rem" }} inputMode="decimal" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} placeholder="0" /></Field>
      <Field label="הערה (אופציונלי)"><Textarea value={form.note} onChange={(e) => setForm({ ...form, note: e.target.value })} rows={2} /></Field>
      <Button onClick={submit} className="w-full h-12 text-base font-semibold" size="lg">שמירת הוצאה</Button>
    </CardContent></Card>
  );
}

function FuelForm() {
  const { data, addExpense } = useAppData();
  const [form, setForm] = useState({ date: todayISO(), amount: "", note: "" });

  const submit = () => {
    const amount = parseFloat(form.amount);
    if (!amount || amount <= 0) return toast.error("הכנס סכום תקין");
    const isElectric = data.vehicle.type === "electric";
    addExpense({
      date: form.date,
      category: "fuel",
      amount,
      energyType: isElectric ? "electric" : "petrol95",
      note: form.note.trim() || undefined,
    });
    toast.success(isElectric ? "טעינה נרשמה" : "תדלוק נרשם");
    setForm({ ...form, amount: "", note: "" });
  };

  const label = data.vehicle.type === "electric" ? "כמה עלתה הטעינה?" : "כמה עלה התדלוק?";

  return (
    <Card className="mt-4"><CardContent className="p-4 space-y-3">
      <Field label="תאריך"><Input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} /></Field>
      <Field label={label}>
        <Input className="text-2xl font-bold text-center" style={{ height: "3.75rem" }} inputMode="decimal" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} placeholder="0" />
      </Field>
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
