import { readActive, writeActive, type ActiveTrip } from "@/lib/active-trip";
import { STAND_AFTER_MS, chargingNow, engineOn } from "@/lib/engine";
import { fmtDuration } from "@/lib/store";

/**
 * While the car stands: is the engine on? Shows what the app thinks (the charger,
 * or the driver's tap) and lets the driver correct it with one tap. Idle fuel is
 * counted only while the engine is on.
 */
export function EngineChip({ active, byCharger }: { active: ActiveTrip; byCharger: boolean }) {
  const now = Date.now();
  const standing = now - (active.lastMoveAt ?? active.startedAt) >= STAND_AFTER_MS;
  const idle = active.idleSeconds ?? 0;
  if (!standing && idle < 60) return null;
  const on = engineOn(active, byCharger, chargingNow());
  const set = (value: boolean) => {
    const cur = readActive();
    if (cur) writeActive({ ...cur, engine: { on: value, at: Date.now() } });
  };
  const state =
    on === true
      ? active.engine
        ? "דלוק"
        : "דלוק (המטען עובד)"
      : on === false
        ? active.engine
          ? "כבוי"
          : "כבוי (המטען לא עובד)"
        : "לא ידוע";
  return (
    <div className="num mt-2 flex items-center justify-between gap-2 rounded-xl bg-muted/40 px-3 py-2 text-xs">
      <span className="text-muted-foreground">
        {standing ? `עומד · מנוע ${state}` : "מנוע"}
        {idle >= 60 && ` · בעמידה עם מנוע דלוק ${fmtDuration(idle)}`}
      </span>
      {standing && (
        <button
          type="button"
          onClick={() => set(on !== true)}
          className="shrink-0 rounded-lg border px-2.5 py-1.5 font-semibold"
        >
          {on === true ? "כיביתי מנוע" : "המנוע דלוק"}
        </button>
      )}
    </div>
  );
}
