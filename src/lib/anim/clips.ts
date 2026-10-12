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
  /** The still pose the film starts from, as it sits in the first cell [left, top, right, bottom], to line the two up. */
  body: readonly [number, number, number, number];
  cells: Cell[];
  /** A celebration: he jigs on the last drawing until the scene moves on. */
  jig?: boolean;
  /** Plays over and over (the taxi driving) instead of once. */
  loop?: boolean;
  /** "width" for a still wider than its box (the taxi): it spans the box from side to side. */
  fit?: "width";
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
  jig: true,
};

/** Before noon: a big yawn over the coffee, which pours down his front when the taxi screeches in. */
export const MORNING: Clip = {
  src: "/anim/captain/morning.webp",
  columns: 8,
  rows: 7,
  width: 230,
  height: 360,
  body: [75, 23, 196, 334],
  cells: sequence(52, { 44: 2, 50: 2 }),
};

/** An expense: the fuel nozzle he is holding gushes into his face, and he stamps about in a rage. */
export const SPLASH: Clip = {
  src: "/anim/captain/splash.webp",
  columns: 8,
  rows: 7,
  width: 255,
  height: 360,
  body: [70, 22, 175, 349],
  cells: sequence(51, { 0: 3, 15: 2, 16: 3, 17: 2 }),
};

/** The daily goal or a streak: he flings his banknotes up, marches under them, tips his cap and leaps. */
export const PARADE: Clip = {
  src: "/anim/captain/parade.webp",
  columns: 8,
  rows: 6,
  width: 259,
  height: 360,
  body: [77, 24, 197, 352],
  cells: sequence(46, { 0: 9, 33: 2, 45: 2 }),
  jig: true,
};

/** Idle: he polishes the taxi with a red rag, breathes on it, polishes again and tucks the rag away. */
export const WIPE: Clip = {
  src: "/anim/captain/wipe.webp",
  columns: 8,
  rows: 7,
  width: 242,
  height: 360,
  body: [74, 9, 184, 352],
  cells: sequence(53),
};

/** Idle: he licks his thumb and flicks away three banknotes, giggles, and fans the rest. */
export const COUNT: Clip = {
  src: "/anim/captain/count.webp",
  columns: 8,
  rows: 7,
  width: 218,
  height: 360,
  body: [81, 6, 208, 352],
  cells: sequence(53, { 10: 2, 33: 2, 34: 2, 48: 3, 52: 2 }),
};

/** Idle: the phone rings, he jumps out of his cap, digs out the phone, takes the ride and grins. */
export const PHONE: Clip = {
  src: "/anim/captain/phone.webp",
  columns: 8,
  rows: 6,
  width: 242,
  height: 360,
  body: [68, 17, 201, 357],
  cells: sequence(45, { 8: 2, 9: 4, 27: 2, 28: 2, 32: 6 }),
};

/** Idle: he dozes off over his coffee and springs awake. */
export const SNOOZE: Clip = {
  src: "/anim/captain/snooze.webp",
  columns: 8,
  rows: 4,
  width: 219,
  height: 360,
  body: [64, 25, 192, 353],
  cells: sequence(28, { 8: 2, 19: 2, 20: 19, 27: 6 }),
};

/** Turbo driving on the spot, bouncing on old springs (one 11-drawing cycle); the stage moves it along. */
export const TAXI_DRIVE: Clip = {
  src: "/anim/taxi/drive.webp",
  columns: 8,
  rows: 2,
  width: 381,
  height: 230,
  body: [4, 3, 379, 225],
  cells: sequence(11),
  loop: true,
  fit: "width",
};

/** Turbo slams on the brakes: nose down, a hubcap rolls off, a door swings open, smoke, then a tired sag. */
export const TAXI_BRAKE: Clip = {
  src: "/anim/taxi/brake.webp",
  columns: 8,
  rows: 5,
  width: 367,
  height: 230,
  body: [3, 28, 326, 220],
  cells: sequence(39),
  fit: "width",
};

export const clipMs = (clip: Clip) => timeline(clip.cells).ms;

/**
 * Where the film sits in its box, in % of that box: the still pose in the first cell stands
 * exactly where the still image stands (as tall as the box, feet on its bottom, centred), and
 * whatever flies around him spills over the box. A wide still (the taxi speeding, wider than
 * the taxi's box on every stage) spans the box from side to side instead, wheels on the bottom.
 */
export function filmBox(clip: Clip) {
  const [left, top, right, bottom] = clip.body;
  const pct = (n: number) => `${+(n * 100).toFixed(3)}%`;
  if (clip.fit === "width") {
    const wide = right - left;
    return {
      width: pct(clip.width / wide),
      bottom: "0%",
      left: pct(-left / wide),
      translate: `0 ${pct((clip.height - bottom) / clip.height)}`,
      aspectRatio: `${clip.width} / ${clip.height}`,
    };
  }
  const tall = bottom - top;
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
