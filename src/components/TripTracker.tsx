import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type ComponentProps,
  type ReactNode,
} from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Play,
  Square,
  MapPin,
  Timer,
  AlertTriangle,
  Gauge,
  Minimize2,
  Hourglass,
  Flag,
} from "lucide-react";
import { toast } from "sonner";
import {
  useAppData,
  todayISO,
  nowHHMM,
  fmt,
  fmtDuration,
  effectiveFuelParams,
  type Trip,
} from "@/lib/store";
import {
  ACTIVE_EVENT,
  readActive,
  writeActive,
  notifyIfHidden,
  requestNotifyPermission,
  type ActiveTrip,
} from "@/lib/active-trip";
import { TripEndDialog, type TripFormValues } from "@/components/TripEndDialog";
import { TripHistory } from "@/components/TripHistory";
import { celebrate, crossedDailyGoal } from "@/lib/rewards";
import { hushSound, playSound } from "@/lib/sound";
import { calculateWorkStreak, tripMotivation } from "@/lib/motivation";
import { looksForgotten } from "@/lib/gps";
import { hasBackgroundTracking } from "@/lib/location";
import { GPS_ERROR_EVENT, readGpsError } from "@/lib/trip-gps";
import { betweenToTrip, isBetween, startBetween, trackBetweenOn } from "@/lib/between-trip";

const WAIT_ASK_MS = 4 * 60 * 1000;
const WAIT_SNOOZE_MS = 15 * 60 * 1000;
const FORGOT_SNOOZE_MS = 30 * 60 * 1000;

const hhmm = (ms: number) =>
  new Date(ms).toLocaleTimeString("he-IL", { hour: "2-digit", minute: "2-digit", hour12: false });

