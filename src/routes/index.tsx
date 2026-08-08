import { createFileRoute, Link } from "@tanstack/react-router";
import { useAppData, todayISO, filterByDate, filterByRange, sumIncomes, fmt, monthRange, totalCosts, sumHours } from "@/lib/store";
import { PageHeader } from "@/components/PageHeader";
import { Card, CardContent } from "@/components/ui/card";
import { InsightsCard } from "@/components/InsightsCard";
import { KmCostCard } from "@/components/KmCostCard";
import { MonthPaceCard, IncomeVsExpenseCard, WeekdayProfitCard, ProfitabilityGauge } from "@/components/DashboardCharts";

import { TrendingUp, TrendingDown, Wallet, Target, Zap, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

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
  const expenseToday = totalCosts(todayIncomes, todayExpenses, data.vehicle, settings);
  const netToday = incomeToday - expenseToday;
  const hoursToday = sumHours(todayIncomes);
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
  const monthExpense = totalCosts(monthIncomes, monthExpenses, data.vehicle, settings);
  const monthNet = monthIncome - monthExpense;
  const daysWorked = new Set(monthIncomes.map((i) => i.date)).size;
  const dayOfMonth = now.getDate();
  const forecast = daysWorked > 0 ? Math.round((monthNet / daysWorked) * 30) : 0;

  const hour = now.getHours();
  const greeting = hour < 5 ? "לילה טוב" : hour < 12 ? "בוקר טוב" : hour < 17 ? "צהריים טובים" : hour < 21 ? "ערב טוב" : "לילה טוב";

  return (
    <div className="mx-auto max-w-xl">
      <PageHeader title={`היי, ${greeting}`} subtitle={new Date().toLocaleDateString("he-IL", { weekday: "long", day: "numeric", month: "long" })} />

      <div className="px-4 space-y-4">
        {/* Hero net card */}
        <Card className="overflow-hidden border-0" style={{ background: "var(--gradient-primary)", boxShadow: "var(--shadow-glow)" }}>
          <CardContent className="p-6 text-primary-foreground">
            <div className="flex items-center gap-2 text-xs font-semibold opacity-90">
              <Wallet className="h-4 w-4" /> רווח נקי היום
            </div>
            <div className="num mt-2 text-[2.75rem] font-extrabold leading-none tracking-tight">{fmt(netToday, c)}</div>
            <div className="mt-2 text-sm opacity-95">
              רווחיות {profitabilityPct}% · {todayIncomes.length} רשומות
              {hoursToday > 0 && ` · ${fmt(netToday / hoursToday, c)} לשעה`}
            </div>
            <div className="mt-4">
              <div className="flex justify-between text-xs opacity-90 mb-1.5">
                <span>יעד יומי {fmt(settings.dailyGoal, c)}</span>
                <span className="num font-semibold">{goalPct}%</span>
              </div>
              <div className="h-2 rounded-full bg-black/20 overflow-hidden">
                <div className="h-full bg-white rounded-full transition-all duration-500" style={{ width: `${goalPct}%` }} />
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-2 gap-3">
          <StatCard icon={<TrendingUp className="h-4 w-4" />} label="הכנסות היום" value={fmt(incomeToday, c)} tone="success" />
          <StatCard icon={<TrendingDown className="h-4 w-4" />} label="הוצאות היום (כולל דלק)" value={fmt(expenseToday, c)} tone="destructive" />
          <StatCard icon={<Target className="h-4 w-4" />} label="נקודת איזון יומית" value={fmt(breakeven, c)} />
          <StatCard icon={<Zap className="h-4 w-4" />} label="תחזית חודשית" value={fmt(forecast, c)} />
        </div>

        <ProfitabilityGauge data={data} />

        <MonthPaceCard data={data} />

        <IncomeVsExpenseCard data={data} />

        <WeekdayProfitCard data={data} />

        <KmCostCard data={data} />

        <InsightsCard data={data} />




        {/* Quick actions */}
        <div className="grid grid-cols-3 gap-2">
          <Link to={"/add" as never} search={{ tab: "income" } as never}>
            <Button variant="secondary" className="w-full h-auto py-3 flex-col gap-1 rounded-xl">
              <Plus className="h-4 w-4 text-success" />
              <span className="text-xs font-medium">הכנסה</span>
            </Button>
          </Link>
          <Link to={"/add" as never} search={{ tab: "expense" } as never}>
            <Button variant="secondary" className="w-full h-auto py-3 flex-col gap-1 rounded-xl">
              <Plus className="h-4 w-4 text-destructive" />
              <span className="text-xs font-medium">הוצאה</span>
            </Button>
          </Link>
          <Link to={"/add" as never} search={{ tab: "fuel" } as never}>
            <Button variant="secondary" className="w-full h-auto py-3 flex-col gap-1 rounded-xl">
              <Zap className="h-4 w-4 text-warning" />
              <span className="text-xs font-medium">תדלוק</span>
            </Button>
          </Link>
        </div>

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
  const color = tone === "success" ? "text-success" : tone === "destructive" ? "text-destructive" : "text-muted-foreground";
  return (
    <Card className="transition-shadow hover:shadow-md">
      <CardContent className="p-3.5">
        <div className={`flex items-center gap-1.5 text-xs ${color}`}>{icon}<span className="text-muted-foreground leading-tight">{label}</span></div>
        <div className="num mt-1.5 text-xl font-bold tracking-tight">{value}</div>
      </CardContent>
    </Card>
  );
}

function MiniStat({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <div>
      <div className="text-[11px] text-muted-foreground">{label}</div>
      <div className={`num text-base font-semibold ${accent ? "text-primary" : ""}`}>{value}</div>
    </div>
  );
}
