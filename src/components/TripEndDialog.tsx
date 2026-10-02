import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useAppData, effectiveFuelParams, fmt, type Income } from "@/lib/store";

export type TripFormValues = {
  date: string;
  time: string;
  km: number;
  seconds: number;
  waitSeconds: number;
};

type Props = {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  mode: "end" | "edit";
  initial: TripFormValues;
  initialIncome?: Income | null;
  onSave: (trip: TripFormValues, income: Omit<Income, "id" | "km" | "tripId"> | null) => void;
  onDiscard?: () => void;
};

export function TripEndDialog({ open, onOpenChange, mode, initial, initialIncome, onSave, onDiscard }: Props) {
  const { data } = useAppData();
  const c = data.settings.currency;
  const [date, setDate] = useState(initial.date);
  const [time, setTime] = useState(initial.time);
  const [km, setKm] = useState("");
  const [driveMin, setDriveMin] = useState("");
  const [waitMin, setWaitMin] = useState("");
  const [amount, setAmount] = useState("");
  const [tip, setTip] = useState("");
  const [commission, setCommission] = useState("");

  useEffect(() => {
    if (!open) return;
    setDate(initial.date);
    setTime(initial.time);
    setKm(initial.km ? initial.km.toFixed(1) : "0");
    setDriveMin(String(Math.round(Math.max(0, initial.seconds - initial.waitSeconds) / 60)));
    setWaitMin(String(Math.round(initial.waitSeconds / 60)));
    setAmount(initialIncome ? String(initialIncome.amount) : "");
    setTip(initialIncome?.tip ? String(initialIncome.tip) : "");
    setCommission(String(initialIncome?.commissionPct ?? 0));
  }, [open, initial, initialIncome]);

  const kmN = Math.max(0, Number(km) || 0);
  const amountN = Math.max(0, Number(amount) || 0);
  const tipN = Math.max(0, Number(tip) || 0);
  const comN = Math.min(100, Math.max(0, Number(commission) || 0));
  const p = effectiveFuelParams(date, data.vehicle, data.settings, time);
  const fuel = (kmN / (p.consumption || 1)) * p.price;
  const net = amountN * (1 - comN / 100) + tipN - fuel;
  const waitS = Math.max(0, (Number(waitMin) || 0) * 60);
  const totalS = Math.max(0, (Number(driveMin) || 0) * 60) + waitS;

  const tripValues = (): TripFormValues => ({ date, time, km: Math.round(kmN * 100) / 100, seconds: totalS, waitSeconds: waitS });

  const save = (withIncome: boolean) => {
    const income =
      withIncome && amountN > 0
        ? {
            date,
            time,
            amount: amountN,
            tip: tipN,
            commissionPct: comN,
            platform: initialIncome?.platform ?? "פרטי",
            hours: Math.round((totalS / 3600) * 100) / 100,
            note: initialIncome?.note ?? "נסיעת GPS",
          }
        : null;
    onSave(tripValues(), income);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[92vh] overflow-y-auto sm:max-w-md" dir="rtl">
        <DialogHeader className="text-right">
          <DialogTitle className="text-xl font-extrabold">{mode === "end" ? "הנסיעה הסתיימה" : "עריכת נסיעה"}</DialogTitle>
          <DialogDescription>הנתונים מולאו אוטומטית. נשאר רק להוסיף סכום.</DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-2 gap-3">
          <F label="תאריך"><Input type="date" value={date} onChange={(e) => setDate(e.target.value)} /></F>
          <F label="שעת התחלה"><Input type="time" value={time} onChange={(e) => setTime(e.target.value)} /></F>
          <F label="ק״מ"><Input inputMode="decimal" value={km} onChange={(e) => setKm(e.target.value)} /></F>
          <F label="דקות נהיגה"><Input inputMode="numeric" value={driveMin} onChange={(e) => setDriveMin(e.target.value)} /></F>
          <F label="דקות המתנה"><Input inputMode="numeric" value={waitMin} onChange={(e) => setWaitMin(e.target.value)} /></F>
          <F label="עמלה %"><Input inputMode="decimal" value={commission} onChange={(e) => setCommission(e.target.value)} /></F>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <F label={`סכום שקיבלת (${c})`}>
            <Input inputMode="decimal" autoFocus={mode === "end"} placeholder="0" className="h-14 text-2xl font-bold" value={amount} onChange={(e) => setAmount(e.target.value)} />
          </F>
          <F label={`טיפ (${c})`}>
            <Input inputMode="decimal" placeholder="0" className="h-14 text-xl" value={tip} onChange={(e) => setTip(e.target.value)} />
          </F>
        </div>

        <div className="num flex items-center justify-between rounded-2xl bg-muted/60 px-4 py-3 text-sm">
          <span className="text-muted-foreground">דלק משוער {fmt(fuel, c)}</span>
          <span className={`text-lg font-extrabold ${net >= 0 ? "text-success" : "text-destructive"}`}>נטו {fmt(net, c)}</span>
        </div>

        <div className="grid gap-2">
          <Button className="h-14 text-lg font-bold" onClick={() => save(true)} disabled={amountN <= 0}>
            שמור עם הסכום
          </Button>
          <Button variant="outline" className="h-12" onClick={() => save(false)}>
            {mode === "end" ? "שמור בלי סכום" : initialIncome ? "שמור והסר סכום" : "שמור בלי סכום"}
          </Button>
          {onDiscard && (
            <Button variant="ghost" className="h-10 text-destructive" onClick={onDiscard}>
              {mode === "end" ? "בטל נסיעה (לא לשמור)" : "מחק נסיעה"}
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

function F({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1">
      <Label className="text-xs text-muted-foreground">{label}</Label>
      {children}
    </div>
  );
}
