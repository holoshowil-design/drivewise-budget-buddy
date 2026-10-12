import { useEffect, useRef } from "react";
import { clipMs, filmBox, type Clip } from "@/lib/anim/clips";
import { cellAt, timeline } from "@/lib/anim/timing";

/**
 * Plays a drawn film once, on twos, then holds its last drawing; a loop plays until it is
 * taken away. Sized in % of the box it stands in, so the same film fits every stage. Only
 * `transform` changes, and only when the drawing changes, so React never re-renders during
 * playback. `--film-ms` is the film's length, for CSS that should start once the drawing
 * holds (the jig of a celebration).
 */
export function FrameStrip({ clip, className = "" }: { clip: Clip; className?: string }) {
  const strip = useRef<HTMLImageElement>(null);

  useEffect(() => {
    const el = strip.current;
    if (!el) return;
    const { starts, ms: total } = timeline(clip.cells);
    const show = (i: number) => {
      const cell = clip.cells[i].cell;
      const x = (cell % clip.columns) * (100 / clip.columns);
      const y = Math.floor(cell / clip.columns) * (100 / clip.rows);
      el.style.transform = `translate(${-x}%, ${-y}%)`;
    };
    let raf = 0;
    let t0 = 0;
    let last = -1;
    const tick = (now: number) => {
      t0 ||= now;
      const i = cellAt(starts, clip.loop ? (now - t0) % total : now - t0);
      if (i !== last) {
        last = i;
        show(i);
      }
      if (clip.loop || now - t0 < total) raf = requestAnimationFrame(tick);
    };
    show(0);
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [clip]);

  return (
    <span
      className={`frame-strip ${clip.jig ? "frame-jig" : ""} ${className}`}
      style={{ ...filmBox(clip), ["--film-ms" as string]: `${clipMs(clip)}ms` }}
      aria-hidden="true"
    >
      <img
        ref={strip}
        className="frame-cells"
        src={clip.src}
        alt=""
        draggable={false}
        decoding="sync"
        style={{ width: `${clip.columns * 100}%`, height: `${clip.rows * 100}%` }}
      />
    </span>
  );
}
