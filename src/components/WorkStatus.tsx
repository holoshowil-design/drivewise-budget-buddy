import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { ACTIVE_EVENT, readActive, type ActiveTrip } from "@/lib/active-trip";
import { fmtDuration } from "@/lib/store";
import { WORK_STATUS_LABEL, workStatus } from "@/lib/work-status";

const DOT = {
  work: "bg-success",
  "between-driving": "bg-primary",
  "between-waiting": "bg-primary",
  private: "bg-muted-foreground",
  off: "bg-muted-foreground/50",
} as const;

/** A small line on the home screen: driving or not, and whether time is being measured. */
export function WorkStatus() {
  const [active, setActive] = useState<ActiveTrip | null>(null);
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const sync = () => setActive(readActive());
    sync();
    window.addEventListener(ACTIVE_EVENT, sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener(ACTIVE_EVENT, sync);
      window.removeEventListener("storage", sync);
    };
  }, []);

  // The clock only ticks while something is measured.
  useEffect(() => {
    if (!active) return;
    setNow(Date.now());
    const id = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(id);
  }, [active]);

  const status = workStatus(active, now);

  return (
    <Link
      to="/trip"
      className="num flex items-center gap-2 rounded-full border bg-card px-3 py-1.5 text-xs font-semibold"
      aria-label={`סטטוס: ${WORK_STATUS_LABEL[status.kind]}`}
    >
      <span className={`h-2.5 w-2.5 shrink-0 rounded-full ${DOT[status.kind]}`} />
      <span>{WORK_STATUS_LABEL[status.kind]}</span>
      {status.kind !== "off" ? (
        <span className="ms-auto text-muted-foreground">
          מודד {fmtDuration(status.seconds)} · {status.km.toFixed(1)} ק״מ
        </span>
      ) : (
        <span className="ms-auto text-muted-foreground">הזמן לא נספר</span>
      )}
    </Link>
  );
}
