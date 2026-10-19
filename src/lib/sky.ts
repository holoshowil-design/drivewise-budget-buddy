/**
 * The painted stages follow the real light outside: dawn, day, dusk or night.
 * Sunrise and sunset are a smooth fit for Tel Aviv on the local clock (summer time included):
 * sunset runs from about 16:40 in late December to about 19:50 in late June.
 * Off by up to half an hour at most, which is plenty for a light change on a drawing.
 */
export type SkyPhase = "dawn" | "day" | "dusk" | "night";

function dayOfYear(date: Date): number {
  const start = new Date(date.getFullYear(), 0, 1);
  return (
    Math.round(
      (new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime() - start.getTime()) /
        86400000,
    ) + 1
  );
}

/** Sunrise and sunset as decimal hours on the local clock. */
export function sunTimes(date: Date): { sunrise: number; sunset: number } {
  const season = Math.sin((2 * Math.PI * (dayOfYear(date) - 80)) / 365);
  return { sunrise: 6.05 - 0.55 * season, sunset: 18.25 + 1.58 * season };
}

export function skyPhase(date: Date): SkyPhase {
  const { sunrise, sunset } = sunTimes(date);
  const h = date.getHours() + date.getMinutes() / 60;
  if (h < sunrise - 0.4 || h >= sunset + 0.7) return "night";
  if (h < sunrise + 1.6) return "dawn";
  if (h >= sunset - 1.2) return "dusk";
  return "day";
}
