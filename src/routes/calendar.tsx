import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useMemo } from "react";
import { useAppData, fmt, fmtDuration, monthRange } from "@/lib/store";
import { dayOf, sumDays, useDays } from "@/lib/calc";
import { RecordsList } from "@/components/RecordsList";
import { PageHeader } from "@/components/PageHeader";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronRight, ChevronLeft, MapPin, Plus } from "lucide-react";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/calendar")({
  head: () => ({
    meta: [
      { title: "לוח שנה - דרייבר" },
      { name: "description", content: "תצוגה חודשית של הרווח היומי." },
      { property: "og:title", content: "לוח שנה - דרייבר" },
      { property: "og:description", content: "תצוגה חודשית של הרווח היומי." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: CalendarPage,
});

const weekDays = ["א", "ב", "ג", "ד", "ה", "ו", "ש"];

function CalendarPage() {
  const { data, ready } = useAppData();
  const calcDays = useDays(data);
  const now = new Date();
  const todayIso = new Date(now.getTime() - now.getTimezoneOffset() * 60000)
    .toISOString()
    .slice(0, 10);
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth());
  const [selected, setSelected] = useState<string | null>(todayIso);

  const days = useMemo(() => {
    const first = new Date(year, month, 1);
    const last = new Date(year, month + 1, 0);
    const startWeekday = first.getDay();
    const total = last.getDate();
    const arr: { iso: string | null; day: number | null }[] = [];
    for (let i = 0; i < startWeekday; i++) arr.push({ iso: null, day: null });
    for (let d = 1; d <= total; d++) {
      const dt = new Date(year, month, d);
      const iso = new Date(dt.getTime() - dt.getTimezoneOffset() * 60000)
        .toISOString()
        .slice(0, 10);
      arr.push({ iso, day: d });
    }
    return arr;
  }, [year, month]);

  if (!ready) return null;
  const c = data.settings.currency;
  const goal = data.settings.dailyGoal;

  const prev = () => {
    if (month === 0) {
      setMonth(11);
      setYear(year - 1);
    } else setMonth(month - 1);
  };
  const next = () => {
    if (month === 11) {
      setMonth(0);
      setYear(year + 1);
    } else setMonth(month + 1);
  };

  const monthLabel = new Date(year, month, 1).toLocaleDateString("he-IL", {
    month: "long",
    year: "numeric",
  });

  const { from, to } = monthRange(year, month);
  const monthNet = sumDays(calcDays, from, to).net;

  const sel = selected ? dayOf(calcDays, selected, data) : null;
  const selectedNet = sel?.net ?? 0;

  return (
    <div className="mx-auto max-w-xl">
      <PageHeader
        title="לוח שנה"
        subtitle={`רווח חודשי: ${fmt(monthNet, c)}`}
        scene={{
          mood: monthNet >= 0 ? "smirk" : "grumble",
          prop: "stamp",
          line: monthNet >= 0 ? "כל יום יעד מקבל חותמת! 🟢" : "החודש עוד ניתן להציל 💪",
        }}
      />

      <div className="px-4 space-y-4">
        <Card key={monthLabel} className="calendar-flip">
          <CardContent className="p-3">
            <div className="flex items-center justify-between mb-3">
              <Button variant="ghost" size="icon" aria-label="החודש הבא" onClick={next}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <div className="font-semibold">{monthLabel}</div>
              <Button variant="ghost" size="icon" aria-label="החודש הקודם" onClick={prev}>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
            <div
              className="grid grid-cols-7 gap-1 text-center text-[11px] font-medium text-muted-foreground mb-1.5"
              aria-hidden="true"
            >
              {weekDays.map((w) => (
                <div key={w}>{w}</div>
              ))}
            </div>
            <div className="grid grid-cols-7 gap-1">
              {days.map((cell, idx) => {
                if (!cell.iso) return <div key={idx} />;
                const d = dayOf(calcDays, cell.iso, data);
                const net = Math.round(d.net);
                const hasData = d.incomeNet > 0 || d.costs > 0 || d.trips.length > 0;
                let tone = "bg-muted/40 text-muted-foreground";
                if (hasData) {
                  if (net < 0)
                    tone = "bg-destructive/12 text-destructive border border-destructive/30";
                  else if (net >= goal)
                    tone = "bg-success/15 text-success border border-success/30";
                  else tone = "bg-warning/15 text-warning border border-warning/30";
                }
                const isSelected = selected === cell.iso;
                const isToday = cell.iso === todayIso;
                return (
                  <button
                    key={cell.iso}
                    onClick={() => setSelected(cell.iso!)}
                    aria-pressed={isSelected}
                    aria-label={`${new Date(`${cell.iso}T12:00:00`).toLocaleDateString("he-IL", { weekday: "long", day: "numeric", month: "long" })}${
                      hasData
                        ? `, נטו ${fmt(net, c)}${net >= goal ? ", יעד הושג" : ""}`
                        : ", אין רשומות"
                    }`}
                    className={cn(
                      "cal-cell relative aspect-square rounded-xl flex flex-col items-center justify-center text-[11px] font-medium transition-all",
                      tone,
                      isToday && !isSelected && "ring-1 ring-primary/50",
                      isSelected && "ring-2 ring-primary ring-offset-1 ring-offset-card",
                    )}
                  >
                    <span
                      className={cn("num text-xs", isToday && "font-extrabold text-primary")}
                      aria-hidden="true"
                    >
                      {cell.day}
                    </span>
                    {hasData && (
                      <span
                        className="num mt-0.5 text-[11px] font-bold leading-none"
                        aria-hidden="true"
                      >
                        {net}
                      </span>
                    )}
                    {hasData && net >= goal && (
                      <span className="ink-stamp" aria-hidden="true">
                        ✓
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
            <div className="mt-3 flex flex-wrap items-center justify-center gap-x-3 gap-y-1 border-t pt-2.5 text-[11px] text-muted-foreground">
              <LegendDot className="bg-success/60" label={`יעד הושג (${fmt(goal, c)}+)`} />
              <LegendDot className="bg-warning/70" label="מתחת ליעד" />
              <LegendDot className="bg-destructive/60" label="הפסד" />
            </div>
          </CardContent>
        </Card>

        {selected && sel && (
          <div className="space-y-2">
            <div className="flex items-center justify-between gap-2 px-1">
              <h3 className="font-semibold">
                {new Date(selected).toLocaleDateString("he-IL", {
                  weekday: "long",
                  day: "numeric",
                  month: "long",
                })}
              </h3>
              <div className="flex items-center gap-2">
                <div
                  className={cn(
                    "num font-bold",
                    selectedNet >= 0 ? "text-success" : "text-destructive",
                  )}
                >
                  {fmt(selectedNet, c)}
                </div>
                <Link
                  to="/add"
                  search={{ tab: "income", date: selected }}
                  aria-label="הוסף רשומה לתאריך הזה"
                  className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground"
                >
                  <Plus className="h-4 w-4" />
                </Link>
              </div>
            </div>
            {sel.trips.length > 0 && (
              <Card>
                <CardContent className="divide-y p-0">
                  {sel.trips.map((t) => (
                    <div key={t.id} className="flex items-center gap-3 p-3 text-sm">
                      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                        <MapPin className="h-4 w-4" />
                      </span>
                      <div className="min-w-0 flex-1">
                        <div className="font-medium">נסיעת GPS</div>
                        <div className="num text-xs text-muted-foreground">
                          {t.time ?? ""} · {t.km.toFixed(1)} ק״מ · {fmtDuration(t.seconds)}
                        </div>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}
            <RecordsList incomes={sel.incomes} expenses={sel.expenses} />
          </div>
        )}
      </div>
    </div>
  );
}

function LegendDot({ className, label }: { className: string; label: string }) {
  return (
    <span className="flex items-center gap-1">
      <span className={cn("h-2 w-2 rounded-full", className)} />
      {label}
    </span>
  );
}
