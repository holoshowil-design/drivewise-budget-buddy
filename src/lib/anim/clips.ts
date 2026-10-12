import { sequence, timeline, type Cell } from "./timing";

/**
 * A drawn film: equal cells in one grid image (row by row), played on twos by FrameStrip.
 * Made from a Higgsfield clip with scratch tooling: 12 fps frames, paper keyed out, colours
 * lifted like public/characters.
 */
export type Clip = {
  src: string;
  columns: number;
  rows: number;
  /** One cell, in px of the image. */
  width: number;
  height: number;
  /** The Captain's body in the first cell [left, top, right, bottom], to line the film up with his still pose. */
  body: readonly [number, number, number, number];
  cells: Cell[];
};

/** Income saved: banknotes rain on the Captain, he grabs them and leaps (4 s, then holds the last drawing). */
export const HEIST: Clip = {
  src: "/anim/captain/heist.webp",
  columns: 8,
  rows: 5,
  width: 257,
  height: 360,
  body: [69, 22, 179, 354],
  cells: sequence(38, { 0: 6, 5: 5, 25: 2 }),
};

export const clipMs = (clip: Clip) => timeline(clip.cells).ms;

/**
 * Where the film sits in the mascot box, in % of that box: the body in the first cell stands
 * exactly where the still pose stands (as tall as the box, feet on its bottom, centred), and
 * whatever flies around him spills over the box.
 */
export function filmBox(clip: Clip) {
  const [left, top, right, bottom] = clip.body;
  const tall = bottom - top;
  const pct = (n: number) => `${+(n * 100).toFixed(3)}%`;
  return {
    height: pct(clip.height / tall),
    bottom: pct(-(clip.height - bottom) / tall),
    left: "50%",
    translate: `${pct(-(left + right) / 2 / clip.width)} 0`,
    aspectRatio: `${clip.width} / ${clip.height}`,
  };
}

const ready = new Map<string, HTMLImageElement>();
const loading = new Map<string, Promise<boolean>>();

/** Fetches and decodes a film once; keeps it in memory so it starts without a blank frame. */
export function loadClip(clip: Clip): Promise<boolean> {
  if (ready.has(clip.src)) return Promise.resolve(true);
  const pending = loading.get(clip.src);
  if (pending) return pending;
  const img = new Image();
  img.src = clip.src;
  const p = img.decode().then(
    () => {
      ready.set(clip.src, img);
      return true;
    },
    () => false,
  );
  // a failed load may be tried again later
  void p.then(() => loading.delete(clip.src));
  loading.set(clip.src, p);
  return p;
}

export const clipReady = (clip: Clip) => ready.has(clip.src);
