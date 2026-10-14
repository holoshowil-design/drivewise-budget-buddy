import { netFromIncome, type AppData } from "@/lib/store";

/** Four-hour blocks of the working day; the last one runs past midnight. */
export const BLOCKS = [
  { from: 6, label: "06–10" },
  { from: 10, label: "10–14" },
  { from: 14, label: "14–18" },
  { from: 18, label: "18–22" },
  { from: 22, label: "22–02" },
  { from: 2, label: "02–06" },
] as const;

export const WEEKDAYS = ["א׳", "ב׳", "ג׳", "ד׳", "ה׳", "ו׳", "ש׳"] as const;

/** How far back the map looks, so it follows the current routine. */
export const WINDOW_DAYS = 90;
/** A slot needs this many worked days before it can be called the best. */
export const MIN_DAYS = 2;

export type Slot = {
  weekday: number; // 0 = Sunday
  block: number; // index into BLOCKS
  total: number; // net in this slot over the window
  days: number; // distinct dates that had income in this slot
  avg: number; // total / days: what a worked day in this slot brings
};

function blockOf(hour: number) {
  if (hour >= 22 || hour < 2) return 4;
  if (hour < 6) return 5;
  return Math.floor((hour - 6) / 4);
}

const weekdayOf = (date: string) => {
  const [y, m, d] = date.split("-").map(Number);
  return new Date(y, m - 1, d).getDay();
};

/**
 * Net income per weekday and time block over the last WINDOW_DAYS, as the average
 * a worked day brings in that slot. An income from a GPS trip is placed by the
 * trip's start time; any other income by the time it was saved. Incomes with no
 * time are left out.
 */
export function bestHours(data: AppData, today: string) {
  const [y, m, d] = today.split("-").map(Number);
  const from = new Date(y, m - 1, d - (WINDOW_DAYS - 1));
  const since = `${from.getFullYear()}-${String(from.getMonth() + 1).padStart(2, "0")}-${String(from.getDate()).padStart(2, "0")}`;
  const tripTime = new Map((data.trips ?? []).map((t) => [t.id, t.time]));
  const cells = new Map<string, { total: number; dates: Set<string> }>();
  for (const income of data.incomes) {
    if (income.date < since || income.date > today) continue;
    const time = (income.tripId && tripTime.get(income.tripId)) || income.time;
    const hour = time ? Number(time.slice(0, 2)) : NaN;
    if (!Number.isFinite(hour)) continue;
    const key = `${weekdayOf(income.date)}:${blockOf(hour)}`;
    let cell = cells.get(key);
    if (!cell) cells.set(key, (cell = { total: 0, dates: new Set() }));
    cell.total += netFromIncome(income);
    cell.dates.add(income.date);
  }
  const slots: Slot[] = [...cells].map(([key, c]) => {
    const [weekday, block] = key.split(":").map(Number);
    return { weekday, block, total: c.total, days: c.dates.size, avg: c.total / c.dates.size };
  });
  const best = slots.filter((s) => s.days >= MIN_DAYS).sort((a, b) => b.avg - a.avg)[0] ?? null;
  return { slots, best };
}
