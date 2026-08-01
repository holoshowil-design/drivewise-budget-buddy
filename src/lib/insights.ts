import { filterByRange, sumIncomes, sumExpenses, fmt, type AppData } from "./store";

export type Insight = {
  id: string;
  tone: "good" | "warn" | "bad" | "info";
  title: string;
  detail: string;
};

function isoOffset(days: number) {
  const d = new Date();
  d.setDate(d.getDate() - days);
  return new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 10);
}

export function buildInsights(data: AppData): Insight[] {
  const c = data.settings.currency;
  const out: Insight[] = [];

  const thisWeek = { from: isoOffset(6), to: isoOffset(0) };
  const lastWeek = { from: isoOffset(13), to: isoOffset(7) };

  const netIn = (r: { from: string; to: string }) =>
    sumIncomes(filterByRange(data.incomes, r.from, r.to)) - sumExpenses(filterByRange(data.expenses, r.from, r.to));

  const cur = netIn(thisWeek);
  const prev = netIn(lastWeek);

  if (prev > 0 || cur > 0) {
    const diff = cur - prev;
    const pct = prev > 0 ? Math.round((diff / prev) * 100) : 100;
    out.push({
      id: "weekcmp",
      tone: diff >= 0 ? "good" : "warn",
      title: diff >= 0 ? `השבוע טוב ב-${Math.abs(pct)}% מהשבוע שעבר` : `השבוע נמוך ב-${Math.abs(pct)}% מהשבוע שעבר`,
      detail: `${fmt(cur, c)} מול ${fmt(prev, c)}`,
    });
  }

  // profit per hour (last 30 days)
  const from30 = isoOffset(29);
  const inc30 = filterByRange(data.incomes, from30, isoOffset(0));
  const exp30 = filterByRange(data.expenses, from30, isoOffset(0));
  const net30 = sumIncomes(inc30) - sumExpenses(exp30);
  const hours30 = inc30.reduce((s, i) => s + (i.hours || 0), 0);
  const km30 = inc30.reduce((s, i) => s + (i.km || 0), 0);

  if (hours30 > 0) {
    const perHour = Math.round(net30 / hours30);
    out.push({
      id: "perhour",
      tone: perHour >= 60 ? "good" : perHour >= 40 ? "info" : "warn",
      title: `${fmt(perHour, c)} רווח נקי לשעה`,
      detail: `לפי ${Math.round(hours30)} שעות ב-30 הימים האחרונים`,
    });
  }

  if (km30 > 0) {
    const fuel30 = exp30.filter((e) => e.category === "fuel").reduce((s, e) => s + e.amount, 0);
    const costPerKm = Math.round((fuel30 / km30) * 100) / 100;
    if (fuel30 > 0) {
      out.push({
        id: "perkm",
        tone: "info",
        title: `${costPerKm}${c} אנרגיה לכל ק״מ`,
        detail: `${Math.round(km30)} ק״מ · ${fmt(fuel30, c)} דלק/חשמל`,
      });
    }
  }

  // best day of week
  const byDow = new Map<number, number>();
  for (const i of filterByRange(data.incomes, isoOffset(59), isoOffset(0))) {
    const dow = new Date(i.date).getDay();
    byDow.set(dow, (byDow.get(dow) || 0) + i.amount * (1 - i.commissionPct / 100) + (i.tip || 0));
  }
  if (byDow.size >= 3) {
    const best = [...byDow.entries()].sort((a, b) => b[1] - a[1])[0];
    const names = ["ראשון", "שני", "שלישי", "רביעי", "חמישי", "שישי", "שבת"];
    out.push({
      id: "bestday",
      tone: "good",
      title: `יום ${names[best[0]]} הוא היום החזק שלך`,
      detail: `סה״כ ${fmt(best[1], c)} בחודשיים האחרונים`,
    });
  }

  // breakeven status this month
  const now = new Date();
  const monthFrom = new Date(now.getFullYear(), now.getMonth(), 1);
  const mFrom = new Date(monthFrom.getTime() - monthFrom.getTimezoneOffset() * 60000).toISOString().slice(0, 10);
  const monthNet = sumIncomes(filterByRange(data.incomes, mFrom, isoOffset(0))) - sumExpenses(filterByRange(data.expenses, mFrom, isoOffset(0)));
  const fixed = data.settings.fixedMonthlyExpenses;
  if (fixed > 0) {
    const remaining = fixed - monthNet;
    out.push({
      id: "breakeven",
      tone: remaining <= 0 ? "good" : "info",
      title: remaining <= 0 ? "כיסית את ההוצאות הקבועות החודש" : `נשאר ${fmt(remaining, c)} עד כיסוי ההוצאות הקבועות`,
      detail: `הוצאות קבועות ${fmt(fixed, c)} · נטו עד כה ${fmt(monthNet, c)}`,
    });
  }

  // streak of days meeting goal
  let streak = 0;
  for (let i = 0; i < 30; i++) {
    const day = isoOffset(i);
    const n = sumIncomes(data.incomes.filter((x) => x.date === day)) - sumExpenses(data.expenses.filter((x) => x.date === day));
    if (n >= data.settings.dailyGoal && data.settings.dailyGoal > 0) streak++;
    else break;
  }
  if (streak >= 2) {
    out.push({ id: "streak", tone: "good", title: `${streak} ימים ברצף מעל היעד`, detail: "תמשיך ככה" });
  }

  // spending spike
  const otherExp30 = exp30.filter((e) => e.category !== "fuel").reduce((s, e) => s + e.amount, 0);
  if (net30 > 0 && otherExp30 / Math.max(1, net30) > 0.3) {
    out.push({
      id: "spend",
      tone: "bad",
      title: "הוצאות שוטפות גבוהות",
      detail: `${fmt(otherExp30, c)} הוצאות (לא דלק) ב-30 יום — מעל 30% מהרווח`,
    });
  }

  return out.slice(0, 5);
}
