import type { SoundName } from "./cues";
import {
  drive,
  filter,
  gain,
  lfo,
  noise,
  osc,
  ramp,
  semis,
  strike,
  type Out,
  type Point,
  type Voice,
} from "./synth";

/* ---------------- the Captain: a wordless, wobbly old voice ----------------
   A sawtooth "throat" through three vowel formants, with a little breath.
   He never says real words, he mumbles in the rhythm of his speech bubbles. */

type Vowel = "a" | "e" | "i" | "o" | "u" | "m";
const FORMANTS: Record<Vowel, readonly number[]> = {
  a: [730, 1090, 2440],
  e: [530, 1840, 2480],
  i: [300, 2200, 2900],
  o: [570, 840, 2410],
  u: [320, 870, 2240],
  m: [250, 1000, 2200],
};
const LEVELS: Record<Vowel, readonly number[]> = {
  a: [1, 0.55, 0.25],
  e: [1, 0.6, 0.3],
  i: [0.9, 0.5, 0.3],
  o: [1, 0.45, 0.15],
  u: [1, 0.3, 0.1],
  m: [1, 0.12, 0.04],
};
const BANDWIDTH = [130, 170, 250];

/** One syllable: vowel, length, pitch contour (Hz), optional pause before it,
 *  `h` for a breathy onset, `tie` to slur from the previous syllable. */
type Syl = {
  v: Vowel;
  d: number;
  f0: readonly number[];
  pause?: number;
  h?: boolean;
  tie?: boolean;
  slide?: number;
  loud?: number;
};

function speak(
  o: Out,
  syls: readonly Syl[],
  { breath = 0.12, wobble = 22, level = 1 } = {},
): number {
  const lead = 0.08;
  const total = lead + syls.reduce((s, x) => s + (x.pause ?? 0) + x.d, 0) + 0.08;
  const throat = osc(o, "sawtooth", syls[0].f0[0], 0, total);
  lfo(o, throat.detune, 5.3, wobble, 0, total);
  lfo(o, throat.detune, 1.3, wobble * 0.7, 0, total);
  // an old voice never holds still: slow random waver on top of the vibrato
  const shiver = noise(o, 0, total);
  const shiverTone = filter(o, "lowpass", 18);
  const shiverDepth = gain(o, wobble * 1.5);
  shiver.connect(shiverTone).connect(shiverDepth).connect(throat.detune);
  const air = noise(o, 0, total);
  const voiced = gain(o, 0);
  const breathy = gain(o, 0);
  const out = gain(o, level);
  throat.connect(voiced);
  air.connect(breathy);
  const bank = FORMANTS[syls[0].v].map((f, i) => {
    const band = filter(o, "bandpass", f, f / BANDWIDTH[i]);
    const g = gain(o, LEVELS[syls[0].v][i]);
    voiced.connect(band);
    breathy.connect(band);
    band.connect(g).connect(out);
    return { band, g };
  });
  out.connect(o.dest);

  let at = lead;
  let prevEnd = 0;
  let prev = syls[0].v;
  syls.forEach((s, idx) => {
    at += s.pause ?? 0;
    const T = o.t + at;
    const loud = s.loud ?? 1;
    const tiedNext = syls[idx + 1]?.tie && !syls[idx + 1]?.pause;
    // the mouth moves to the new vowel in 40ms
    bank.forEach(({ band, g }, i) => {
      band.frequency.setValueAtTime(FORMANTS[prev][i], T);
      band.frequency.linearRampToValueAtTime(FORMANTS[s.v][i], T + 0.04);
      band.Q.setValueAtTime(FORMANTS[prev][i] / BANDWIDTH[i], T);
      band.Q.linearRampToValueAtTime(FORMANTS[s.v][i] / BANDWIDTH[i], T + 0.04);
      g.gain.setValueAtTime(LEVELS[prev][i], T);
      g.gain.linearRampToValueAtTime(LEVELS[s.v][i], T + 0.04);
    });
    prev = s.v;
    // pitch contour across the first `slide` of the syllable
    const span = s.d * (s.slide ?? 1);
    s.f0.forEach((f, k) => {
      const tt = T + (s.f0.length === 1 ? 0 : (k / (s.f0.length - 1)) * span);
      if (k === 0) throat.frequency.setValueAtTime(f, tt);
      else throat.frequency.linearRampToValueAtTime(f, tt);
    });
    // loudness: soft attack unless slurred, fall away unless the next one is slurred
    if (!(s.tie && !s.pause)) {
      voiced.gain.setValueAtTime(0, T);
      voiced.gain.linearRampToValueAtTime(loud, T + 0.03);
    } else voiced.gain.linearRampToValueAtTime(loud, T + 0.03);
    voiced.gain.setValueAtTime(loud, T + s.d - 0.05);
    voiced.gain.linearRampToValueAtTime(tiedNext ? loud : 0, T + s.d);
    // breath: a puff before an aspirated syllable, a little air under every one
    if (s.h) {
      const from = Math.max(T - 0.07, o.t + prevEnd);
      breathy.gain.setValueAtTime(0, from);
      breathy.gain.linearRampToValueAtTime(0.7 * loud, T - 0.005);
    } else if (!(s.tie && !s.pause)) breathy.gain.setValueAtTime(0, T);
    breathy.gain.linearRampToValueAtTime(breath * loud, T + 0.03);
    breathy.gain.setValueAtTime(breath * loud, T + s.d - 0.05);
    breathy.gain.linearRampToValueAtTime(tiedNext ? breath * loud : 0, T + s.d);
    at += s.d;
    prevEnd = at;
  });
  return total;
}

