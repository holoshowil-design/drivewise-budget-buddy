import { createFileRoute, Link } from "@tanstack/react-router";
import { useAppData, todayISO, filterByDate, filterByRange, sumIncomes, sumExpenses, fmt, monthRange } from "@/lib/store";
import { PageHeader } from "@/components/PageHeader";
import { Card, CardContent } from "@/components/ui/card";

import { TrendingUp, TrendingDown, Wallet, Target, Zap, Clock, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ResponsiveContainer, BarChart, Bar, XAxis, Tooltip, CartesianGrid } from "recharts";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "דרייבר - דשבורד" },
      { name: "description", content: "סיכום ההכנסות וההוצאות שלך, יעדים יומיים ומצב רווחיות." },
    ],
  }),
  component: Dashboard,
});

function Dashboard() {
  const { data, ready } = useAppData();
  if (!ready) return null;

  const today = todayISO();
  const { settings } = data;
  const c = settings.currency;

  const todayIncomes = filterByDate(data.incomes, today);
  const todayExpenses = filterByDate(data.expenses, today);
  const incomeToday = sumIncomes(todayIncomes);
  const expenseToday = sumExpenses(todayExpenses);
  const netToday = incomeToday - expenseToday;
  const profitabilityPct = incomeToday > 0 ? Math.round((netToday / incomeToday) * 100) : 0;
  const goalPct = settings.dailyGoal > 0 ? Math.min(100, Math.round((netToday / settings.dailyGoal) * 100)) : 0;

  // breakeven daily = (fixed monthly / workdays) + today's variable expenses
  const breakeven = Math.round(settings.fixedMonthlyExpenses / Math.max(1, settings.workDaysPerMonth) + expenseToday);

  // month
  const now = new Date();
  const { from, to } = monthRange(now.getFullYear(), now.getMonth());
  const monthIncomes = filterByRange(data.incomes, from, to);
  const monthExpenses = filterByRange(data.expenses, from, to);
  const monthIncome = sumIncomes(monthIncomes);
  const monthExpense = sumExpenses(monthExpenses);
  const monthNet = monthIncome - monthExpense;
  const daysWorked = new Set(monthIncomes.map((i) => i.date)).size;
  const dayOfMonth = now.getDate();
  const forecast = daysWorked > 0 ? Math.round((monthNet / daysWorked) * 30) : 0;

  // weekly chart - last 7 days
  const weekData: { day: string; net: number }[] = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const iso = new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 10);
    const inc = sumIncomes(filterByDate(data.incomes, iso));
    const exp = sumExpenses(filterByDate(data.expenses, iso));
    weekData.push({ day: d.toLocaleDateString("he-IL", { weekday: "short" }), net: Math.round(inc - exp) });
  }

  return (
    <div className="mx-auto max-w-xl">
      <PageHeader title="היי, בוקר טוב" subtitle={new Date().toLocaleDateString("he-IL", { weekday: "long", day: "numeric", month: "long" })} />

      <div className="px-4 space-y-4">
        {/* Hero net card */}
        <Card className="overflow-hidden border-0" style={{ background: "var(--gradient-primary)", boxShadow: "var(--shadow-glow)" }}>
          <CardContent className="p-6 text-primary-foreground">
            <div className="flex items-center gap-2 text-xs font-semibold opacity-90">
              <Wallet className="h-4 w-4" /> רווח נקי היום
            </div>
            <div className="mt-2 text-5xl font-extrabold tracking-tight">{fmt(netToday, c)}</div>
            <div className="mt-1.5 text-sm opacity-95">רווחיות {profitabilityPct}% · {todayIncomes.length} נסיעות</div>
            <div className="mt-4">
              <div className="flex justify-between text-xs opacity-90 mb-1.5">
                <span>יעד יומי {fmt(settings.dailyGoal, c)}</span>
                <span>{goalPct}%</span>
              </div>
              <div className="h-2 rounded-full bg-black/20 overflow-hidden">
                <div className="h-full bg-white rounded-full transition-all" style={{ width: `${goalPct}%` }} />
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-2 gap-3">
          <StatCard icon={<TrendingUp className="h-4 w-4" />} label="הכנסות היום" value={fmt(incomeToday, c)} tone="success" />
          <StatCard icon={<TrendingDown className="h-4 w-4" />} label="הוצאות היום" value={fmt(expenseToday, c)} tone="destructive" />
          <StatCard icon={<Target className="h-4 w-4" />} label="נקודת איזון יומית" value={fmt(breakeven, c)} />
          <StatCard icon={<Zap className="h-4 w-4" />} label="תחזית חודשית" value={fmt(forecast, c)} />
        </div>

        {/* Quick actions */}
        <div className="grid grid-cols-3 gap-2">
          <Link to={"/add" as never} search={{ tab: "income" } as never}>
            <Button variant="secondary" className="w-full h-auto py-3 flex-col gap-1">
              <Plus className="h-4 w-4" />
              <span className="text-xs">הכנסה</span>
            </Button>
          </Link>
          <Link to={"/add" as never} search={{ tab: "expense" } as never}>
            <Button variant="secondary" className="w-full h-auto py-3 flex-col gap-1">
              <Plus className="h-4 w-4" />
              <span className="text-xs">הוצאה</span>
            </Button>
          </Link>
          <Link to={"/add" as never} search={{ tab: "fuel" } as never}>
            <Button variant="secondary" className="w-full h-auto py-3 flex-col gap-1">
              <Zap className="h-4 w-4" />
              <span className="text-xs">תדלוק</span>
            </Button>
          </Link>
        </div>

        {/* Weekly chart */}
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold">7 ימים אחרונים</h3>
              <span className="text-xs text-muted-foreground flex items-center gap-1"><Clock className="h-3 w-3" />רווח נקי יומי</span>
            </div>
            <div className="h-40">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={weekData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                  <XAxis dataKey="day" stroke="var(--muted-foreground)" fontSize={11} tickLine={false} axisLine={false} />
                  <Tooltip
                    cursor={{ fill: "var(--muted)" }}
                    contentStyle={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 8, fontSize: 12 }}
                    formatter={(v: number) => [fmt(v, c), "נטו"]}
                  />
                  <Bar dataKey="net" fill="var(--primary)" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Month summary */}
        <Card>
          <CardContent className="p-4 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold">סיכום חודשי</h3>
              <span className="text-xs text-muted-foreground">יום {dayOfMonth} בחודש</span>
            </div>
            <div className="grid grid-cols-3 gap-2 text-center">
              <MiniStat label="הכנסות" value={fmt(monthIncome, c)} />
              <MiniStat label="הוצאות" value={fmt(monthExpense, c)} />
              <MiniStat label="נטו" value={fmt(monthNet, c)} accent />
            </div>
            <div className="text-xs text-muted-foreground text-center">{daysWorked} ימי עבודה · ממוצע יומי {fmt(daysWorked ? Math.round(monthNet / daysWorked) : 0, c)}</div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function StatCard({ icon, label, value, tone }: { icon: React.ReactNode; label: string; value: string; tone?: "success" | "destructive" }) {
  const color = tone === "success" ? "text-success" : tone === "destructive" ? "text-destructive" : "text-foreground";
  return (
    <Card>
      <CardContent className="p-3">
        <div className={`flex items-center gap-1.5 text-xs ${color}`}>{icon}<span className="text-muted-foreground">{label}</span></div>
        <div className="mt-1 text-xl font-bold tracking-tight">{value}</div>
      </CardContent>
    </Card>
  );
}

function MiniStat({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <div>
      <div className="text-[11px] text-muted-foreground">{label}</div>
      <div className={`text-base font-semibold ${accent ? "text-primary" : ""}`}>{value}</div>
    </div>
  );
}
