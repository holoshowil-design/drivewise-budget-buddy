/**
 * One shared clock for every animated scene (stage 6, docs/visual-art-direction.md §6).
 * Drawings change "on twos": 12 per second, in steps, never tweened.
 */
export const FPS = 12;
export const FRAME_MS = 1000 / FPS;

/** Line boil: three versions of the same drawing, swapped 8 times a second. */
export const BOIL_FPS = 8;

/** Beat lengths, in frames. */
export const BEAT = { anticipation: 3, action: 2, overshoot: 2, settle: 2 } as const;

/** Holds long enough for the eye to read a pose (0.33–0.83 s), in frames. */
export const HOLD = { short: 4, normal: 6, long: 8, glance: 10 } as const;

export const framesToMs = (frames: number) => Math.round(frames * FRAME_MS);

/** How long a speech bubble stays up: 0.25 s plus 60 ms per character, at most 2.5 s. */
export function bubbleMs(text: string) {
  return Math.min(2500, 250 + 60 * [...text].length);
}

/** One drawing in a scene: which cell of the strip, and how many frames it holds (default 1). */
export type Cell = { cell: number; hold?: number };

/** Start frame of every cell, and the scene length in frames. */
export function timeline(cells: Cell[]) {
  const starts: number[] = [];
  let frames = 0;
  for (const c of cells) {
    starts.push(frames);
    frames += Math.max(1, c.hold ?? 1);
  }
  return { starts, frames, ms: framesToMs(frames) };
}

/** Index of the cell on screen at `ms` from the start; the last cell once the scene is over. */
export function cellAt(starts: number[], ms: number) {
  const frame = Math.floor(Math.max(0, ms) / FRAME_MS);
  let i = 0;
  while (i + 1 < starts.length && starts[i + 1] <= frame) i++;
  return i;
}