const say =
  (syls: readonly Syl[], opts?: Parameters<typeof speak>[2]): Voice =>
  (o) =>
    speak(o, syls, opts);

/** A tune hummed through the nose: semitone steps over `base`, slurred note to note. */
function hum(notes: readonly (readonly [number, number])[], base: number): Voice {
  return (o) =>
    speak(
      o,
      notes.map(([n, d], i) => ({
        v: "m" as const,
        d,
        f0: i === 0 ? [semis(base, n)] : [semis(base, notes[i - 1][0]), semis(base, n)],
        slide: 0.22,
        tie: i > 0,
        loud: i % 4 === 0 ? 1 : 0.85,
      })),
      { breath: 0.05, wobble: 14 },
    );
}

/** He whistles: a pure tone with vibrato and breath, slurred note to note. */
function whistle(notes: readonly (readonly [number, number])[], base: number): Voice {
  return (o) => {
    const total = notes.reduce((s, [, d]) => s + d, 0) + 0.12;
    const tone = osc(o, "sine", semis(base, notes[0][0]), 0, total);
    lfo(o, tone.detune, 6.2, 22, 0, total);
    const air = noise(o, 0, total);
    const airBand = filter(o, "bandpass", semis(base, notes[0][0]), 14);
    const toneAmp = gain(o, 0);
    const airAmp = gain(o, 0);
    tone.connect(toneAmp).connect(o.dest);
    air.connect(airBand).connect(airAmp).connect(o.dest);
    let at = 0.04;
    notes.forEach(([n, d], i) => {
      const T = o.t + at;
      const f = semis(base, n);
      tone.frequency.setValueAtTime(i === 0 ? f : semis(base, notes[i - 1][0]), T);
      tone.frequency.linearRampToValueAtTime(f, T + Math.min(0.05, d / 3));
      airBand.frequency.setValueAtTime(f, T);
      // a tiny tongue dip between notes
      if (i === 0) toneAmp.gain.setValueAtTime(0, T);
      else toneAmp.gain.linearRampToValueAtTime(0.18, T);
      toneAmp.gain.linearRampToValueAtTime(0.32, T + 0.025);
      toneAmp.gain.setValueAtTime(0.32, T + d - 0.02);
      airAmp.gain.setValueAtTime(0.05, T);
      at += d;
    });
    toneAmp.gain.linearRampToValueAtTime(0, o.t + at + 0.06);
    airAmp.gain.linearRampToValueAtTime(0, o.t + at + 0.06);
    return total;
  };
}

