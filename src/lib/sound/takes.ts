import type { SoundName } from "./cues";
import type { Out } from "./synth";

/**
 * The Captain's own voice: short recorded takes (made with a speech model, no
 * words, a thin cartoon-crook voice) that play instead of synthesized sound.
 * Moods have two takes each, so he does not say the same thing twice in a row.
 */
export const TAKES = {
  grumble: ["grumble-1", "grumble-2"],
  smirk: ["smirk-1", "smirk-2"],
  sleepy: ["sleepy-1", "sleepy-2"],
  shock: ["shock-1", "shock-2"],
  victory: ["victory-1", "victory-2"],
  excited: ["excited-1", "excited-2"],
  pain: ["pain-1", "pain-2"],
  yes: ["yes"],
  one: ["one"],
  two: ["two"],
  three: ["three"],
  tune: ["tune"],
  snore: ["snore"],
} satisfies Partial<Record<SoundName, readonly string[]>>;

export type RecordedSound = keyof typeof TAKES;

export const isRecorded = (name: SoundName): name is RecordedSound => name in TAKES;

export const takeUrl = (take: string) => `/sounds/captain/${take}.mp3`;

/** Picks a take at random, never the one played last when there is a choice. */
export function chooseTake<T>(takes: readonly T[], last: T | undefined, random = Math.random) {
  const pool = takes.length > 1 ? takes.filter((t) => t !== last) : takes;
  return pool[Math.floor(random() * pool.length)] as T | undefined;
}

const buffers = new Map<string, AudioBuffer>();
const lastPlayed = new Map<RecordedSound, AudioBuffer>();
let loading: Promise<void> | null = null;
let decoder: BaseAudioContext | null = null;

/** Decoding needs an audio context but no touch: an offline one makes buffers that any context can play. */
function decoderContext(): BaseAudioContext | null {
  if (decoder || typeof window === "undefined") return decoder;
  const OAC =
    window.OfflineAudioContext ??
    (window as unknown as { webkitOfflineAudioContext?: typeof OfflineAudioContext })
      .webkitOfflineAudioContext;
  return (decoder = OAC ? new OAC(1, 1, 48000) : null);
}

function decode(ctx: BaseAudioContext, data: ArrayBuffer) {
  return new Promise<AudioBuffer | null>((resolve) => {
    // The callback form also works on older Safari.
    ctx.decodeAudioData(data, resolve, () => resolve(null))?.catch(() => {});
  });
}

async function loadTake(take: string) {
  const data = await fetch(takeUrl(take))
    .then((r) => (r.ok ? r.arrayBuffer() : null))
    .catch(() => null);
  const ctx = data && decoderContext();
  const buffer = ctx && (await decode(ctx, data));
  if (buffer) buffers.set(take, buffer);
}

/** Downloads and decodes the takes that are not ready yet. Cheap to call again, and a take that failed is tried again. */
export function loadTakes(): Promise<void> {
  if (!loading) {
    const done = () => {
      loading = null;
    };
    const missing = Object.values(TAKES)
      .flat()
      .filter((take) => !buffers.has(take));
    loading = Promise.all(missing.map(loadTake)).then(done, done);
  }
  return loading;
}

/** A take of this sound that is ready to play, or null while the Captain's voice is still loading. */
export function pickTake(name: RecordedSound): AudioBuffer | null {
  const ready = TAKES[name].flatMap((take) => buffers.get(take) ?? []);
  const take = chooseTake(ready, lastPlayed.get(name)) ?? null;
  if (take) lastPlayed.set(name, take);
  return take;
}

/** Plays a take like any other voice: from `o.t` into `o.dest`, returning its length. */
export function playTake(o: Out, buffer: AudioBuffer): number {
  const src = o.ctx.createBufferSource();
  src.buffer = buffer;
  src.connect(o.dest);
  src.start(o.t);
  return buffer.duration;
}
