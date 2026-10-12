/**
 * One clock for the drawn films: drawings change "on twos", 12 a second, in steps, never tweened.
 */
export const FPS = 12;
export const FRAME_MS = 1000 / FPS;

export const framesToMs = (frames: number) => Math.round(frames * FRAME_MS);

/** One drawing in a film: which cell of the strip, and how many frames it holds (default 1). */
export type Cell = { cell: number; hold?: number };

/** Cells 0..count-1 in order, each held one frame unless `holds` says otherwise. */
export function sequence(count: number, holds: Record<number, number> = {}): Cell[] {
  return Array.from({ length: count }, (_, cell) =>
    holds[cell] ? { cell, hold: holds[cell] } : { cell },
  );
}

/** Start frame of every cell, and the film's length in frames and ms. */
export function timeline(cells: Cell[]) {
  const starts: number[] = [];
  let frames = 0;
  for (const c of cells) {
    starts.push(frames);
    frames += Math.max(1, c.hold ?? 1);
  }
  return { starts, frames, ms: framesToMs(frames) };
}

/** Index of the cell on screen `ms` after the start; the last cell once the film is over. */
export function cellAt(starts: number[], ms: number) {
  const frame = Math.floor(Math.max(0, ms) / FRAME_MS);
  let i = 0;
  while (i + 1 < starts.length && starts[i + 1] <= frame) i++;
  return i;
}
