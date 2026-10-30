import type { ActiveTrip } from "@/lib/active-trip";

/**
 * Stops inside a work trip, with the reason the driver picked. Waiting for the
 * passenger goes into the trip's existing waiting time; every other reason is
 * kept in `stops` (seconds per reason). The trip's total time does not change:
 * a stop is part of the work, this only says where the time went.
 */
export type StopReason = "fuel" | "food" | "prayer" | "wait" | "pickup" | "rest" | "other";

export type StopSeconds = Partial<Record<StopReason, number>>;

export const STOP_REASONS: { id: StopReason; label: string }[] = [
  { id: "wait", label: "המתנה לנוסע" },
  { id: "pickup", label: "איסוף / הורדה נוספת" },
  { id: "fuel", label: "תדלוק" },
  { id: "food", label: "הפסקת אוכל" },
  { id: "prayer", label: "תפילה" },
  { id: "rest", label: "מנוחה / שירותים" },
  { id: "other", label: "עצירה אחרת" },
];

export const stopLabel = (reason: StopReason) =>
  STOP_REASONS.find((r) => r.id === reason)?.label ?? "עצירה";

/** Driving this far (km) after a stop started ends it by itself. */
export const RESUME_AFTER_KM = 0.5;

/** Starts a stop at `at` (epoch ms); a stop already running is closed first. */
export function startStop(cur: ActiveTrip, reason: StopReason, at: number): ActiveTrip {
  const closed = closeStop(cur, at);
  return { ...closed, stop: { reason, at, km: closed.km } };
}

/** Ends the running stop at `at` and adds its time to the trip (nothing when none runs). */
export function closeStop(cur: ActiveTrip, at: number): ActiveTrip {
  const stop = cur.stop;
  if (!stop) return cur;
  const seconds = Math.max(0, Math.round((at - stop.at) / 1000));
  const next: ActiveTrip = { ...cur, stop: undefined };
  if (stop.reason === "wait") next.waitSeconds = (cur.waitSeconds ?? 0) + seconds;
  else next.stops = { ...cur.stops, [stop.reason]: (cur.stops?.[stop.reason] ?? 0) + seconds };
  // The time stood is accounted for: don't ask "are you waiting?" about it again.
  next.lastMoveAt = Math.max(cur.lastMoveAt ?? cur.startedAt, at);
  return next;
}

/** The trip after a GPS fix: a stop ends by itself once the car has driven on. */
export function resumeIfDriving(cur: ActiveTrip, now: number): ActiveTrip {
  if (!cur.stop || cur.km - cur.stop.km < RESUME_AFTER_KM) return cur;
  return closeStop(cur, Math.min(now, cur.lastMoveAt ?? now));
}

/** Only the reasons that have time, or undefined when there are none. */
export function cleanStops(stops: StopSeconds | undefined): StopSeconds | undefined {
  if (!stops) return undefined;
  const out: StopSeconds = {};
  for (const r of STOP_REASONS) {
    const s = Math.round(stops[r.id] ?? 0);
    if (s > 0) out[r.id] = s;
  }
  return Object.keys(out).length ? out : undefined;
}

/**
 * Where the stopped time went on trips from `fromDate` on (seconds per reason).
 * The waiting time of the trips counts as "wait".
 */
export function sumStops(
  trips: { date: string; waitSeconds?: number; stops?: StopSeconds }[],
  fromDate: string,
): StopSeconds {
  const out: StopSeconds = {};
  for (const t of trips) {
    if (t.date < fromDate) continue;
    if (t.waitSeconds) out.wait = (out.wait ?? 0) + t.waitSeconds;
    for (const r of STOP_REASONS) {
      const s = t.stops?.[r.id];
      if (s) out[r.id] = (out[r.id] ?? 0) + s;
    }
  }
  return out;
}

/** "תדלוק 6 ד׳ · תפילה 12 ד׳" for the stops of a trip (waiting is shown on its own). */
export function stopsText(stops: StopSeconds | undefined): string {
  if (!stops) return "";
  return STOP_REASONS.filter((r) => r.id !== "wait" && (stops[r.id] ?? 0) >= 30)
    .map((r) => `${r.label} ${Math.max(1, Math.round((stops[r.id] ?? 0) / 60))} ד׳`)
    .join(" · ");
}
