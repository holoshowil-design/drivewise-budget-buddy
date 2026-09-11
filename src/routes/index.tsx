import { createFileRoute, Link } from "@tanstack/react-router";
import { useAppData, todayISO, filterByDate, filterByRange, sumIncomes, fmt, monthRange, totalCosts, sumHours } from "@/lib/store";
import { Card, CardContent } from "@/components/ui/card";
import { InsightsCard } from "@/components/InsightsCard";
import { KmCostCard } from "@/components/KmCostCard";
import { MonthPaceCard, IncomeVsExpenseCard, ProfitabilityGauge } from "@/components/DashboardCharts";
import { DailyProfitGauge, DriveModeAction, InteractiveWeeklyEarnings, PremiumStats } from "@/components/PremiumDashboard";

import { Zap, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AccountBadge } from "@/components/AccountBadge";
import { useEffect, useState } from "react";



export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "דרייבר - דשבורד" },
      { name: "description", content: "סיכום ההכנסות וההוצאות שלך, יעדים יומיים ומצב רווחיות." },
      { property: "og:title", content: "דרייבר - דשבורד" },
      { property: "og:description", content: "סיכום ההכנסות וההוצאות שלך, יעדים יומיים ומצב רווחיות." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Dashboard,
});

function Dashboard() {
  const { data, ready } = useAppData();
  const [tripActive, setTripActive] = useState(false);
  useEffect(() => {
    const check = () => setTripActive(Boolean(localStorage.getItem("driver-active-trip")));
    check();
    window.addEventListener("storage", check);
    return () => window.removeEventListener("storage", check);
  }, []);
  if (!ready) return null;

  const today = todayISO();
  const { settings } = data;
  const c = settings.currency;

  const todayIncomes = filterByDate(data.incomes, today);
  const todayExpenses = filterByDate(data.expenses, today);
  const todayTrips = filterByDate(data.trips ?? [], today);
  const incomeToday = sumIncomes(todayIncomes);
  const expenseToday = totalCosts(todayIncomes, todayExpenses, data.vehicle, settings, todayTrips);
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
  const monthTrips = filterByRange(data.trips ?? [], from, to);
  const monthIncome = sumIncomes(monthIncomes);
  const monthExpense = totalCosts(monthIncomes, monthExpenses, data.vehicle, settings, monthTrips);
  const monthNet = monthIncome - monthExpense;
  const daysWorked = new Set(monthIncomes.map((i) => i.date)).size;
  const dayOfMonth = now.getDate();
  const forecast = daysWorked > 0 ? Math.round((monthNet / daysWorked) * 30) : 0;

  const hour = now.getHours();
  const greeting = hour < 5 ? "לילה טוב" : hour < 12 ? "בוקר טוב" : hour < 17 ? "צהריים טובים" : hour < 21 ? "ערב טוב" : "לילה טוב";

  return (
    <div className="mx-auto max-w-xl">
      <header className="flex items-center justify-between gap-3 px-4 pb-4 pt-[calc(1.5rem+env(safe-area-inset-top,0px))]">
        <div>
          <p className="text-xs font-semibold text-primary">{new Date().toLocaleDateString("he-IL", { weekday: "long", day: "numeric", month: "long" })}</p>
          <h1 className="font-display mt-1 text-2xl font-bold">{greeting}</h1>
        </div>
        <AccountBadge />
      </header>

      <div className="stagger space-y-4 px-4">
        <DailyProfitGauge net={netToday} goal={settings.dailyGoal} breakEven={breakeven} currency={c} profitability={profitabilityPct} hourly={hoursToday > 0 ? netToday / hoursToday : 0} />
        <DriveModeAction active={tripActive} />
        <PremiumStats data={data} income={incomeToday} expense={expenseToday} breakEven={breakeven} forecast={forecast} />
        <InteractiveWeeklyEarnings data={data} />

        <ProfitabilityGauge data={data} />

        <MonthPaceCard data={data} />

        <IncomeVsExpenseCard data={data} />

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

function MiniStat({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <div>
      <div className="text-[11px] text-muted-foreground">{label}</div>
      <div className={`num text-base font-semibold ${accent ? "text-primary" : ""}`}>{value}</div>
    </div>
  );
}