export function TripTracker({
  autoStart = false,
  driveMode = false,
  stage,
}: {
  autoStart?: boolean;
  driveMode?: boolean;
  /** The page's scene, placed under the live card so the start button comes first. */
  stage?: ReactNode;
}) {
  const navigate = useNavigate();
  const {
    data,
    ready,
    addTrip,
    removeTrip,
    restoreRecords,
    saveTripWithIncome,
    updateTripWithIncome,
  } = useAppData();
  const [active, setActive] = useState<ActiveTrip | null>(null);
  const [elapsed, setElapsed] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [askWait, setAskWait] = useState(false);
  const [askForgot, setAskForgot] = useState(false);
  const [ending, setEnding] = useState<TripFormValues | null>(null);
  const [editing, setEditing] = useState<Trip | null>(null);
  const activeRef = useRef<ActiveTrip | null>(null);

  const c = data.settings.currency;
  const askWaiting = data.settings.askWaiting !== false;

  const persist = useCallback((t: ActiveTrip | null) => {
    activeRef.current = t;
    setActive(t);
    writeActive(t);
  }, []);

  /** Saves the between-trips drive so far (nothing when it was too short). */
  const closeBetween = useCallback(
    (cur: ActiveTrip, endAt = Date.now()) => {
      const trip = betweenToTrip(cur, endAt);
      if (trip) addTrip(trip);
    },
    [addTrip],
  );

  const start = useCallback(() => {
    // Read the stored trip: a between measurement may have been closed or opened elsewhere.
    const cur = readActive();
    if (cur && !isBetween(cur)) return;
    // Starting a work trip ends the drive that led to it.
    if (cur) closeBetween(cur);
    const now = Date.now();
    // TripWatcher (root layout) starts measuring as soon as the trip is stored.
    persist({ startedAt: now, date: todayISO(), time: nowHHMM(), km: 0, lastMoveAt: now });
    requestNotifyPermission();
    playSound("turbo-start");
    toast.success("נסיעת עבודה התחילה", {
      action: {
        label: "ביטול",
        onClick: () => {
          if (activeRef.current?.startedAt === now) persist(null);
        },
      },
    });
  }, [persist, closeBetween]);

  /** Measures km and time between work trips, for the fuel indication. */
  const startBetweenNow = () => {
    if (activeRef.current) return;
    persist(startBetween(Date.now(), todayISO(), nowHHMM()));
    toast.success("מודד ק״מ וזמן בין נסיעות");
  };

  const stopBetween = () => {
    const cur = readActive();
    if (!cur || !isBetween(cur)) return;
    persist(null);
    closeBetween(cur);
    toast(`המדידה נשמרה · ${cur.km.toFixed(1)} ק״מ בין נסיעות`);
  };

  // driving mode is always silent
  useEffect(() => {
    if (driveMode) hushSound();
  }, [driveMode]);

  /**
   * Stops tracking and opens the end-of-trip form (nothing is saved yet).
   * `endAt` (epoch ms) ends the trip at an earlier moment, e.g. the last movement.
   */
  const end = useCallback(
    (endAt?: number) => {
      const cur = activeRef.current;
      if (!cur) return;
      // GPS pauses while the end form is open; closing it resumes the trip.
      persist({ ...cur, pausedAt: Date.now() });
      setAskWait(false);
      setAskForgot(false);
      const until = Math.max(cur.startedAt, Math.min(Date.now(), endAt ?? Date.now()));
      const seconds = Math.round((until - cur.startedAt) / 1000);
      setEnding({
        date: cur.date,
        time: cur.time,
        km: Math.round(cur.km * 100) / 100,
        seconds,
        waitSeconds: Math.min(seconds, Math.round(cur.waitSeconds ?? 0)),
      });
    },
    [persist],
  );

  const finishEnding = () => {
    persist(null);
    setElapsed(0);
    setEnding(null);
  };

  const resumeAfterCancel = () => {
    // closed the popup without choosing — keep the trip running
    setEnding(null);
    if (activeRef.current) persist({ ...activeRef.current, pausedAt: undefined });
  };

  const stillDriving = () => {
    const cur = activeRef.current;
    setAskForgot(false);
    if (cur) persist({ ...cur, forgotSnoozeUntil: Date.now() + FORGOT_SNOOZE_MS });
  };

  const confirmWaiting = () => {
    const cur = activeRef.current;
    setAskWait(false);
    if (!cur) return;
    const now = Date.now();
    const stoodFor = Math.max(0, (now - (cur.lastMoveAt ?? now)) / 1000);
    persist({
      ...cur,
      waitSeconds: (cur.waitSeconds ?? 0) + stoodFor,
      lastMoveAt: now,
      waitSnoozeUntil: now + WAIT_SNOOZE_MS,
    });
    toast("ההמתנה נרשמת · נשאל שוב בעוד 15 דקות");
  };

  // Show the trip TripWatcher measures (also one started by auto-detection while
  // this screen is open). A trip left paused by an end form that is no longer
  // open (reload, left the screen) resumes.
  useEffect(() => {
    const saved = readActive();
    if (saved?.pausedAt) persist({ ...saved, pausedAt: undefined });
    else if (saved && !(autoStart && isBetween(saved))) {
      activeRef.current = saved;
      setActive(saved);
    } else if (autoStart) {
      // A tap on "start driving" starts right away (the toast can undo it). Drop
      // the action from the address so going back here does not start another.
      start();
      void navigate({
        to: "/trip",
        search: { mode: driveMode ? "drive" : undefined },
        replace: true,
      });
    }
    const sync = () => {
      const t = readActive();
      activeRef.current = t;
      setActive(t);
    };
    const syncError = () => setError(readGpsError());
    syncError();
    window.addEventListener(ACTIVE_EVENT, sync);
    window.addEventListener("storage", sync);
    window.addEventListener(GPS_ERROR_EVENT, syncError);
    return () => {
      window.removeEventListener(ACTIVE_EVENT, sync);
      window.removeEventListener("storage", sync);
      window.removeEventListener(GPS_ERROR_EVENT, syncError);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // live timer + waiting check
  useEffect(() => {
    if (!active) return;
    const tick = () => {
      setElapsed(Math.round((Date.now() - active.startedAt) / 1000));
      const cur = activeRef.current;
      if (!cur || ending) return;
      // Standing still between trips is normal; TripWatcher closes the measurement.
      if (isBetween(cur)) {
        setAskWait(false);
        setAskForgot(false);
        return;
      }
      const now = Date.now();
      const stoodMs = now - (cur.lastMoveAt ?? cur.startedAt);
      // The car moved again: put the prompts away by themselves.
      if (stoodMs < WAIT_ASK_MS) setAskWait(false);
      if (!looksForgotten(cur, now)) setAskForgot(false);
      if (looksForgotten(cur, now)) {
        setAskWait(false);
        setAskForgot((was) => {
          if (!was) notifyIfHidden("שכחת לסיים את הנסיעה?", "לא זוהתה תנועה כבר הרבה זמן");
          return true;
        });
        return;
      }
      if (!askWaiting) return;
      if (stoodMs >= WAIT_ASK_MS && now >= (cur.waitSnoozeUntil ?? 0)) {
        setAskWait((was) => {
          if (!was) {
            notifyIfHidden("עומד במקום כמה דקות", "אתה בהמתנה או שהנסיעה הסתיימה?");
            if (navigator.vibrate) navigator.vibrate([200, 100, 200]);
          }
          return true;
        });
      }
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [active, askWaiting, ending]);

  /** Deletes a trip (and its linked income) with an undo button in the toast. */
  const deleteTrip = (t: Trip) => {
    const linked = data.incomes.filter((i) => i.tripId === t.id);
    removeTrip(t.id);
    toast("הנסיעה נמחקה", {
      duration: 8000,
      action: { label: "ביטול", onClick: () => restoreRecords({ trips: [t], incomes: linked }) },
    });
  };

  const deleteRef = useRef(deleteTrip);
  deleteRef.current = deleteTrip;
  const onDelete = useCallback((t: Trip) => deleteRef.current(t), []);

  const saveEnded: ComponentProps<typeof TripEndDialog>["onSave"] = (trip, income) => {
    const reachedGoal = income
      ? crossedDailyGoal(data, { ...income, km: 0, tripId: "reward-trip-preview" }, trip)
      : false;
    const feedback = tripMotivation(data, trip, income);
    const nextStreak = income
      ? calculateWorkStreak([
          ...data.incomes,
          { ...income, km: 0, tripId: "streak-preview", id: "streak-preview" },
        ])
      : calculateWorkStreak(data.incomes);
    const trigger = document.activeElement;
    saveTripWithIncome({ ...trip, endedAt: new Date().toISOString() }, income);
    const firstIncomeToday =
      Boolean(income) &&
      trip.date === todayISO() &&
      !data.incomes.some((item) => item.date === trip.date);
    const kind = reachedGoal
      ? "goal"
      : feedback.milestone === "break-even"
        ? "break-even"
        : firstIncomeToday && nextStreak.milestone
          ? "streak"
          : "trip";
    // the trip is over before its reward plays, so the Captain's film may start
    finishEnding();
    // The drive to the next customer is measured too (a work trip started next closes it).
    if (trackBetweenOn(data.settings)) persist(startBetween(Date.now(), todayISO(), nowHHMM()));
    celebrate(kind, trigger, income?.amount, data.settings.currency, {
      title: kind === "streak" ? `רצף של ${nextStreak.current} ימים` : feedback.title,
      message: feedback.message,
      streak: nextStreak.current,
    });
    toast.success(
      income
        ? `נסיעה והכנסה נשמרו · ${trip.km.toFixed(1)} ק״מ`
        : `נסיעה נשמרה · ${trip.km.toFixed(1)} ק״מ`,
    );
  };

  if (!ready) return null;

  const betweenNow = isBetween(active);
  const liveParams = effectiveFuelParams(todayISO(), data.vehicle, data.settings, nowHHMM());
  const liveCost = active ? (active.km / (liveParams.consumption || 1)) * liveParams.price : 0;
  const avgSpeed = active && elapsed > 0 ? active.km / (elapsed / 3600) : 0;
  const today = todayISO();
  const todayIncomes = data.incomes.filter((item) => item.date === today);
  const grossToday = todayIncomes.reduce(
    (sum, item) => sum + item.amount * (1 - item.commissionPct / 100) + (item.tip || 0),
    0,
  );
  const liveNet = grossToday - liveCost;

  const editIncome = editing?.incomeId
    ? (data.incomes.find((i) => i.id === editing.incomeId) ?? null)
    : null;

  return (
    <div className="space-y-4">
      {driveMode && (
        <section
          className="drive-hud fixed inset-0 z-50 flex flex-col p-5 pb-[calc(1.25rem+env(safe-area-inset-bottom,0px))] pt-[calc(1.25rem+env(safe-area-inset-top,0px))]"
          aria-label="מצב נהיגה"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-bold text-hud-accent">
              <span
                className={`h-2.5 w-2.5 rounded-full ${active ? "animate-pulse bg-hud-accent" : "bg-hud-muted"}`}
              />
              {betweenNow
                ? "מודד בין נסיעות"
                : active
                  ? hasBackgroundTracking()
                    ? "GPS פעיל · ממשיך גם כשהמסך נעול"
                    : "GPS פעיל · המסך נשאר דלוק"
                  : "מוכן לנסיעה"}
            </div>
            <Link to="/trip" search={{}} aria-label="צא ממצב נהיגה" className="hud-icon-button">
              <Minimize2 className="h-5 w-5" />
            </Link>
          </div>
          <div className="flex flex-1 flex-col items-center justify-center gap-8">
            <div className="text-center">
              <MapPin className="mx-auto mb-2 h-6 w-6 text-hud-accent" />
              <div className="num font-display text-[clamp(4rem,18vw,7rem)] font-extrabold leading-none text-hud-foreground">
                {active?.km.toFixed(2) ?? "0.00"}
              </div>
              <div className="mt-2 text-lg font-semibold text-hud-muted">קילומטר</div>
            </div>
            <div className="grid w-full max-w-xl grid-cols-2 gap-3">
              <div className="hud-metric">
                <Timer className="h-5 w-5 text-hud-accent" />
                <span className="num font-display mt-2 text-4xl font-bold text-hud-foreground">
                  {fmtDuration(elapsed)}
                </span>
                <span className="text-xs text-hud-muted">זמן נסיעה</span>
              </div>
              <div className="hud-metric">
                <Gauge className="h-5 w-5 text-hud-accent" />
                <span className="num font-display mt-2 text-4xl font-bold text-hud-foreground">
                  {fmt(liveNet, c)}
                </span>
                <span className="text-xs text-hud-muted">נטו היום אחרי דלק</span>
              </div>
            </div>
          </div>
          {active && !betweenNow ? (
            <Button
              variant="destructive"
              className="h-20 w-full rounded-2xl text-xl font-extrabold"
              onClick={() => end()}
            >
              <Square className="h-7 w-7" /> סיים נסיעה
            </Button>
          ) : (
            <Button className="h-20 w-full rounded-2xl text-xl font-extrabold" onClick={start}>
              <Play className="h-7 w-7" /> התחל נסיעה
            </Button>
          )}
        </section>
      )}

      {/* Forgot to end? */}
      {askForgot && active && !ending && (
        <div
          className="fixed inset-0 z-[60] flex items-end justify-center bg-black/70 p-4 pb-10 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
        >
          <Card className="w-full max-w-md border-2">
            <CardContent className="p-6 text-center">
              <Flag className="mx-auto h-10 w-10 text-primary" />
              <h2 className="mt-2 text-2xl font-extrabold">שכחת לסיים את הנסיעה?</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                לא זוהתה תנועה מאז {hhmm(active.lastMoveAt ?? active.startedAt)}.
              </p>
              <div className="mt-5 grid gap-2">
                <Button
                  className="h-16 text-lg font-bold"
                  onClick={() => end(active.lastMoveAt ?? active.startedAt)}
                >
                  <Flag className="h-6 w-6" /> סיים בשעה{" "}
                  {hhmm(active.lastMoveAt ?? active.startedAt)}
                </Button>
                <Button variant="outline" className="h-12" onClick={() => end()}>
                  סיים עכשיו
                </Button>
                <Button variant="ghost" className="h-12" onClick={stillDriving}>
                  אני עדיין בנסיעה
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Waiting check */}
      {askWait && active && !askForgot && !ending && (
        <div
          className="fixed inset-0 z-[60] flex items-end justify-center bg-black/70 p-4 pb-10 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
        >
          <Card className="w-full max-w-md border-2">
            <CardContent className="p-6 text-center">
              <Hourglass className="mx-auto h-10 w-10 text-primary" />
              <h2 className="mt-2 text-2xl font-extrabold">עומד במקום כמה דקות</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                אתה בהמתנה ללקוח, או שהנסיעה הסתיימה?
              </p>
              <div className="mt-5 grid gap-2">
                <Button className="h-16 text-lg font-bold" onClick={confirmWaiting}>
                  <Hourglass className="h-6 w-6" /> בהמתנה — המשך לחשב
                </Button>
                <Button
                  variant="destructive"
                  className="h-14 text-base font-bold"
                  onClick={() => end()}
                >
                  <Flag className="h-5 w-5" /> סיימתי את הנסיעה
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* End-of-trip popup */}
      {ending && (
        <TripEndDialog
          open
          mode="end"
          initial={ending}
          onOpenChange={(o) => {
            if (!o) resumeAfterCancel();
          }}
          onSave={saveEnded}
          onSaveAndNext={(trip, income) => {
            saveEnded(trip, income);
            start();
          }}
          onDiscard={() => {
            const cancelled = activeRef.current;
            finishEnding();
            toast("הנסיעה בוטלה ולא נשמרה", {
              duration: 8000,
              action: cancelled
                ? {
                    label: "ביטול",
                    onClick: () => {
                      if (activeRef.current) return;
                      persist({ ...cancelled, pausedAt: undefined });
                    },
                  }
                : undefined,
            });
          }}
        />
      )}

      {/* Edit popup */}
      {editing && (
        <TripEndDialog
          open
          mode="edit"
          initial={{
            date: editing.date,
            time: editing.time ?? "00:00",
            km: editing.km,
            seconds: editing.seconds,
            waitSeconds: editing.waitSeconds ?? 0,
          }}
          initialIncome={editIncome}
          betweenTrip={isBetween(editing)}
          onOpenChange={(o) => {
            if (!o) setEditing(null);
          }}
          onSave={(trip, income) => {
            updateTripWithIncome(editing.id, trip, income);
            setEditing(null);
            toast.success("הנסיעה עודכנה");
          }}
          onDiscard={() => {
            deleteTrip(editing);
            setEditing(null);
          }}
        />
      )}

      {/* Live tracker */}
      <Card
        className="border-2"
        style={active && !betweenNow ? { borderColor: "var(--success)" } : undefined}
      >
        <CardContent className="p-5">
          {betweenNow && active ? (
            <>
              <div className="flex items-center justify-center gap-2 text-xs font-bold tracking-wide text-muted-foreground">
                <span className="h-2.5 w-2.5 animate-pulse rounded-full bg-muted-foreground" />
                בדרך לנסיעה הבאה · מודד ק״מ וזמן
              </div>
              <div className="num mt-3 grid grid-cols-3 gap-2 text-center">
                <div className="rounded-xl bg-muted/50 p-2.5">
                  <div className="text-[11px] text-muted-foreground">ק״מ</div>
                  <div className="text-2xl font-extrabold">{active.km.toFixed(1)}</div>
                </div>
                <div className="rounded-xl bg-muted/50 p-2.5">
                  <div className="text-[11px] text-muted-foreground">זמן</div>
                  <div className="text-2xl font-extrabold">{fmtDuration(elapsed)}</div>
                </div>
                <div className="rounded-xl bg-muted/50 p-2.5">
                  <div className="text-[11px] text-muted-foreground">דלק משוער</div>
                  <div className="text-2xl font-extrabold">{fmt(liveCost, c)}</div>
                </div>
              </div>
              <p className="mt-2 text-center text-[11px] text-muted-foreground">
                נשמר לחישוב הדלק, לא כנסיעת עבודה. נסגר מעצמו אחרי חצי שעה בלי תנועה.
              </p>
              <Button className="mt-3 h-20 w-full text-xl font-extrabold" onClick={start}>
                <Play className="ms-2 h-7 w-7" /> התחל נסיעת עבודה
              </Button>
              <Button variant="ghost" className="mt-1 h-10 w-full" onClick={stopBetween}>
                עצור מדידה
              </Button>
            </>
          ) : active ? (
            <>
              <div className="flex items-center justify-center gap-2 text-xs font-bold uppercase tracking-wide text-success">
                <span className="h-2.5 w-2.5 animate-pulse rounded-full bg-success" /> נסיעה פעילה
              </div>
              <div className="mt-4 grid grid-cols-2 gap-3 text-center">
                <div className="rounded-2xl bg-muted/60 p-4">
                  <div className="flex items-center justify-center gap-1 text-[11px] text-muted-foreground">
                    <MapPin className="h-3.5 w-3.5" /> ק״מ
                  </div>
                  <div className="num text-4xl font-extrabold tracking-tight">
                    {active.km.toFixed(2)}
                  </div>
                </div>
                <div className="rounded-2xl bg-muted/60 p-4">
                  <div className="flex items-center justify-center gap-1 text-[11px] text-muted-foreground">
                    <Timer className="h-3.5 w-3.5" /> זמן
                  </div>
                  <div className="num text-4xl font-extrabold tracking-tight">
                    {fmtDuration(elapsed)}
                  </div>
                </div>
              </div>
              <div className="num mt-3 flex justify-between rounded-xl bg-muted/40 px-3 py-2 text-xs text-muted-foreground">
                <span>מהירות ממוצעת {avgSpeed.toFixed(0)} קמ״ש</span>
                {(active.waitSeconds ?? 0) > 0 && (
                  <span>המתנה {fmtDuration(active.waitSeconds ?? 0)}</span>
                )}
                <span>דלק משוער {fmt(liveCost, c)}</span>
              </div>
              <Button
                variant="destructive"
                className="mt-4 h-20 w-full text-xl font-extrabold"
                onClick={() => end()}
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
              <Button variant="outline" className="mt-2 h-11 w-full" onClick={startBetweenNow}>
                מדוד גם בין נסיעות (לא עבודה)
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

      {stage}

      {/* History: memoized, so the one-second timer does not redraw it */}
      <TripHistory data={data} onEdit={setEditing} onDelete={onDelete} />
    </div>
  );
}
