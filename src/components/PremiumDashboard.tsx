import { useEffect, useMemo, useState } from "react";
import { Link } from "@tanstack/react-router";
import { Award, ChevronDown, Gauge, Navigation, Sparkles, TrendingUp, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CountUp } from "@/components/CountUp";
import {
  filterByDate,
  fmt,
  netProfit,
  sumHours,
  sumIncomes,
  sumKm,
  sumTripKm,
  totalCosts,
  type AppData,
} from "@/lib/store";

const iso = (date: Date) => new Date(date.getTime() - date.getTimezoneOffset() * 60000).toISOString().slice(0, 10);

export function DailyProfitGauge({
  net,
  goal,
  breakEven,
  currency,
  profitability,
  hourly,
}: {
  net: number;
  goal: number;
  breakEven: number;
  currency: string;
  profitability: number;
  hourly: number;
}) {
  const targetPct = goal > 0 ? Math.max(0, Math.min(100, (net / goal) * 100)) : 0;
  const passedBreakEven = net >= breakEven;
  const pathLength = 251.2;
  const dashOffset = pathLength * (1 - targetPct / 100);
  const goalReached = targetPct >= 100;

  return (
    <section className="profit-hero animate-scale-in" aria-label="מד רווח יומי">
      {goalReached && <GoalSparkles />}
      <div className="relative z-10 flex items-center justify-between text-xs">
        <span className="flex items-center gap-1.5 font-semibold text-hud-muted">
          <Gauge className="h-4 w-4 text-hud-accent" /> רווח נקי היום
        </span>
        <span className={`status-chip ${passedBreakEven ? "status-chip-success" : "status-chip-neutral"}`}>
          {passedBreakEven ? "נקודת האיזון עברה" : `איזון ב־${fmt(breakEven, currency)}`}
        </span>
      </div>

      <div className="relative z-10 mx-auto mt-2 h-36 w-full max-w-[21rem]">
        <svg viewBox="0 0 220 126" className="h-full w-full overflow-visible" role="img" aria-label={`${Math.round(targetPct)} אחוז מהיעד`}>
          <defs>
            <linearGradient id="profitGaugeBefore" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0" stopColor="var(--warning)" />
              <stop offset="1" stopColor="var(--hud-neutral)" />
            </linearGradient>
            <linearGradient id="profitGaugeAfter" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0" stopColor="var(--primary)" />
              <stop offset="1" stopColor="var(--hud-accent)" />
            </linearGradient>
            <filter id="gaugeGlow" x="-30%" y="-30%" width="160%" height="160%">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
            </filter>
          </defs>
          <path d="M 30 108 A 80 80 0 0 1 190 108" className="gauge-track" pathLength={pathLength} />
          <path
            d="M 30 108 A 80 80 0 0 1 190 108"
            className="gauge-value"
            pathLength={pathLength}
            stroke={passedBreakEven ? "url(#profitGaugeAfter)" : "url(#profitGaugeBefore)"}
            strokeDasharray={pathLength}
            strokeDashoffset={dashOffset}
            filter={passedBreakEven ? "url(#gaugeGlow)" : undefined}
          />
          <circle cx="30" cy="108" r="3" fill="var(--warning)" />
          <circle cx="190" cy="108" r="3" fill="var(--hud-accent)" />
        </svg>
        <div className="absolute inset-x-0 bottom-0 text-center">
          <CountUp value={net} format={(n) => fmt(n, currency)} className="num font-display block text-[2.65rem] font-extrabold leading-none text-hud-foreground" />
          <span className="mt-1 block text-xs font-semibold text-hud-muted">
            {Math.round(targetPct)}% מתוך יעד {fmt(goal, currency)}
          </span>
        </div>
      </div>

      <div className="relative z-10 mt-3 grid grid-cols-2 divide-x divide-x-reverse divide-hud-border rounded-xl border border-hud-border bg-hud-surface/60 py-2.5 text-center backdrop-blur-md">
        <div>
          <span className="block text-[10px] text-hud-muted">רווחיות</span>
          <strong className="num text-sm text-hud-foreground">{profitability}%</strong>
        </div>
        <div>
          <span className="block text-[10px] text-hud-muted">רווח לשעה</span>
          <strong className="num text-sm text-hud-foreground">{hourly > 0 ? fmt(hourly, currency) : "—"}</strong>
        </div>
      </div>
    </section>
  );
}

export function DriveModeAction({ active }: { active: boolean }) {
  return (
    <Link to="/trip" search={{ action: active ? undefined : "start_trip", mode: "drive" } as never} className="block">
      <Button className="drive-mode-button h-14 w-full justify-between rounded-2xl px-4">
        <span className="flex items-center gap-3">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary-foreground/15">
            <Navigation className="h-4 w-4" />
          </span>
          <span className="text-right">
            <strong className="font-display block text-sm">{active ? "חזרה למצב נהיגה" : "הפעל מצב נהיגה"}</strong>
            <span className="block text-[10px] font-normal opacity-80">מסך כהה, נתונים גדולים ומסך שנשאר פעיל</span>
          </span>
        </span>
        <span className="relative flex h-6 w-11 rounded-full bg-primary-foreground/20 p-1">
          <span className={`h-4 w-4 rounded-full bg-primary-foreground transition-transform ${active ? "-translate-x-5" : ""}`} />
        </span>
      </Button>
    </Link>
  );
}

