import { useEffect, useMemo, useState } from "react";
import { Link } from "@tanstack/react-router";
import { MovieStage } from "@/components/MovieStage";
import { ComicBubble } from "@/components/InkWorld";
import {
  Award,
  ChevronDown,
  Gauge,
  Navigation,
  Sparkles,
  TrendingUp,
  Zap,
  ArrowLeft,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { CountUp } from "@/components/CountUp";
import { calculateDailyMomentum, calculateWorkStreak } from "@/lib/motivation";
import { drivenKm, filterByDate, fmt, fmtPrecise, sumHours, type AppData } from "@/lib/store";
import { dayOf, useDays } from "@/lib/calc";

const iso = (date: Date) =>
  new Date(date.getTime() - date.getTimezoneOffset() * 60000).toISOString().slice(0, 10);

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
    <section
      className={`profit-hero animate-scale-in ${goalReached ? "profit-hero-achieved" : ""}`}
      aria-label="מד רווח יומי"
    >
      {goalReached && <GoalSparkles />}
      <div className="relative z-10 flex items-center justify-between text-xs">
        <span className="flex items-center gap-1.5 font-semibold text-hud-muted">
          <Gauge className="h-4 w-4 text-hud-accent" /> רווח נקי היום
        </span>
        <span
          className={`status-chip ${passedBreakEven ? "status-chip-success" : "status-chip-neutral"}`}
        >
          {passedBreakEven ? "נקודת האיזון עברה" : `איזון ב־${fmt(breakEven, currency)}`}
        </span>
      </div>

      <div className="relative z-10 mx-auto mt-2 h-36 w-full max-w-[21rem]">
        <svg
          viewBox="0 0 220 126"
          className="h-full w-full overflow-visible"
          role="img"
          aria-label={`${Math.round(targetPct)} אחוז מהיעד`}
        >
          <path
            d="M 30 108 A 80 80 0 0 1 190 108"
            className="gauge-track"
            pathLength={pathLength}
          />
          <path
            d="M 30 108 A 80 80 0 0 1 190 108"
            className="gauge-value"
            pathLength={pathLength}
            stroke={passedBreakEven ? "var(--hud-good)" : "var(--hud-accent)"}
            strokeDasharray={pathLength}
            strokeDashoffset={dashOffset}
          />
          <g className="gauge-ticks">
            {Array.from({ length: 11 }, (_, i) => {
              const ang = Math.PI - (i / 10) * Math.PI;
              const r1 = i % 5 === 0 ? 62 : 67;
              return (
                <line
                  key={i}
                  x1={110 + Math.cos(ang) * r1}
                  y1={108 - Math.sin(ang) * r1}
                  x2={110 + Math.cos(ang) * 72}
                  y2={108 - Math.sin(ang) * 72}
                />
              );
            })}
          </g>
          <g className="gauge-needle" style={{ transform: `rotate(${-90 + targetPct * 1.8}deg)` }}>
            <path d="M107 108 L110 46 L113 108 Z" />
            <circle cx="110" cy="108" r="7" />
          </g>
          <circle cx="30" cy="108" r="3" fill="var(--hud-accent)" />
          <circle cx="190" cy="108" r="3" fill="var(--hud-good)" />
        </svg>
        <div className="absolute inset-x-0 bottom-0 text-center">
          <CountUp
            value={net}
            format={(n) => fmt(n, currency)}
            className="num font-display block text-[2.65rem] font-extrabold leading-none text-hud-foreground"
          />
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
          <strong className="num text-sm text-hud-foreground">
            {hourly > 0 ? fmt(hourly, currency) : "—"}
          </strong>
        </div>
      </div>
    </section>
  );
}