/** Rattling inhale, whistling exhale. */
const snore: Voice = (o) => {
  const breathe = (at: number) => {
    const T = o.t + at;
    // inhale: the soft palate flutters about 26 times a second
    const rasp = noise(o, at, at + 1.05);
    const raspBand = filter(o, "bandpass", 330, 1.4);
    const throat = osc(o, "sawtooth", 68, at, at + 1.05);
    const throatTone = filter(o, "lowpass", 320, 1);
    const flutter = gain(o, 0.5);
    lfo(o, flutter.gain, 26, 0.5, at, at + 1.05);
    const inhale = gain(o, 0);
    ramp(inhale.gain, T, [
      [0, 0],
      [0.75, 0.9],
      [0.95, 0.5],
      [1.05, 0],
    ]);
    rasp.connect(raspBand).connect(flutter);
    const throatAmp = gain(o, 0.45);
    throat.connect(throatTone).connect(throatAmp).connect(flutter);
    flutter.connect(inhale).connect(o.dest);
    // exhale: a little whistle through the moustache
    const puff = noise(o, at + 1.15, at + 1.85);
    const puffBand = filter(o, "bandpass", 1500, 1.6);
    ramp(puffBand.frequency, T, [
      [1.15, 1600],
      [1.85, 800],
    ]);
    const puffAmp = gain(o, 0);
    ramp(puffAmp.gain, T, [
      [1.15, 0],
      [1.25, 0.4],
      [1.85, 0],
    ]);
    puff.connect(puffBand).connect(puffAmp).connect(o.dest);
    const peep = osc(o, "sine", 1250, at + 1.15, at + 1.85);
    ramp(peep.frequency, T, [
      [1.15, 1300],
      [1.85, 950],
    ]);
    const peepAmp = gain(o, 0);
    ramp(peepAmp.gain, T, [
      [1.15, 0],
      [1.3, 0.05],
      [1.85, 0],
    ]);
    peep.connect(peepAmp).connect(o.dest);
  };
  breathe(0);
  return 1.95;
};

/* ---------------- Turbo the taxi: an old engine, a klaxon, tired brakes ---------------- */

/** Sawtooth engine with a sub octave and a putt-putt pulse that follows the revs. */
function engine(
  o: Out,
  start: number,
  len: number,
  pitch: readonly Point[],
  amp: readonly Point[],
) {
  const t0 = o.t + start;
  const scaled = (k: number) => pitch.map(([t, f]) => [t, f * k] as const);
  const saw = osc(o, "sawtooth", pitch[0][1], start, start + len);
  const sub = osc(o, "square", pitch[0][1] / 2, start, start + len);
  const chug = osc(o, "square", pitch[0][1] / 6, start, start + len);
  ramp(saw.frequency, t0, pitch);
  ramp(sub.frequency, t0, scaled(1 / 2));
  ramp(chug.frequency, t0, scaled(1 / 6));
  const mix = gain(o, 0.5);
  saw.connect(mix);
  sub.connect(mix);
  const tone = filter(o, "lowpass", pitch[0][1] * 7, 2);
  ramp(tone.frequency, t0, scaled(7));
  const body = gain(o, 0.62);
  const chugDepth = gain(o, 0.38);
  const chugRound = filter(o, "lowpass", 80);
  chug.connect(chugRound).connect(chugDepth).connect(body.gain);
  const env = gain(o, 0);
  ramp(env.gain, t0, amp);
  mix.connect(drive(o, 2)).connect(tone).connect(body).connect(env).connect(o.dest);
}

