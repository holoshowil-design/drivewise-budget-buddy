import { useEffect, useRef, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { Car, Play, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAppData, todayISO, nowHHMM } from "@/lib/store";
import {
  ACTIVE_EVENT,
  readActive,
  writeActive,
  haversine,
  notifyIfHidden,
  requestNotifyPermission,
} from "@/lib/active-trip";

const SNOOZE_KEY = "driver-detect-snooze";
const MIN_SPEED_KMH = 15;
const SUSTAIN_MS = 20_000;

/**
 * Watches movement while the app is open and, when sustained driving is
 * detected and no trip is running, asks whether this is a work trip.
 */
export function DriveDetector() {
  const { data, ready } = useAppData();
  const navigate = useNavigate();
  const [hasActive, setHasActive] = useState(true);
  const [prompt, setPrompt] = useState(false);
  const lastRef = useRef<{ lat: number; lon: number; t: number } | null>(null);
  const fastSinceRef = useRef<number | null>(null);

  const enabled = ready && data.settings.autoDetectTrip !== false;

  useEffect(() => {
    const sync = () => setHasActive(!!readActive());
    sync();
    window.addEventListener(ACTIVE_EVENT, sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener(ACTIVE_EVENT, sync);
      window.removeEventListener("storage", sync);
    };
  }, []);

  useEffect(() => {
    if (!enabled || hasActive || prompt) return;
    if (typeof navigator === "undefined" || !navigator.geolocation) return;
    const id = navigator.geolocation.watchPosition(
      (pos) => {
        const snooze = Number(localStorage.getItem(SNOOZE_KEY) || 0);
        if (Date.now() < snooze) return;
        if ((pos.coords.accuracy ?? 999) > 80) return;
        const point = { lat: pos.coords.latitude, lon: pos.coords.longitude, t: pos.timestamp };
        let speed = pos.coords.speed != null ? pos.coords.speed * 3.6 : null;
        const prev = lastRef.current;
        if (speed == null && prev) {
          const dt = (point.t - prev.t) / 1000;
          if (dt > 0) speed = (haversine(prev, point) / dt) * 3600;
        }
        lastRef.current = point;
        if (speed == null) return;
        if (speed >= MIN_SPEED_KMH && speed < 220) {
          fastSinceRef.current ??= point.t;
          if (point.t - fastSinceRef.current >= SUSTAIN_MS) {
            fastSinceRef.current = null;
            setPrompt(true);
            notifyIfHidden("מזוהה נסיעה", "זו נסיעת עבודה? פתח את האפליקציה כדי להתחיל לחשב.");
            if (navigator.vibrate) navigator.vibrate([200, 100, 200]);
          }
        } else {
          fastSinceRef.current = null;
        }
      },
      () => {},
      { enableHighAccuracy: true, maximumAge: 5000, timeout: 30000 },
    );
    return () => navigator.geolocation.clearWatch(id);
  }, [enabled, hasActive, prompt]);

  const yes = () => {
    setPrompt(false);
    requestNotifyPermission();
    const now = Date.now();
    writeActive({ startedAt: now, date: todayISO(), time: nowHHMM(), km: 0, lastMoveAt: now });
    navigate({ to: "/trip", search: { mode: "drive" } });
  };

  const no = () => {
    setPrompt(false);
    localStorage.setItem(SNOOZE_KEY, String(Date.now() + 60 * 60 * 1000));
  };

  if (!prompt || hasActive) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-end justify-center bg-black/70 p-4 pb-10 backdrop-blur-sm" role="dialog" aria-modal="true" aria-label="זיהוי נסיעה">
      <div className="w-full max-w-md rounded-3xl border-2 bg-card p-6 text-center shadow-2xl">
        <Car className="mx-auto h-10 w-10 text-primary" />
        <h2 className="mt-2 text-2xl font-extrabold">מזוהה נסיעה</h2>
        <p className="mt-1 text-sm text-muted-foreground">זו נסיעת עבודה? נתחיל למדוד ק״מ וזמן.</p>
        <div className="mt-5 grid gap-2">
          <Button className="h-16 text-lg font-bold" onClick={yes}>
            <Play className="h-6 w-6" /> כן, התחל לחשב
          </Button>
          <Button variant="outline" className="h-14 text-base" onClick={no}>
            <X className="h-5 w-5" /> לא, נסיעה פרטית
          </Button>
        </div>
        <p className="mt-3 text-[11px] text-muted-foreground">"לא" ישתיק את הזיהוי לשעה הקרובה</p>
      </div>
    </div>
  );
}
