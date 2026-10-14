/** Rows that share a date, in the order the dates first appear. */
export type DayGroup<T> = { date: string; rows: T[] };

/** Groups rows by their date, keeping the incoming order of dates and of rows within a day. */
export function groupByDay<T>(rows: T[], dateOf: (row: T) => string): DayGroup<T>[] {
  const groups: DayGroup<T>[] = [];
  const byDate = new Map<string, DayGroup<T>>();
  for (const row of rows) {
    const date = dateOf(row);
    let group = byDate.get(date);
    if (!group) {
      group = { date, rows: [] };
      byDate.set(date, group);
      groups.push(group);
    }
    group.rows.push(row);
  }
  return groups;
}

/** The day before a YYYY-MM-DD date, as YYYY-MM-DD. */
function dayBefore(iso: string) {
  const [y, m, d] = iso.split("-").map(Number);
  const prev = new Date(Date.UTC(y, m - 1, d - 1));
  return prev.toISOString().slice(0, 10);
}

/** "היום", "אתמול", or the weekday and date ("יום ד׳, 14 באוק׳"). */
export function dayLabel(date: string, today: string) {
  if (date === today) return "היום";
  if (date === dayBefore(today)) return "אתמול";
  const [y, m, d] = date.split("-").map(Number);
  return new Date(y, m - 1, d).toLocaleDateString("he-IL", {
    weekday: "short",
    day: "numeric",
    month: "short",
  });
}