/** A-OO-GA: the old klaxon. */
const aooga: Voice = (o) => {
  const len = 0.95;
  const saw = osc(o, "sawtooth", 170, 0, len);
  const sq = osc(o, "square", 170, 0, len);
  sq.detune.value = 9;
  const sweep: Point[] = [
    [0, 170],
    [0.3, 400],
    [0.42, 380],
    [0.5, 330],
    [len, 300],
  ];
  ramp(saw.frequency, o.t, sweep);
  ramp(sq.frequency, o.t, sweep);
  const mix = gain(o, 0.5);
  saw.connect(mix);
  sq.connect(mix);
  const horn = filter(o, "bandpass", 800, 1.6);
  ramp(horn.frequency, o.t, [
    [0, 600],
    [0.3, 1250],
    [0.45, 900],
    [0.55, 1100],
    [len, 950],
  ]);
  const tone = filter(o, "lowpass", 3000);
  const env = gain(o, 0);
  ramp(env.gain, o.t, [
    [0, 0],
    [0.03, 0.7],
    [0.4, 0.75],
    [0.46, 0.35],
    [0.52, 0.8],
    [len - 0.1, 0.7],
    [len, 0],
  ]);
  mix.connect(drive(o, 3)).connect(horn).connect(tone).connect(env).connect(o.dest);
  return len;
};

/** Meep-meep. */
const beep: Voice = (o) => {
  for (const [at, len] of [
    [0, 0.13],
    [0.2, 0.17],
  ] as const) {
    const a = osc(o, "square", 415, at, at + len);
    const b = osc(o, "square", 523, at, at + len);
    const mix = gain(o, 0.5);
    a.connect(mix);
    b.connect(mix);
    const horn = filter(o, "bandpass", 1100, 0.9);
    const env = gain(o, 0);
    ramp(env.gain, o.t + at, [
      [0, 0],
      [0.01, 0.6],
      [len - 0.03, 0.5],
      [len, 0],
    ]);
    mix.connect(horn).connect(drive(o, 2)).connect(env).connect(o.dest);
  }
  return 0.4;
};

/** Starter motor cranks: rr-rr-rr... then the engine catches and revs. */
const turboStart: Voice = (o) => {
  const crankLen = 1.05;
  const crank = osc(o, "sawtooth", 80, 0, crankLen);
  ramp(crank.frequency, o.t, [
    [0, 80],
    [1, 104],
  ]);
  const crankTone = filter(o, "lowpass", 900, 1);
  const crankAmp = gain(o, 0);
  const grind = noise(o, 0, crankLen);
  const grindBand = filter(o, "bandpass", 1500, 0.8);
  const grindAmp = gain(o, 0);
  crankAmp.gain.setValueAtTime(0, o.t);
  grindAmp.gain.setValueAtTime(0, o.t);
  for (let i = 0; i < 6; i++) {
    const at = o.t + 0.05 + i * 0.16;
    crankAmp.gain.setValueAtTime(0.06, at);
    crankAmp.gain.linearRampToValueAtTime(0.7, at + 0.04);
    crankAmp.gain.linearRampToValueAtTime(0.08, at + 0.14);
    grindAmp.gain.setValueAtTime(0.02, at);
    grindAmp.gain.linearRampToValueAtTime(0.12, at + 0.04);
    grindAmp.gain.linearRampToValueAtTime(0.03, at + 0.14);
  }
  crankAmp.gain.linearRampToValueAtTime(0, o.t + crankLen);
  grindAmp.gain.linearRampToValueAtTime(0, o.t + crankLen);
  crank.connect(crankTone).connect(crankAmp).connect(o.dest);
  grind.connect(grindBand).connect(grindAmp).connect(o.dest);
  engine(
    o,
    crankLen,
    1.45,
    [
      [0, 50],
      [0.25, 140],
      [0.6, 72],
      [1.45, 60],
    ],
    [
      [0, 0],
      [0.05, 0.62],
      [0.5, 0.5],
      [1.2, 0.38],
      [1.45, 0],
    ],
  );
  return crankLen + 1.45;
};

/** Vroom: a rev and back down. */
const rev: Voice = (o) => {
  engine(
    o,
    0,
    1.2,
    [
      [0, 60],
      [0.35, 190],
      [0.7, 150],
      [1.2, 70],
    ],
    [
      [0, 0],
      [0.05, 0.6],
      [0.4, 0.85],
      [1, 0.5],
      [1.2, 0],
    ],
  );
  return 1.2;
};

