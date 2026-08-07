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
import { Trash2, RefreshCw, CloudCheck, LogOut, LogIn, Download, Upload } from "lucide-react";
import { useAuthUser } from "@/hooks/use-auth";
import { supabase } from "@/integrations/supabase/client";
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
        const stamp = new Date().toISOString();
        setS((prev) => ({ ...prev, fuelPrice: res.price, fuelPriceUpdatedAt: stamp }));
        updateSettings({ fuelPrice: res.price, fuelPriceUpdatedAt: stamp });
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
            <p className="text-xs text-muted-foreground">
              לפי הצריכה והמחיר מחושבת עלות דלק משוערת לכל ק״מ שנסעת. המחיר האונליין הוא המחיר המרבי לצרכן בשירות עצמי, מתעדכן אחת לחודש.
              {s.fuelPriceUpdatedAt && ` עודכן לאחרונה: ${new Date(s.fuelPriceUpdatedAt).toLocaleDateString("he-IL")}.`}
            </p>

            <Button onClick={saveVehicle} className="w-full">שמור רכב</Button>
          </CardContent>
        </Card>

        <BackupCard />

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

function AccountCard() {
  const { user, loading } = useAuthUser();
  if (loading) return null;
  return (
    <Card>
      <CardContent className="p-4 space-y-3">
        <h3 className="font-semibold">חשבון וגיבוי בענן</h3>
        {user ? (
          <>
            <div className="flex items-center gap-2 text-sm">
              <CloudCheck className="h-4 w-4 text-primary" />
              <span className="text-muted-foreground">מחובר כ־</span>
              <span dir="ltr" className="font-medium">{user.email}</span>
            </div>
            <p className="text-xs text-muted-foreground">כל שינוי נשמר אוטומטית בענן וזמין בכל מכשיר שתתחבר בו.</p>
            <Button
              variant="outline"
              className="w-full"
              onClick={async () => {
                await supabase.auth.signOut();
                toast.success("התנתקת");
              }}
            >
              <LogOut className="h-4 w-4 ml-1" />
              התנתק
            </Button>
          </>
        ) : (
          <>
            <p className="text-xs text-muted-foreground">
              כרגע הנתונים שמורים רק בטלפון הזה. התחבר כדי לגבות אותם בענן ולראות אותם בכל מכשיר.
            </p>
            <Button className="w-full" onClick={() => navigateToAuth()}>
              <LogIn className="h-4 w-4 ml-1" />
              התחבר / הרשמה
            </Button>
          </>
        )}
      </CardContent>
    </Card>
  );
}

function navigateToAuth() {
  window.location.href = "/auth";
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <Label className="text-xs text-muted-foreground">{label}</Label>
      {children}
    </div>
  );
}

/** Local backup: export the whole dataset to a JSON file and restore it later. */
function BackupCard() {
  const { data, update } = useAppData();
  const inputId = "restore-file";

  const exportJson = () => {
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `driver-backup-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("קובץ גיבוי נוצר");
  };

  const importJson = async (file: File) => {
    try {
      const parsed = JSON.parse(await file.text());
      if (!Array.isArray(parsed.incomes) || !Array.isArray(parsed.expenses)) throw new Error("bad");
      update((d) => {
        const byId = <T extends { id: string }>(a: T[], b: T[]) => {
          const map = new Map(a.map((x) => [x.id, x]));
          b.forEach((x) => map.set(x.id, x));
          return [...map.values()];
        };
        return {
          ...d,
          incomes: byId(d.incomes, parsed.incomes),
          expenses: byId(d.expenses, parsed.expenses),
          vehicle: { ...d.vehicle, ...(parsed.vehicle || {}) },
          settings: { ...d.settings, ...(parsed.settings || {}) },
        };
      });
      toast.success("הגיבוי שוחזר ומוזג עם הנתונים הקיימים");
    } catch {
      toast.error("קובץ לא תקין");
    }
  };

  return (
    <Card>
      <CardContent className="p-4 space-y-3">
        <h3 className="font-semibold">גיבוי מקומי</h3>
        <p className="text-xs text-muted-foreground">שמור עותק של כל הנתונים כקובץ, ושחזר אותו בכל זמן. השחזור ממזג ולא מוחק רשומות קיימות.</p>
        <div className="grid grid-cols-2 gap-3">
          <Button variant="outline" onClick={exportJson}>
            <Download className="h-4 w-4 ml-1" />ייצוא גיבוי
          </Button>
          <Button variant="outline" onClick={() => document.getElementById(inputId)?.click()}>
            <Upload className="h-4 w-4 ml-1" />שחזור מקובץ
          </Button>
        </div>
        <input
          id={inputId}
          type="file"
          accept="application/json"
          className="hidden"
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) void importJson(f);
            e.target.value = "";
          }}
        />
      </CardContent>
    </Card>
  );
}
