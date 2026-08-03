import { useState } from "react";
import { useAppData, categoryLabel, netFromIncome, fmt, estimateEnergyCost, type Income, type Expense, type ExpenseCategory } from "@/lib/store";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Pencil, Trash2, TrendingUp, TrendingDown } from "lucide-react";
import { toast } from "sonner";

const expenseCats: ExpenseCategory[] = ["fuel", "insurance", "license", "maintenance", "parking", "food", "wash", "other"];

type Row = { type: "income"; item: Income } | { type: "expense"; item: Expense };

export function RecordsList({ incomes, expenses }: { incomes: Income[]; expenses: Expense[] }) {
  const { data, removeIncome, removeExpense, updateIncome, updateExpense } = useAppData();
  const c = data.settings.currency;
  const [editing, setEditing] = useState<Row | null>(null);

  const rows: Row[] = [
    ...incomes.map((item) => ({ type: "income" as const, item })),
    ...expenses.map((item) => ({ type: "expense" as const, item })),
  ].sort((a, b) => (a.item.date < b.item.date ? 1 : a.item.date > b.item.date ? -1 : 0));

  const del = (r: Row) => {
    if (!confirm("למחוק את הרשומה?")) return;
    if (r.type === "income") removeIncome(r.item.id);
    else removeExpense(r.item.id);
    toast.success("הרשומה נמחקה");
  };

  if (rows.length === 0) {
    return <Card><CardContent className="p-6 text-center text-sm text-muted-foreground">אין רשומות בטווח הזה</CardContent></Card>;
  }

  return (
    <>
      <Card>
        <CardContent className="p-0 divide-y divide-border">
          {rows.map((r) => {
            const isIncome = r.type === "income";
            const amount = isIncome ? netFromIncome(r.item as Income) : (r.item as Expense).amount;
            const km = isIncome ? (r.item as Income).km || 0 : 0;
            const energy = km > 0 ? estimateEnergyCost(km, data.vehicle, data.settings).cost : 0;
            const title = isIncome ? "הכנסה" : categoryLabel((r.item as Expense).category);

            return (
              <div key={r.item.id} className="flex items-center gap-3 p-3">
                <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${isIncome ? "bg-success/10 text-success" : "bg-destructive/10 text-destructive"}`}>
                  {isIncome ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5">
                    <span className="text-sm font-medium">{title}</span>
                    {km > 0 && (
                      <span className="rounded-full bg-muted px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground">
                        {km.toLocaleString("he-IL")} ק״מ
                      </span>
                    )}
                  </div>
                  <div className="truncate text-xs text-muted-foreground">
                    {new Date(r.item.date).toLocaleDateString("he-IL", { day: "numeric", month: "short" })}
                    {km > 0 ? ` · עלות אנרגיה משוערת ${fmt(energy, c)}` : ""}
                    {r.item.note ? ` · ${r.item.note}` : ""}
                  </div>
                </div>

                <div className={`text-sm font-bold ${isIncome ? "text-success" : "text-destructive"}`}>
                  {isIncome ? "+" : "−"}{fmt(amount, c)}
                </div>
                <div className="flex shrink-0 gap-1">
                  <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => setEditing(r)} aria-label="עריכה"><Pencil className="h-4 w-4" /></Button>
                  <Button size="icon" variant="ghost" className="h-8 w-8 text-destructive" onClick={() => del(r)} aria-label="מחיקה"><Trash2 className="h-4 w-4" /></Button>
                </div>
              </div>
            );
          })}
        </CardContent>
      </Card>

      <EditDialog
        row={editing}
        onClose={() => setEditing(null)}
        onSaveIncome={(id, patch) => { updateIncome(id, patch); toast.success("הרשומה עודכנה"); setEditing(null); }}
        onSaveExpense={(id, patch) => { updateExpense(id, patch); toast.success("הרשומה עודכנה"); setEditing(null); }}
      />
    </>
  );
}

function EditDialog({
  row, onClose, onSaveIncome, onSaveExpense,
}: {
  row: Row | null;
  onClose: () => void;
  onSaveIncome: (id: string, patch: Partial<Income>) => void;
  onSaveExpense: (id: string, patch: Partial<Expense>) => void;
}) {
  if (!row) return null;
  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-sm">
        <DialogHeader><DialogTitle>עריכת רשומה</DialogTitle></DialogHeader>
        {row.type === "income"
          ? <IncomeEdit item={row.item as Income} onSave={onSaveIncome} />
          : <ExpenseEdit item={row.item as Expense} onSave={onSaveExpense} />}
      </DialogContent>
    </Dialog>
  );
}

function IncomeEdit({ item, onSave }: { item: Income; onSave: (id: string, patch: Partial<Income>) => void }) {
  const [f, setF] = useState({
    date: item.date,
    amount: String(item.amount),
    commissionPct: String(item.commissionPct),
    tip: String(item.tip || ""),
    hours: String(item.hours || ""),
    km: String(item.km || ""),
    note: item.note || "",
  });
  const save = () => {
    const amount = parseFloat(f.amount);
    if (!amount || amount <= 0) return toast.error("סכום לא תקין");
    onSave(item.id, {
      date: f.date,
      amount,
      commissionPct: parseFloat(f.commissionPct) || 0,
      tip: parseFloat(f.tip) || 0,
      hours: parseFloat(f.hours) || 0,
      km: parseFloat(f.km) || 0,
      note: f.note.trim() || undefined,
    });
  };
  return (
    <div className="space-y-3">
      <F label="תאריך"><Input type="date" value={f.date} onChange={(e) => setF({ ...f, date: e.target.value })} /></F>
      <F label="סכום ברוטו"><Input inputMode="decimal" value={f.amount} onChange={(e) => setF({ ...f, amount: e.target.value })} /></F>
      <div className="grid grid-cols-3 gap-2">
        <F label="עמלה %"><Input inputMode="decimal" value={f.commissionPct} onChange={(e) => setF({ ...f, commissionPct: e.target.value })} /></F>
        <F label="שעות"><Input inputMode="decimal" value={f.hours} onChange={(e) => setF({ ...f, hours: e.target.value })} /></F>
        <F label="ק״מ"><Input inputMode="decimal" value={f.km} onChange={(e) => setF({ ...f, km: e.target.value })} /></F>
      </div>
      <F label="תשר"><Input inputMode="decimal" value={f.tip} onChange={(e) => setF({ ...f, tip: e.target.value })} /></F>
      <F label="הערה"><Textarea rows={2} value={f.note} onChange={(e) => setF({ ...f, note: e.target.value })} /></F>
      <DialogFooter><Button onClick={save} className="w-full">שמירה</Button></DialogFooter>
    </div>
  );
}

function ExpenseEdit({ item, onSave }: { item: Expense; onSave: (id: string, patch: Partial<Expense>) => void }) {
  const [f, setF] = useState({ date: item.date, category: item.category, amount: String(item.amount), note: item.note || "" });
  const save = () => {
    const amount = parseFloat(f.amount);
    if (!amount || amount <= 0) return toast.error("סכום לא תקין");
    onSave(item.id, { date: f.date, category: f.category, amount, note: f.note.trim() || undefined });
  };
  return (
    <div className="space-y-3">
      <F label="תאריך"><Input type="date" value={f.date} onChange={(e) => setF({ ...f, date: e.target.value })} /></F>
      <F label="קטגוריה">
        <Select value={f.category} onValueChange={(v) => setF({ ...f, category: v as ExpenseCategory })}>
          <SelectTrigger><SelectValue /></SelectTrigger>
          <SelectContent>{expenseCats.map((cat) => <SelectItem key={cat} value={cat}>{categoryLabel(cat)}</SelectItem>)}</SelectContent>
        </Select>
      </F>
      <F label="סכום"><Input inputMode="decimal" value={f.amount} onChange={(e) => setF({ ...f, amount: e.target.value })} /></F>
      <F label="הערה"><Textarea rows={2} value={f.note} onChange={(e) => setF({ ...f, note: e.target.value })} /></F>
      <DialogFooter><Button onClick={save} className="w-full">שמירה</Button></DialogFooter>
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
