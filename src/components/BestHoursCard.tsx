import { useMemo, useState } from "react";
import { Clock } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { BLOCKS, WEEKDAYS, WINDOW_DAYS, bestHours, type Slot } from "@/lib/best-hours";
import { fmt, todayISO, type AppData } from "@/lib/store";

/** Five steps of the brand green over the card, light to dark (one hue: magnitude). */
const STEPS = [18, 36, 54, 72, 90];
const shade = (pct: number) => `color-mix(in oklab, var(--primary) ${pct}%, var(--card))`;

/** Hours read left to right inside Hebrew text (LTR isolate), so "10–14" doesn't flip. */
const hours = (label: string) => `\u2066${label}\u2069`;

const slotName = (weekday: number, block: number) =>
  `יום ${WEEKDAYS[weekday]} ${hours(BLOCKS[block].label)}`;

/**
 * When it pays to work: the average net a worked day brings in each weekday and
 * four-hour block, over the last 90 days. Tap a cell for its numbers.
 */
export function BestHoursCard({ data }: { data: AppData }) {
  const c = data.settings.currency;
  const { slots, best } = useMemo(() => bestHours(data, todayISO()), [data]);
  const [picked, setPicked] = useState<{ weekday: number; block: number } | null>(null);

  const byKey = new Map(slots.map((s) => [`${s.weekday}:${s.block}`, s]));
  const max = Math.max(0, ...slots.map((s) => s.avg));
  const stepOf = (s: Slot) =>
    max > 0 ? STEPS[Math.min(STEPS.length - 1, Math.floor((s.avg / max) * STEPS.length))] : 0;
  const pickedSlot = picked ? byKey.get(`${picked.weekday}:${picked.block}`) : undefined;

  const describe = (s: Slot) =>
    `${slotName(s.weekday, s.block)}: ממוצע ${fmt(s.avg, c)} ליום עבודה (${s.days} ${s.days === 1 ? "יום" : "ימים"})`;

  return (
    <Card>
      <CardContent className="space-y-3 p-4">
        <div>
          <h3 className="flex items-center gap-1.5 text-sm font-semibold">
            <Clock className="h-4 w-4 text-primary" /> מתי הכי משתלם לעבוד
          </h3>
          <p className="text-xs text-muted-foreground">
            ממוצע נטו ליום עבודה בכל משבצת · {WINDOW_DAYS} הימים האחרונים
          </p>
        </div>

        {slots.length < 3 ? (
          <p className="text-sm text-muted-foreground">
            אחרי עוד כמה ימי עבודה תופיע כאן מפה של השעות המשתלמות.
          </p>
        ) : (
          <>
            {best && (
              <div className="rounded-xl bg-primary/10 px-3 py-2 text-sm">
                <span className="text-muted-foreground">הכי משתלם: </span>
                <strong className="num">
                  {slotName(best.weekday, best.block)} · {fmt(best.avg, c)}
                </strong>
              </div>
            )}

            <div
              className="grid gap-[2px] text-center text-[10px]"
              style={{ gridTemplateColumns: `1.6rem repeat(${BLOCKS.length}, minmax(0, 1fr))` }}
            >
              <span />
              {BLOCKS.map((b) => (
                <span key={b.label} dir="ltr" className="num pb-0.5 text-muted-foreground">
                  {b.label}
                </span>
              ))}
              {WEEKDAYS.map((day, weekday) => (
                <Row
                  key={day}
                  day={day}
                  weekday={weekday}
                  byKey={byKey}
                  best={best}
                  picked={picked}
                  stepOf={stepOf}
                  describe={describe}
                  onPick={setPicked}
                />
              ))}
            </div>

            <div className="flex items-center justify-between gap-2 text-[10px] text-muted-foreground">
              <span className="flex items-center gap-1" aria-hidden="true">
                פחות
                {STEPS.map((p) => (
                  <span key={p} className="h-2.5 w-4 rounded-sm" style={{ background: shade(p) }} />
                ))}
                יותר
              </span>
              <span>★ הכי משתלם</span>
            </div>

            <p className="num min-h-[1.25rem] text-xs font-medium" aria-live="polite">
              {picked
                ? pickedSlot
                  ? describe(pickedSlot)
                  : `${slotName(picked.weekday, picked.block)}: לא עבדת במשבצת הזו`
                : "לחץ על משבצת כדי לראות את הסכום"}
            </p>
          </>
        )}
      </CardContent>
    </Card>
  );
}

function Row({
  day,
  weekday,
  byKey,
  best,
  picked,
  stepOf,
  describe,
  onPick,
}: {
  day: string;
  weekday: number;
  byKey: Map<string, Slot>;
  best: Slot | null;
  picked: { weekday: number; block: number } | null;
  stepOf: (s: Slot) => number;
  describe: (s: Slot) => string;
  onPick: (p: { weekday: number; block: number }) => void;
}) {
  return (
    <>
      <span className="flex items-center justify-center font-semibold text-muted-foreground">
        {day}
      </span>
      {BLOCKS.map((_, block) => {
        const slot = byKey.get(`${weekday}:${block}`);
        const isBest = best?.weekday === weekday && best.block === block;
        const isPicked = picked?.weekday === weekday && picked.block === block;
        return (
          <button
            key={block}
            type="button"
            onClick={() => onPick({ weekday, block })}
            aria-label={slot ? describe(slot) : `${slotName(weekday, block)}: אין נתונים`}
            aria-pressed={isPicked}
            className={`flex h-7 items-center justify-center rounded text-[11px] font-bold ${
              slot ? "" : "border border-dashed border-border"
            } ${isPicked ? "outline outline-2 outline-offset-1 outline-foreground" : ""}`}
            style={slot ? { background: shade(stepOf(slot)) } : undefined}
          >
            {isBest && (
              <span className={stepOf(slot!) >= 54 ? "text-primary-foreground" : "text-foreground"}>
                ★
              </span>
            )}
          </button>
        );
      })}
    </>
  );
}
