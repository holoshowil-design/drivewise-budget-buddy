import { useRef, useState, type ReactNode } from "react";
import { ChevronsLeft } from "lucide-react";
import { haptic } from "@/lib/haptics";
import { cn } from "@/lib/utils";

/** How far (0..1) the thumb must travel before letting go counts. */
const DONE_AT = 0.85;

const still = () =>
  typeof window !== "undefined" &&
  (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ?? false);

/**
 * "Slide to start": the thumb sits at the start side (right in Hebrew) and is
 * dragged across the track. A light vibration when the drag starts, another
 * when it passes the point of no return (the action itself confirms).
 * Keyboard and screen readers press the thumb like a button. A plain tap shows
 * a hint instead, so a stray touch in the pocket starts nothing.
 */
export function SwipeToConfirm({
  label,
  hint = "החליקו עד הסוף",
  icon,
  onConfirm,
  className,
}: {
  label: string;
  hint?: string;
  icon?: ReactNode;
  onConfirm: () => void;
  className?: string;
}) {
  const track = useRef<HTMLDivElement>(null);
  const drag = useRef<{ x: number; max: number; sign: number; past: boolean } | null>(null);
  const moved = useRef(false);
  const [p, setP] = useState(0);
  const [dragging, setDragging] = useState(false);
  const [done, setDone] = useState(false);
  const [showHint, setShowHint] = useState(false);

  const confirm = () => {
    if (done) return;
    setDone(true);
    setP(1);
    // Passing the end already vibrated; the action itself gives the success pulse.
    onConfirm();
  };

  const onDown = (e: React.PointerEvent<HTMLButtonElement>) => {
    if (done || !track.current) return;
    const rtl = getComputedStyle(track.current).direction === "rtl";
    const max = track.current.clientWidth - 64;
    drag.current = { x: e.clientX, max: Math.max(1, max), sign: rtl ? -1 : 1, past: false };
    moved.current = false;
    e.currentTarget.setPointerCapture(e.pointerId);
    setDragging(true);
  };

  const onMove = (e: React.PointerEvent<HTMLButtonElement>) => {
    const d = drag.current;
    if (!d) return;
    const dx = (e.clientX - d.x) * d.sign;
    if (!moved.current && dx > 6) {
      moved.current = true;
      setShowHint(false);
      haptic("light");
    }
    const next = Math.min(1, Math.max(0, dx / d.max));
    if (next >= DONE_AT !== d.past) {
      d.past = next >= DONE_AT;
      if (d.past) haptic("tap");
    }
    setP(next);
  };

  const onUp = () => {
    const d = drag.current;
    drag.current = null;
    setDragging(false);
    if (!d) return;
    if (d.past) confirm();
    else setP(0);
  };

  // Thumb is 56px wide with a 4px margin on each side.
  const offset = p * Math.max(0, (track.current?.clientWidth ?? 0) - 64);
  const sign = track.current && getComputedStyle(track.current).direction === "ltr" ? 1 : -1;
  const smooth = !dragging && !still();

  return (
    <div
      ref={track}
      className={cn(
        "relative flex h-16 w-full select-none items-center overflow-hidden rounded-2xl bg-primary text-primary-foreground",
        className,
      )}
    >
      {/* Filled part behind the thumb */}
      <div
        className={cn(
          "absolute inset-y-0 start-0 rounded-2xl bg-primary-foreground/15",
          smooth && "transition-[width] duration-200",
        )}
        style={{ width: `calc(${p * 100}% + ${(1 - p) * 64}px)` }}
        aria-hidden="true"
      />
      <span
        className="pointer-events-none absolute inset-0 flex items-center justify-center ps-14 text-sm font-bold"
        style={{ opacity: Math.max(0, 1 - p * 1.6) }}
        aria-hidden="true"
      >
        {showHint ? hint : label}
        <ChevronsLeft className="ms-1 h-4 w-4 opacity-70 ltr:rotate-180" />
      </span>
      <button
        type="button"
        aria-label={label}
        className={cn(
          "relative z-10 ms-1 flex h-14 w-14 touch-none items-center justify-center rounded-xl bg-primary-foreground text-primary shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
          smooth && "transition-transform duration-200",
        )}
        style={{ transform: `translateX(${sign * offset}px)` }}
        onPointerDown={onDown}
        onPointerMove={onMove}
        onPointerUp={onUp}
        onPointerCancel={onUp}
        onClick={(e) => {
          // Keyboard / screen reader press (no pointer): act like a button.
          if (e.detail === 0) return confirm();
          if (!moved.current && !done) {
            setShowHint(true);
            haptic("light");
          }
        }}
      >
        {icon}
      </button>
    </div>
  );
}