/** Squealing brakes, tyres skidding, then the thunk of the stop. */
const brake: Voice = (o) => {
  const len = 0.8;
  const squeal = osc(o, "sine", 2650, 0, len);
  ramp(squeal.frequency, o.t, [
    [0, 2750],
    [len, 2500],
  ]);
  lfo(o, squeal.frequency, 11, 45, 0, len);
  const squeal2 = osc(o, "sine", 3980, 0, len);
  const sq2Amp = gain(o, 0.3);
  const squealAmp = gain(o, 0);
  ramp(squealAmp.gain, o.t, [
    [0, 0],
    [0.06, 0.12],
    [0.55, 0.11],
    [0.75, 0],
  ]);
  squeal.connect(squealAmp);
  squeal2.connect(sq2Amp).connect(squealAmp);
  squealAmp.connect(o.dest);
  const skid = noise(o, 0, len);
  const skidBand = filter(o, "bandpass", 1700, 0.6);
  const skidAmp = gain(o, 0);
  ramp(skidAmp.gain, o.t, [
    [0, 0],
    [0.05, 0.35],
    [0.6, 0.25],
    [0.78, 0],
  ]);
  skid.connect(skidBand).connect(skidAmp).connect(o.dest);
  const thunk = osc(o, "sine", 95, 0.72, 1.1);
  ramp(thunk.frequency, o.t, [
    [0.72, 95],
    [0.9, 55],
  ]);
  const thunkAmp = gain(o, 0);
  strike(thunkAmp.gain, o.t + 0.72, 0.7, 0.28);
  thunk.connect(thunkAmp).connect(o.dest);
  return 1.05;
};

/** Pop-pop: the old engine backfires. */
const cough: Voice = (o) => {
  for (const at of [0, 0.32]) {
    const T = o.t + at;
    const pop = noise(o, at, at + 0.25);
    const popTone = filter(o, "lowpass", 1400);
    const popAmp = gain(o, 0);
    strike(popAmp.gain, T, 0.55, 0.14, 0.004);
    pop.connect(popTone).connect(popAmp).connect(o.dest);
    const boom = osc(o, "sine", 90, at, at + 0.3);
    ramp(boom.frequency, T, [
      [0, 90],
      [0.15, 45],
    ]);
    const boomAmp = gain(o, 0);
    strike(boomAmp.gain, T, 0.6, 0.22, 0.004);
    boom.connect(boomAmp).connect(o.dest);
    const puff = noise(o, at + 0.03, at + 0.3);
    const puffBand = filter(o, "bandpass", 600, 1.2);
    const puffAmp = gain(o, 0);
    ramp(puffAmp.gain, T, [
      [0.03, 0],
      [0.08, 0.25],
      [0.3, 0],
    ]);
    puff.connect(puffBand).connect(puffAmp).connect(o.dest);
  }
  return 0.7;
};

/** Pfffff-whrrr: the tired taxi lets out a long sigh. */
const sigh: Voice = (o) => {
  const len = 1.05;
  const air = noise(o, 0, len);
  const band = filter(o, "bandpass", 1800, 1.2);
  ramp(band.frequency, o.t, [
    [0, 1800],
    [len, 350],
  ]);
  const airAmp = gain(o, 0);
  ramp(airAmp.gain, o.t, [
    [0, 0],
    [0.08, 0.5],
    [0.6, 0.35],
    [len, 0],
  ]);
  air.connect(band).connect(airAmp).connect(o.dest);
  const groan = osc(o, "triangle", 140, 0, len);
  ramp(groan.frequency, o.t, [
    [0, 140],
    [len, 45],
  ]);
  const groanAmp = gain(o, 0);
  ramp(groanAmp.gain, o.t, [
    [0, 0],
    [0.1, 0.4],
    [0.8, 0.3],
    [len, 0],
  ]);
  groan.connect(groanAmp).connect(o.dest);
  return len;
};

