import { useCallback, useEffect, useRef, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Play, Square, MapPin, Timer, Fuel, Trash2, AlertTriangle, Gauge, Minimize2 } from "lucide-react";
import { toast } from "sonner";
import {
  useAppData,
  todayISO,
  nowHHMM,
  fmt,
  fmtDuration,
  effectiveFuelParams,
  energyUnitLabel,
  type Trip,
} from "@/lib/store";

const ACTIVE_KEY = "driver-active-trip";

type ActiveTrip = {
  startedAt: number; // epoch ms
  date: string;
  time: string;
  km: number;
  last?: { lat: number; lon: number; t: number };
};

function readActive(): ActiveTrip | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(ACTIVE_KEY);
    return raw ? (JSON.parse(raw) as ActiveTrip) : null;
  } catch {
    return null;
  }
}

/** Great-circle distance between two coordinates, in kilometers. */
function haversine(a: { lat: number; lon: number }, b: { lat: number; lon: number }) {
  const R = 6371;
  const dLat = ((b.lat - a.lat) * Math.PI) / 180;
  const dLon = ((b.lon - a.lon) * Math.PI) / 180;
  const la1 = (a.lat * Math.PI) / 180;
  const la2 = (b.lat * Math.PI) / 180;
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(la1) * Math.cos(la2) * Math.sin(dLon / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}

export function TripTracker({ autoStart = false, driveMode = false }: { autoStart?: boolean; driveMode?: boolean }) {
  const { data, ready, addTrip, removeTrip } = useAppData();
  const [active, setActive] = useState<ActiveTrip | null>(null);
  const [elapsed, setElapsed] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [askStart, setAskStart] = useState(false);
  const watchRef = useRef<number | null>(null);
  const wakeRef = useRef<{ release: () => Promise<void> } | null>(null);
  const activeRef = useRef<ActiveTrip | null>(null);

  const c = data.settings.currency;
  const unit = energyUnitLabel(data.vehicle);

  const persist = useCallback((t: ActiveTrip | null) => {
    activeRef.current = t;
    setActive(t);
    if (typeof window === "undefined") return;
    if (t) localStorage.setItem(ACTIVE_KEY, JSON.stringify(t));
    else localStorage.removeItem(ACTIVE_KEY);
  }, []);

  const releaseWakeLock = useCallback(() => {
    wakeRef.current?.release().catch(() => {});
    wakeRef.current = null;
  }, []);

  const stopWatch = useCallback(() => {
    if (watchRef.current !== null) {
      navigator.geolocation.clearWatch(watchRef.current);
      watchRef.current = null;
    }
    releaseWakeLock();
  }, [releaseWakeLock]);

  const startWatch = useCallback(() => {
    if (typeof navigator === "undefined" || !navigator.geolocation) {
      setError("המכשיר או הדפדפן לא תומכים באיתור מיקום.");
      return;
    }
    if (watchRef.current !== null) return;
    watchRef.current = navigator.geolocation.watchPosition(
      (pos) => {
        setError(null);
        const cur = activeRef.current;
        if (!cur) return;
        const acc = pos.coords.accuracy ?? 999;
        if (acc > 60) return; // ignore very inaccurate fixes
        const point = { lat: pos.coords.latitude, lon: pos.coords.longitude, t: pos.timestamp };
        if (cur.last) {
          const d = haversine(cur.last, point);
          const dt = Math.max(0.001, (point.t - cur.last.t) / 1000);
          const speedKmh = (d / dt) * 3600;
          // ignore GPS jitter and impossible jumps
          if (d >= 0.008 && speedKmh <= 220) {
            persist({ ...cur, km: cur.km + d, last: point });
            return;
          }
          if (d < 0.008) return; // stayed in place — keep old anchor
        }
        persist({ ...cur, last: point });
      },
      (err) => {
        setError(
          err.code === err.PERMISSION_DENIED
            ? "אין הרשאת מיקום. אשר מיקום בדפדפן, או הזן את הק״מ ידנית בהזנת הכנסה."
            : "לא הצלחנו לקבל מיקום כרגע. בדוק שה-GPS דלוק.",
        );
      },
      { enableHighAccuracy: true, maximumAge: 0, timeout: 20000 },
    );

    const nav = navigator as Navigator & {
      wakeLock?: { request: (type: "screen") => Promise<{ release: () => Promise<void> }> };
    };
    nav.wakeLock
      ?.request("screen")
      .then((lock) => {
        wakeRef.current = lock;
      })
      .catch(() => {});
  }, [persist]);

  const start = useCallback(() => {
    if (activeRef.current) return;
    const t: ActiveTrip = { startedAt: Date.now(), date: todayISO(), time: nowHHMM(), km: 0 };
    persist(t);
    setAskStart(false);
    startWatch();
    toast.success("נסיעת עבודה התחילה");
  }, [persist, startWatch]);

  const end = useCallback(() => {
    const cur = activeRef.current;
    if (!cur) return;
    stopWatch();
    const seconds = Math.round((Date.now() - cur.startedAt) / 1000);
    const km = Math.round(cur.km * 100) / 100;
    persist(null);
    setElapsed(0);
    if (km <= 0 && seconds < 30) {
      toast("הנסיעה הייתה קצרה מדי ולא נשמרה");
      return;
    }
    addTrip({ date: cur.date, time: cur.time, km, seconds, endedAt: new Date().toISOString() });
    toast.success(`נסיעה נשמרה · ${km.toFixed(1)} ק״מ · ${fmtDuration(seconds)}`);
  }, [addTrip, persist, stopWatch]);

  // restore an active trip after a reload / accidental close
  useEffect(() => {
    const saved = readActive();
    if (saved) {
      activeRef.current = saved;
      setActive(saved);
      startWatch();
    } else if (autoStart) {
      setAskStart(true);
    }
    return () => stopWatch();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // live timer
  useEffect(() => {
    if (!active) return;
    const tick = () => setElapsed(Math.round((Date.now() - active.startedAt) / 1000));
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [active]);

  if (!ready) return null;

  const liveParams = effectiveFuelParams(todayISO(), data.vehicle, data.settings, nowHHMM());
  const liveCost = active ? (active.km / (liveParams.consumption || 1)) * liveParams.price : 0;
  const avgSpeed = active && elapsed > 0 ? (active.km / (elapsed / 3600)) : 0;
  const today = todayISO();
  const todayIncomes = data.incomes.filter((item) => item.date === today);
  const grossToday = todayIncomes.reduce((sum, item) => sum + item.amount * (1 - item.commissionPct / 100) + (item.tip || 0), 0);
  const liveNet = grossToday - liveCost;

  const trips: Trip[] = [...(data.trips ?? [])].sort((a, b) =>
    `${b.date} ${b.time ?? ""}`.localeCompare(`${a.date} ${a.time ?? ""}`),
  );

  return (
    <div className="space-y-4">
      {driveMode && (
        <section className="drive-hud fixed inset-0 z-50 flex flex-col p-5 pb-[calc(1.25rem+env(safe-area-inset-bottom,0px))] pt-[calc(1.25rem+env(safe-area-inset-top,0px))]" aria-label="מצב נהיגה">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-bold text-hud-accent">
              <span className={`h-2.5 w-2.5 rounded-full ${active ? "animate-pulse bg-hud-accent" : "bg-hud-muted"}`} />
              {active ? "GPS פעיל · המסך נשאר דלוק" : "מוכן לנסיעה"}
            </div>
            <Link to="/trip" search={{}} aria-label="צא ממצב נהיגה" className="hud-icon-button"><Minimize2 className="h-5 w-5" /></Link>
          </div>
          <div className="flex flex-1 flex-col items-center justify-center gap-8">
            <div className="text-center">
              <MapPin className="mx-auto mb-2 h-6 w-6 text-hud-accent" />
              <div className="num font-display text-[clamp(4rem,18vw,7rem)] font-extrabold leading-none text-hud-foreground">{active?.km.toFixed(2) ?? "0.00"}</div>
              <div className="mt-2 text-lg font-semibold text-hud-muted">קילומטר</div>
            </div>
            <div className="grid w-full max-w-xl grid-cols-2 gap-3">
              <div className="hud-metric">
                <Timer className="h-5 w-5 text-hud-accent" />
                <span className="num font-display mt-2 text-4xl font-bold text-hud-foreground">{fmtDuration(elapsed)}</span>
                <span className="text-xs text-hud-muted">זמן נסיעה</span>
              </div>
              <div className="hud-metric">
                <Gauge className="h-5 w-5 text-hud-accent" />
                <span className="num font-display mt-2 text-4xl font-bold text-hud-foreground">{fmt(liveNet, c)}</span>
                <span className="text-xs text-hud-muted">נטו היום אחרי דלק</span>
              </div>
            </div>
          </div>
          {active ? (
            <Button variant="destructive" className="h-20 w-full rounded-2xl text-xl font-extrabold" onClick={end}><Square className="h-7 w-7" /> סיים נסיעה</Button>
          ) : (
            <Button className="h-20 w-full rounded-2xl text-xl font-extrabold" onClick={start}><Play className="h-7 w-7" /> התחל נסיעה</Button>
          )}
        </section>
      )}
      {/* Auto-prompt from ?action=start_trip */}
      {askStart && !active && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/70 p-4 pb-10 backdrop-blur-sm">
          <Card className="w-full max-w-md border-2">
            <CardContent className="p-5 text-center">
              <h2 className="text-xl font-extrabold">להתחיל נסיעת עבודה?</h2>
              <p className="mt-1 text-sm text-muted-foreground">נמדוד ק״מ וזמן אוטומטית עד לסיום הנסיעה.</p>
              <div className="mt-5 grid gap-2">
                <Button className="h-16 text-lg font-bold" onClick={start}>
                  <Play className="ms-1 h-6 w-6" /> כן, התחל עכשיו
                </Button>
                <Button variant="ghost" className="h-12" onClick={() => setAskStart(false)}>
                  לא עכשיו
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Live tracker */}
      <Card className="border-2" style={active ? { borderColor: "var(--success)" } : undefined}>
        <CardContent className="p-5">
          {active ? (
            <>
              <div className="flex items-center justify-center gap-2 text-xs font-bold uppercase tracking-wide text-success">
                <span className="h-2.5 w-2.5 animate-pulse rounded-full bg-success" /> נסיעה פעילה
              </div>
              <div className="mt-4 grid grid-cols-2 gap-3 text-center">
                <div className="rounded-2xl bg-muted/60 p-4">
                  <div className="flex items-center justify-center gap-1 text-[11px] text-muted-foreground">
                    <MapPin className="h-3.5 w-3.5" /> ק״מ
                  </div>
                  <div className="num text-4xl font-extrabold tracking-tight">{active.km.toFixed(2)}</div>
                </div>
                <div className="rounded-2xl bg-muted/60 p-4">
                  <div className="flex items-center justify-center gap-1 text-[11px] text-muted-foreground">
                    <Timer className="h-3.5 w-3.5" /> זמן
                  </div>
                  <div className="num text-4xl font-extrabold tracking-tight">{fmtDuration(elapsed)}</div>
                </div>
              </div>
              <div className="num mt-3 flex justify-between rounded-xl bg-muted/40 px-3 py-2 text-xs text-muted-foreground">
                <span>מהירות ממוצעת {avgSpeed.toFixed(0)} קמ״ש</span>
                <span>דלק משוער {fmt(liveCost, c)}</span>
              </div>
              <Button
                variant="destructive"
                className="mt-4 h-20 w-full text-xl font-extrabold"
                onClick={end}
              >
                <Square className="ms-2 h-7 w-7" /> סיים נסיעת עבודה
              </Button>
            </>
          ) : (
            <>
              <p className="text-center text-sm text-muted-foreground">
                מדידה אוטומטית של ק״מ וזמן נהיגה, שנכנסת ישירות לחישוב עלות הדלק שלך.
              </p>
              <Button className="mt-4 h-20 w-full text-xl font-extrabold" onClick={start}>
                <Play className="ms-2 h-7 w-7" /> התחל נסיעת עבודה
              </Button>
            </>
          )}

          {error && (
            <div className="mt-3 flex items-start gap-2 rounded-xl border border-destructive/40 bg-destructive/10 p-3 text-xs text-destructive">
              <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}
        </CardContent>
      </Card>

      {/* History */}
      <Card>
        <CardContent className="p-4">
          <h3 className="mb-3 flex items-center gap-1.5 text-sm font-semibold">
            <Fuel className="h-4 w-4 text-primary" /> נסיעות שהסתיימו
          </h3>
          {trips.length === 0 ? (
            <p className="text-xs text-muted-foreground">עדיין אין נסיעות שמורות.</p>
          ) : (
            <ul className="divide-y">
              {trips.slice(0, 30).map((t) => {
                const p = effectiveFuelParams(t.date, data.vehicle, data.settings, t.time);
                const units = t.km / (p.consumption || 1);
                return (
                  <li key={t.id} className="flex items-center justify-between gap-2 py-2.5">
                    <div>
                      <div className="num text-sm font-semibold">
                        {t.km.toFixed(1)} ק״מ · {fmtDuration(t.seconds)}
                      </div>
                      <div className="num text-[11px] text-muted-foreground">
                        {t.date} {t.time ?? ""} · ≈ {fmt(units * p.price, c)} ({units.toFixed(1)} {unit})
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      aria-label="מחק נסיעה"
                      onClick={() => {
                        removeTrip(t.id);
                        toast("הנסיעה נמחקה");
                      }}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </li>
                );
              })}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
