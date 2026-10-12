import type { MascotMood, MascotProp } from "@/components/DriverMascot";
import type { TaxiMood } from "@/components/CaricatureTaxi";
import {
  COUNT,
  HEIST,
  MORNING,
  PARADE,
  PHONE,
  SNOOZE,
  SPLASH,
  TAXI_BRAKE,
  TAXI_DRIVE,
  WIPE,
  type Clip,
} from "./clips";

export type SceneName =
  | "morning"
  | "heist"
  | "splash"
  | "parade"
  | "wipe"
  | "count"
  | "phone"
  | "snooze"
  | "drive"
  | "brake";

/**
 * One moment of a scene on the character stages: the poses, a line, and which drawn films
 * show. `film` shows the Captain's film; `taxiFilm` puts Turbo in a film of his own.
 */
export type Beat = {
  at: number;
  mood: MascotMood;
  prop?: MascotProp;
  taxi?: TaxiMood;
  driving?: boolean;
  quip?: string;
  film?: boolean;
  taxiFilm?: Clip;
};

/** A scene told with drawn films. `travel` keeps the scene's CSS travel under the Captain's film. */
export type Film = { clip?: Clip; length: number; beats: Beat[]; travel?: boolean };

/**
 * Scenes that also exist as drawn films. A film plays while its beats say so, the quips
 * follow the drawings, and the drawn-pose scene in MovieStage stays the fallback (films not
 * loaded yet, driving, phone saving data). A one-shot film holds its last drawing until the
 * beats move on; the Captain then goes back to a breathing pose.
 */
// prettier-ignore
export const FILMS: Partial<Record<SceneName, Film>> = {
  // Turbo screeches in behind the Captain and falls apart a little; the coffee goes everywhere
  morning: {
    clip: MORNING,
    length: 9000,
    beats: [
      { at: 0, mood: "sleepy", taxi: "zoom", driving: true, film: true, taxiFilm: TAXI_DRIVE, quip: "אהההה... ☕" },
      { at: 1100, mood: "sleepy", taxi: "shock", film: true, taxiFilm: TAXI_BRAKE, quip: "אהההה... ☕" },
      { at: 2580, mood: "shock", taxi: "cough", film: true, taxiFilm: TAXI_BRAKE, quip: "הקפה!!" },
      { at: 4000, mood: "grumble", taxi: "cough", film: true, taxiFilm: TAXI_BRAKE, quip: "#@!" },
      { at: 4600, mood: "grumble", prop: "none", taxi: "tired", taxiFilm: TAXI_BRAKE, quip: "#@!" },
      { at: 7200, mood: "smirk", prop: "none", taxi: "honk", quip: "יאללה, לעבודה" },
    ],
  },
  heist: {
    clip: HEIST,
    length: 8200,
    beats: [
      { at: 0, mood: "smirk", taxi: "happy", film: true, quip: "ששש..." },
      { at: 2000, mood: "shock", taxi: "shock", film: true, quip: "!?" },
      { at: 2670, mood: "excited", taxi: "zoom", film: true, quip: "שלי!" },
      { at: 3420, mood: "victory", taxi: "honk", film: true, quip: "בּוּם! 💰" },
      { at: 6800, mood: "smirk", prop: "cash", taxi: "happy" },
    ],
  },
  splash: {
    clip: SPLASH,
    length: 7600,
    beats: [
      { at: 0, mood: "smirk", taxi: "happy", film: true },
      { at: 900, mood: "smirk", taxi: "happy", film: true, quip: "רק מתדלק..." },
      { at: 2000, mood: "shock", taxi: "shock", film: true, quip: "גְּלוּק!" },
      { at: 3100, mood: "grumble", taxi: "cough", film: true, quip: "#@!" },
      { at: 4900, mood: "grumble", prop: "none", taxi: "tired", quip: "נחזיר את זה" },
    ],
  },
  // the Captain rides Turbo's roof on a victory lap
  parade: {
    clip: PARADE,
    length: 10000,
    travel: true,
    beats: [
      { at: 0, mood: "excited", taxi: "zoom", film: true, quip: "יעד!!" },
      { at: 1400, mood: "victory", taxi: "honk", driving: true, film: true, taxiFilm: TAXI_DRIVE, quip: "מצעד ניצחון 🏆" },
      { at: 8200, mood: "victory", prop: "none", taxi: "happy", driving: false },
    ],
  },
  wipe: {
    clip: WIPE,
    length: 7000,
    beats: [
      { at: 0, mood: "smirk", taxi: "happy", film: true },
      { at: 1600, mood: "smirk", taxi: "happy", film: true, quip: "מבריקה כמו חדשה ✨" },
      { at: 4500, mood: "smirk", taxi: "honk" },
    ],
  },
  count: {
    clip: COUNT,
    length: 6400,
    beats: [
      { at: 0, mood: "excited", film: true },
      { at: 500, mood: "excited", film: true, quip: "אחד..." },
      { at: 1670, mood: "excited", film: true, quip: "שניים..." },
      { at: 2500, mood: "excited", film: true, quip: "שלוש! 🤑" },
      { at: 5000, mood: "excited" },
    ],
  },
  phone: {
    clip: PHONE,
    length: 7000,
    beats: [
      { at: 0, mood: "shock", film: true, quip: "טררר!" },
      { at: 2400, mood: "smirk", film: true, quip: "כן? איסוף? בדרך!" },
      { at: 4700, mood: "smirk", taxi: "zoom" },
    ],
  },
  snooze: {
    clip: SNOOZE,
    length: 6500,
    beats: [
      { at: 0, mood: "sleepy", taxi: "tired", film: true },
      { at: 3420, mood: "shock", taxi: "honk", film: true, quip: "מה? מי? נסיעה!" },
      { at: 4500, mood: "smirk", taxi: "happy" },
    ],
  },
  // Turbo's own scenes: a warm-up lap, and a lap that ends in a hard stop he barely survives
  drive: {
    length: 6000,
    beats: [
      { at: 0, mood: "smirk", taxi: "zoom", driving: true, taxiFilm: TAXI_DRIVE, quip: "סיבוב חימום 🏁" },
      { at: 4200, mood: "excited", taxi: "honk", quip: "איזו מכונה! 😍" },
    ],
  },
  brake: {
    length: 7500,
    beats: [
      { at: 0, mood: "smirk", taxi: "zoom", driving: true, taxiFilm: TAXI_DRIVE, quip: "סיבוב קטן..." },
      { at: 2300, mood: "smirk", taxi: "shock", taxiFilm: TAXI_BRAKE },
      { at: 3300, mood: "shock", taxi: "cough", taxiFilm: TAXI_BRAKE, quip: "אוי!" },
      { at: 5600, mood: "smirk", taxi: "tired", taxiFilm: TAXI_BRAKE, quip: "זקנה, אבל שלי 🧡" },
    ],
  },
};

/** Every strip a filmed scene needs, the Captain's and Turbo's, each once. */
export function clipsOf(film: Film): Clip[] {
  const all = [film.clip, ...film.beats.map((b) => b.taxiFilm)];
  return [...new Set(all.filter((c): c is Clip => Boolean(c)))];
}
