import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Route as GaugeIcon, Fuel } from "lucide-react";
import { toast } from "sonner";
import {
  monthRange,
  energyUnitLabel,
  todayISO,
  fmt,
  fmtPrecise,
  useAppData,
  type AppData,
} from "@/lib/store";
import { dayOf, fuelComparison, sumDays, useDays } from "@/lib/calc";

export function KmCostCard({ data }: { data: AppData }) {
  const { recordFuelPriceChange } = useAppData();
  const days = useDays(data);
  const c = data.settings.currency;
  const unit = energyUnitLabel(data.vehicle);

  const today = todayISO();
  const now = new Date();
  const { from, to } = monthRange(now.getFullYear(), now.getMonth());
  const day = dayOf(days, today, data);
  const month = sumDays(days, from, to);
  const units = (cost: number) =>
    data.settings.fuelPrice > 0 ? cost / data.settings.fuelPrice : 0;
  const costPerKm =
    month.km > 0
      ? month.fuelEstimated / month.km
      : data.settings.fuelPrice / (data.vehicle.consumption || 1);
  const cmp = fuelComparison(month, data);

  const applyConsumption = (consumption: number) => {
    recordFuelPriceChange(data.settings.fuelPrice, consumption);
    toast.success(`הצריכה עודכנה ל-${consumption} ק״מ/${unit}, מהיום והלאה`);
  };

  if (month.km === 0 && day.km === 0) {
    return (
      <Card className="card-lift animate-fade-in-up">
        <CardContent className="p-4">
          <h3 className="mb-1 flex items-center gap-1.5 text-sm font-semibold">
            <GaugeIcon className="h-4 w-4 text-primary" /> קילומטרים ועלות דלק
          </h3>
          <p className="text-xs text-muted-foreground">
            הפעל מעקב נסיעה או הוסף ק״מ בהזנת ההכנסה כדי לראות כמה נסעת וכמה זה עלה לך באנרגיה.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="card-lift animate-fade-in-up">
      <CardContent className="p-4">
        <div className="mb-3 flex items-center justify-between">
          <h3 className="flex items-center gap-1.5 text-sm font-semibold">
            <GaugeIcon className="h-4 w-4 text-primary" /> קילומטרים ועלות דלק
          </h3>
          <span className="num text-[11px] text-muted-foreground">
            {data.vehicle.consumption} ק״מ/{unit} · {data.settings.fuelPrice}
            {c}/{unit}
          </span>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Block
            title="היום"
            km={day.km}
            cost={day.fuelEstimated}
            units={units(day.fuelEstimated)}
            unit={unit}
            currency={c}
          />
          <Block
            title="החודש"
            km={month.km}
            cost={month.fuelEstimated}
            units={units(month.fuelEstimated)}
            unit={unit}
            currency={c}
          />
        </div>

        <div className="mt-3 rounded-xl border bg-muted/40 p-3">
          <div className="mb-2 flex items-center gap-1.5 text-xs font-semibold">
            <Fuel className="h-3.5 w-3.5 text-warning" /> נטו אחרי דלק
          </div>
          <div className="grid grid-cols-2 gap-3">
            <NetBlock
              label="היום"
              net={day.incomeNet - day.fuelEstimated}
              fuel={day.fuelEstimated}
              currency={c}
            />
            <NetBlock
              label="החודש"
              net={month.incomeNet - month.fuelEstimated}
              fuel={month.fuelEstimated}
              currency={c}
            />
          </div>
          <p className="mt-2 text-[11px] leading-relaxed text-muted-foreground">
            הדלק יורד מהנטו לפי הק״מ שנסעת (GPS וידני), גם בימים שלא תדלקת. התדלוקים עצמם משמשים
            להשוואה.
          </p>
        </div>

        <div className="mt-3 space-y-1 border-t pt-3 text-xs text-muted-foreground">
          <div className="flex justify-between">
            <span>עלות אנרגיה משוערת לק״מ</span>
            <span className="num font-semibold text-foreground">{fmtPrecise(costPerKm, c)}</span>
          </div>
          {month.betweenKm > 0 && (
            <div className="flex justify-between">
              <span>מתוכם בין נסיעות (ללא נוסע)</span>
              <span className="num font-semibold text-foreground">
                {Math.round(month.betweenKm).toLocaleString("he-IL")} ק״מ ·{" "}
                {fmt(month.fuelEstimated * (month.betweenKm / month.km), c)}
              </span>
            </div>
          )}
          <div className="flex justify-between">
            <span>תדלוקים בפועל החודש</span>
            <span className="num font-semibold text-foreground">{fmt(cmp.actual, c)}</span>
          </div>
          {cmp.actual > 0 && month.km > 0 && (
            <div className="flex justify-between">
              <span>{cmp.diff >= 0 ? "תדלקת יותר מהמשוער" : "תדלקת פחות מהמשוער"}</span>
              <span
                className={`num font-semibold ${cmp.diff >= 0 ? "text-destructive" : "text-success"}`}
              >
                {fmt(Math.abs(Math.round(cmp.diff)), c)}
              </span>
            </div>
          )}
          {cmp.suggestedConsumption !== null && (
            <div className="mt-2 rounded-lg bg-warning/10 p-2.5 text-foreground">
              <p className="text-[11px] leading-relaxed">
                לפי התדלוקים החודש הרכב עושה בערך {cmp.suggestedConsumption} ק״מ ל{unit} (מוגדר{" "}
                {data.vehicle.consumption}). אם רשמת את כל הק״מ, כדאי לעדכן.
              </p>
              <Button
                size="sm"
                variant="outline"
                className="mt-2 h-8 w-full"
                onClick={() => applyConsumption(cmp.suggestedConsumption!)}
              >
                עדכן צריכה ל-{cmp.suggestedConsumption}
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

function NetBlock({
  label,
  net,
  fuel,
  currency,
}: {
  label: string;
  net: number;
  fuel: number;
  currency: string;
}) {
  return (
    <div>
      <div className="text-[11px] text-muted-foreground">{label}</div>
      <div
        className={`num text-lg font-bold tracking-tight ${net >= 0 ? "text-success" : "text-destructive"}`}
      >
        {fmt(net, currency)}
      </div>
      <div className="num text-[11px] text-muted-foreground">דלק משוער −{fmt(fuel, currency)}</div>
    </div>
  );
}

function Block({
  title,
  km,
  cost,
  units,
  unit,
  currency,
}: {
  title: string;
  km: number;
  cost: number;
  units: number;
  unit: string;
  currency: string;
}) {
  return (
    <div className="rounded-lg bg-muted/50 p-3">
      <div className="text-[11px] text-muted-foreground">{title}</div>
      <div className="num text-xl font-bold tracking-tight">
        {Math.round(km).toLocaleString("he-IL")} <span className="text-xs font-medium">ק״מ</span>
      </div>
      <div className="num mt-0.5 text-xs text-muted-foreground">
        ≈ {fmt(Math.round(cost), currency)} · {units.toFixed(1)} {unit}
      </div>
    </div>
  );
}
