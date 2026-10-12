import { useEffect, useRef } from "react";
import { cellAt, timeline, type Cell } from "@/lib/anim/timing";

type Props = {
  /** Horizontal strip image: `cellCount` drawings of equal width, side by side. */
  src: string;
  cellCount: number;
  /** Display size of one drawing, in px. */
  width: number;
  height: number;
  /** Play order, with holds in frames. */
  cells: Cell[];
  loop?: boolean;
  /** Show the last drawing without motion (reduced motion, driving, setting off). */
  still?: boolean;
  onDone?: () => void;
  alt?: string;
};

/**
 * Plays drawn frames on twos. Only `transform` changes, and only when the drawing
 * changes (at most 12 times a second), so React never re-renders during playback.
 */
export function FrameStrip({
  src,
  cellCount,
  width,
  height,
  cells,
  loop,
  still,
  onDone,
  alt = "",
}: Props) {
  const strip = useRef<HTMLImageElement>(null);
  const done = useRef(onDone);
  done.current = onDone;

  useEffect(() => {
    const el = strip.current;
    if (!el || cells.length === 0) return;
    const show = (cell: number) => {
      el.style.transform = `translate3d(${-cell * width}px, 0, 0)`;
    };
    const { starts, ms: total } = timeline(cells);
    if (still) {
      show(cells[cells.length - 1].cell);
      return;
    }
    let raf = 0;
    let t0 = 0;
    let last = -1;
    const tick = (now: number) => {
      if (!t0) t0 = now;
      let ms = now - t0;
      if (loop) ms %= total;
      const i = cellAt(starts, ms);
      if (i !== last) {
        last = i;
        show(cells[i].cell);
      }
      if (!loop && ms >= total) {
        done.current?.();
        return;
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [cells, loop, still, width]);

  return (
    <span
      dir="ltr"
      role={alt ? "img" : undefined}
      aria-label={alt || undefined}
      aria-hidden={alt ? undefined : true}
      style={{ display: "inline-block", position: "relative", width, height, overflow: "hidden" }}
    >
      <img
        ref={strip}
        src={src}
        alt=""
        decoding="async"
        draggable={false}
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: width * cellCount,
          height,
          maxWidth: "none",
          willChange: "transform",
        }}
      />
    </span>
  );
}
