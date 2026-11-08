import { useEffect, useState } from "react";
import { Download, X } from "lucide-react";
import { canSelfUpdate, checkForUpdate, installUpdate } from "@/lib/app-update";
import { ACTIVE_EVENT, isDrivingNow, readActive } from "@/lib/active-trip";

/** Checked again when the app comes back to the screen, at most this often. */
const RECHECK_MS = 60 * 60 * 1000;
const DISMISS_KEY = "driver-update-dismissed";

function dismissedCode(): number {
  try {
    return Number(sessionStorage.getItem(DISMISS_KEY)) || 0;
  } catch {
    return 0;
  }
}

/**
 * A thin bar at the top of the installed app when a newer version is out:
 * "יש גרסה חדשה · עדכן". Hidden while driving. The X hides it until the app is
 * opened again.
 */
export function UpdateBanner() {
  const [latest, setLatest] = useState<{ code: number; name: string } | null>(null);
  const [driving, setDriving] = useState(false);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!canSelfUpdate()) return;
    let lastCheck = 0;
    const check = async () => {
      if (Date.now() - lastCheck < RECHECK_MS) return;
      lastCheck = Date.now();
      const r = await checkForUpdate();
      if (r?.available && r.latestCode && r.latestCode > dismissedCode()) {
        setLatest({ code: r.latestCode, name: r.latestName ?? "" });
      } else if (r && !r.available) {
        setLatest(null);
      }
    };
    const onVisible = () => {
      if (document.visibilityState === "visible") void check();
    };
    void check();
    document.addEventListener("visibilitychange", onVisible);
    return () => document.removeEventListener("visibilitychange", onVisible);
  }, []);

  useEffect(() => {
    const sync = () => setDriving(isDrivingNow(readActive()));
    sync();
    window.addEventListener(ACTIVE_EVENT, sync);
    const t = window.setInterval(sync, 30_000);
    return () => {
      window.removeEventListener(ACTIVE_EVENT, sync);
      window.clearInterval(t);
    };
  }, []);

  if (!latest || driving) return null;

  const dismiss = () => {
    try {
      sessionStorage.setItem(DISMISS_KEY, String(latest.code));
    } catch {
      // Private storage blocked: it just hides until the next check.
    }
    setLatest(null);
  };

  const update = async () => {
    setBusy(true);
    await installUpdate();
    setBusy(false);
  };

  return (
    <div
      role="status"
      className="fixed inset-x-0 top-0 z-[60] px-3 pt-[calc(0.4rem+env(safe-area-inset-top,0px))]"
    >
      <div className="mx-auto flex max-w-xl items-center gap-2 rounded-full border border-primary/30 bg-card/95 py-1.5 pr-3 pl-1.5 text-sm shadow-md backdrop-blur">
        <span className="flex-1 truncate">
          יש גרסה חדשה{latest.name ? ` (${latest.name})` : ""}
        </span>
        <button
          type="button"
          onClick={update}
          disabled={busy}
          className="flex items-center gap-1 rounded-full bg-primary px-3 py-1 text-xs font-semibold text-primary-foreground disabled:opacity-60"
        >
          <Download className="h-3.5 w-3.5" />
          {busy ? "מוריד…" : "עדכן"}
        </button>
        <button
          type="button"
          onClick={dismiss}
          aria-label="לא עכשיו"
          className="rounded-full p-1 text-muted-foreground"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
