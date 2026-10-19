import { useEffect, useRef } from "react";
import { ACTIVE_EVENT, readActive, writeActive } from "@/lib/active-trip";
import { betweenIdleEnd, betweenToTrip } from "@/lib/between-trip";
import { watchLocation } from "@/lib/location";
import { useAppData } from "@/lib/store";
import { applyFix, setGpsError } from "@/lib/trip-gps";

type WakeLock = { release: () => Promise<void> };

const NOTIFICATION = {
  work: {
    title: "נסיעה פעילה",
    message: "דרייבר מודד ק״מ. פתח את האפליקציה כדי לסיים.",
  },
  between: {
    title: "מדידה בין נסיעות",
    message: "דרייבר מודד ק״מ וזמן בין הנסיעות. פתח את האפליקציה כדי להתחיל נסיעה.",
  },
} as const;

/**
 * Measures the active trip wherever the driver is in the app. Lives in the root
 * layout, so moving from the trip screen to the dashboard or to an expense no
 * longer stops the GPS. Pauses while the end-of-trip form is open (`pausedAt`).
 * The trip in localStorage is the single source of truth; screens follow it
 * through ACTIVE_EVENT.
 *
 * A "between" measurement (the drive between work trips) runs all day, so it does
 * not hold the screen on, and it closes by itself once the car has stood still
 * for a while, saving the drive at the moment the car last moved.
 */
export function TripWatcher() {
  const { addTrip } = useAppData();
  const addTripRef = useRef(addTrip);
  addTripRef.current = addTrip;

  useEffect(() => {
    let stop: (() => void) | null = null;
    let watchKind: "work" | "between" | null = null;
    let wake: WakeLock | null = null;

    const acquireWake = () => {
      if (wake || document.visibilityState !== "visible") return;
      const nav = navigator as Navigator & {
        wakeLock?: { request: (type: "screen") => Promise<WakeLock> };
      };
      nav.wakeLock
        ?.request("screen")
        .then((lock) => {
          if (!stop || watchKind === "between") {
            lock.release().catch(() => {});
            return;
          }
          wake = lock;
          // The browser drops the lock when the app is hidden; forget it so it is re-taken.
          (lock as unknown as EventTarget).addEventListener?.("release", () => {
            if (wake === lock) wake = null;
          });
        })
        .catch(() => {});
    };

    const releaseWake = () => {
      wake?.release().catch(() => {});
      wake = null;
    };

    const sync = () => {
      const cur = readActive();
      const want = Boolean(cur && !cur.pausedAt);
      const kind = cur?.kind === "between" ? "between" : "work";
      // Stop when nothing is to be measured, or restart when the kind changed (the
      // background notification names what is being measured).
      if (stop && (!want || kind !== watchKind)) {
        stop();
        stop = null;
        watchKind = null;
        releaseWake();
        if (!want) setGpsError(null);
      }
      if (want && !stop) {
        watchKind = kind;
        stop = watchLocation(
          (fix) => {
            setGpsError(null);
            const trip = readActive();
            if (!trip || trip.pausedAt) return;
            const next = applyFix(trip, fix, Date.now());
            if (next) writeActive(next);
          },
          (err) =>
            setGpsError(
              err.message === "no-geolocation"
                ? "המכשיר או הדפדפן לא תומכים באיתור מיקום."
                : err.kind === "denied"
                  ? "אין הרשאת מיקום. אשר מיקום, או הזן את הק״מ ידנית בהזנת הכנסה."
                  : "לא הצלחנו לקבל מיקום כרגע. בדוק שה-GPS דלוק.",
            ),
          // Installed app: keeps measuring with the screen locked.
          { background: NOTIFICATION[kind] },
        );
        if (kind === "work") acquireWake();
      }
    };

    // A between measurement that stood still for long enough is saved as it was when the
    // car last moved. Also runs once at start, for one left from before the app was closed.
    const closeIdleBetween = () => {
      const cur = readActive();
      if (!cur || cur.pausedAt) return;
      const end = betweenIdleEnd(cur, Date.now());
      if (end === null) return;
      writeActive(null);
      const trip = betweenToTrip(cur, end);
      if (trip) addTripRef.current(trip);
    };

    const onVisible = () => {
      if (document.visibilityState === "visible" && stop && watchKind === "work") acquireWake();
    };

    closeIdleBetween();
    sync();
    const idleTimer = window.setInterval(closeIdleBetween, 30_000);
    window.addEventListener(ACTIVE_EVENT, sync);
    window.addEventListener("storage", sync);
    document.addEventListener("visibilitychange", onVisible);
    return () => {
      window.clearInterval(idleTimer);
      window.removeEventListener(ACTIVE_EVENT, sync);
      window.removeEventListener("storage", sync);
      document.removeEventListener("visibilitychange", onVisible);
      stop?.();
      stop = null;
      releaseWake();
    };
  }, []);

  return null;
}
