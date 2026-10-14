/** How many recent incomes are looked at when picking common amounts. */
const RECENT = 200;

/**
 * The gross amounts the driver gets most often, most frequent first (the more
 * recent one wins a tie). Only amounts that came up at least twice, so a
 * one-off fare is never offered.
 */
export function commonAmounts(
  incomes: { amount: number; date: string; time?: string }[],
  limit = 4,
): number[] {
  const recent = [...incomes]
    .sort((a, b) => `${b.date} ${b.time ?? ""}`.localeCompare(`${a.date} ${a.time ?? ""}`))
    .slice(0, RECENT);
  const stats = new Map<number, { count: number; rank: number }>();
  recent.forEach((income, rank) => {
    const amount = Math.round(income.amount * 100) / 100;
    if (!(amount > 0)) return;
    const s = stats.get(amount);
    if (s) s.count += 1;
    else stats.set(amount, { count: 1, rank });
  });
  return [...stats.entries()]
    .filter(([, s]) => s.count >= 2)
    .sort((a, b) => b[1].count - a[1].count || a[1].rank - b[1].rank)
    .slice(0, limit)
    .map(([amount]) => amount);
}