export function PremiumStats({ data, income, expense, breakEven, forecast }: { data: AppData; income: number; expense: number; breakEven: number; forecast: number }) {
  const c = data.settings.currency;
  const hours = sumHours(filterByDate(data.incomes, iso(new Date())));
  const km = sumKm(filterByDate(data.incomes, iso(new Date()))) + sumTripKm(filterByDate(data.trips ?? [], iso(new Date())));
  const hourly = hours > 0 ? (income - expense) / hours : 0;
  const kmRatio = km > 0 ? (income - expense) / km : 0;
  const badges = [
    hourly > 70 ? "🔥 תעריף שעה חזק" : "קצב היום",
    kmRatio > 4 ? "⚡ יחס ק״מ מיטבי" : "עלות מבוקרת",
  ];
  const stats = [
    { label: "הכנסות היום", value: income, icon: TrendingUp, badge: badges[0], tone: "text-success" },
    { label: "הוצאות כולל דלק", value: expense, icon: Zap, badge: badges[1], tone: "text-warning" },
    { label: "נקודת איזון", value: breakEven, icon: Award, badge: "יעד מינימום", tone: "text-muted-foreground" },
    { label: "תחזית חודשית", value: forecast, icon: Sparkles, badge: forecast > 0 ? "לפי הקצב הנוכחי" : "ממתין לנתונים", tone: "text-primary" },
  ];

  return (
    <div className="grid grid-cols-2 gap-3">
      {stats.map(({ label, value, icon: Icon, badge, tone }) => (
        <div key={label} className="premium-stat group">
          <div className="flex items-center justify-between gap-2">
            <Icon className={`h-4 w-4 ${tone}`} />
            <span className="truncate text-[9px] font-semibold text-muted-foreground">{badge}</span>
          </div>
          <CountUp value={value} format={(n) => fmt(n, c)} className="num font-display mt-3 block text-xl font-bold" />
          <span className="mt-0.5 block text-[11px] text-muted-foreground">{label}</span>
        </div>
      ))}
    </div>
  );
}

export function InteractiveWeeklyEarnings({ data }: { data: AppData }) {
  const [selected, setSelected] = useState(6);
  const c = data.settings.currency;
  const series = useMemo(() => {
    return Array.from({ length: 7 }, (_, index) => {
      const date = new Date();
      date.setDate(date.getDate() - (6 - index));
      const day = iso(date);
      const incomes = filterByDate(data.incomes, day);
      const expenses = filterByDate(data.expenses, day);
      const trips = filterByDate(data.trips ?? [], day);
      const net = netProfit(incomes, expenses, data.vehicle, data.settings, trips);
      const km = sumKm(incomes) + sumTripKm(trips);
      return {
        date: day,
        label: date.toLocaleDateString("he-IL", { weekday: "short" }).replace("יום ", ""),
        net,
        km,
        trips: trips.length,
        records: incomes.length,
        income: sumIncomes(incomes),
        costs: totalCosts(incomes, expenses, data.vehicle, data.settings, trips),
      };
    });
  }, [data]);
  const ceiling = Math.max(1, ...series.map((item) => Math.abs(item.net)));
  const current = series[selected] ?? series[6];
  const total = series.reduce((sum, item) => sum + item.net, 0);

  return (
    <section className="premium-panel animate-fade-in-up">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="font-display text-sm font-bold">רווח שבועי</h2>
          <p className="mt-0.5 text-[11px] text-muted-foreground">לחיצה על יום מציגה את הפירוט</p>
        </div>
        <span className={`status-chip ${total >= 0 ? "status-chip-success" : "status-chip-danger"}`}>{fmt(total, c)}</span>
      </div>
      <div className="mt-5 flex h-36 items-end gap-2" dir="rtl">
        {series.map((item, index) => {
          const height = item.net === 0 ? 8 : Math.max(16, (Math.abs(item.net) / ceiling) * 100);
          const active = selected === index;
          return (
            <button
              key={item.date}
              type="button"
              className="group flex h-full min-w-0 flex-1 flex-col items-center justify-end gap-2"
              aria-label={`${item.label}, ${fmt(item.net, c)}`}
              aria-pressed={active}
              onClick={() => setSelected(index)}
            >
              <span className={`num text-[9px] font-semibold transition-opacity ${active ? "opacity-100" : "opacity-0 group-hover:opacity-100"}`}>{Math.round(item.net)}</span>
              <span className={`weekly-bar ${item.net < 0 ? "weekly-bar-negative" : ""} ${active ? "weekly-bar-active" : ""}`} style={{ height: `${height}%` }} />
              <span className={`text-[10px] font-bold ${active ? "text-primary" : "text-muted-foreground"}`}>{item.label}</span>
            </button>
          );
        })}
      </div>
      <div key={current.date} className="weekly-detail animate-fade-in">
        <div>
          <span className="text-[10px] text-muted-foreground">נטו</span>
          <strong className="num block text-sm">{fmt(current.net, c)}</strong>
        </div>
        <div>
          <span className="text-[10px] text-muted-foreground">נסיעות / רשומות</span>
          <strong className="num block text-sm">{current.trips} / {current.records}</strong>
        </div>
        <div>
          <span className="text-[10px] text-muted-foreground">רווח לק״מ</span>
          <strong className="num block text-sm">{current.km > 0 ? fmt(current.net / current.km, c) : "—"}</strong>
        </div>
        <ChevronDown className="h-4 w-4 self-center text-muted-foreground" />
      </div>
    </section>
  );
}

function GoalSparkles() {
  return (
    <div className="goal-sparkles" aria-hidden="true">
      {Array.from({ length: 12 }, (_, index) => <span key={index} style={{ "--spark": index } as React.CSSProperties} />)}
    </div>
  );
}