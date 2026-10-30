import { memo, useMemo } from "react";
import { Pause } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { fmtDuration, todayISO, type Trip } from "@/lib/store";
import { workTrips } from "@/lib/between-trip";
import { STOP_REASONS, sumStops } from "@/lib/trip-stops";

const DAYS = 7;

function daysAgoISO(days: number) {
  const d = new Date(`${todayISO()}T12:00:00`);
  d.setDate(d.getDate() - days);
  return d.toISOString().slice(0, 10);
}

/** Where the stopped time of the last week went: waiting, fuel, food, prayer... */
export const StopsSummary = memo(function StopsSummary({ trips }: { trips: Trip[] }) {
  const rows = useMemo(() => {
    const sums = sumStops(workTrips(trips ?? []), daysAgoISO(DAYS - 1));
    return STOP_REASONS.map((r) => ({ ...r, seconds: Math.round(sums[r.id] ?? 0) }))
      .filter((r) => r.seconds >= 60)
      .sort((a, b) => b.seconds - a.seconds);
  }, [trips]);
  if (rows.length === 0) return null;
  const total = rows.reduce((s, r) => s + r.seconds, 0);
  return (
    <Card>
      <CardContent className="p-4">
        <h3 className="mb-2 flex items-center gap-1.5 text-sm font-semibold">
          <Pause className="h-4 w-4 text-primary" /> עצירות ב-{DAYS} הימים האחרונים
          <span className="num ms-auto text-xs font-normal text-muted-foreground">
            סה״כ {fmtDuration(total)}
          </span>
        </h3>
        <ul className="space-y-1.5">
          {rows.map((r) => (
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
      </CardContent>
    </Card>
  );
});
