import { readActive } from "@/lib/active-trip";
import { ambientAllowed, canPlay, type Cue, type SoundName } from "./cues";
import { readSoundPref, writeSoundPref } from "./prefs";
import type { Voice } from "./synth";
import { isRecorded, loadTakes, pickTake, playTake } from "./takes";
import { SOUNDS } from "./voices";

export type { SoundName } from "./cues";
export { loadTakes } from "./takes";

/**
 * The app's one speaker. Nothing is created until the first touch (browsers
 * only start audio after one), every sound goes through a gentle limiter, and
 * nothing plays while hidden, switched off, or in driving mode.
 */
const MASTER = 0.85;
const AMBIENT_VOLUME = 0.6;
/** A sound asked for this soon after a touch may wait for the audio to wake up. */
const GESTURE_WINDOW_MS = 1000;

let ctx: AudioContext | null = null;
let bus: GainNode | null = null;
let enabled: boolean | null = null;
let lastGesture = 0;
let lastAmbient = Number.NEGATIVE_INFINITY;
const playing = new Set<GainNode>();

export function soundEnabled(): boolean {
  enabled ??= readSoundPref();
  return enabled;
}

/** Re-reads the switch (another tab changed it). */
export function refreshSoundPref() {
  enabled = readSoundPref();
  if (!enabled) hushSound();
}

function audio(): AudioContext | null {
  if (ctx) return ctx;
  if (typeof window === "undefined") return null;
  const AC =
    window.AudioContext ??
    (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!AC) return null;
  ctx = new AC({ latencyHint: "interactive" });
  const limiter = ctx.createDynamicsCompressor();
  limiter.threshold.value = -6;
  limiter.knee.value = 6;
  limiter.ratio.value = 10;
  limiter.attack.value = 0.003;
  limiter.release.value = 0.15;
  bus = ctx.createGain();
  bus.gain.value = MASTER;
  bus.connect(limiter).connect(ctx.destination);
  return ctx;
}

/** Call from every touch or key press. */
export function unlockSound() {
  lastGesture = Date.now();
  if (!soundEnabled()) return;
  void loadTakes();
  const c = audio();
  if (c && c.state !== "running") void c.resume().catch(() => {});
}

export function setSoundEnabled(on: boolean) {
  enabled = on;
  writeSoundPref(on);
  if (on) unlockSound();
  else hushSound();
}

const inDriveMode = () => document.querySelector(".drive-hud") !== null;

function fade(g: GainNode) {
  if (!ctx) return;
  g.gain.cancelScheduledValues(ctx.currentTime);
  g.gain.setTargetAtTime(0, ctx.currentTime, 0.03);
}

/** The Captain stays quiet until his recorded voice has loaded, rather than sounding synthetic. */
function voiceFor(name: SoundName): Voice | null {
  if (!isRecorded(name)) return SOUNDS[name];
  const take = pickTake(name);
  return take && ((o) => playTake(o, take));
}

/** Plays one sound now. Returns its volume node, or null when it may not play. */
export function playSound(
  name: SoundName,
  { volume = 1, ambient = false }: { volume?: number; ambient?: boolean } = {},
) {
  const c = ctx;
  if (!c || !bus) return null;
  const running = c.state === "running" || Date.now() - lastGesture < GESTURE_WINDOW_MS;
  if (
    !canPlay({ enabled: soundEnabled(), running, hidden: document.hidden, driving: inDriveMode() })
  )
    return null;
  const voice = voiceFor(name);
  if (!voice) return null;
  const g = c.createGain();
  g.gain.value = volume * (ambient ? AMBIENT_VOLUME : 1);
  g.connect(bus);
  playing.add(g);
  const length = voice({ ctx: c, dest: g, t: c.currentTime + 0.02 });
  window.setTimeout(
    () => {
      g.disconnect();
      playing.delete(g);
    },
    (length + 0.4) * 1000,
  );
  return g;
}

export type CueHandle = { stop: () => void };

/** Plays a little soundtrack. Each cue checks the rules again when its moment comes. */
export function playCues(cues: readonly Cue[], { ambient = false } = {}): CueHandle {
  const voiced: GainNode[] = [];
  const timers = cues.map((cue) =>
    window.setTimeout(() => {
      const g = playSound(cue.sound, { volume: cue.volume, ambient });
      if (g) voiced.push(g);
    }, cue.at),
  );
  return {
    stop: () => {
      timers.forEach((t) => window.clearTimeout(t));
      voiced.forEach(fade);
    },
  };
}

/** May an idle film on the stage have sound right now? Claims the slot if so. */
export function claimAmbient(force = false): boolean {
  const now = Date.now();
  if (!ambientAllowed({ now, lastGesture, lastAmbient, tripActive: readActive() !== null, force }))
    return false;
  lastAmbient = now;
  return true;
}

/** Fades out everything that is playing. */
export function hushSound() {
  playing.forEach(fade);
}

export function suspendSound() {
  hushSound();
  void ctx?.suspend().catch(() => {});
}

export function resumeSound() {
  if (ctx && lastGesture && soundEnabled()) void ctx.resume().catch(() => {});
}
