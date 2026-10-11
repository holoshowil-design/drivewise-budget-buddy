import { createFileRoute } from "@tanstack/react-router";
import { lazy, Suspense, useState, useMemo } from "react";
import {
  useAppData,
  filterByRange,
  fmt,
  fmtPrecise,
  fmtDateShort,
  categoryLabel,
  monthRange,
  type ExpenseCategory,
} from "@/lib/store";
import { perKm, sumDays, useDays } from "@/lib/calc";
import { buildReportCsv } from "@/lib/csv";
import { PageHeader } from "@/components/PageHeader";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Download } from "lucide-react";
import { RecordsList } from "@/components/RecordsList";

// recharts loads only when the expense breakdown is shown.
const ExpensePie = lazy(() => import("@/components/ExpensePie"));

type Range = "today" | "week" | "month" | "all";

export const Route = createFileRoute("/reports")({
  head: () => ({
    meta: [
      { title: "דוחות - דרייבר" },
      { name: "description", content: "סיכומים ופירוט הכנסות והוצאות." },
      { property: "og:title", content: "דוחות - דרייבר" },
      { property: "og:description", content: "סיכומים ופירוט הכנסות והוצאות." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Reports,
});

function isoToday() {
  const d = new Date();
  return new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 10);
}

function Reports() {
  const { data, ready } = useAppData();
  const days = useDays(data);
  const [range, setRange] = useState<Range>("month");
  /** 0 = this month, 1 = last month, ... */
  const [monthsBack, setMonthsBack] = useState(0);

  const { from, to } = useMemo(() => {
    const now = new Date();
    const iso = (d: Date) =>
      new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 10);
    if (range === "today") return { from: isoToday(), to: isoToday() };
    if (range === "week") {
      const d = new Date();
      d.setDate(d.getDate() - 6);
      return { from: iso(d), to: isoToday() };
    }
    if (range === "month") return monthRange(now.getFullYear(), now.getMonth() - monthsBack);
    return { from: "0000-01-01", to: "9999-12-31" };
  }, [range, monthsBack]);

  if (!ready) return null;
  const c = data.settings.currency;

  const incomes = filterByRange(data.incomes, from, to);
  const expenses = filterByRange(data.expenses, from, to);
  const trips = filterByRange(data.trips ?? [], from, to);
  const totals = sumDays(days, from, to);
  const incomeTotal = totals.incomeNet;
  const expenseTotal = totals.costs;
  const net = totals.net;
  const daysWorked = totals.daysWorked;
  const totalHours = totals.hours;
  const netPerKm = perKm(totals);
  const grossTotal = totals.gross;
  const commissionTotal = totals.commission;
  const profitabilityPct = incomeTotal > 0 ? Math.round((net / incomeTotal) * 100) : 0;

  // category breakdown
  const byCategory = new Map<ExpenseCategory, number>();
  for (const e of expenses) {
    if (e.category === "fuel") continue;
    byCategory.set(e.category, (byCategory.get(e.category) || 0) + e.amount);
  }
  const fuelCharged = totals.fuelEstimated;
  if (fuelCharged > 0) byCategory.set("fuel", fuelCharged);
  const pieData = Array.from(byCategory.entries()).map(([k, v]) => ({
    name: categoryLabel(k),
    value: Math.round(v),
  }));

  const exportCSV = () => {
    const csv = buildReportCsv(data, { incomes, expenses, trips });
    const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `driver-report-${from}-to-${to}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="mx-auto max-w-xl">
      <PageHeader
        title="דוחות"
        subtitle={range === "all" ? "כל הרשומות" : `${fmtDateShort(from)} – ${fmtDateShort(to)}`}
        action={
          <Button size="sm" variant="outline" onClick={exportCSV}>
            <Download className="h-4 w-4 ml-1" />
            ייצוא
          </Button>
        }
        scene={{ mood: "smirk", prop: "chart", line: "בוא נראה לאן הלך כל שקל 🧐" }}
      />

      <div className="px-4 space-y-4">
        <Tabs value={range} onValueChange={(v) => setRange(v as Range)}>
          <TabsList className="grid grid-cols-4 w-full">
            <TabsTrigger value="today">היום</TabsTrigger>
            <TabsTrigger value="week">שבוע</TabsTrigger>
            <TabsTrigger value="month">חודש</TabsTrigger>
            <TabsTrigger value="all">הכל</TabsTrigger>
          </TabsList>
        </Tabs>

        {range === "month" && (
          <div className="flex items-center justify-between rounded-xl border bg-card px-2 py-1">
            <Button
              variant="ghost"
              size="icon"
              aria-label="החודש הקודם"
              onClick={() => setMonthsBack((m) => m + 1)}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
            <span className="text-sm font-semibold">
              {new Date(`${from}T12:00:00`).toLocaleDateString("he-IL", {
                month: "long",
                year: "numeric",
              })}
            </span>
            <Button
              variant="ghost"
              size="icon"
              aria-label="החודש הבא"
              disabled={monthsBack === 0}
              onClick={() => setMonthsBack((m) => Math.max(0, m - 1))}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
          </div>
        )}

        <div className="grid grid-cols-2 gap-3">
          <Stat label="הכנסות (נטו)" value={fmt(incomeTotal, c)} tone="success" />
          <Stat label="הוצאות" value={fmt(expenseTotal, c)} tone="destructive" />
          <Stat label="רווח נקי" value={fmt(net, c)} accent />
          <Stat label="רווחיות" value={`${profitabilityPct}%`} />
          <Stat label="ימי עבודה" value={String(daysWorked)} />
          <Stat label="ממוצע יומי" value={fmt(daysWorked ? Math.round(net / daysWorked) : 0, c)} />
          <Stat label="ממוצע לשעה" value={fmt(totalHours ? Math.round(net / totalHours) : 0, c)} />
          <Stat label="ממוצע לק״מ" value={netPerKm === null ? "—" : fmtPrecise(netPerKm, c)} />
          <Stat label="ברוטו לפני עמלה" value={fmt(grossTotal, c)} />
          <Stat label="עמלות חברה" value={fmt(commissionTotal, c)} tone="destructive" />
          <Stat label="ק״מ" value={Math.round(totals.km).toLocaleString("he-IL")} />
          <Stat
            label="דלק משוער (לפי ק״מ)"
            value={fmt(totals.fuelEstimated, c)}
            tone="destructive"
          />
        </div>

        {pieData.length > 0 && (
          <Card>
            <CardContent className="p-4">
              <h3 className="text-sm font-semibold mb-3">פירוט הוצאות לפי קטגוריה</h3>
              <div className="h-56">
                <Suspense
                  fallback={<div className="h-full animate-pulse rounded-xl bg-muted/40" />}
                >
                  <ExpensePie data={[...pieData]} currency={c} />
                </Suspense>
              </div>
              <div className="mt-3 space-y-1.5">
                {pieData
                  .sort((a, b) => b.value - a.value)
                  .map((p) => {
                    const pct = expenseTotal > 0 ? Math.round((p.value / expenseTotal) * 100) : 0;
                    return (
                      <div key={p.name} className="flex justify-between text-sm">
                        <span>{p.name}</span>
                        <span className="text-muted-foreground">
                          {fmt(p.value, c)} · {pct}%
                        </span>
                      </div>
                    );
                  })}
              </div>
            </CardContent>
          </Card>
        )}
        <div>
          <h3 className="mb-2 px-1 text-sm font-semibold">
            רשומות בטווח ({incomes.length + expenses.length})
          </h3>
          <RecordsList incomes={incomes} expenses={expenses} />
        </div>
      </div>
    </div>
  );
}

function Stat({
  label,
  value,
  tone,
  accent,
}: {
  label: string;
  value: string;
  tone?: "success" | "destructive";
  accent?: boolean;
}) {
  const color = accent
    ? "text-primary"
    : tone === "success"
      ? "text-success"
      : tone === "destructive"
        ? "text-destructive"
        : "text-foreground";
  return (
    <Card>
      <CardContent className="p-3.5">
        <div className="text-[11px] text-muted-foreground">{label}</div>
        <div className={`num mt-0.5 text-lg font-bold tracking-tight ${color}`}>{value}</div>
      </CardContent>
    </Card>
  );
}