export function DriveModeAction({ active }: { active: boolean }) {
  return (
    <Button asChild className="drive-mode-button h-14 w-full justify-between rounded-2xl px-4">
      <Link
        to="/trip"
        search={{ action: active ? undefined : "start_trip", mode: "drive" } as never}
      >
        <span className="flex items-center gap-3">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary-foreground/15">
            <Navigation className="h-4 w-4" />
          </span>
          <span className="text-right">
            <strong className="font-display block text-sm">
              {active ? "חזרה למצב נהיגה" : "הפעל מצב נהיגה"}
            </strong>
            <span className="block text-[10px] font-normal opacity-80">
              מסך כהה, נתונים גדולים ומסך שנשאר פעיל
            </span>
          </span>
        </span>
        {/* Status light, not a toggle: the whole row is a link to drive mode. */}
        <span
          className={`h-3 w-3 shrink-0 rounded-full ${active ? "animate-pulse bg-primary-foreground" : "bg-primary-foreground/40"}`}
          aria-hidden="true"
        />
      </Link>
    </Button>
  );
}

type CoachTone = "start" | "warning" | "progress" | "success";

/** Live, non-shaming coaching based only on today's existing financial state. */
export function MomentumCoach({ data }: { data: AppData }) {
  const momentum = calculateDailyMomentum(data);
  const streak = calculateWorkStreak(data.incomes);
  const { net, goal, breakEven, remaining } = momentum;
  const progress = goal > 0 ? Math.max(0, Math.round((net / goal) * 100)) : 0;
  const state: { tone: CoachTone; emoji: string; title: string; message: string; cta: string } =
    !streak.activeToday
      ? {
          tone: "start",
          emoji: "👋",
          title: streak.current > 0 ? `שומרים על רצף של ${streak.current} ימים` : "מתחילים רצף חדש",
          message: "רישום ההכנסה הראשונה היום ישמור את יום העבודה ברצף.",
          cta: "רשום הכנסה",
        }
      : net < 0
        ? {
            tone: "warning",
            emoji: "🧭",
            title: "מכוונים מחדש",
            message: `הרצף נשמר. חסרים ${fmt(Math.max(0, breakEven - net), data.settings.currency)} כדי לחזור לאיזון.`,
            cta: "המשך לצבור",
          }
        : net < breakEven
          ? {
              tone: "warning",
              emoji: "⛽",
              title: "היום בתנועה",
              message: `הרצף נשמר. עוד ${fmt(Math.max(0, breakEven - net), data.settings.currency)} והיום עובר לרווח.`,
              cta: "המשך לצבור",
            }
          : progress < 70
            ? {
                tone: "progress",
                emoji: "💪",
                title: "עברת לרווח",
                message: `${progress}% מהיעד הושלמו. התחנה הבאה היא ניצחון יומי.`,
                cta: "שמור על הקצב",
              }
            : progress < 100
              ? {
                  tone: "progress",
                  emoji: "🚀",
                  title: "היעד ממש קרוב",
                  message: `נשארו ${fmt(remaining, data.settings.currency)} בלבד כדי להשלים את היום.`,
                  cta: "סוגרים את היעד",
                }
              : {
                  tone: "success",
                  emoji: "🏆",
                  title: "היום הושלם",
                  message: `רצף של ${streak.current} ימים נשמר · כל מה שמכאן מגדיל את הרווח.`,
                  cta: "ממשיכים חזק",
                };

  return (
    <section
      key={`${state.tone}-${momentum.stage}`}
      className={`momentum-coach momentum-coach-${state.tone}`}
      aria-live="polite"
    >
      <div className="coach-stage stage-bg stage-street" aria-hidden="true">
        <MovieStage
          morning
          base={{
            mood:
              state.tone === "start"
                ? "sleepy"
                : state.tone === "warning"
                  ? "grumble"
                  : state.tone === "success"
                    ? "victory"
                    : "smirk",
            taxi: state.tone === "start" ? "tired" : state.tone === "success" ? "zoom" : "happy",
            driving: state.tone === "success",
          }}
          mascotClass="coach-mascot"
          taxiClass="coach-taxi"
        />
        <span className="coach-streak num">🔥 {streak.current}</span>
      </div>
      <ComicBubble
        tone={state.tone === "warning" ? "warn" : state.tone === "start" ? "default" : "win"}
        className="coach-bubble"
      >
        <span className="coach-bubble-emoji" aria-hidden="true">
          {state.emoji}
        </span>
        <span className="min-w-0 flex-1">
          <h2 className="font-display text-base font-extrabold">{state.title}</h2>
          <p>{state.message}</p>
        </span>
        <Link
          to={streak.activeToday ? "/trip" : "/add"}
          search={
            (streak.activeToday
              ? { action: "start_trip", mode: "drive" }
              : { tab: "income" }) as never
          }
          className="momentum-action"
          aria-label={state.cta}
        >
          <ArrowLeft aria-hidden="true" />
        </Link>
      </ComicBubble>
      <DailyJourney hasIncome={streak.activeToday} net={net} breakEven={breakEven} goal={goal} />
    </section>
  );
}