/** Boing: a startled spring. */
const boing: Voice = (o) => {
  const len = 0.6;
  const spring = osc(o, "sine", 220, 0, len);
  ramp(spring.frequency, o.t, [
    [0, 220],
    [len, 330],
  ]);
  const wobble = lfo(o, spring.frequency, 16, 90, 0, len);
  ramp(wobble.gain, o.t, [
    [0, 90],
    [len, 0],
  ]);
  const amp = gain(o, 0);
  strike(amp.gain, o.t, 0.7, 0.55);
  spring.connect(amp).connect(o.dest);
  return len;
};

/* ---------------- the world around them ---------------- */

/** Ka-ching: the drawer clacks, the bell rings twice. */
const kaching: Voice = (o) => {
  const clack = noise(o, 0, 0.1);
  const clackTone = filter(o, "highpass", 2500);
  const clackAmp = gain(o, 0);
  strike(clackAmp.gain, o.t, 0.5, 0.04, 0.001);
  clack.connect(clackTone).connect(clackAmp).connect(o.dest);
  const knock = osc(o, "sine", 180, 0, 0.12);
  const knockAmp = gain(o, 0);
  strike(knockAmp.gain, o.t, 0.4, 0.05, 0.001);
  knock.connect(knockAmp).connect(o.dest);
  for (const [at, peak] of [
    [0.07, 0.45],
    [0.16, 0.3],
  ] as const) {
    for (const [f, k] of [
      [2093, 1],
      [3136, 0.6],
      [4186, 0.35],
      [5274, 0.2],
    ] as const) {
      const bell = osc(o, "sine", f, at, at + 1.2);
      const g = gain(o, 0);
      strike(g.gain, o.t + at, peak * k, 0.9, 0.002);
      bell.connect(g).connect(o.dest);
    }
  }
  return 1.3;
};

/** Slide whistle up: things are looking up. */
const slide: Voice = (o) => {
  const len = 0.6;
  const pipe = osc(o, "sine", 450, 0, len);
  ramp(pipe.frequency, o.t, [
    [0, 450],
    [0.45, 1500],
    [0.52, 1440],
  ]);
  lfo(o, pipe.detune, 7, 20, 0, len);
  const amp = gain(o, 0);
  ramp(amp.gain, o.t, [
    [0, 0],
    [0.04, 0.4],
    [0.48, 0.4],
    [len, 0],
  ]);
  pipe.connect(amp).connect(o.dest);
  const air = noise(o, 0, len);
  const airBand = filter(o, "bandpass", 450, 10);
  ramp(airBand.frequency, o.t, [
    [0, 450],
    [0.45, 1500],
  ]);
  const airAmp = gain(o, 0);
  ramp(airAmp.gain, o.t, [
    [0, 0],
    [0.04, 0.12],
    [0.48, 0.1],
    [len, 0],
  ]);
  air.connect(airBand).connect(airAmp).connect(o.dest);
  return len;
};

/** Wah-wah-wah-waaah: the sad trombone. */
const womp: Voice = (o) => {
  const notes = [
    [233.1, 0.3],
    [220, 0.3],
    [207.7, 0.3],
    [196, 1],
  ] as const;
  const len = notes.reduce((s, [, d]) => s + d, 0) + 0.05;
  const horn = osc(o, "sawtooth", notes[0][0], 0, len);
  const tone = filter(o, "lowpass", 400, 4);
  const amp = gain(o, 0);
  const shake = lfo(o, horn.detune, 5.5, 0, 0, len);
  let at = 0;
  for (const [f, d] of notes) {
    const T = o.t + at;
    horn.frequency.setValueAtTime(f * 0.977, T);
    horn.frequency.linearRampToValueAtTime(f, T + 0.06);
    tone.frequency.setValueAtTime(350, T);
    tone.frequency.linearRampToValueAtTime(1300, T + 0.09);
    tone.frequency.linearRampToValueAtTime(700, T + d - 0.04);
    amp.gain.setValueAtTime(0.05, T);
    amp.gain.linearRampToValueAtTime(0.5, T + 0.04);
    amp.gain.linearRampToValueAtTime(0.4, T + d - 0.04);
    amp.gain.linearRampToValueAtTime(0.05, T + d);
    at += d;
  }
  // the last note wobbles as it dies
  shake.gain.setValueAtTime(0, o.t + 0.9);
  shake.gain.linearRampToValueAtTime(40, o.t + 1.4);
  amp.gain.linearRampToValueAtTime(0, o.t + len);
  horn.connect(tone).connect(amp).connect(o.dest);
  return len;
};

