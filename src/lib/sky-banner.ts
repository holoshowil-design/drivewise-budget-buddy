/** One day's net profit, as the dashboard counts it. */
export type BannerDay = { date: string; net: number };

const WEEKDAYS = ["ראשון", "שני", "שלישי", "רביעי", "חמישי", "שישי", "שבת"];

/**
 * The line on the banner the little plane tows across the home stage: one true, cheerful
 * fact from the driver's own numbers. Returns null when there is nothing good to say yet
 * (the plane stays in the hangar).
 *
 * `days` are the last days, oldest first, the last one being today. `seed` picks between
 * the facts that hold, so the banner changes from day to day.
 */
export function bannerLine(
  days: BannerDay[],
  streak: { current: number; best: number },
  money: (n: number) => string,
  seed: number,
): string | null {
  const lines: string[] = [];
  const past = days.slice(0, -1);
  const today = days[days.length - 1];
  const best = past.reduce<BannerDay | null>((b, d) => (d.net > (b?.net ?? 0) ? d : b), null);

  if (today && best && today.net > best.net) lines.push(`שיא השבוע נשבר היום: ${money(today.net)}`);
  else if (best) {
    const weekday = WEEKDAYS[new Date(`${best.date}T12:00:00`).getDay()];
    lines.push(`שיא השבוע: ${money(best.net)} ביום ${weekday}`);
  }
  const week = days.reduce((sum, d) => sum + d.net, 0);
  if (week > 0 && days.filter((d) => d.net > 0).length >= 2) {
    lines.push(`${money(week)} בשבעה ימים`);
  }
  if (streak.current >= 3) {
    lines.push(
      streak.current >= streak.best
        ? `${streak.current} ימי עבודה ברצף, שיא אישי`
        : `${streak.current} ימי עבודה ברצף`,
    );
  }
  if (lines.length === 0) return null;
  return lines[Math.abs(Math.floor(seed)) % lines.length];
}
