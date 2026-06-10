import { createFileRoute } from "@tanstack/react-router";
import { useState, useMemo } from "react";
import { useAppData, filterByRange, sumIncomes, sumExpenses, fmt, categoryLabel, netFromIncome, monthRange, type ExpenseCategory } from "@/lib/store";
import { PageHeader } from "@/components/PageHeader";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Legend } from "recharts";

type Range = "today" | "week" | "month" | "all";

export const Route = createFileRoute("/reports")({
  head: () => ({ meta: [{ title: "דוחות - דרייבר" }, { name: "description", content: "סיכומים ופירוט הכנסות והוצאות." }] }),
  component: Reports,
});

function isoToday() {
  const d = new Date();
  return new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 10);
}

function Reports() {
  const { data, ready } = useAppData();
  const [range, setRange] = useState<Range>("month");

  const { from, to } = useMemo(() => {
    const now = new Date();
    const iso = (d: Date) => new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 10);
    if (range === "today") return { from: isoToday(), to: isoToday() };
    if (range === "week") {
      const d = new Date(); d.setDate(d.getDate() - 6);
      return { from: iso(d), to: isoToday() };
    }
    if (range === "month") return monthRange(now.getFullYear(), now.getMonth());
    return { from: "0000-01-01", to: "9999-12-31" };
  }, [range]);

  if (!ready) return null;
  const c = data.settings.currency;

  const incomes = filterByRange(data.incomes, from, to);
  const expenses = filterByRange(data.expenses, from, to);
  const incomeTotal = sumIncomes(incomes);
  const expenseTotal = sumExpenses(expenses);
  const net = incomeTotal - expenseTotal;
  const daysWorked = new Set(incomes.map((i) => i.date)).size;
  const totalHours = incomes.reduce((s, i) => s + (i.hours || 0), 0);
  const totalKm = incomes.reduce((s, i) => s + (i.km || 0), 0);
  const grossTotal = incomes.reduce((s, i) => s + i.amount, 0);
  const commissionTotal = incomes.reduce((s, i) => s + i.amount * (i.commissionPct / 100), 0);
  const profitabilityPct = incomeTotal > 0 ? Math.round((net / incomeTotal) * 100) : 0;

  // category breakdown
  const byCategory = new Map<ExpenseCategory, number>();
  for (const e of expenses) byCategory.set(e.category, (byCategory.get(e.category) || 0) + e.amount);
  const pieData = Array.from(byCategory.entries()).map(([k, v]) => ({ name: categoryLabel(k), value: Math.round(v) }));
  const colors = ["var(--chart-1)", "var(--chart-2)", "var(--chart-3)", "var(--chart-4)", "var(--chart-5)", "var(--primary)", "var(--warning)", "var(--destructive)"];


  const exportCSV = () => {
    const rows: string[] = ["סוג,תאריך,קטגוריה/פלטפורמה,סכום ברוטו,עמלה%,תשר,נטו,ק״מ,שעות,הערה"];
    for (const i of incomes) {
      rows.push(["הכנסה", i.date, i.platform, i.amount, i.commissionPct, i.tip || 0, netFromIncome(i).toFixed(2), i.km || 0, i.hours || 0, (i.note || "").replace(/,/g, " ")].join(","));
    }
    for (const e of expenses) {
      rows.push(["הוצאה", e.date, categoryLabel(e.category), e.amount, 0, 0, (-e.amount).toFixed(2), 0, 0, (e.note || "").replace(/,/g, " ")].join(","));
    }
    const blob = new Blob(["\uFEFF" + rows.join("\n")], { type: "text/csv;charset=utf-8" });
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
        subtitle={`${from} → ${to}`}
        action={<Button size="sm" variant="outline" onClick={exportCSV}><Download className="h-4 w-4 ml-1" />ייצוא</Button>}
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

        <div className="grid grid-cols-2 gap-3">
          <Stat label="הכנסות (נטו)" value={fmt(incomeTotal, c)} tone="success" />
          <Stat label="הוצאות" value={fmt(expenseTotal, c)} tone="destructive" />
          <Stat label="רווח נקי" value={fmt(net, c)} accent />
          <Stat label="רווחיות" value={`${profitabilityPct}%`} />
          <Stat label="ימי עבודה" value={String(daysWorked)} />
          <Stat label="ממוצע יומי" value={fmt(daysWorked ? Math.round(net / daysWorked) : 0, c)} />
          <Stat label="ממוצע לשעה" value={fmt(totalHours ? Math.round(net / totalHours) : 0, c)} />
          <Stat label="ממוצע לק״מ" value={fmt(totalKm ? Math.round((net / totalKm) * 100) / 100 : 0, c)} />
          <Stat label="ברוטו לפני עמלה" value={fmt(grossTotal, c)} />
          <Stat label="עמלות חברה" value={fmt(commissionTotal, c)} tone="destructive" />
        </div>

        {pieData.length > 0 && (
          <Card>
            <CardContent className="p-4">
              <h3 className="text-sm font-semibold mb-3">פירוט הוצאות לפי קטגוריה</h3>
              <div className="h-56">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={pieData} dataKey="value" nameKey="name" innerRadius={45} outerRadius={80} paddingAngle={2}>
                      {pieData.map((_, i) => <Cell key={i} fill={colors[i % colors.length]} />)}
                    </Pie>
                    <Tooltip contentStyle={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 8, fontSize: 12 }} formatter={(v: number) => fmt(v, c)} />
                    <Legend wrapperStyle={{ fontSize: 11 }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="mt-3 space-y-1.5">
                {pieData.sort((a, b) => b.value - a.value).map((p) => {
                  const pct = expenseTotal > 0 ? Math.round((p.value / expenseTotal) * 100) : 0;
                  return (
                    <div key={p.name} className="flex justify-between text-sm">
                      <span>{p.name}</span>
                      <span className="text-muted-foreground">{fmt(p.value, c)} · {pct}%</span>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        )}

      </div>
    </div>
  );
}

function Stat({ label, value, tone, accent }: { label: string; value: string; tone?: "success" | "destructive"; accent?: boolean }) {
  const color = accent ? "text-primary" : tone === "success" ? "text-success" : tone === "destructive" ? "text-destructive" : "text-foreground";
  return (
    <Card>
      <CardContent className="p-3">
        <div className="text-[11px] text-muted-foreground">{label}</div>
        <div className={`text-lg font-bold ${color}`}>{value}</div>
      </CardContent>
    </Card>
  );
}
