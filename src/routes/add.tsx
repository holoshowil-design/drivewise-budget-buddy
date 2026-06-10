import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useAppData, todayISO, type ExpenseCategory, type EnergyType, categoryLabel, energyLabel } from "@/lib/store";
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
      <PageHeader title="הוספת רשומה" subtitle="הכנס הכנסה, הוצאה או תדלוק" />
      <div className="px-4">
        <Tabs value={active} onValueChange={setActive}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="income">הכנסה</TabsTrigger>
            <TabsTrigger value="expense">הוצאה</TabsTrigger>
            <TabsTrigger value="fuel">תדלוק/טעינה</TabsTrigger>
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
  const [form, setForm] = useState({
    date: todayISO(),
    amount: "",
    platform: "",
    commissionPct: String(data.settings.defaultCommissionPct),
    tip: "",
    hours: "",
    km: "",
    note: "",
  });

  const submit = () => {
    const amount = parseFloat(form.amount);
    if (!amount || amount <= 0) return toast.error("הכנס סכום תקין");
    addIncome({
      date: form.date,
      amount,
      platform: form.platform.trim() || "כללי",
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
      <Field label="סכום ברוטו (₪)"><Input inputMode="decimal" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} placeholder="0" /></Field>
      <Field label="פלטפורמה / מקור"><Input value={form.platform} onChange={(e) => setForm({ ...form, platform: e.target.value })} placeholder="לדוגמה: גט, יאנגו, פרטי" /></Field>
      <div className="grid grid-cols-2 gap-3">
        <Field label="עמלת חברה (%)"><Input inputMode="decimal" value={form.commissionPct} onChange={(e) => setForm({ ...form, commissionPct: e.target.value })} /></Field>
        <Field label="תשר (₪)"><Input inputMode="decimal" value={form.tip} onChange={(e) => setForm({ ...form, tip: e.target.value })} placeholder="0" /></Field>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <Field label="שעות"><Input inputMode="decimal" value={form.hours} onChange={(e) => setForm({ ...form, hours: e.target.value })} placeholder="0" /></Field>
        <Field label="ק״מ"><Input inputMode="decimal" value={form.km} onChange={(e) => setForm({ ...form, km: e.target.value })} placeholder="0" /></Field>
      </div>
      <Field label="הערה"><Textarea value={form.note} onChange={(e) => setForm({ ...form, note: e.target.value })} rows={2} /></Field>
      <Button onClick={submit} className="w-full" size="lg">הוסף הכנסה</Button>
    </CardContent></Card>
  );
}

const expenseCats: ExpenseCategory[] = ["fuel", "insurance", "license", "maintenance", "parking", "food", "wash", "other"];

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
            {expenseCats.filter((c) => c !== "fuel").map((c) => (
              <SelectItem key={c} value={c}>{categoryLabel(c)}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </Field>
      <Field label="סכום (₪)"><Input inputMode="decimal" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} placeholder="0" /></Field>
      <Field label="הערה"><Textarea value={form.note} onChange={(e) => setForm({ ...form, note: e.target.value })} rows={2} /></Field>
      <Button onClick={submit} className="w-full" size="lg">הוסף הוצאה</Button>
    </CardContent></Card>
  );
}

function FuelForm() {
  const { data, addExpense } = useAppData();
  const defaultEnergy: EnergyType = data.vehicle.type === "electric" ? "electric" : "petrol95";
  const [form, setForm] = useState<{ date: string; energyType: EnergyType; quantity: string; pricePerUnit: string; odometer: string; note: string }>({
    date: todayISO(),
    energyType: defaultEnergy,
    quantity: "",
    pricePerUnit: "",
    odometer: "",
    note: "",
  });

  const qty = parseFloat(form.quantity) || 0;
  const price = parseFloat(form.pricePerUnit) || 0;
  const total = Math.round(qty * price * 100) / 100;

  const submit = () => {
    if (!qty || !price) return toast.error("הכנס כמות ומחיר");
    addExpense({
      date: form.date,
      category: "fuel",
      amount: total,
      energyType: form.energyType,
      quantity: qty,
      pricePerUnit: price,
      odometer: parseFloat(form.odometer) || undefined,
      note: form.note.trim() || undefined,
    });
    toast.success("תדלוק נרשם");
    setForm({ ...form, quantity: "", pricePerUnit: "", odometer: "", note: "" });
  };

  const energies: EnergyType[] = ["petrol95", "petrol98", "diesel", "electric"];

  return (
    <Card className="mt-4"><CardContent className="p-4 space-y-3">
      <Field label="תאריך"><Input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} /></Field>
      <Field label="סוג אנרגיה">
        <Select value={form.energyType} onValueChange={(v) => setForm({ ...form, energyType: v as EnergyType })}>
          <SelectTrigger><SelectValue /></SelectTrigger>
          <SelectContent>
            {energies.map((e) => <SelectItem key={e} value={e}>{energyLabel(e)}</SelectItem>)}
          </SelectContent>
        </Select>
      </Field>
      <div className="grid grid-cols-2 gap-3">
        <Field label={form.energyType === "electric" ? "kWh" : "ליטרים"}>
          <Input inputMode="decimal" value={form.quantity} onChange={(e) => setForm({ ...form, quantity: e.target.value })} placeholder="0" />
        </Field>
        <Field label="מחיר ליחידה"><Input inputMode="decimal" value={form.pricePerUnit} onChange={(e) => setForm({ ...form, pricePerUnit: e.target.value })} placeholder="0" /></Field>
      </div>
      <div className="text-sm text-muted-foreground">סה״כ: <span className="font-semibold text-foreground">{total ? `₪${total}` : "—"}</span></div>
      <Field label="ק״מ במד-מרחק (אופציונלי)"><Input inputMode="decimal" value={form.odometer} onChange={(e) => setForm({ ...form, odometer: e.target.value })} placeholder="0" /></Field>
      <Field label="הערה"><Textarea value={form.note} onChange={(e) => setForm({ ...form, note: e.target.value })} rows={2} /></Field>
      <Button onClick={submit} className="w-full" size="lg">הוסף תדלוק</Button>
    </CardContent></Card>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <Label className="text-xs text-muted-foreground">{label}</Label>
      {children}
    </div>
  );
}
