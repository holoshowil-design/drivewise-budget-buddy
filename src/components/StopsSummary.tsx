import { memo, useMemo } from "react";
import { Pause } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { fmt, fmtDuration, todayISO, tripEnergy, type AppData } from "@/lib/store";
import { isBetween, isPrivate, workTrips } from "@/lib/between-trip";
import { STOP_REASONS, sumStops } from "@/lib/trip-stops";

const DAYS = 7;

function daysAgoISO(days: number) {
  const d = new Date(`${todayISO()}T12:00:00`);
  d.setDate(d.getDate() - days);
  return d.toISOString().slice(0, 10);
}

/**
 * The last week outside the driving itself: waiting for a ride, stops inside trips
 * (fuel, food, prayer...), standing with the engine on, and private drives.
 */
export const StopsSummary = memo(function StopsSummary({ data }: { data: AppData }) {
  const s = useMemo(() => {
    const from = daysAgoISO(DAYS - 1);
    const week = (data.trips ?? []).filter((t) => t.date >= from);
    const sums = sumStops(workTrips(week), from);
    const rows = [
      {
        id: "between-wait",
        label: "ממתין לנסיעה (בין נסיעות)",
        seconds: week.filter(isBetween).reduce((n, t) => n + (t.waitSeconds ?? 0), 0),
      },
      ...STOP_REASONS.map((r) => ({ id: r.id, label: r.label, seconds: sums[r.id] ?? 0 })),
    ]
      .map((r) => ({ ...r, seconds: Math.round(r.seconds) }))
      .filter((r) => r.seconds >= 60)
      .sort((a, b) => b.seconds - a.seconds);
    const work = week.filter((t) => !isPrivate(t));
    const idleSeconds = work.reduce((n, t) => n + (t.idleSeconds ?? 0), 0);
    const idleCost = work.reduce(
      (n, t) => n + tripEnergy({ ...t, km: 0 }, data.vehicle, data.settings).cost,
      0,
    );
    const priv = week.filter(isPrivate);
    const privKm = priv.reduce((n, t) => n + (t.km || 0), 0);
    const privCost = priv.reduce((n, t) => n + tripEnergy(t, data.vehicle, data.settings).cost, 0);
    return { rows, idleSeconds, idleCost, privCount: priv.length, privKm, privCost };
  }, [data.trips, data.vehicle, data.settings]);
  if (s.rows.length === 0 && s.idleSeconds < 60 && s.privCount === 0) return null;
  const total = s.rows.reduce((n, r) => n + r.seconds, 0);
  const c = data.settings.currency;
  return (
    <Card>
      <CardContent className="p-4">
        <h3 className="mb-2 flex items-center gap-1.5 text-sm font-semibold">
          <Pause className="h-4 w-4 text-primary" /> המתנות ועצירות ב-{DAYS} הימים האחרונים
          {total > 0 && (
            <span className="num ms-auto text-xs font-normal text-muted-foreground">
              סה״כ {fmtDuration(total)}
            </span>
          )}
        </h3>
        <ul className="space-y-1.5">
          {s.rows.map((r) => (
            <li key={r.id} className="num text-xs">
              <div className="flex justify-between">
                <span>{r.label}</span>
                <span className="font-semibold">{fmtDuration(r.seconds)}</span>
              </div>
              <div className="mt-0.5 h-1.5 overflow-hidden rounded-full bg-muted">
                <div
                  className="h-full rounded-full bg-primary"
                  style={{ width: `${Math.max(4, (r.seconds / total) * 100)}%` }}
                />
              </div>
            </li>
          ))}
        </ul>
        {s.idleSeconds >= 60 && (
          <p className="num mt-3 text-xs text-muted-foreground">
            מנוע דלוק בעמידה {fmtDuration(s.idleSeconds)} · ≈ {fmt(s.idleCost, c)} דלק
          </p>
        )}
        {s.privCount > 0 && (
          <p className="num mt-1 text-xs text-muted-foreground">
            נסיעות פרטיות: {s.privCount} · {s.privKm.toFixed(1)} ק״מ · ≈ {fmt(s.privCost, c)} דלק
            (לא נכנס לחישובי העבודה)
          </p>
        )}
      </CardContent>
    </Card>
  );
});
