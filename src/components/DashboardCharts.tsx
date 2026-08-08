import { useMemo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  ComposedChart,
  Bar,
  Line,
  BarChart,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ReferenceLine,
  RadialBarChart,
  RadialBar,
  PolarAngleAxis,
  Cell,
} from "recharts";
import { CalendarRange, LineChart as LineChartIcon, Gauge, CalendarDays } from "lucide-react";
import {
  filterByDate,
  filterByRange,
  monthRange,
  netProfit,
  sumIncomes,
  totalCosts,
  fmt,
  type AppData,
} from "@/lib/store";

const iso = (d: Date) => new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 10);

const tooltipStyle = {
  background: "var(--card)",
  border: "1px solid var(--border)",
  borderRadius: 12,
  fontSize: 12,
  boxShadow: "var(--shadow-card)",
  direction: "rtl" as const,
};

function SectionTitle({ icon, title, hint }: { icon: React.ReactNode; title: string; hint?: string }) {
  return (
    <div className="mb-3 flex items-center justify-between gap-2">
      <h3 className="flex items-center gap-1.5 text-sm font-semibold">
        <span className="text-primary">{icon}</span>
        {title}
      </h3>
      {hint && <span className="text-[11px] text-muted-foreground">{hint}</span>}
    </div>
  );
}

