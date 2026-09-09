import { Card, CardContent } from "@/components/ui/card";
import { Route as GaugeIcon, Fuel } from "lucide-react";
import {
  filterByDate,
  filterByRange,
  monthRange,
  sumKm,
  sumTripKm,
  estimateTripEnergyCost,
  sumIncomes,
  sumExpenses,
  estimateEnergyCostByDate,
  fuelCostFor,
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

  const todayIncomes = filterByDate(data.incomes, today);
  const todayExpenses = filterByDate(data.expenses, today);
  const monthIncomes = filterByRange(data.incomes, from, to);
  const monthExpenses = filterByRange(data.expenses, from, to);

  const todayTrips = filterByDate(data.trips ?? [], today);
  const monthTrips = filterByRange(data.trips ?? [], from, to);

  const tripKmToday = sumTripKm(todayTrips);
  const tripKmMonth = sumTripKm(monthTrips);
  const tripEstToday = estimateTripEnergyCost(todayTrips, data.vehicle, data.settings);
  const tripEstMonth = estimateTripEnergyCost(monthTrips, data.vehicle, data.settings);

  const manualKmToday = sumKm(todayIncomes);
  const manualKmMonth = sumKm(monthIncomes);
  const kmToday = manualKmToday + tripKmToday;
  const kmMonth = manualKmMonth + tripKmMonth;

  const estIncomeToday = estimateEnergyCostByDate(todayIncomes, data.vehicle, data.settings);
  const estIncomeMonth = estimateEnergyCostByDate(monthIncomes, data.vehicle, data.settings);
  const estToday = {
    cost: estIncomeToday.cost + tripEstToday.cost,
    units: estIncomeToday.units + tripEstToday.units,
    costPerKm: estIncomeToday.costPerKm,
  };
  const estMonth = {
    cost: estIncomeMonth.cost + tripEstMonth.cost,
    units: estIncomeMonth.units + tripEstMonth.units,
    costPerKm: estIncomeMonth.costPerKm,
  };

  const fuelToday = fuelCostFor(todayIncomes, todayExpenses, data.vehicle, data.settings, todayTrips);
  const fuelMonth = fuelCostFor(monthIncomes, monthExpenses, data.vehicle, data.settings, monthTrips);

  const netAfterFuelToday = sumIncomes(todayIncomes) - fuelToday.charged;
  const netAfterFuelMonth = sumIncomes(monthIncomes) - fuelMonth.charged;

  const actualMonth = sumExpenses(monthExpenses.filter((e) => e.category === "fuel"));
  const diff = actualMonth - estMonth.cost;

  if (kmMonth === 0 && kmToday === 0) {
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
            {data.vehicle.consumption} ק״מ/{unit} · {data.settings.fuelPrice}{c}/{unit}
          </span>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Block title="היום" km={kmToday} cost={estToday.cost} units={estToday.units} unit={unit} currency={c} />
          <Block title="החודש" km={kmMonth} cost={estMonth.cost} units={estMonth.units} unit={unit} currency={c} />
        </div>

        {/* Net after fuel — shown even on days without an actual refuel */}
        <div className="mt-3 rounded-xl border bg-muted/40 p-3">
          <div className="mb-2 flex items-center gap-1.5 text-xs font-semibold">
            <Fuel className="h-3.5 w-3.5 text-warning" /> נטו אחרי דלק
          </div>
          <div className="grid grid-cols-2 gap-3">
            <NetBlock
              label="היום"
              net={netAfterFuelToday}
              fuel={fuelToday.charged}
              estimated={fuelToday.actual === 0}
              currency={c}
            />
            <NetBlock
              label="החודש"
              net={netAfterFuelMonth}
              fuel={fuelMonth.charged}
              estimated={fuelMonth.actual === 0}
              currency={c}
            />
          </div>
          <p className="mt-2 text-[11px] leading-relaxed text-muted-foreground">
            גם בימים שלא תדלקת, הדלק יורד מהנטו לפי הק״מ שנסעת — כך תמיד רואים את הרווח האמיתי.
          </p>
        </div>

        {tripKmMonth > 0 && (
          <div className="num mt-2 flex justify-between rounded-lg bg-muted/40 px-3 py-2 text-[11px] text-muted-foreground">
            <span>ידני {Math.round(manualKmMonth).toLocaleString("he-IL")} ק״מ</span>
            <span>מעקב GPS {tripKmMonth.toFixed(1)} ק״מ</span>
          </div>
        )}

        <div className="mt-3 space-y-1 border-t pt-3 text-xs text-muted-foreground">
          <div className="flex justify-between">
            <span>עלות אנרגיה משוערת לק״מ</span>
            <span className="num font-semibold text-foreground">{estMonth.costPerKm.toFixed(2)}{c}</span>
          </div>
          <div className="flex justify-between">
            <span>תדלוקים בפועל החודש</span>
            <span className="num font-semibold text-foreground">{fmt(actualMonth, c)}</span>
          </div>
          {actualMonth > 0 && kmMonth > 0 && (
            <div className="flex justify-between">
              <span>{diff >= 0 ? "שילמת יותר מהמשוער" : "שילמת פחות מהמשוער"}</span>
              <span className={`num font-semibold ${diff >= 0 ? "text-destructive" : "text-success"}`}>
                {fmt(Math.abs(Math.round(diff)), c)}
              </span>
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
  estimated,
  currency,
}: {
  label: string;
  net: number;
  fuel: number;
  estimated: boolean;
  currency: string;
}) {
  return (
    <div>
      <div className="text-[11px] text-muted-foreground">{label}</div>
      <div className={`num text-lg font-bold tracking-tight ${net >= 0 ? "text-success" : "text-destructive"}`}>
        {fmt(net, currency)}
      </div>
      <div className="num text-[11px] text-muted-foreground">
        {estimated ? "דלק משוער" : "דלק בפועל"} −{fmt(fuel, currency)}
      </div>
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
