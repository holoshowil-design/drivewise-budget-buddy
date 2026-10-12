/**
 * A tiny Web Audio kit. Every sound in the app is built from these few parts
 * (oscillators, noise, filters, envelopes), so there are no audio files to
 * download. Works on an AudioContext or an OfflineAudioContext.
 */

/** Where and when a voice plays: it schedules its nodes from `t` into `dest`. */
export type Out = { ctx: BaseAudioContext; dest: AudioNode; t: number };
/** Schedules one sound and returns its length in seconds. */
export type Voice = (o: Out) => number;

/** [seconds after o.t, value] */
export type Point = readonly [number, number];

export const semis = (base: number, n: number) => base * 2 ** (n / 12);

/** Holds the first value, then ramps linearly through the rest. */
export function ramp(param: AudioParam, t0: number, points: readonly Point[]) {
  const [first, ...rest] = points;
  param.cancelScheduledValues(t0);
  param.setValueAtTime(first[1], t0 + first[0]);
  for (const [dt, v] of rest) param.linearRampToValueAtTime(v, t0 + dt);
}

/** Percussive envelope: quick rise to `peak`, exponential fall to silence. */
export function strike(param: AudioParam, at: number, peak: number, decay: number, attack = 0.004) {
  param.setValueAtTime(0.0001, at);
  param.linearRampToValueAtTime(peak, at + attack);
  param.setTargetAtTime(0.0001, at + attack, decay / 4);
}

export function gain(o: Out, value = 0) {
  const g = o.ctx.createGain();
  g.gain.value = value;
  return g;
}

export function osc(o: Out, type: OscillatorType, freq: number, start: number, stop: number) {
  const n = o.ctx.createOscillator();
  n.type = type;
  n.frequency.value = freq;
  n.start(o.t + start);
  n.stop(o.t + stop);
  return n;
}

export function filter(o: Out, type: BiquadFilterType, freq: number, q = 0.7) {
  const f = o.ctx.createBiquadFilter();
  f.type = type;
  f.frequency.value = freq;
  f.Q.value = q;
  return f;
}

const noiseBuffers = new WeakMap<BaseAudioContext, AudioBuffer>();

/** White noise (two seconds, looped). */
export function noise(o: Out, start: number, stop: number) {
  let buffer = noiseBuffers.get(o.ctx);
  if (!buffer) {
    buffer = o.ctx.createBuffer(1, o.ctx.sampleRate * 2, o.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    let seed = 7;
    for (let i = 0; i < data.length; i++) {
      seed = (seed * 16807) % 2147483647;
      data[i] = seed / 1073741823.5 - 1;
    }
    noiseBuffers.set(o.ctx, buffer);
  }
  const src = o.ctx.createBufferSource();
  src.buffer = buffer;
  src.loop = true;
  src.start(o.t + start, (start * 0.37) % 1.5);
  src.stop(o.t + stop);
  return src;
}

/** Sine LFO added onto a parameter (vibrato, wobble, tremolo). Returns its depth gain. */
export function lfo(
  o: Out,
  target: AudioParam,
  rate: number,
  depth: number,
  start: number,
  stop: number,
) {
  const l = osc(o, "sine", rate, start, stop);
  const d = gain(o, depth);
  l.connect(d).connect(target);
  return d;
}

/** Soft clipper, for horns and engines that should sound a bit overdriven. */
export function drive(o: Out, amount: number) {
  const ws = o.ctx.createWaveShaper();
  const n = 1024;
  const shape = new Float32Array(n);
  for (let i = 0; i < n; i++) {
    const x = (i / (n - 1)) * 2 - 1;
    shape[i] = Math.tanh(amount * x) / Math.tanh(amount);
  }
  ws.curve = shape;
  ws.oversample = "2x";
  return ws;
}
