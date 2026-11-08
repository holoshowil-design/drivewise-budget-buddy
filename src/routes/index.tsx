import { createFileRoute } from "@tanstack/react-router";
import { useAppData, todayISO } from "@/lib/store";
import { dayOf, monthForecast, useDays } from "@/lib/calc";
import { InsightsCard } from "@/components/InsightsCard";
import { KmCostCard } from "@/components/KmCostCard";
import { lazy, Suspense } from "react";
import {
  DailyProfitGauge,
  DriveModeAction,
  InteractiveWeeklyEarnings,
  MomentumCoach,
  PremiumStats,
} from "@/components/PremiumDashboard";

import { AccountBadge } from "@/components/AccountBadge";
import { WorkStatus } from "@/components/WorkStatus";
import { useEffect, useState } from "react";
import { ACTIVE_EVENT, readActive } from "@/lib/active-trip";
import { isSideDrive } from "@/lib/between-trip";

// recharts is heavy: load the chart cards only when the dashboard renders them.
const charts = () => import("@/components/DashboardCharts");
const MonthPaceCard = lazy(() => charts().then((m) => ({ default: m.MonthPaceCard })));
const IncomeVsExpenseCard = lazy(() => charts().then((m) => ({ default: m.IncomeVsExpenseCard })));
const ProfitabilityGauge = lazy(() => charts().then((m) => ({ default: m.ProfitabilityGauge })));

function ChartSlot({ children }: { children: React.ReactNode }) {
  return (
    <Suspense
      fallback={<div className="h-56 animate-pulse rounded-2xl bg-muted/40" aria-hidden="true" />}
    >
      {children}
    </Suspense>
  );
}

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "דרייבר - דשבורד" },
      { name: "description", content: "סיכום ההכנסות וההוצאות שלך, יעדים יומיים ומצב רווחיות." },
      { property: "og:title", content: "דרייבר - דשבורד" },
      {
        property: "og:description",
        content: "סיכום ההכנסות וההוצאות שלך, יעדים יומיים ומצב רווחיות.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Dashboard,
});

function Dashboard() {
  const { data, ready } = useAppData();
  const days = useDays(data);
  const [tripActive, setTripActive] = useState(false);
  useEffect(() => {
    // Only a work trip counts: a between-trips measurement still lets the button start one.
    const check = () => setTripActive(Boolean(readActive() && !isSideDrive(readActive())));
    check();
    window.addEventListener("storage", check);
    window.addEventListener(ACTIVE_EVENT, check);
    return () => {
      window.removeEventListener("storage", check);
      window.removeEventListener(ACTIVE_EVENT, check);
    };
  }, []);
  if (!ready) return null;

  const today = todayISO();
  const { settings } = data;
  const c = settings.currency;

  const day = dayOf(days, today, data);
  const incomeToday = day.incomeNet;
  const expenseToday = day.costs;
  const netToday = day.net;
  const hoursToday = day.hours;
  const profitabilityPct = incomeToday > 0 ? Math.round((netToday / incomeToday) * 100) : 0;
  const goalPct =
    settings.dailyGoal > 0 ? Math.min(100, Math.round((netToday / settings.dailyGoal) * 100)) : 0;

  // breakeven daily = (fixed monthly / workdays) + today's variable expenses
  const breakeven = Math.round(
    settings.fixedMonthlyExpenses / Math.max(1, settings.workDaysPerMonth) + expenseToday,
  );

  const now = new Date();
  const forecast = Math.round(monthForecast(days, data, today).forecast);

  const hour = now.getHours();
  const greeting =
    hour < 5
      ? "לילה טוב"
      : hour < 12
        ? "בוקר טוב"
        : hour < 17
          ? "צהריים טובים"
          : hour < 21
            ? "ערב טוב"
            : "לילה טוב";

  return (
    <div className="mx-auto max-w-xl">
      <header className="flex items-center justify-between gap-3 px-4 pb-4 pt-[calc(1.5rem+env(safe-area-inset-top,0px))]">
        <div>
          <p className="text-xs font-semibold text-primary">
            {new Date().toLocaleDateString("he-IL", {
              weekday: "long",
              day: "numeric",
              month: "long",
            })}
          </p>
          <h1 className="font-display mt-1 text-2xl font-bold">{greeting}</h1>
        </div>
        <AccountBadge />
      </header>

      <div className="space-y-3 px-4 pb-4">
        <WorkStatus />
        {/* First thing on the screen: starting a trip needs no scrolling. */}
        <DriveModeAction active={tripActive} />
      </div>

      <div className="stagger space-y-4 px-4">
        <DailyProfitGauge
          net={netToday}
          goal={settings.dailyGoal}
          breakEven={breakeven}
          currency={c}
          profitability={profitabilityPct}
          hourly={hoursToday > 0 ? netToday / hoursToday : 0}
        />
        <MomentumCoach data={data} />
        <PremiumStats
          data={data}
          income={incomeToday}
          expense={expenseToday}
          breakEven={breakeven}
          forecast={forecast}
        />
        <InteractiveWeeklyEarnings data={data} />

        <ChartSlot>
          <ProfitabilityGauge data={data} />
        </ChartSlot>

        <ChartSlot>
          <MonthPaceCard data={data} />
        </ChartSlot>

        <ChartSlot>
          <IncomeVsExpenseCard data={data} />
        </ChartSlot>

        <KmCostCard data={data} />

        <InsightsCard data={data} />
        {/* Adding a record is the + in the bottom bar; the month totals live in the
            profitability and month-pace cards above, and in full on the reports page. */}
      </div>
    </div>
  );
}