/** מצטבר חודשי מול קצב היעד */
export function MonthPaceCard({ data }: { data: AppData }) {
  const c = data.settings.currency;
  const now = new Date();
  const { from, to } = monthRange(now.getFullYear(), now.getMonth());
  const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
  const today = now.getDate();

  const { series, cum, target, projected } = useMemo(() => {
    const goalMonth = data.settings.dailyGoal * data.settings.workDaysPerMonth;
    let running = 0;
    const series: { day: number; cum: number | null; pace: number }[] = [];
    for (let d = 1; d <= daysInMonth; d++) {
      const date = iso(new Date(now.getFullYear(), now.getMonth(), d));
      if (d <= today) {
        running += netProfit(filterByDate(data.incomes, date), filterByDate(data.expenses, date), data.vehicle, data.settings);
      }
      series.push({ day: d, cum: d <= today ? Math.round(running) : null, pace: Math.round((goalMonth / daysInMonth) * d) });
    }
    const projected = today > 0 ? Math.round((running / today) * daysInMonth) : 0;
    return { series, cum: Math.round(running), target: goalMonth, projected };
  }, [data, daysInMonth, today]);

  const pct = target > 0 ? Math.round((cum / target) * 100) : 0;
  const paceNow = Math.round((target / daysInMonth) * today);
  const ahead = cum - paceNow;
  void from; void to;

  return (
    <Card>
      <CardContent className="p-4">
        <SectionTitle icon={<CalendarRange className="h-4 w-4" />} title="מצטבר החודש מול קצב היעד" hint={`${pct}% מהיעד`} />
        <div className="mb-3 flex items-end justify-between">
          <div>
            <div className="num text-2xl font-extrabold tracking-tight">{fmt(cum, c)}</div>
            <div className={`text-xs font-medium ${ahead >= 0 ? "text-success" : "text-destructive"}`}>
              {ahead >= 0 ? `מקדים את הקצב ב-${fmt(ahead, c)}` : `מפגר אחרי הקצב ב-${fmt(-ahead, c)}`}
            </div>
          </div>
          <div className="text-left">
            <div className="text-[11px] text-muted-foreground">תחזית לסוף החודש</div>
            <div className="num text-base font-bold">{fmt(projected, c)}</div>
          </div>
        </div>
        <div className="h-44">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={series} margin={{ top: 4, right: 4, left: 4, bottom: 0 }}>
              <defs>
                <linearGradient id="cumFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="var(--primary)" stopOpacity={0.35} />
                  <stop offset="100%" stopColor="var(--primary)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
              <XAxis dataKey="day" stroke="var(--muted-foreground)" fontSize={10} tickLine={false} axisLine={false} interval={4} />
              <Tooltip
                contentStyle={tooltipStyle}
                labelFormatter={(v) => `יום ${v} בחודש`}
                formatter={(v: number, n) => [fmt(v || 0, c), n === "cum" ? "מצטבר" : "קצב יעד"]}
              />
              <Area type="monotone" dataKey="pace" stroke="var(--muted-foreground)" strokeDasharray="4 4" strokeWidth={1.5} fill="none" />
              <Area type="monotone" dataKey="cum" stroke="var(--primary)" strokeWidth={2.5} fill="url(#cumFill)" connectNulls />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}

/** הכנסות מול הוצאות + קו נטו – 14 ימים */
export function IncomeVsExpenseCard({ data }: { data: AppData }) {
  const c = data.settings.currency;
  const series = useMemo(() => {
    const out: { day: string; income: number; expense: number; net: number }[] = [];
    for (let i = 13; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const date = iso(d);
      const inc = filterByDate(data.incomes, date);
      const exp = filterByDate(data.expenses, date);
      const income = sumIncomes(inc);
      const expense = totalCosts(inc, exp, data.vehicle, data.settings);
      out.push({
        day: d.toLocaleDateString("he-IL", { day: "numeric", month: "numeric" }),
        income: Math.round(income),
        expense: -Math.round(expense),
        net: Math.round(income - expense),
      });
    }
    return out;
  }, [data]);

  const has = series.some((s) => s.income !== 0 || s.expense !== 0);

  return (
    <Card>
      <CardContent className="p-4">
        <SectionTitle icon={<LineChartIcon className="h-4 w-4" />} title="הכנסות מול הוצאות" hint="14 ימים" />
        {has ? (
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={series} margin={{ top: 4, right: 4, left: 4, bottom: 0 }} stackOffset="sign">
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                <XAxis dataKey="day" stroke="var(--muted-foreground)" fontSize={10} tickLine={false} axisLine={false} interval={2} />
                <YAxis hide />
                <ReferenceLine y={0} stroke="var(--border)" />
                <Tooltip
                  contentStyle={tooltipStyle}
                  formatter={(v: number, n) => [fmt(Math.abs(v), c), n === "income" ? "הכנסה" : n === "expense" ? "הוצאה" : "נטו"]}
                />
                <Bar dataKey="income" stackId="a" fill="var(--success)" radius={[4, 4, 0, 0]} maxBarSize={16} />
                <Bar dataKey="expense" stackId="a" fill="var(--destructive)" radius={[0, 0, 4, 4]} maxBarSize={16} />
                <Line type="monotone" dataKey="net" stroke="var(--chart-2)" strokeWidth={2} dot={false} />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <Empty />
        )}
        <div className="mt-3 flex items-center justify-center gap-4 text-[11px] text-muted-foreground">
          <Dot color="var(--success)" label="הכנסות" />
          <Dot color="var(--destructive)" label="הוצאות" />
          <Dot color="var(--chart-2)" label="נטו" />
        </div>
      </CardContent>
    </Card>
  );
}

/** ממוצע רווח לפי יום בשבוע – איזה ימים משתלמים */
export function WeekdayProfitCard({ data }: { data: AppData }) {
  const c = data.settings.currency;
  const names = ["א׳", "ב׳", "ג׳", "ד׳", "ה׳", "ו׳", "ש׳"];

  const series = useMemo(() => {
    const sums = Array.from({ length: 7 }, () => ({ total: 0, days: new Set<string>() }));
    const from = iso(new Date(Date.now() - 55 * 86400000));
    const to = iso(new Date());
    const incomes = filterByRange(data.incomes, from, to);
    const dates = new Set(incomes.map((i) => i.date));
    for (const date of dates) {
      const dow = new Date(date).getDay();
      sums[dow].total += netProfit(filterByDate(data.incomes, date), filterByDate(data.expenses, date), data.vehicle, data.settings);
      sums[dow].days.add(date);
    }
    return sums.map((s, i) => ({ day: names[i], avg: s.days.size ? Math.round(s.total / s.days.size) : 0 }));
  }, [data]);

  const max = Math.max(...series.map((s) => s.avg));
  const has = series.some((s) => s.avg !== 0);
  const best = series.reduce((a, b) => (b.avg > a.avg ? b : a), series[0]);

  return (
    <Card>
      <CardContent className="p-4">
        <SectionTitle icon={<CalendarDays className="h-4 w-4" />} title="ממוצע רווח לפי יום בשבוע" hint="8 שבועות" />
        {has ? (
          <>
            <div className="h-40">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={series} margin={{ top: 4, right: 0, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                  <XAxis dataKey="day" stroke="var(--muted-foreground)" fontSize={11} tickLine={false} axisLine={false} />
                  <Tooltip contentStyle={tooltipStyle} cursor={{ fill: "var(--muted)" }} formatter={(v: number) => [fmt(v, c), "ממוצע נטו"]} />
                  <Bar dataKey="avg" radius={[6, 6, 0, 0]} maxBarSize={30}>
                    {series.map((s, i) => (
                      <Cell key={i} fill={s.avg === max && max > 0 ? "var(--primary)" : "color-mix(in oklab, var(--primary) 28%, transparent)"} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
            {best.avg > 0 && (
              <p className="mt-2 text-center text-xs text-muted-foreground">
                יום <span className="font-semibold text-foreground">{best.day}</span> הכי משתלם — ממוצע {fmt(best.avg, c)}
              </p>
            )}
          </>
        ) : (
          <Empty />
        )}
      </CardContent>
    </Card>
  );
}

/** מד רווחיות – כמה מכל שקל נשאר בכיס */
export function ProfitabilityGauge({ data }: { data: AppData }) {
  const c = data.settings.currency;
  const now = new Date();
  const { from, to } = monthRange(now.getFullYear(), now.getMonth());
  const inc = filterByRange(data.incomes, from, to);
  const exp = filterByRange(data.expenses, from, to);
  const income = sumIncomes(inc);
  const costs = totalCosts(inc, exp, data.vehicle, data.settings);
  const pct = income > 0 ? Math.max(0, Math.min(100, Math.round(((income - costs) / income) * 100))) : 0;
  const tone = pct >= 65 ? "var(--success)" : pct >= 45 ? "var(--warning)" : "var(--destructive)";
  const msg = pct >= 65 ? "רווחיות מצוינת" : pct >= 45 ? "רווחיות סבירה — כדאי לצמצם הוצאות" : "רווחיות נמוכה — בדוק דלק ועמלות";

  return (
    <Card>
      <CardContent className="flex items-center gap-4 p-4">
        <div className="relative h-28 w-28 shrink-0">
          <ResponsiveContainer width="100%" height="100%">
            <RadialBarChart innerRadius="72%" outerRadius="100%" data={[{ value: pct }]} startAngle={90} endAngle={-270}>
              <PolarAngleAxis type="number" domain={[0, 100]} tick={false} />
              <RadialBar dataKey="value" cornerRadius={12} fill={tone} background={{ fill: "var(--muted)" }} />
            </RadialBarChart>
          </ResponsiveContainer>
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
            <span className="num text-xl font-extrabold" style={{ color: tone }}>{pct}%</span>
          </div>
        </div>
        <div className="min-w-0">
          <h3 className="flex items-center gap-1.5 text-sm font-semibold"><Gauge className="h-4 w-4 text-primary" />רווחיות החודש</h3>
          <p className="mt-1 text-xs text-muted-foreground leading-snug">{msg}</p>
          <p className="mt-1.5 text-xs">
            מתוך <span className="num font-semibold">{fmt(income, c)}</span> הכנסות · עלויות{" "}
            <span className="num font-semibold text-destructive">{fmt(costs, c)}</span>
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

function Dot({ color, label }: { color: string; label: string }) {
  return (
    <span className="flex items-center gap-1.5">
      <span className="h-2 w-2 rounded-full" style={{ background: color }} />
      {label}
    </span>
  );
}

function Empty() {
  return (
    <div className="flex h-32 flex-col items-center justify-center gap-1 rounded-xl bg-muted/40 text-center">
      <p className="text-sm font-medium">אין עדיין מספיק נתונים</p>
      <p className="text-xs text-muted-foreground">הוסף רשומות והגרף יתמלא</p>
    </div>
  );
}
