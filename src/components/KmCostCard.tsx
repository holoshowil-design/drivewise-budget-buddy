import { Card, CardContent } from "@/components/ui/card";
import { Route as GaugeIcon } from "lucide-react";
import {
  filterByDate,
  filterByRange,
  monthRange,
  sumKm,
  sumExpenses,
  estimateEnergyCost,
  energyUnitLabel,
  todayISO,
  fmt,
  type AppData,
} from "@/lib/store";

export function KmCostCard({ data }: { data: AppData }) {
  const c = data.settings.currency;
  const unit = energyUnitLabel(data.vehicle);

  const today = todayISO();
  const now = new Date();
  const { from, to } = monthRange(now.getFullYear(), now.getMonth());

  const kmToday = sumKm(filterByDate(data.incomes, today));
  const monthIncomes = filterByRange(data.incomes, from, to);
  const kmMonth = sumKm(monthIncomes);

  const estToday = estimateEnergyCost(kmToday, data.vehicle, data.settings);
  const estMonth = estimateEnergyCost(kmMonth, data.vehicle, data.settings);

  const actualMonth = sumExpenses(
    filterByRange(data.expenses, from, to).filter((e) => e.category === "fuel"),
  );
  const diff = actualMonth - estMonth.cost;

  if (kmMonth === 0 && kmToday === 0) {
    return (
      <Card>
        <CardContent className="p-4">
          <h3 className="mb-1 flex items-center gap-1.5 text-sm font-semibold">
            <GaugeIcon className="h-4 w-4 text-primary" /> קילומטרים ועלות דלק
          </h3>
          <p className="text-xs text-muted-foreground">
            הוסף ק״מ בהזנת ההכנסה כדי לראות כמה נסעת וכמה זה עלה לך באנרגיה.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent className="p-4">
        <div className="mb-3 flex items-center justify-between">
          <h3 className="flex items-center gap-1.5 text-sm font-semibold">
            <GaugeIcon className="h-4 w-4 text-primary" /> קילומטרים ועלות דלק
          </h3>
          <span className="text-[11px] text-muted-foreground">
            {data.vehicle.consumption} ק״מ/{unit} · {data.settings.fuelPrice}{c}/{unit}
          </span>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Block
            title="היום"
            km={kmToday}
            cost={estToday.cost}
            units={estToday.units}
            unit={unit}
            currency={c}
          />
          <Block
            title="החודש"
            km={kmMonth}
            cost={estMonth.cost}
            units={estMonth.units}
            unit={unit}
            currency={c}
          />
        </div>

        <div className="mt-3 space-y-1 border-t pt-3 text-xs text-muted-foreground">
          <div className="flex justify-between">
            <span>עלות אנרגיה משוערת לק״מ</span>
            <span className="font-semibold text-foreground">
              {estToday.costPerKm.toFixed(2)}{c}
            </span>
          </div>
          <div className="flex justify-between">
            <span>תדלוקים בפועל החודש</span>
            <span className="font-semibold text-foreground">{fmt(actualMonth, c)}</span>
          </div>
          {actualMonth > 0 && kmMonth > 0 && (
            <div className="flex justify-between">
              <span>{diff >= 0 ? "שילמת יותר מהמשוער" : "שילמת פחות מהמשוער"}</span>
              <span className={`font-semibold ${diff >= 0 ? "text-destructive" : "text-success"}`}>
                {fmt(Math.abs(Math.round(diff)), c)}
              </span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
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
      <div className="text-xl font-bold tracking-tight">
        {Math.round(km).toLocaleString("he-IL")} <span className="text-xs font-medium">ק״מ</span>
      </div>
      <div className="mt-0.5 text-xs text-muted-foreground">
        ≈ {fmt(Math.round(cost), currency)} · {units.toFixed(1)} {unit}
      </div>
    </div>
  );
}
