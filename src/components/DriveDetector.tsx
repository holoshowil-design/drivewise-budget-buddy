import { useEffect, useRef, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { Car, Check, X } from "lucide-react";
import { toast } from "sonner";
import { useAppData } from "@/lib/store";
import {
  ACTIVE_EVENT,
  readActive,
  writeActive,
  haversine,
  notifyIfHidden,
  requestNotifyPermission,
  type ActiveTrip,
} from "@/lib/active-trip";
import { hasBackgroundTracking, watchLocation } from "@/lib/location";
import { trackBetweenOn } from "@/lib/between-trip";
import { autoToSide, confirmAuto, isUnconfirmedAuto } from "@/lib/auto-trip";

const MIN_SPEED_KMH = 15;
const SUSTAIN_MS = 20_000;

const BACKGROUND_NOTE = {
  title: "דרייבר מזהה נסיעות",
  message: "כשתתחיל לנסוע המדידה תתחיל לבד.",
};

const two = (n: number) => String(n).padStart(2, "0");
const dateOf = (ms: number) => {
  const d = new Date(ms);
  return `${d.getFullYear()}-${two(d.getMonth() + 1)}-${two(d.getDate())}`;
};
const timeOf = (ms: number) => {
  const d = new Date(ms);
  return `${two(d.getHours())}:${two(d.getMinutes())}`;
};

/**
 * Watches movement while no trip runs. When sustained driving is detected it
 * starts measuring by itself, from the moment the car started moving, and a bar
 * at the top asks whether this is a work trip (the trip screen asks again once
 * the car stops). In the installed app it can keep watching with the app closed.
 */
export function DriveDetector() {
  const { data, ready } = useAppData();
  const navigate = useNavigate();
  const [active, setActive] = useState<ActiveTrip | null>(null);
  const [synced, setSynced] = useState(false);
  const lastRef = useRef<{ lat: number; lon: number; t: number } | null>(null);
  // The drive so far while it is not yet sustained: when it started and how far it went.
  const runRef = useRef<{ since: number; km: number } | null>(null);

  // Never ask for location on first load: run only after the user turned the
  // feature on, or (setting never touched) when location was already granted.
  const [granted, setGranted] = useState(false);
  useEffect(() => {
    if (typeof navigator === "undefined" || !navigator.permissions?.query) return;
    navigator.permissions
      .query({ name: "geolocation" })
      .then((status) => {
        setGranted(status.state === "granted");
        status.onchange = () => setGranted(status.state === "granted");
      })
      .catch(() => {});
  }, []);
  const setting = data.settings.autoDetectTrip;
  const enabled = ready && (setting === true || (setting === undefined && granted));
  const background = data.settings.detectInBackground === true && hasBackgroundTracking();

  useEffect(() => {
    const sync = () => {
      setActive(readActive());
      setSynced(true);
    };
    sync();
    window.addEventListener(ACTIVE_EVENT, sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener(ACTIVE_EVENT, sync);
      window.removeEventListener("storage", sync);
    };
  }, []);

  const hasActive = !synced || Boolean(active);

  useEffect(() => {
    if (!enabled || hasActive) return;
    lastRef.current = null;
    runRef.current = null;
    return watchLocation(
      (fix) => {
        if (fix.accuracy > 80) return;
        const point = { lat: fix.lat, lon: fix.lon, t: fix.time };
        const prev = lastRef.current;
        const step = prev ? haversine(prev, point) : 0;
        let speed = fix.speedKmh;
        if (speed == null && prev) {
          const dt = (point.t - prev.t) / 1000;
          if (dt > 0) speed = (step / dt) * 3600;
        }
        lastRef.current = point;
        if (speed == null) return;
        const driving = speed >= MIN_SPEED_KMH && speed < 220;
        const now = Date.now();
        if (!driving) {
          runRef.current = null;
          return;
        }
        const run = runRef.current ?? { since: prev?.t ?? point.t, km: 0 };
        run.km += step;
        runRef.current = run;
        if (point.t - run.since < SUSTAIN_MS) return;
        runRef.current = null;
        if (readActive()) return;
        writeActive({
          auto: true,
          startedAt: run.since,
          date: dateOf(run.since),
          time: timeOf(run.since),
          km: run.km,
          lastMoveAt: now,
          last: { lat: fix.lat, lon: fix.lon, t: fix.time, acc: fix.accuracy },
        });
        requestNotifyPermission();
        notifyIfHidden("התחלתי למדוד נסיעה", "זוהתה נסיעה. בסוף אשאל אם זו הייתה נסיעת עבודה.");
        if (navigator.vibrate) navigator.vibrate([200, 100, 200]);
        if (document.visibilityState === "visible")
          void navigate({ to: "/trip", search: { mode: "drive" } });
      },
      () => {},
      {
        maximumAge: 5000,
        timeout: 30000,
        // Installed app, when the driver turned it on: watch with the app closed too.
        background: background ? BACKGROUND_NOTE : undefined,
      },
    );
  }, [enabled, hasActive, background, navigate]);

  if (!isUnconfirmedAuto(active) || active?.pausedAt) return null;
  const cur = active as ActiveTrip;

  const yes = () => {
    writeActive(confirmAuto(cur));
    toast.success("נסיעת עבודה · ממשיך למדוד");
  };
  const no = () => {
    writeActive(autoToSide(cur, "private"));
    toast("נסיעה פרטית · נמדדים ק״מ ודלק, לא נכנס לחישובי העבודה. נשמר לבד כשהרכב חונה.", {
      duration: 8000,
      action: { label: "ביטול", onClick: () => writeActive(cur) },
    });
  };
  const between = () => {
    writeActive(autoToSide(cur, "between"));
    toast("נמדד כנסיעה בין נסיעות (רק ק״מ וזמן)");
  };

  // A quiet bar, not a full-screen question: the driver may be driving right now.
  return (
    <div
      className="fixed inset-x-0 top-0 z-[70] px-3 pt-[calc(0.5rem+env(safe-area-inset-top,0px))]"
      role="region"
      aria-label="נסיעה שזוהתה"
    >
      <div className="mx-auto max-w-md rounded-2xl border-2 bg-card p-3 shadow-xl">
        <div className="flex items-center gap-2 text-sm font-bold">
          <Car className="h-5 w-5 shrink-0 text-primary" />
          <span>זוהתה נסיעה · מודד מ-{cur.time}. נסיעת עבודה?</span>
        </div>
        <div
          className={`mt-2 grid gap-2 ${trackBetweenOn(data.settings) ? "grid-cols-3" : "grid-cols-2"}`}
        >
          <button
            type="button"
            onClick={yes}
            className="flex h-12 items-center justify-center gap-1 rounded-xl bg-primary text-sm font-bold text-primary-foreground"
          >
            <Check className="h-4 w-4" /> כן, עבודה
          </button>
          {trackBetweenOn(data.settings) && (
            <button
              type="button"
              onClick={between}
              className="h-12 rounded-xl bg-secondary px-1 text-xs font-semibold text-secondary-foreground"
            >
              בדרך לנסיעה
            </button>
          )}
          <button
            type="button"
            onClick={no}
            className="flex h-12 items-center justify-center gap-1 rounded-xl border text-sm font-semibold"
          >
            <X className="h-4 w-4" /> פרטית
          </button>
        </div>
      </div>
    </div>
  );
}
