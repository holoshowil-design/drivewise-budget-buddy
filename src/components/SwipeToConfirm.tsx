import { useEffect, useRef, useState, type ReactNode } from "react";
import { Check, ChevronsLeft } from "lucide-react";
import { haptic } from "@/lib/haptics";
import { cn } from "@/lib/utils";

/** How far (0..1) the thumb must travel before letting go counts. */
const DONE_AT = 0.8;
/** A quick flick (px per ms) past the middle also counts. */
const FLICK = 0.9;
const PAD = 4;
const SPRING = "transform 420ms cubic-bezier(0.34, 1.56, 0.64, 1)";
const GLIDE = "transform 160ms cubic-bezier(0.22, 1, 0.36, 1)";

const still = () =>
  typeof window !== "undefined" &&
  (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ?? false);

type Drag = {
  x0: number;
  max: number;
  dir: number;
  past: boolean;
  x: number;
  lastX: number;
  lastT: number;
  v: number;
};

/**
 * "Slide to start": the thumb sits at the start side (right in Hebrew) and is
 * dragged across the track. The drag moves the DOM directly on each animation
 * frame (no React render per finger move), so it follows the finger smoothly;
 * letting go early springs back, a flick or a long drag finishes it.
 * Haptics: a light touch when the drag starts and a tick at the point of no
 * return (the action itself gives the success pulse).
 * Keyboard and screen readers press the thumb like a button. A plain tap only
 * shows a hint, so a stray touch starts nothing.
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
  const thumb = useRef<HTMLButtonElement>(null);
  const fill = useRef<HTMLDivElement>(null);
  const text = useRef<HTMLSpanElement>(null);
  const drag = useRef<Drag | null>(null);
  const frame = useRef(0);
  const moved = useRef(false);
  const [done, setDone] = useState(false);
  const [showHint, setShowHint] = useState(false);

  useEffect(() => () => cancelAnimationFrame(frame.current), []);

  const geometry = () => {
    const t = track.current!;
    const w = thumb.current!.offsetWidth;
    return {
      max: Math.max(1, t.clientWidth - w - PAD * 2),
      dir: getComputedStyle(t).direction === "rtl" ? -1 : 1,
      trackW: t.clientWidth,
      thumbW: w,
    };
  };

  /** Puts thumb, fill and label where `x` (px along the track) says. */
  const paint = (x: number, transition: string | null) => {
    if (!track.current || !thumb.current || !fill.current) return;
    const { max, dir, trackW, thumbW } = geometry();
    const t = still() ? "none" : (transition ?? "none");
    thumb.current.style.transition = t;
    fill.current.style.transition = t;
    thumb.current.style.transform = `translate3d(${dir * x}px,0,0)`;
    // The fill is as wide as the track and slides out toward the start edge,
    // so only transforms change while dragging.
    const hidden = trackW - (PAD * 2 + thumbW + x);
    fill.current.style.transform = `translate3d(${-dir * hidden}px,0,0)`;
    if (text.current) {
      text.current.style.transition = transition ? "opacity 200ms" : "none";
      text.current.style.opacity = String(Math.max(0, 1 - (x / max) * 1.8));
    }
  };

  // First paint and after a resize: put the fill behind the resting thumb.
  useEffect(() => {
    paint(0, null);
    const ro = new ResizeObserver(() => !drag.current && !done && paint(0, null));
    if (track.current) ro.observe(track.current);
    return () => ro.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const finish = () => {
    if (done) return;
    setDone(true);
    const { max } = geometry();
    paint(max, GLIDE);
    window.setTimeout(onConfirm, still() ? 0 : 170);
  };

  const onDown = (e: React.PointerEvent<HTMLButtonElement>) => {
    if (done || !track.current) return;
    const { max, dir } = geometry();
    const now = performance.now();
    drag.current = { x0: e.clientX, max, dir, past: false, x: 0, lastX: 0, lastT: now, v: 0 };
    moved.current = false;
    e.currentTarget.setPointerCapture(e.pointerId);
    paint(0, null);
  };

  const onMove = (e: React.PointerEvent<HTMLButtonElement>) => {
    const d = drag.current;
    if (!d) return;
    const raw = (e.clientX - d.x0) * d.dir;
    if (!moved.current && raw > 4) {
      moved.current = true;
      setShowHint(false);
      haptic("light");
    }
    // A little rubber band past either end instead of a hard stop.
    const x = raw < 0 ? raw * 0.15 : raw > d.max ? d.max + (raw - d.max) * 0.15 : raw;
    const now = performance.now();
    const dt = now - d.lastT;
    if (dt > 0) d.v = 0.7 * ((x - d.lastX) / dt) + 0.3 * d.v;
    d.lastX = x;
    d.lastT = now;
    d.x = x;
    const past = x / d.max >= DONE_AT;
    if (past !== d.past) {
      d.past = past;
      if (past) haptic("tap");
    }
    cancelAnimationFrame(frame.current);
    frame.current = requestAnimationFrame(() => paint(x, null));
  };

  const onUp = () => {
    const d = drag.current;
    drag.current = null;
    cancelAnimationFrame(frame.current);
    if (!d) return;
    const flick = d.v > FLICK && d.x / d.max > 0.4;
    if (d.past || flick) {
      if (!d.past) haptic("tap");
      finish();
    } else paint(0, SPRING);
  };

  return (
    <div
      ref={track}
      className={cn(
        "relative h-16 w-full select-none overflow-hidden rounded-2xl bg-primary text-primary-foreground shadow-sm",
        className,
      )}
    >
      {/* Filled part behind the thumb */}
      <div
        ref={fill}
        className="absolute inset-y-0 start-0 w-full rounded-2xl bg-primary-foreground/20 will-change-transform"
        aria-hidden="true"
      />
      <span
        ref={text}
        className="pointer-events-none absolute inset-0 flex items-center justify-center ps-16 text-[15px] font-bold"
        aria-hidden="true"
      >
        <span className="swipe-shine">{showHint ? hint : label}</span>
        <ChevronsLeft className="ms-1 h-4 w-4 opacity-70 ltr:rotate-180" />
      </span>
      <button
        ref={thumb}
        type="button"
        aria-label={label}
        className="absolute start-1 top-1 z-10 flex h-14 w-14 touch-none items-center justify-center rounded-xl bg-primary-foreground text-primary shadow-md will-change-transform focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring active:shadow-lg"
        onPointerDown={onDown}
        onPointerMove={onMove}
        onPointerUp={onUp}
        onPointerCancel={onUp}
        onClick={(e) => {
          // Keyboard / screen reader press (no pointer): act like a button.
          if (e.detail === 0) return finish();
          if (!moved.current && !done) {
            setShowHint(true);
            haptic("light");
            // A small nudge shows which way to slide.
            paint(18, GLIDE);
            window.setTimeout(() => paint(0, SPRING), 170);
          }
        }}
      >
        {done ? <Check className="h-6 w-6" /> : icon}
      </button>
    </div>
  );
}
