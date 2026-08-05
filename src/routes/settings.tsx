import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { useAppData, type VehicleType } from "@/lib/store";
import { PageHeader } from "@/components/PageHeader";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Trash2, RefreshCw } from "lucide-react";
import { useServerFn } from "@tanstack/react-start";
import { getOnlineFuelPrice } from "@/lib/fuel-price.functions";


export const Route = createFileRoute("/settings")({
  head: () => ({ meta: [{ title: "הגדרות - דרייבר" }, { name: "description", content: "הגדרות, יעדים ופרטי רכב." }] }),
  component: SettingsPage,
});

function SettingsPage() {
  const { data, ready, updateSettings, updateVehicle, update } = useAppData();
  const [s, setS] = useState(data.settings);
  const [v, setV] = useState(data.vehicle);
  const [loadingPrice, setLoadingPrice] = useState(false);
  const fetchPrice = useServerFn(getOnlineFuelPrice);

  useEffect(() => { if (ready) { setS(data.settings); setV(data.vehicle); } }, [ready, data.settings, data.vehicle]);

  const syncFuelPrice = async () => {
    setLoadingPrice(true);
    try {
      const res = await fetchPrice();
      if (res.ok) {
        setS((prev) => ({ ...prev, fuelPrice: res.price }));
        updateSettings({ fuelPrice: res.price });
        toast.success(`מחיר עודכן: ₪${res.price} לליטר`);
      } else {
        toast.error(res.error || "לא הצלחתי לעדכן מחיר");
      }
    } catch {
      toast.error("לא הצלחתי לעדכן מחיר");
    } finally {
      setLoadingPrice(false);
    }
  };


  const saveSettings = () => {
    updateSettings({
      dailyGoal: Number(s.dailyGoal) || 0,
      fixedMonthlyExpenses: Number(s.fixedMonthlyExpenses) || 0,
      workDaysPerMonth: Number(s.workDaysPerMonth) || 1,
      defaultCommissionPct: Number(s.defaultCommissionPct) || 0,
      fuelPrice: Number(s.fuelPrice) || 0,
      currency: s.currency || "₪",
    });
    toast.success("הגדרות נשמרו");
  };

  const saveVehicle = () => {
    updateVehicle({ ...v, consumption: Number(v.consumption) || 0 });
    toast.success("פרטי רכב נשמרו");
  };

  const resetAll = () => {
    if (!confirm("למחוק את כל הנתונים? פעולה זו לא ניתנת לביטול.")) return;
    update(() => ({ incomes: [], expenses: [], vehicle: v, settings: s }));
    toast.success("כל הנתונים נמחקו");
  };

  if (!ready) return null;

  return (
    <div className="mx-auto max-w-xl">
      <PageHeader title="הגדרות" subtitle="יעדים, רכב, ונתונים" />

      <div className="px-4 space-y-4">
        <AccountCard />

        <Card>
          <CardContent className="p-4 space-y-3">
            <h3 className="font-semibold">יעדים ותקציב</h3>
            <Field label="יעד רווח יומי (₪)">
              <Input inputMode="decimal" value={s.dailyGoal} onChange={(e) => setS({ ...s, dailyGoal: Number(e.target.value) })} />
            </Field>
            <Field label="הוצאות קבועות חודשיות (ביטוח, רישוי, ליסינג וכו׳)">
              <Input inputMode="decimal" value={s.fixedMonthlyExpenses} onChange={(e) => setS({ ...s, fixedMonthlyExpenses: Number(e.target.value) })} />
            </Field>
            <Field label="ימי עבודה בחודש (ממוצע)">
              <Input inputMode="decimal" value={s.workDaysPerMonth} onChange={(e) => setS({ ...s, workDaysPerMonth: Number(e.target.value) })} />
            </Field>
            <Field label="עמלת חברה ברירת מחדל (%)">
              <Input inputMode="decimal" value={s.defaultCommissionPct} onChange={(e) => setS({ ...s, defaultCommissionPct: Number(e.target.value) })} />
            </Field>
            <Button onClick={saveSettings} className="w-full">שמור</Button>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 space-y-3">
            <h3 className="font-semibold">הרכב שלי</h3>
            <div className="grid grid-cols-2 gap-3">
              <Field label="יצרן"><Input value={v.make} onChange={(e) => setV({ ...v, make: e.target.value })} /></Field>
              <Field label="דגם"><Input value={v.model} onChange={(e) => setV({ ...v, model: e.target.value })} /></Field>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Field label="שנה"><Input value={v.year} onChange={(e) => setV({ ...v, year: e.target.value })} /></Field>
              <Field label="מספר רישוי"><Input value={v.plate} onChange={(e) => setV({ ...v, plate: e.target.value })} /></Field>
            </div>
            <Field label="סוג רכב">
              <Select value={v.type} onValueChange={(val) => setV({ ...v, type: val as VehicleType })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="petrol">בנזין / סולר</SelectItem>
                  <SelectItem value="hybrid">היברידי</SelectItem>
                  <SelectItem value="electric">חשמלי</SelectItem>
                </SelectContent>
              </Select>
            </Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label={v.type === "electric" ? "צריכה (ק״מ ל-kWh)" : "צריכה (ק״מ לליטר)"}>
                <Input inputMode="decimal" value={v.consumption} onChange={(e) => setV({ ...v, consumption: Number(e.target.value) })} />
              </Field>
              <Field label={v.type === "electric" ? "מחיר kWh (₪)" : "מחיר ליטר (₪)"}>
                <Input inputMode="decimal" value={s.fuelPrice} onChange={(e) => setS({ ...s, fuelPrice: Number(e.target.value) })} onBlur={saveSettings} />
              </Field>
            </div>
            {v.type !== "electric" && (
              <Button variant="outline" className="w-full" disabled={loadingPrice} onClick={syncFuelPrice}>
                <RefreshCw className={`h-4 w-4 ml-1 ${loadingPrice ? "animate-spin" : ""}`} />
                {loadingPrice ? "מעדכן..." : "עדכן מחיר דלק אונליין (95)"}
              </Button>
            )}
            <p className="text-xs text-muted-foreground">לפי הצריכה והמחיר מחושבת עלות דלק משוערת לכל ק״מ שנסעת. המחיר האונליין הוא המחיר המרבי לצרכן בשירות עצמי, מתעדכן אחת לחודש.</p>

            <Button onClick={saveVehicle} className="w-full">שמור רכב</Button>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 space-y-3">
            <h3 className="font-semibold text-destructive">אזור מסוכן</h3>
            <p className="text-xs text-muted-foreground">מחיקה של כל ההכנסות וההוצאות. הגדרות ופרטי רכב יישמרו.</p>
            <Button variant="destructive" onClick={resetAll} className="w-full"><Trash2 className="h-4 w-4 ml-1" />מחק את כל הנתונים</Button>
            <div className="text-xs text-muted-foreground text-center pt-2">
              {data.incomes.length} הכנסות · {data.expenses.length} הוצאות
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
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
