import { g as filterByDate, at as totalCosts, n as netProfit, t as todayISO, N as netFromIncome } from "./router-DhZGCYXD.mjs";
const DAY = 864e5;
function isoFromDate(date) {
  return new Date(date.getTime() - date.getTimezoneOffset() * 6e4).toISOString().slice(0, 10);
}
function previousDay(iso) {
  const date = /* @__PURE__ */ new Date(`${iso}T12:00:00`);
  date.setDate(date.getDate() - 1);
  return isoFromDate(date);
}
function calculateWorkStreak(incomes, today = todayISO()) {
  const days = [
    ...new Set(incomes.filter((income) => income.amount > 0).map((income) => income.date))
  ].sort();
  if (days.length === 0) return { current: 0, best: 0, activeToday: false, milestone: null };
  let best = 1;
  let run = 1;
  for (let index = 1; index < days.length; index += 1) {
    const previous = (/* @__PURE__ */ new Date(`${days[index - 1]}T12:00:00`)).getTime();
    const current2 = (/* @__PURE__ */ new Date(`${days[index]}T12:00:00`)).getTime();
    run = Math.round((current2 - previous) / DAY) === 1 ? run + 1 : 1;
    best = Math.max(best, run);
  }
  const activeToday = days.includes(today);
  const anchor = activeToday ? today : previousDay(today);
  let current = 0;
  let cursor = anchor;
  const daySet = new Set(days);
  while (daySet.has(cursor)) {
    current += 1;
    cursor = previousDay(cursor);
  }
  if (!activeToday && !daySet.has(previousDay(today))) current = 0;
  const milestone = activeToday && [3, 7, 14, 30].includes(current) ? current : null;
  return { current, best, activeToday, milestone };
}
function calculateDailyMomentum(data, date = todayISO()) {
  const incomes = filterByDate(data.incomes, date);
  const expenses = filterByDate(data.expenses, date);
  const trips = filterByDate(data.trips ?? [], date);
  const costs = totalCosts(incomes, expenses, data.vehicle, data.settings, trips);
  const net = netProfit(incomes, expenses, data.vehicle, data.settings, trips);
  const breakEven = Math.round(
    data.settings.fixedMonthlyExpenses / Math.max(1, data.settings.workDaysPerMonth) + costs
  );
  const goal = data.settings.dailyGoal;
  const stage = incomes.length === 0 ? "start" : net >= goal ? "victory" : "stability";
  const target = stage === "stability" && net < breakEven ? breakEven : goal;
  return {
    stage,
    net,
    breakEven,
    goal,
    progress: target > 0 ? Math.max(0, Math.min(100, Math.round(net / target * 100))) : 0,
    remaining: Math.max(0, target - net)
  };
}
function incomeMotivation(data, income) {
  const before = calculateDailyMomentum(data, income.date);
  const afterData = {
    ...data,
    incomes: [...data.incomes, { ...income, id: "motivation-preview" }]
  };
  const after = calculateDailyMomentum(afterData, income.date);
  const delta = netFromIncome({ ...income });
  if (before.net < after.goal && after.net >= after.goal)
    return {
      tone: "milestone",
      title: "היעד היומי הושג",
      message: "היום הושלם. כל הכנסה נוספת מגדילה את הרווח.",
      delta,
      milestone: "goal"
    };
  if (before.net < after.breakEven && after.net >= after.breakEven)
    return {
      tone: "milestone",
      title: "עברת לרווח",
      message: `נקודת האיזון מאחוריך. נשארו ${Math.max(0, after.goal - after.net).toFixed(0)} ₪ ליעד.`,
      delta,
      milestone: "break-even"
    };
  if (filterByDate(data.incomes, income.date).length === 0)
    return {
      tone: "positive",
      title: "יום העבודה התחיל",
      message: `הרצף נשמר. נוספו ${delta.toFixed(0)} ₪ נטו.`,
      delta
    };
  return {
    tone: "positive",
    title: "התקדמות טובה",
    message: `נוספו ${delta.toFixed(0)} ₪ נטו · נשארו ${after.remaining.toFixed(0)} ₪ לתחנה הבאה.`,
    delta
  };
}
function expenseMotivation(data, expense) {
  const before = calculateDailyMomentum(data, expense.date);
  const afterData = {
    ...data,
    expenses: [...data.expenses, { ...expense, id: "motivation-preview" }]
  };
  const after = calculateDailyMomentum(afterData, expense.date);
  if (before.net >= before.breakEven && after.net < after.breakEven)
    return {
      tone: "corrective",
      title: "המספרים עודכנו",
      message: `חזרת מתחת לאיזון. חסרים ${Math.max(0, after.breakEven - after.net).toFixed(0)} ₪ כדי לחזור לרווח.`,
      delta: after.net - before.net
    };
  return {
    tone: "corrective",
    title: expense.category === "fuel" ? "התדלוק נכנס לחישוב" : "ההוצאה נכנסה לחישוב",
    message: `התמונה נשארת מדויקת. נשארו ${after.remaining.toFixed(0)} ₪ לתחנה הבאה.`,
    delta: after.net - before.net
  };
}
function tripMotivation(data, trip, income) {
  if (income) return incomeMotivation(data, { ...income, km: 0, tripId: "motivation-preview" });
  const before = calculateDailyMomentum(data, trip.date);
  const after = calculateDailyMomentum(
    { ...data, trips: [...data.trips, { ...trip, id: "motivation-preview" }] },
    trip.date
  );
  return {
    tone: "positive",
    title: "הנסיעה תועדה",
    message: `נוספו ${trip.km.toFixed(1)} ק״מ למעקב. הנטו עודכן לפי עלות הדלק.`,
    delta: after.net - before.net
  };
}
export {
  calculateWorkStreak as a,
  calculateDailyMomentum as c,
  expenseMotivation as e,
  incomeMotivation as i,
  tripMotivation as t
};
