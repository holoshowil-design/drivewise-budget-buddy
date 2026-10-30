import type { ActiveTrip } from "@/lib/active-trip";

/**
 * Standing time and whether the engine runs while standing. A phone cannot read
 * the engine, so the signs are: the driver's own tap ("engine off"), and, when the
 * driver said the car charger works only with the engine on, the phone charging.
 * Unknown means the time counts but no idle fuel is charged.
 */

/** Not moving for this long counts as standing (a red light is not waiting). */
export const STAND_AFTER_MS = 2 * 60 * 1000;

type Battery = EventTarget & { charging: boolean };
let battery: Battery | null = null;
let asked = false;

/** Whether the phone is charging now, or null when the browser does not say. */
export function chargingNow(): boolean | null {
  if (!asked && typeof navigator !== "undefined") {
    asked = true;
    const nav = navigator as Navigator & { getBattery?: () => Promise<Battery> };
    nav
      .getBattery?.()
      .then((b) => {
        battery = b;
      })
      .catch(() => {});
  }
  return battery ? battery.charging : null;
}

/** Engine on while standing: the driver's tap first, then the charger, else unknown. */
export function engineOn(
  cur: Pick<ActiveTrip, "engine">,
  byCharger: boolean,
  charging: boolean | null,
): boolean | null {
  if (cur.engine) return cur.engine.on;
  if (byCharger && charging != null) return charging;
  return null;
}

/**
 * Counts the standing time since it was last counted: into the waiting time of a
 * drive between trips (waiting for the next ride), and into the idle time when the
 * engine runs. A tap on the engine is forgotten once the car drives again.
 */
export function countStanding(cur: ActiveTrip, now: number, engine: boolean | null): ActiveTrip {
  const lastMove = cur.lastMoveAt ?? cur.startedAt;
  const next: ActiveTrip = { ...cur, standCountedAt: now };
  if (cur.engine && lastMove > cur.engine.at + 30_000) next.engine = undefined;
  const from = Math.max(cur.standCountedAt ?? cur.startedAt, lastMove + STAND_AFTER_MS);
  const add = Math.max(0, (now - from) / 1000);
  if (add <= 0) return next;
  if (cur.kind === "between") next.waitSeconds = (cur.waitSeconds ?? 0) + add;
  const on = next.engine ? next.engine.on : engine;
  if (on) next.idleSeconds = (cur.idleSeconds ?? 0) + add;
  return next;
}