/** An old desk telephone: brrring... brrring. */
const phone: Voice = (o) => {
  for (const at of [0, 0.62]) {
    const len = 0.45;
    const bell = gain(o, 0.5);
    for (const [f, k] of [
      [1150, 1],
      [1460, 0.7],
      [2300, 0.3],
    ] as const) {
      const s = osc(o, "sine", f, at, at + len);
      const g = gain(o, k);
      s.connect(g).connect(bell);
    }
    const clapper = gain(o, 0.5);
    lfo(o, clapper.gain, 22, 0.5, at, at + len);
    const env = gain(o, 0);
    ramp(env.gain, o.t + at, [
      [0, 0],
      [0.01, 0.35],
      [len - 0.03, 0.3],
      [len, 0],
    ]);
    bell.connect(clapper).connect(env).connect(o.dest);
  }
  return 1.1;
};

/** Coffee everywhere. */
const splash: Voice = (o) => {
  const wash = noise(o, 0, 0.6);
  const tone = filter(o, "lowpass", 3000);
  ramp(tone.frequency, o.t, [
    [0, 3000],
    [0.45, 700],
  ]);
  const amp = gain(o, 0);
  strike(amp.gain, o.t, 0.7, 0.45, 0.005);
  wash.connect(tone).connect(amp).connect(o.dest);
  for (const [at, f] of [
    [0.05, 520],
    [0.11, 760],
    [0.16, 610],
    [0.22, 900],
    [0.29, 680],
    [0.35, 1050],
  ] as const) {
    const bubble = osc(o, "sine", f, at, at + 0.07);
    ramp(bubble.frequency, o.t + at, [
      [0, f],
      [0.06, f * 1.6],
    ]);
    const g = gain(o, 0);
    strike(g.gain, o.t + at, 0.18, 0.06, 0.003);
    bubble.connect(g).connect(o.dest);
  }
  return 0.6;
};

function mallet(o: Out, at: number, f: number, peak: number, decay: number) {
  const T = o.t + at;
  const bar = osc(o, "sine", f, at, at + decay * 1.6);
  const barAmp = gain(o, 0);
  strike(barAmp.gain, T, peak, decay, 0.002);
  bar.connect(barAmp).connect(o.dest);
  const over = osc(o, "sine", f * 3, at, at + decay);
  const overAmp = gain(o, 0);
  strike(overAmp.gain, T, peak * 0.3, decay * 0.35, 0.002);
  over.connect(overAmp).connect(o.dest);
  const click = noise(o, at, at + 0.04);
  const clickBand = filter(o, "bandpass", f * 2, 2);
  const clickAmp = gain(o, 0);
  strike(clickAmp.gain, T, peak * 0.5, 0.02, 0.001);
  click.connect(clickBand).connect(clickAmp).connect(o.dest);
}

/** Dee-dee-dee-DING on the xylophone. */
const fanfare: Voice = (o) => {
  const run = [523.25, 659.25, 783.99, 1046.5];
  run.forEach((f, i) => mallet(o, i * 0.11, f, 0.42, 0.3));
  run.forEach((f) => mallet(o, 0.5, f, 0.26, 0.9));
  run.forEach((f) => mallet(o, 0.62, f, 0.12, 0.8));
  return 2.1;
};

