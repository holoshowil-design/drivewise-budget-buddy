import { useEffect } from "react";
import { ACTIVE_EVENT, readActive, writeActive } from "@/lib/active-trip";
import { watchLocation } from "@/lib/location";
import { applyFix, setGpsError } from "@/lib/trip-gps";

type WakeLock = { release: () => Promise<void> };

/**
 * Measures the active trip wherever the driver is in the app. Lives in the root
 * layout, so moving from the trip screen to the dashboard or to an expense no
 * longer stops the GPS. Pauses while the end-of-trip form is open (`pausedAt`).
 * The trip in localStorage is the single source of truth; screens follow it
 * through ACTIVE_EVENT.
 */
export function TripWatcher() {
  useEffect(() => {
    let stop: (() => void) | null = null;
    let wake: WakeLock | null = null;

    const acquireWake = () => {
      if (wake || document.visibilityState !== "visible") return;
      const nav = navigator as Navigator & {
        wakeLock?: { request: (type: "screen") => Promise<WakeLock> };
      };
      nav.wakeLock
        ?.request("screen")
        .then((lock) => {
          if (!stop) {
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
      if (want && !stop) {
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
          {
            // Installed app: keeps measuring with the screen locked.
            background: {
              title: "נסיעה פעילה",
              message: "דרייבר מודד ק״מ. פתח את האפליקציה כדי לסיים.",
            },
          },
        );
        acquireWake();
      } else if (!want && stop) {
        stop();
        stop = null;
        releaseWake();
        setGpsError(null);
      }
    };

    const onVisible = () => {
      if (document.visibilityState === "visible" && stop) acquireWake();
    };

    sync();
    window.addEventListener(ACTIVE_EVENT, sync);
    window.addEventListener("storage", sync);
    document.addEventListener("visibilitychange", onVisible);
    return () => {
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