function DailyJourney({
  hasIncome,
  net,
  breakEven,
  goal,
}: {
  hasIncome: boolean;
  net: number;
  breakEven: number;
  goal: number;
}) {
  const steps = ["התחלה", "איזון", "יעד"];
  const done = [hasIncome, hasIncome && net >= breakEven, hasIncome && net >= goal];
  const active = done.findIndex((value) => !value);
  const progressWidth = done[2] ? 100 : done[1] ? 67 : done[0] ? 33 : 0;
  return (
    <div
      className="daily-journey"
      aria-label={active >= 0 ? `התחנה הבאה: ${steps[active]}` : "כל תחנות היום הושלמו"}
    >
      <span className="daily-journey-line">
        <span style={{ width: `${progressWidth}%` }} />
      </span>
      {steps.map((label, index) => (
        <span
          key={label}
          className={`daily-step ${done[index] ? "daily-step-done" : index === active ? "daily-step-active" : ""}`}
        >
          <i>{done[index] ? "✓" : index + 1}</i>
          <b>{label}</b>
        </span>
      ))}
    </div>
  );
}

export function PremiumStats({
  data,
  income,
  expense,
  breakEven,
  forecast,
}: {
  data: AppData;
  income: number;
  expense: number;
  breakEven: number;
  forecast: number;
}) {
  const c = data.settings.currency;
  const hours = sumHours(filterByDate(data.incomes, iso(new Date())));
  const km = drivenKm(
    filterByDate(data.incomes, iso(new Date())),
    filterByDate(data.trips ?? [], iso(new Date())),
  );
  const hourly = hours > 0 ? (income - expense) / hours : 0;
  const kmRatio = km > 0 ? (income - expense) / km : 0;
  const badges = [
    hourly > 70 ? "🔥 תעריף שעה חזק" : "קצב היום",
    kmRatio > 4 ? "⚡ יחס ק״מ מיטבי" : "עלות מבוקרת",
  ];
  const stats = [
    {
      label: "הכנסות היום",
      value: income,
      icon: TrendingUp,
      badge: badges[0],
      tone: "text-success",
      fill: "green",
    },
    { label: "הוצאות כולל דלק", value: expense, icon: Zap, badge: badges[1], tone: "text-warning", fill: "mustard" },
    {
      label: "נקודת איזון",
      value: breakEven,
      icon: Award,
      badge: "יעד מינימום",
      tone: "text-muted-foreground",
      fill: "vermilion",
    },
    {
      label: "תחזית חודשית",
      value: forecast,
      icon: Sparkles,
      badge: forecast > 0 ? "לפי הקצב הנוכחי" : "ממתין לנתונים",
      tone: "text-primary",
      fill: "slate",
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-3">
      {stats.map(({ label, value, icon: Icon, badge, tone, fill }) => (
        <div key={label} className="premium-stat group" data-fill={fill}>
          <div className="flex items-center justify-between gap-2">
            <Icon className={`h-4 w-4 ${tone}`} />
            <span className="truncate text-[9px] font-semibold text-muted-foreground">{badge}</span>
          </div>
          <CountUp
            value={value}
            format={(n) => fmt(n, c)}
            className="num font-display mt-3 block text-xl font-bold"
          />
          <span className="mt-0.5 block text-[11px] text-muted-foreground">{label}</span>
        </div>
      ))}
    </div>
  );
}

export function InteractiveWeeklyEarnings({ data }: { data: AppData }) {
  const [selected, setSelected] = useState(6);
  const c = data.settings.currency;
  const days = useDays(data);
  const series = useMemo(() => {
    return Array.from({ length: 7 }, (_, index) => {
      const date = new Date();
      date.setDate(date.getDate() - (6 - index));
      const d = dayOf(days, iso(date), data);
      return {
        date: d.date,
        label: date.toLocaleDateString("he-IL", { weekday: "short" }).replace("יום ", ""),
        net: d.net,
        km: d.km,
        trips: d.trips.length,
        records: d.incomes.length,
      };
    });
  }, [days, data]);
  // Profit bars grow up from the zero line, loss bars hang below it.
  const maxPos = Math.max(0, ...series.map((item) => item.net));
  const maxNeg = Math.max(0, ...series.map((item) => -item.net));
  const span = Math.max(1, maxPos + maxNeg);
  const posShare = maxNeg === 0 ? 100 : maxPos === 0 ? 0 : (maxPos / span) * 100;
  const current = series[selected] ?? series[6];
  const total = series.reduce((sum, item) => sum + item.net, 0);

  return (
    <section className="premium-panel animate-fade-in-up">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="font-display text-sm font-bold">רווח שבועי</h2>
          <p className="mt-0.5 text-[11px] text-muted-foreground">לחיצה על יום מציגה את הפירוט</p>
        </div>
        <span
          className={`status-chip ${total >= 0 ? "status-chip-success" : "status-chip-danger"}`}
        >
          {fmt(total, c)}
        </span>
      </div>
      <div className="mt-5 flex h-40 gap-2" dir="rtl">
        {series.map((item, index) => {
          const active = selected === index;
          const negative = item.net < 0;
          const height =
            item.net === 0
              ? 0
              : Math.max(10, (Math.abs(item.net) / (negative ? maxNeg : maxPos)) * 100);
          const bar = (
            <span
              className={`weekly-bar ${negative ? "weekly-bar-negative" : ""} ${active ? "weekly-bar-active" : ""} ${index === 6 ? "weekly-bar-today" : ""}`}
              style={{
                height: `${height}%`,
                ...(negative ? { transformOrigin: "top", borderRadius: "3px 3px 8px 8px" } : {}),
              }}
            />
          );
          return (
            <button
              key={item.date}
              type="button"
              className="group flex h-full min-w-0 flex-1 flex-col items-center gap-1"
              aria-label={`${item.label}, ${fmt(item.net, c)}`}
              aria-pressed={active}
              onClick={() => setSelected(index)}
            >
              <span
                className={`num text-[9px] font-semibold transition-opacity ${active ? "opacity-100" : "opacity-0 group-hover:opacity-100"}`}
              >
                {Math.round(item.net)}
              </span>
              <span className="flex w-full min-h-0 flex-1 flex-col items-center">
                <span
                  className="flex w-full items-end justify-center"
                  style={{ height: `${posShare}%` }}
                >
                  {!negative && item.net !== 0 && bar}
                </span>
                <span className="w-full border-t border-muted-foreground/40" aria-hidden="true" />
                <span
                  className="flex w-full items-start justify-center"
                  style={{ height: `${100 - posShare}%` }}
                >
                  {negative && bar}
                </span>
              </span>
              <span
                className={`text-[10px] font-bold ${active ? "text-primary" : "text-muted-foreground"}`}
              >
                {item.label}
              </span>
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
          <strong className="num block text-sm">
            {current.trips} / {current.records}
          </strong>
        </div>
        <div>
          <span className="text-[10px] text-muted-foreground">רווח לק״מ</span>
          <strong className="num block text-sm">
            {current.km > 0 ? fmtPrecise(current.net / current.km, c) : "—"}
          </strong>
        </div>
        <ChevronDown className="h-4 w-4 self-center text-muted-foreground" />
      </div>
    </section>
  );
}

function GoalSparkles() {
  return (
    <div className="goal-sparkles" aria-hidden="true">
      {Array.from({ length: 12 }, (_, index) => (
        <span key={index} style={{ "--spark": index } as React.CSSProperties} />
      ))}
    </div>
  );
}