const MUMBLES = {
  grumble: say(
    [
      { v: "m", d: 0.16, f0: [118, 112] },
      { v: "o", d: 0.13, f0: [114, 104], h: true, pause: 0.07 },
      { v: "m", d: 0.2, f0: [106, 96] },
      { v: "u", d: 0.26, f0: [100, 92, 84], pause: 0.06 },
    ],
    { wobble: 30 },
  ),
  smirk: say([
    { v: "e", d: 0.1, f0: [165, 174], h: true },
    { v: "e", d: 0.12, f0: [172, 160], h: true, pause: 0.08 },
  ]),
  sleepy: say([
    { v: "a", d: 0.75, f0: [140, 215, 190, 120], h: true },
    { v: "m", d: 0.32, f0: [118, 102], tie: true },
  ]),
  shock: say([
    { v: "a", d: 0.1, f0: [180, 260], h: true },
    { v: "o", d: 0.22, f0: [280, 340, 320], tie: true },
  ]),
  victory: say([
    { v: "i", d: 0.1, f0: [210, 230] },
    { v: "a", d: 0.18, f0: [235, 290], tie: true },
    { v: "u", d: 0.32, f0: [330, 345, 290], h: true, pause: 0.08 },
  ]),
  excited: say([
    { v: "o", d: 0.1, f0: [220, 230], h: true },
    { v: "o", d: 0.1, f0: [245, 255], h: true, pause: 0.07 },
    { v: "o", d: 0.18, f0: [270, 300, 290], h: true, pause: 0.07 },
  ]),
  pain: say([
    { v: "a", d: 0.12, f0: [300, 260] },
    { v: "u", d: 0.12, f0: [250, 220], tie: true },
    { v: "a", d: 0.12, f0: [290, 255], pause: 0.08 },
    { v: "u", d: 0.16, f0: [245, 200], tie: true },
  ]),
  yes: say([
    { v: "m", d: 0.14, f0: [140, 132] },
    { v: "m", d: 0.2, f0: [150, 185], h: true, pause: 0.07 },
  ]),
  one: say([{ v: "a", d: 0.18, f0: [150, 140], h: true }]),
  two: say([{ v: "e", d: 0.18, f0: [160, 150], h: true }]),
  three: say([{ v: "i", d: 0.28, f0: [190, 230, 220], h: true }]),
};

const RAW: Record<SoundName, Voice> = {
  ...MUMBLES,
  tune: hum(
    [
      [0, 0.16],
      [4, 0.16],
      [7, 0.16],
      [9, 0.32],
      [7, 0.16],
      [4, 0.16],
      [2, 0.16],
      [0, 0.4],
    ],
    150,
  ),
  whistle: whistle(
    [
      [0, 0.12],
      [4, 0.12],
      [7, 0.12],
      [12, 0.24],
      [11, 0.12],
      [7, 0.12],
      [9, 0.12],
      [7, 0.4],
    ],
    880,
  ),
  snore,
  aooga,
  beep,
  "turbo-start": turboStart,
  rev,
  brake,
  cough,
  sigh,
  boing,
  kaching,
  slide,
  womp,
  phone,
  splash,
  fanfare,
};

/** Level trims, measured (A-weighted) so a honk, a bell and a mumble come out about equally loud. */
const TRIM: Partial<Record<SoundName, number>> = {
  grumble: 1.8,
  smirk: 1.76,
  sleepy: 1.35,
  shock: 1.05,
  victory: 0.93,
  excited: 0.93,
  pain: 1.36,
  yes: 1.8,
  one: 1.55,
  two: 1.66,
  three: 1.46,
  tune: 1.07,
  whistle: 0.62,
  snore: 1.53,
  aooga: 0.72,
  beep: 0.67,
  "turbo-start": 1.4,
  brake: 1.2,
  cough: 1.5,
  sigh: 1.16,
  kaching: 0.56,
  slide: 0.57,
  phone: 1.33,
  splash: 0.83,
  fanfare: 0.66,
};

function trimmed(voice: Voice, k: number): Voice {
  if (k === 1) return voice;
  return (o) => {
    const g = gain(o, k);
    g.connect(o.dest);
    return voice({ ...o, dest: g });
  };
}

export const SOUNDS = Object.fromEntries(
  (Object.keys(RAW) as SoundName[]).map((name) => [name, trimmed(RAW[name], TRIM[name] ?? 1)]),
) as Record<SoundName, Voice>;
