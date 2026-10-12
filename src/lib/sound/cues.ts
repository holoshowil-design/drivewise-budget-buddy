import type { MascotMood } from "@/components/DriverMascot";
import type { TaxiMood } from "@/components/CaricatureTaxi";
import type { RewardKind } from "@/lib/rewards";

/** Every sound the app can make (built in voices.ts). */
export const SOUND_NAMES = [
  // the Captain
  "grumble",
  "smirk",
  "sleepy",
  "shock",
  "victory",
  "excited",
  "pain",
  "yes",
  "one",
  "two",
  "three",
  "tune",
  "whistle",
  "snore",
  // Turbo the taxi
  "aooga",
  "beep",
  "turbo-start",
  "rev",
  "brake",
  "cough",
  "sigh",
  "boing",
  // the world around them
  "kaching",
  "slide",
  "womp",
  "phone",
  "splash",
  "fanfare",
] as const;
export type SoundName = (typeof SOUND_NAMES)[number];

/** A sound `at` ms after the moment it belongs to. */
export type Cue = { sound: SoundName; at: number; volume?: number };

export const REWARD_CUES: Record<RewardKind, readonly Cue[]> = {
  income: [
    { sound: "kaching", at: 0 },
    { sound: "smirk", at: 450 },
  ],
  trip: [
    { sound: "brake", at: 0 },
    { sound: "beep", at: 550 },
  ],
  "break-even": [
    { sound: "slide", at: 0 },
    { sound: "excited", at: 500 },
  ],
  goal: [
    { sound: "fanfare", at: 0 },
    { sound: "aooga", at: 750 },
    { sound: "victory", at: 1400 },
  ],
  streak: [
    { sound: "fanfare", at: 0 },
    { sound: "whistle", at: 600 },
  ],
  corrective: [
    { sound: "grumble", at: 0 },
    { sound: "womp", at: 650 },
  ],
};

/** The films on the character stages that have a soundtrack. Times follow the beats in MovieStage. */
export const SCENE_CUES = {
  morning: [
    { sound: "rev", at: 0 },
    { sound: "brake", at: 1700 },
    { sound: "sleepy", at: 2200 },
    { sound: "shock", at: 4600 },
    { sound: "splash", at: 4750 },
    { sound: "grumble", at: 5600 },
    { sound: "aooga", at: 7200 },
    { sound: "yes", at: 7700 },
  ],
  wipe: [
    { sound: "tune", at: 200 },
    { sound: "beep", at: 5400 },
  ],
  count: [
    { sound: "one", at: 100 },
    { sound: "two", at: 1600 },
    { sound: "three", at: 3100 },
    { sound: "kaching", at: 3400 },
  ],
  phone: [
    { sound: "phone", at: 0 },
    { sound: "yes", at: 1300 },
    { sound: "rev", at: 4600 },
  ],
  snooze: [
    { sound: "snore", at: 400 },
    { sound: "aooga", at: 4400 },
    { sound: "shock", at: 4650 },
    { sound: "smirk", at: 6200 },
  ],
} satisfies Record<string, readonly Cue[]>;

export function sceneCues(name: string): readonly Cue[] | undefined {
  return (SCENE_CUES as Record<string, readonly Cue[]>)[name];
}

/** What the Captain mumbles in each mood, and what Turbo says when tapped. */
export const MOOD_MUMBLE: Record<MascotMood, SoundName> = {
  sleepy: "sleepy",
  grumble: "grumble",
  smirk: "smirk",
  victory: "victory",
  excited: "excited",
  shock: "shock",
  pain: "pain",
};
export const TAXI_VOICE: Record<TaxiMood, SoundName> = {
  happy: "beep",
  tired: "sigh",
  zoom: "rev",
  honk: "aooga",
  cough: "cough",
  shock: "boing",
};

/** At most one idle film with sound every two minutes... */
export const AMBIENT_GAP_MS = 120_000;
/** ...and only while someone is actually using the app. */
export const AMBIENT_IDLE_MS = 90_000;

export type Gate = { enabled: boolean; running: boolean; hidden: boolean; driving: boolean };

/** Sound plays only when switched on, after a touch unlocked audio, on screen, and never while driving. */
export function canPlay(g: Gate): boolean {
  return g.enabled && g.running && !g.hidden && !g.driving;
}

/** Whether an idle film may have sound. `force` is for the once-a-morning film. */
export function ambientAllowed(a: {
  now: number;
  lastGesture: number;
  lastAmbient: number;
  tripActive: boolean;
  force?: boolean;
}): boolean {
  if (a.tripActive) return false;
  if (a.force) return true;
  return a.now - a.lastGesture <= AMBIENT_IDLE_MS && a.now - a.lastAmbient >= AMBIENT_GAP_MS;
}
