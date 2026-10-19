import { useEffect, useState } from "react";
import { ChevronDown } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useAppData, effectiveFuelParams, fmt, type Income } from "@/lib/store";
import { NumberField } from "@/components/NumberField";
import { CommissionChips } from "@/components/CommissionChips";
import { CommonAmounts } from "@/components/CommonAmounts";
import { numberOr } from "@/lib/number";
import { checkDate, checkNumber } from "@/lib/validate";

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
  /** A drive between work trips: only km and time, no income. */
  betweenTrip?: boolean;
  /** End mode: save, then start the next trip right away (back-to-back rides). */
  onSaveAndNext?: (
    trip: TripFormValues,
    income: Omit<Income, "id" | "km" | "tripId"> | null,
  ) => void;
};

export function TripEndDialog({
  open,
  onOpenChange,
  mode,
  initial,
  initialIncome,
  onSave,
  onDiscard,
  onSaveAndNext,
  betweenTrip = false,
}: Props) {
  const { data, ready } = useAppData();
  const c = data.settings.currency;
  const [date, setDate] = useState(initial.date);
  const [time, setTime] = useState(initial.time);
  const [km, setKm] = useState("");
  const [driveMin, setDriveMin] = useState("");
  const [waitMin, setWaitMin] = useState("");
  const [amount, setAmount] = useState("");
  const [tip, setTip] = useState("");
  const [commission, setCommission] = useState("");
  const [showErrors, setShowErrors] = useState(false);
  // The trip details were measured; at the end of a trip only the amount is new.
  const [showDetails, setShowDetails] = useState(mode === "edit" || betweenTrip);

  // Reset the form only when the dialog opens for another trip — not on every
  // parent render (the parent passes `initial` as a fresh object each time).
  const initKey = JSON.stringify([
    initial,
    initialIncome?.id ?? null,
    initialIncome?.updatedAt ?? null,
  ]);
  const defaultCommission = data.settings.defaultCommissionPct;
  useEffect(() => {
    if (!open || !ready) return;
    setShowErrors(false);
    setShowDetails(mode === "edit" || betweenTrip);
    setDate(initial.date);
    setTime(initial.time);
    setKm(initial.km ? initial.km.toFixed(1) : "0");
    setDriveMin(String(Math.round(Math.max(0, initial.seconds - initial.waitSeconds) / 60)));
    setWaitMin(String(Math.round(initial.waitSeconds / 60)));
    setAmount(initialIncome ? String(initialIncome.amount) : "");
    setTip(initialIncome?.tip ? String(initialIncome.tip) : "");
    setCommission(String(initialIncome?.commissionPct ?? defaultCommission));
    // eslint-disable-next-line react-hooks/exhaustive-deps -- initKey stands for initial/initialIncome
  }, [open, ready, initKey]);

  const kmN = Math.max(0, numberOr(km, 0));
  const amountN = Math.max(0, numberOr(amount, 0));
  const tipN = Math.max(0, numberOr(tip, 0));
  const comN = Math.min(100, Math.max(0, numberOr(commission, 0)));
  const errors = {
    date: checkDate(date),
    km: checkNumber(km, { min: 0, max: 2000 }),
    driveMin: checkNumber(driveMin, { min: 0, max: 24 * 60 }),
    waitMin: checkNumber(waitMin, { min: 0, max: 24 * 60 }),
    commission: checkNumber(commission, { min: 0, max: 100 }),
    amount: checkNumber(amount, { min: 0 }),
    tip: checkNumber(tip, { min: 0 }),
  };
  const hasErrors = Object.values(errors).some(Boolean);
  const err = (k: keyof typeof errors) => (showErrors ? errors[k] : undefined);
  const p = effectiveFuelParams(date, data.vehicle, data.settings, time);
  const fuel = (kmN / (p.consumption || 1)) * p.price;
  const net = amountN * (1 - comN / 100) + tipN - fuel;
  const waitS = Math.max(0, numberOr(waitMin, 0) * 60);
  const totalS = Math.max(0, numberOr(driveMin, 0) * 60) + waitS;

  const tripValues = (): TripFormValues => ({
    date,
    time,
    km: Math.round(kmN * 100) / 100,
    seconds: totalS,
    waitSeconds: waitS,
  });

  const save = (withIncome: boolean, next = false) => {
    if (hasErrors) {
      setShowErrors(true);
      // Every field except the amount and the tip sits in the details.
      if (Object.entries(errors).some(([k, e]) => e && k !== "amount" && k !== "tip"))
        setShowDetails(true);
      return;
    }
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
    if (next && onSaveAndNext) onSaveAndNext(tripValues(), income);
    else onSave(tripValues(), income);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[92vh] overflow-y-auto sm:max-w-md" dir="rtl">
        <DialogHeader className="text-right">
          <DialogTitle className="text-xl font-extrabold">
            {betweenTrip ? "נסיעה בין נסיעות" : mode === "end" ? "הנסיעה הסתיימה" : "עריכת נסיעה"}
          </DialogTitle>
          <DialogDescription>
            {betweenTrip
              ? "נשמר לחישוב הדלק, לא כנסיעת עבודה. אפשר לתקן ק״מ וזמן."
              : mode === "end"
                ? "הק״מ והזמן נמדדו. נשאר רק להוסיף סכום."
                : "אפשר לתקן כל פרט."}
          </DialogDescription>
        </DialogHeader>

        {!betweenTrip && (
          <>
            <div className="grid grid-cols-2 gap-3">
              <F label={`סכום שקיבלת (${c})`}>
                <NumberField
                  autoFocus={mode === "end"}
                  placeholder="0"
                  className="h-14 text-2xl font-bold"
                  value={amount}
                  onValueChange={setAmount}
                  error={err("amount")}
                  enterKeyHint="done"
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && amountN > 0) save(true);
                  }}
                />
              </F>
              <F label={`טיפ (${c})`}>
                <NumberField
                  placeholder="0"
                  className="h-14 text-xl"
                  value={tip}
                  onValueChange={setTip}
                  error={err("tip")}
                />
              </F>
            </div>
            <CommonAmounts onPick={setAmount} />
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground">עמלה:</span>
              <CommissionChips
                value={commission}
                defaultPct={defaultCommission}
                onPick={setCommission}
              />
            </div>

            <div className="num flex items-center justify-between rounded-2xl bg-muted/60 px-4 py-3 text-sm">
              <span className="text-muted-foreground">דלק משוער {fmt(fuel, c)}</span>
              <span
                className={`text-lg font-extrabold ${net >= 0 ? "text-success" : "text-destructive"}`}
              >
                נטו {fmt(net, c)}
              </span>
            </div>
          </>
        )}

        {!betweenTrip && (
          <button
            type="button"
            onClick={() => setShowDetails((v) => !v)}
            aria-expanded={showDetails}
            className="num flex w-full items-center justify-between rounded-xl border border-border px-3 py-2 text-xs text-muted-foreground"
          >
            <span className="font-semibold text-foreground">פרטי הנסיעה</span>
            <span className="flex items-center gap-1">
              {kmN.toFixed(1)} ק״מ · {Math.round(totalS / 60)} דק׳ · עמלה {comN}%
              <ChevronDown
                className={`h-3.5 w-3.5 transition-transform ${showDetails ? "rotate-180" : ""}`}
              />
            </span>
          </button>
        )}
        {(showDetails || betweenTrip) && (
          <div className="grid grid-cols-2 gap-3">
            <F label="תאריך">
              <Input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                aria-invalid={err("date") ? true : undefined}
              />
              {err("date") && (
                <p className="text-[11px] font-medium text-destructive" role="alert">
                  {err("date")}
                </p>
              )}
            </F>
            <F label="שעת התחלה">
              <Input type="time" value={time} onChange={(e) => setTime(e.target.value)} />
            </F>
            <F label="ק״מ">
              <NumberField value={km} onValueChange={setKm} error={err("km")} />
            </F>
            <F label="דקות נהיגה">
              <NumberField
                inputMode="numeric"
                value={driveMin}
                onValueChange={setDriveMin}
                error={err("driveMin")}
              />
            </F>
            <F label="דקות המתנה">
              <NumberField
                inputMode="numeric"
                value={waitMin}
                onValueChange={setWaitMin}
                error={err("waitMin")}
              />
            </F>
            {!betweenTrip && (
              <F label="עמלה %">
                <NumberField
                  value={commission}
                  onValueChange={setCommission}
                  error={err("commission")}
                />
              </F>
            )}
          </div>
        )}

        <div className="grid gap-2">
          {betweenTrip && (
            <Button className="h-14 text-lg font-bold" onClick={() => save(false)}>
              שמור
            </Button>
          )}
          {!betweenTrip && (
            <Button
              className="reward-action h-14 text-lg font-bold"
              onClick={() => save(true)}
              disabled={amountN <= 0}
            >
              שמור עם הסכום
            </Button>
          )}
          {mode === "end" && onSaveAndNext && (
            <Button
              variant="secondary"
              className="reward-action h-12 font-bold"
              onClick={() => save(true, true)}
              disabled={amountN <= 0}
            >
              שמור והתחל נסיעה הבאה
            </Button>
          )}
          {!betweenTrip && (
            <Button variant="outline" className="reward-action h-12" onClick={() => save(false)}>
              {mode === "end"
                ? "שמור בלי סכום"
                : initialIncome
                  ? "שמור והסר סכום"
                  : "שמור בלי סכום"}
            </Button>
          )}
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
