import { Fragment, memo, useMemo, useState } from "react";
import { Fuel, Pencil, Trash2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  effectiveFuelParams,
  energyUnitLabel,
  fmt,
  fmtDuration,
  todayISO,
  type AppData,
  type Trip,
} from "@/lib/store";
import { dayLabel, groupByDay } from "@/lib/day-groups";
import { isBetween } from "@/lib/between-trip";

/** Trips shown before "show more"; the last day shown is always complete. */
const PAGE_TRIPS = 12;

/** Finished trips, newest first and grouped by day, with edit, delete and "show more". */
export const TripHistory = memo(function TripHistory({
  data,
  onEdit,
  onDelete,
}: {
  data: AppData;
  onEdit: (trip: Trip) => void;
  onDelete: (trip: Trip) => void;
}) {
  const c = data.settings.currency;
  const unit = energyUnitLabel(data.vehicle);
  const today = todayISO();
  const trips = useMemo(
    () =>
      [...(data.trips ?? [])].sort((a, b) =>
        `${b.date} ${b.time ?? ""}`.localeCompare(`${a.date} ${a.time ?? ""}`),
      ),
    [data.trips],
  );
  const [shown, setShown] = useState(PAGE_TRIPS);
  let end = Math.min(shown, trips.length);
  while (end > 0 && end < trips.length && trips[end].date === trips[end - 1].date) end++;
  const hidden = trips.length - end;
  return (
    <Card>
      <CardContent className="p-4">
        <h3 className="mb-3 flex items-center gap-1.5 text-sm font-semibold">
          <Fuel className="h-4 w-4 text-primary" /> נסיעות שהסתיימו
        </h3>
        {trips.length === 0 ? (
          <p className="text-xs text-muted-foreground">עדיין אין נסיעות שמורות.</p>
        ) : (
          <ul className="divide-y">
            {groupByDay(trips.slice(0, end), (t) => t.date).map((day) => (
              <Fragment key={day.date}>
                <li className="pb-1 pt-3 text-xs font-semibold text-muted-foreground">
                  {dayLabel(day.date, today)}
                </li>
                {day.rows.map((t) => {
                  const p = effectiveFuelParams(t.date, data.vehicle, data.settings, t.time);
                  const units = t.km / (p.consumption || 1);
                  const inc = t.incomeId
                    ? data.incomes.find((i) => i.id === t.incomeId)
                    : undefined;
                  return (
                    <li key={t.id} className="flex items-center justify-between gap-2 py-2.5">
                      <button
                        type="button"
                        className="min-w-0 flex-1 text-start"
                        onClick={() => onEdit(t)}
                      >
                        <div className="num text-sm font-semibold">
                          {isBetween(t) && (
                            <span className="me-1.5 rounded-full bg-muted px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground">
                              בין נסיעות
                            </span>
                          )}
                          {t.km.toFixed(1)} ק״מ · {fmtDuration(t.seconds)}
                          {inc && <span className="text-success"> · {fmt(inc.amount, c)}</span>}
                        </div>
                        <div className="num text-[11px] text-muted-foreground">
                          {t.time ? `${t.time} · ` : ""}≈ {fmt(units * p.price, c)} (
                          {units.toFixed(1)} {unit})
                          {(t.waitSeconds ?? 0) > 0 &&
                            ` · המתנה ${Math.round((t.waitSeconds ?? 0) / 60)} ד׳`}
                        </div>
                      </button>
                      <Button
                        variant="ghost"
                        size="icon"
                        aria-label="ערוך נסיעה"
                        onClick={() => onEdit(t)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        aria-label="מחק נסיעה"
                        onClick={() => onDelete(t)}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </li>
                  );
                })}
              </Fragment>
            ))}
          </ul>
        )}
        {hidden > 0 && (
          <button
            type="button"
            onClick={() => setShown(end + PAGE_TRIPS * 2)}
            className="w-full pt-3 text-center text-sm font-semibold text-primary"
          >
            הצג עוד ({hidden} נסיעות)
          </button>
        )}
      </CardContent>
    </Card>
  );
});
