import { isDrivingNow, type ActiveTrip } from "@/lib/active-trip";
import { isBetween } from "@/lib/between-trip";

/**
 * What the app is doing right now, for the small status on the home screen:
 * a work trip, the time between trips (driving or waiting), or nothing measured.
 */
export type WorkStatus =
  | { kind: "off" }
  | { kind: "work" | "between-driving" | "between-waiting"; seconds: number; km: number };

export function workStatus(active: ActiveTrip | null, now = Date.now()): WorkStatus {
  if (!active) return { kind: "off" };
  const seconds = Math.max(0, Math.round((now - active.startedAt) / 1000));
  const km = active.km;
  if (!isBetween(active)) return { kind: "work", seconds, km };
  return { kind: isDrivingNow(active, now) ? "between-driving" : "between-waiting", seconds, km };
}

export const WORK_STATUS_LABEL: Record<WorkStatus["kind"], string> = {
  work: "בנסיעת עבודה",
  "between-driving": "בין נסיעות · נוהג",
  "between-waiting": "בין נסיעות · ממתין",
  off: "לא מודד כרגע",
};
