import { r as reactExports, j as jsxRuntimeExports } from "../_libs/react.mjs";
import { c as cn, p as playSound, ax as TAXI_VOICE, M as MOOD_MUMBLE, au as claimAmbient, av as playCues, k as isDrivingNow, r as readActive, aw as sceneCues } from "./router-DhZGCYXD.mjs";
const Card = reactExports.forwardRef(
  ({ className, ...props }, ref) => /* @__PURE__ */ jsxRuntimeExports.jsx(
    "div",
    {
      ref,
      className: cn("ink-card rounded-xl border bg-card text-card-foreground shadow", className),
      ...props
    }
  )
);
Card.displayName = "Card";
const CardHeader = reactExports.forwardRef(
  ({ className, ...props }, ref) => /* @__PURE__ */ jsxRuntimeExports.jsx("div", { ref, className: cn("flex flex-col space-y-1.5 p-6", className), ...props })
);
CardHeader.displayName = "CardHeader";
const CardTitle = reactExports.forwardRef(
  ({ className, ...props }, ref) => /* @__PURE__ */ jsxRuntimeExports.jsx(
    "div",
    {
      ref,
      className: cn("font-semibold leading-none tracking-tight", className),
      ...props
    }
  )
);
CardTitle.displayName = "CardTitle";
const CardDescription = reactExports.forwardRef(
  ({ className, ...props }, ref) => /* @__PURE__ */ jsxRuntimeExports.jsx("div", { ref, className: cn("text-sm text-muted-foreground", className), ...props })
);
CardDescription.displayName = "CardDescription";
const CardContent = reactExports.forwardRef(
  ({ className, ...props }, ref) => /* @__PURE__ */ jsxRuntimeExports.jsx("div", { ref, className: cn("p-6 pt-0", className), ...props })
);
CardContent.displayName = "CardContent";
const CardFooter = reactExports.forwardRef(
  ({ className, ...props }, ref) => /* @__PURE__ */ jsxRuntimeExports.jsx("div", { ref, className: cn("flex items-center p-6 pt-0", className), ...props })
);
CardFooter.displayName = "CardFooter";
const FPS = 12;
const FRAME_MS = 1e3 / FPS;
const framesToMs = (frames) => Math.round(frames * FRAME_MS);
function sequence(count, holds = {}) {
  return Array.from(
    { length: count },
    (_, cell) => holds[cell] ? { cell, hold: holds[cell] } : { cell }
  );
}
function timeline(cells) {
  const starts = [];
  let frames = 0;
  for (const c of cells) {
    starts.push(frames);
    frames += Math.max(1, c.hold ?? 1);
  }
  return { starts, frames, ms: framesToMs(frames) };
}
function cellAt(starts, ms) {
  const frame = Math.floor(Math.max(0, ms) / FRAME_MS);
  let i = 0;
  while (i + 1 < starts.length && starts[i + 1] <= frame) i++;
  return i;
}
const HEIST = {
  src: "/anim/captain/heist.webp",
  columns: 8,
  rows: 5,
  width: 257,
  height: 360,
  body: [69, 22, 179, 354],
  cells: sequence(38, { 0: 6, 5: 5, 25: 2 }),
  jig: true
};
const MORNING = {
  src: "/anim/captain/morning.webp",
  columns: 8,
  rows: 7,
  width: 230,
  height: 360,
  body: [75, 23, 196, 334],
  cells: sequence(52, { 44: 2, 50: 2 })
};
const SPLASH = {
  src: "/anim/captain/splash.webp",
  columns: 8,
  rows: 7,
  width: 255,
  height: 360,
  body: [70, 22, 175, 349],
  cells: sequence(51, { 0: 3, 15: 2, 16: 3, 17: 2 })
};
const PARADE = {
  src: "/anim/captain/parade.webp",
  columns: 8,
  rows: 6,
  width: 259,
  height: 360,
  body: [77, 24, 197, 352],
  cells: sequence(46, { 0: 9, 33: 2, 45: 2 }),
  jig: true
};
const WIPE = {
  src: "/anim/captain/wipe.webp",
  columns: 8,
  rows: 7,
  width: 242,
  height: 360,
  body: [74, 9, 184, 352],
  cells: sequence(53)
};
const COUNT = {
  src: "/anim/captain/count.webp",
  columns: 8,
  rows: 7,
  width: 218,
  height: 360,
  body: [81, 6, 208, 352],
  cells: sequence(53, { 10: 2, 33: 2, 34: 2, 48: 3, 52: 2 })
};
const PHONE = {
  src: "/anim/captain/phone.webp",
  columns: 8,
  rows: 6,
  width: 242,
  height: 360,
  body: [68, 17, 201, 357],
  cells: sequence(45, { 8: 2, 9: 4, 27: 2, 28: 2, 32: 6 })
};
const SNOOZE = {
  src: "/anim/captain/snooze.webp",
  columns: 8,
  rows: 4,
  width: 219,
  height: 360,
  body: [64, 25, 192, 353],
  cells: sequence(28, { 8: 2, 19: 2, 20: 19, 27: 6 })
};
const TAXI_DRIVE = {
  src: "/anim/taxi/drive.webp",
  columns: 8,
  rows: 2,
  width: 381,
  height: 230,
  body: [4, 3, 379, 225],
  cells: sequence(11),
  loop: true,
  fit: "width"
};
const TAXI_BRAKE = {
  src: "/anim/taxi/brake.webp",
  columns: 8,
  rows: 5,
  width: 367,
  height: 230,
  body: [3, 28, 326, 220],
  cells: sequence(39),
  fit: "width"
};
const clipMs = (clip) => timeline(clip.cells).ms;
function filmBox(clip) {
  const [left, top, right, bottom] = clip.body;
  const pct = (n) => `${+(n * 100).toFixed(3)}%`;
  if (clip.fit === "width") {
    const wide = right - left;
    return {
      width: pct(clip.width / wide),
      bottom: "0%",
      left: pct(-left / wide),
      translate: `0 ${pct((clip.height - bottom) / clip.height)}`,
      aspectRatio: `${clip.width} / ${clip.height}`
    };
  }
  const tall = bottom - top;
  return {
    height: pct(clip.height / tall),
    bottom: pct(-(clip.height - bottom) / tall),
    left: "50%",
    translate: `${pct(-(left + right) / 2 / clip.width)} 0`,
    aspectRatio: `${clip.width} / ${clip.height}`
  };
}
const ready = /* @__PURE__ */ new Map();
const loading = /* @__PURE__ */ new Map();
function loadClip(clip) {
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
    () => false
  );
  void p.then(() => loading.delete(clip.src));
  loading.set(clip.src, p);
  return p;
}
const clipReady = (clip) => ready.has(clip.src);
function FrameStrip({ clip, className = "" }) {
  const strip = reactExports.useRef(null);
  reactExports.useEffect(() => {
    const el = strip.current;
    if (!el) return;
    const { starts, ms: total } = timeline(clip.cells);
    const show = (i) => {
      const cell = clip.cells[i].cell;
      const x = cell % clip.columns * (100 / clip.columns);
      const y = Math.floor(cell / clip.columns) * (100 / clip.rows);
      el.style.transform = `translate(${-x}%, ${-y}%)`;
    };
    let raf = 0;
    let t0 = 0;
    let last = -1;
    const tick = (now) => {
      t0 ||= now;
      const i = cellAt(starts, clip.loop ? (now - t0) % total : now - t0);
      if (i !== last) {
        last = i;
        show(i);
      }
      if (clip.loop || now - t0 < total) raf = requestAnimationFrame(tick);
    };
    show(0);
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [clip]);
  return /* @__PURE__ */ jsxRuntimeExports.jsx(
    "span",
    {
      className: `frame-strip ${clip.jig ? "frame-jig" : ""} ${className}`,
      style: { ...filmBox(clip), ["--film-ms"]: `${clipMs(clip)}ms` },
      "aria-hidden": "true",
      children: /* @__PURE__ */ jsxRuntimeExports.jsx(
        "img",
        {
          ref: strip,
          className: "frame-cells",
          src: clip.src,
          alt: "",
          draggable: false,
          decoding: "sync",
          style: { width: `${clip.columns * 100}%`, height: `${clip.rows * 100}%` }
        }
      )
    }
  );
}
const reducedMotion = () => window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ?? false;
function motionAllowed() {
  if (typeof window === "undefined" || reducedMotion()) return false;
  if (document.visibilityState === "hidden") return false;
  if (document.querySelector(".drive-hud")) return false;
  return !isDrivingNow(readActive());
}
function filmsWanted() {
  if (typeof window === "undefined" || reducedMotion()) return false;
  const connection = navigator.connection;
  return !connection?.saveData;
}
const REWARD_FILMS = {
  income: { income: HEIST, trip: HEIST, "break-even": HEIST, goal: PARADE, streak: PARADE },
  fuel: { corrective: SPLASH },
  expense: {}
};
const filmsToWarm = (films) => [...new Set(Object.values(films))];
const STALL_MS = 15e3;
const pause = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
let line = Promise.resolve();
function warmClips(clips) {
  if (!filmsWanted()) return Promise.resolve(false);
  const runs = [...new Set(clips)].map((clip) => {
    const run = line.then(() => Promise.race([loadClip(clip), pause(STALL_MS).then(() => false)]));
    line = run;
    return run;
  });
  return Promise.all(runs).then((all) => all.every(Boolean));
}
const CAPTAIN = {
  sleepy: "captain-sleepy",
  grumble: "captain-grumpy",
  smirk: "captain-sly",
  victory: "captain-triumphant",
  excited: "captain-proud",
  shock: "captain-stunned",
  pain: "captain-grumpy"
};
const TAXI = {
  happy: "taxi-happy",
  tired: "taxi-exhausted",
  zoom: "taxi-speeding",
  honk: "taxi-honking",
  cough: "taxi-coughing",
  shock: "taxi-startled"
};
const src = (name) => `/characters/${name}.webp`;
if (typeof window !== "undefined") {
  const warmPoses = () => {
    for (const name of [.../* @__PURE__ */ new Set([...Object.values(CAPTAIN), ...Object.values(TAXI)])])
      new Image().src = src(name);
  };
  if ("requestIdleCallback" in window) window.requestIdleCallback(warmPoses, { timeout: 4e3 });
  else setTimeout(warmPoses, 2e3);
}
function CaptainArt({
  mood,
  className = "",
  reactive = true,
  films = {}
}) {
  const [pose, setPose] = reactExports.useState(mood);
  const [beat, setBeat] = reactExports.useState(0);
  const [film, setFilm] = reactExports.useState(null);
  reactExports.useEffect(() => setPose(mood), [mood]);
  reactExports.useEffect(() => {
    if (!reactive) return;
    let timer;
    const onReward = (e) => {
      const kind = e.detail?.kind;
      setPose(kind === "corrective" ? "grumble" : "victory");
      setBeat((b) => b + 1);
      window.clearTimeout(timer);
      timer = window.setTimeout(() => setPose(mood), 3400);
    };
    window.addEventListener("driver-reward", onReward);
    return () => {
      window.removeEventListener("driver-reward", onReward);
      window.clearTimeout(timer);
    };
  }, [mood, reactive]);
  reactExports.useEffect(() => {
    if (!reactive) return;
    let timer;
    const onReward = (e) => {
      const kind = e.detail?.kind;
      const clip = kind && films[kind];
      if (!clip || !clipReady(clip) || !motionAllowed()) return;
      setFilm(clip);
      window.clearTimeout(timer);
      timer = window.setTimeout(() => setFilm(null), clipMs(clip) + (clip.jig ? 2200 : 300));
    };
    window.addEventListener("driver-reward", onReward);
    const strips = filmsToWarm(films);
    const warm2 = strips.length ? window.setTimeout(() => void warmClips(strips), 1500) : void 0;
    return () => {
      window.removeEventListener("driver-reward", onReward);
      window.clearTimeout(timer);
      window.clearTimeout(warm2);
    };
  }, [reactive, films]);
  return /* @__PURE__ */ jsxRuntimeExports.jsx(
    "span",
    {
      className: `mascot art-captain art-pose-${pose} ${film ? "art-filmed" : ""} ${className}`,
      "aria-hidden": "true",
      children: film ? /* @__PURE__ */ jsxRuntimeExports.jsx(FrameStrip, { clip: film, className: "art-film" }) : /* @__PURE__ */ jsxRuntimeExports.jsx("img", { src: src(CAPTAIN[pose]), alt: "", draggable: false, decoding: "async" })
    },
    film ? `film-${beat}` : `${pose}-${beat}`
  );
}
function TaxiArt({
  mood = "happy",
  driving = false,
  film,
  className = ""
}) {
  return /* @__PURE__ */ jsxRuntimeExports.jsx(
    "span",
    {
      className: `taxi art-taxi art-taxi-${mood} ${driving ? "taxi-driving" : ""} ${film ? "art-filmed" : ""} ${className}`,
      "aria-hidden": "true",
      children: film ? /* @__PURE__ */ jsxRuntimeExports.jsx(FrameStrip, { clip: film, className: "art-film" }) : /* @__PURE__ */ jsxRuntimeExports.jsx("img", { src: src(TAXI[mood]), alt: "", draggable: false, decoding: "async" })
    },
    film ? film.src : mood
  );
}
const FILMS = {
  // Turbo screeches in behind the Captain and falls apart a little; the coffee goes everywhere
  morning: {
    clip: MORNING,
    length: 9e3,
    beats: [
      { at: 0, mood: "sleepy", taxi: "zoom", driving: true, film: true, taxiFilm: TAXI_DRIVE, quip: "אהההה... ☕" },
      { at: 1100, mood: "sleepy", taxi: "shock", film: true, taxiFilm: TAXI_BRAKE, quip: "אהההה... ☕" },
      { at: 2580, mood: "shock", taxi: "cough", film: true, taxiFilm: TAXI_BRAKE, quip: "הקפה!!" },
      { at: 4e3, mood: "grumble", taxi: "cough", film: true, taxiFilm: TAXI_BRAKE, quip: "#@!" },
      { at: 4600, mood: "grumble", prop: "none", taxi: "tired", taxiFilm: TAXI_BRAKE, quip: "#@!" },
      { at: 7200, mood: "smirk", prop: "none", taxi: "honk", quip: "יאללה, לעבודה" }
    ]
  },
  heist: {
    clip: HEIST,
    length: 8200,
    beats: [
      { at: 0, mood: "smirk", taxi: "happy", film: true, quip: "ששש..." },
      { at: 2e3, mood: "shock", taxi: "shock", film: true, quip: "!?" },
      { at: 2670, mood: "excited", taxi: "zoom", film: true, quip: "שלי!" },
      { at: 3420, mood: "victory", taxi: "honk", film: true, quip: "בּוּם! 💰" },
      { at: 6800, mood: "smirk", prop: "cash", taxi: "happy" }
    ]
  },
  splash: {
    clip: SPLASH,
    length: 7600,
    beats: [
      { at: 0, mood: "smirk", taxi: "happy", film: true },
      { at: 900, mood: "smirk", taxi: "happy", film: true, quip: "רק מתדלק..." },
      { at: 2e3, mood: "shock", taxi: "shock", film: true, quip: "גְּלוּק!" },
      { at: 3100, mood: "grumble", taxi: "cough", film: true, quip: "#@!" },
      { at: 4900, mood: "grumble", prop: "none", taxi: "tired", quip: "נחזיר את זה" }
    ]
  },
  // the Captain rides Turbo's roof on a victory lap
  parade: {
    clip: PARADE,
    length: 1e4,
    travel: true,
    beats: [
      { at: 0, mood: "excited", taxi: "zoom", film: true, quip: "יעד!!" },
      { at: 1400, mood: "victory", taxi: "honk", driving: true, film: true, taxiFilm: TAXI_DRIVE, quip: "מצעד ניצחון 🏆" },
      { at: 8200, mood: "victory", prop: "none", taxi: "happy", driving: false }
    ]
  },
  wipe: {
    clip: WIPE,
    length: 7e3,
    beats: [
      { at: 0, mood: "smirk", taxi: "happy", film: true },
      { at: 1600, mood: "smirk", taxi: "happy", film: true, quip: "מבריקה כמו חדשה ✨" },
      { at: 4500, mood: "smirk", taxi: "honk" }
    ]
  },
  count: {
    clip: COUNT,
    length: 6400,
    beats: [
      { at: 0, mood: "excited", film: true },
      { at: 500, mood: "excited", film: true, quip: "אחד..." },
      { at: 1670, mood: "excited", film: true, quip: "שניים..." },
      { at: 2500, mood: "excited", film: true, quip: "שלוש! 🤑" },
      { at: 5e3, mood: "excited" }
    ]
  },
  phone: {
    clip: PHONE,
    length: 7e3,
    beats: [
      { at: 0, mood: "shock", film: true, quip: "טררר!" },
      { at: 2400, mood: "smirk", film: true, quip: "כן? איסוף? בדרך!" },
      { at: 4700, mood: "smirk", taxi: "zoom" }
    ]
  },
  snooze: {
    clip: SNOOZE,
    length: 6500,
    beats: [
      { at: 0, mood: "sleepy", taxi: "tired", film: true },
      { at: 3420, mood: "shock", taxi: "honk", film: true, quip: "מה? מי? נסיעה!" },
      { at: 4500, mood: "smirk", taxi: "happy" }
    ]
  },
  // Turbo's own scenes: a warm-up lap, and a lap that ends in a hard stop he barely survives
  drive: {
    length: 6e3,
    beats: [
      { at: 0, mood: "smirk", taxi: "zoom", driving: true, taxiFilm: TAXI_DRIVE, quip: "סיבוב חימום 🏁" },
      { at: 4200, mood: "excited", taxi: "honk", quip: "איזו מכונה! 😍" }
    ]
  },
  brake: {
    length: 7500,
    beats: [
      { at: 0, mood: "smirk", taxi: "zoom", driving: true, taxiFilm: TAXI_DRIVE, quip: "סיבוב קטן..." },
      { at: 2300, mood: "smirk", taxi: "shock", taxiFilm: TAXI_BRAKE },
      { at: 3300, mood: "shock", taxi: "cough", taxiFilm: TAXI_BRAKE, quip: "אוי!" },
      { at: 5600, mood: "smirk", taxi: "tired", taxiFilm: TAXI_BRAKE, quip: "זקנה, אבל שלי 🧡" }
    ]
  }
};
function clipsOf(film) {
  const all = [film.clip, ...film.beats.map((b) => b.taxiFilm)];
  return [...new Set(all.filter((c) => Boolean(c)))];
}
const IDLE_FIRST_MS = [2500, 3400];
const IDLE_GAP_MS = [3500, 6500];
function idleDelay(first, random = Math.random) {
  const [from, to] = first ? IDLE_FIRST_MS : IDLE_GAP_MS;
  return Math.round(from + random() * (to - from));
}
function shuffledRound(pool, last, random = Math.random) {
  const round = [...pool];
  for (let i = round.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [round[i], round[j]] = [round[j], round[i]];
  }
  if (round.length > 1 && round[0] === last) {
    [round[0], round[round.length - 1]] = [round[round.length - 1], round[0]];
  }
  return round;
}
const IDLE = ["wipe", "count", "phone", "snooze", "drive", "brake"];
const NEEDS_TAXI = ["wipe", "snooze", "drive", "brake"];
const idlePool = (taxi) => taxi ? IDLE : IDLE.filter((name) => !NEEDS_TAXI.includes(name));
const SCENES = {
  morning: {
    length: 9e3,
    beats: [
      { at: 0, mood: "sleepy", prop: "coffee", taxi: "zoom", driving: true },
      { at: 2200, mood: "sleepy", prop: "coffee", taxi: "tired", quip: "אהההה... ☕" },
      { at: 4600, mood: "shock", prop: "coffee", taxi: "shock", quip: "הקפה!!" },
      { at: 5600, mood: "grumble", prop: "none", taxi: "happy", quip: "#@!" },
      { at: 7200, mood: "smirk", prop: "none", taxi: "honk", quip: "יאללה, לעבודה" }
    ]
  },
  heist: {
    length: 8200,
    beats: [
      { at: 0, mood: "smirk", prop: "none", taxi: "happy", quip: "ששש..." },
      { at: 1800, mood: "shock", prop: "cash", taxi: "shock", quip: "!?" },
      { at: 2600, mood: "excited", prop: "cash", taxi: "zoom", quip: "שלי!" },
      { at: 3600, mood: "victory", prop: "cash", taxi: "honk", quip: "בּוּם! 💰" },
      { at: 6800, mood: "smirk", prop: "cash", taxi: "happy" }
    ]
  },
  splash: {
    length: 7600,
    beats: [
      { at: 0, mood: "smirk", prop: "pump", taxi: "happy", quip: "רק מתדלק..." },
      { at: 1500, mood: "shock", prop: "pump", taxi: "shock", quip: "גְּלוּק!" },
      { at: 2600, mood: "grumble", prop: "none", taxi: "cough", quip: "#@!" },
      { at: 3800, mood: "pain", prop: "none", taxi: "shock", quip: "אאוץ' הרגל!" },
      { at: 6e3, mood: "grumble", prop: "none", taxi: "tired", quip: "נחזיר את זה" }
    ]
  },
  parade: {
    length: 1e4,
    beats: [
      { at: 0, mood: "excited", prop: "cash", taxi: "zoom", quip: "יעד!!" },
      {
        at: 1400,
        mood: "victory",
        prop: "cash",
        taxi: "honk",
        driving: true,
        quip: "מצעד ניצחון 🏆"
      },
      { at: 8200, mood: "victory", prop: "none", taxi: "happy", driving: false }
    ]
  },
  wipe: {
    length: 7e3,
    beats: [
      { at: 0, mood: "smirk", prop: "rag", taxi: "happy" },
      { at: 1600, mood: "smirk", prop: "rag", taxi: "zoom", quip: "מבריקה כמו חדשה ✨" },
      { at: 5400, mood: "excited", prop: "none", taxi: "honk" }
    ]
  },
  count: {
    length: 6400,
    beats: [
      { at: 0, mood: "smirk", prop: "cash", quip: "אחד..." },
      { at: 1500, mood: "smirk", prop: "cash", quip: "שניים..." },
      { at: 3e3, mood: "excited", prop: "cash", quip: "שלוש! 🤑" }
    ]
  },
  phone: {
    length: 7e3,
    beats: [
      { at: 0, mood: "shock", prop: "phone", quip: "טררר!" },
      { at: 1200, mood: "smirk", prop: "phone", quip: "כן? איסוף? בדרך!" },
      { at: 4600, mood: "excited", prop: "phone", taxi: "zoom" }
    ]
  },
  snooze: {
    length: 8e3,
    beats: [
      { at: 0, mood: "sleepy", prop: "none", taxi: "tired" },
      { at: 3600, mood: "sleepy", prop: "none", taxi: "tired" },
      { at: 4400, mood: "shock", prop: "none", taxi: "honk", quip: "מה? מי? נסיעה!" },
      { at: 6200, mood: "smirk", prop: "none", taxi: "happy" }
    ]
  },
  drive: {
    length: 6e3,
    beats: [
      { at: 0, mood: "smirk", prop: "none", taxi: "zoom", driving: true, quip: "סיבוב חימום 🏁" },
      { at: 4200, mood: "excited", prop: "none", taxi: "honk", quip: "איזו מכונה! 😍" }
    ]
  },
  brake: {
    length: 7500,
    beats: [
      { at: 0, mood: "smirk", prop: "none", taxi: "zoom", driving: true, quip: "סיבוב קטן..." },
      { at: 2300, mood: "smirk", prop: "none", taxi: "shock" },
      { at: 3300, mood: "shock", prop: "none", taxi: "cough", quip: "אוי!" },
      { at: 5600, mood: "smirk", prop: "none", taxi: "tired", quip: "זקנה, אבל שלי 🧡" }
    ]
  }
};
const REWARDS = ["heist", "parade"];
const needed = (f, taxi) => clipsOf(f).filter((c) => taxi || c === f.clip);
const warm = (name, taxi) => {
  const f = FILMS[name];
  if (f) void warmClips(needed(f, taxi));
};
const loaded = (f, taxi) => needed(f, taxi).every(clipReady);
function MovieStage({
  base,
  mascotClass,
  taxiClass,
  morning = false,
  rewards = false
}) {
  const [scene, setScene] = reactExports.useState(null);
  const [beat, setBeat] = reactExports.useState(null);
  const [take, setTake] = reactExports.useState(0);
  const [filmed, setFilmed] = reactExports.useState(null);
  const timers = reactExports.useRef([]);
  const playing = reactExports.useRef(false);
  const soundtrack = reactExports.useRef(null);
  const taxiStage = Boolean(base.taxi && taxiClass);
  reactExports.useEffect(() => {
    const still2 = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (still2) return;
    const clear = () => {
      timers.current.forEach((t) => window.clearTimeout(t));
      timers.current = [];
      soundtrack.current?.stop();
      soundtrack.current = null;
    };
    let idleTimer;
    let settled = false;
    let last;
    const upcoming = [];
    const warmNext = () => {
      if (settled) upcoming.slice(0, 2).forEach((n) => warm(n, taxiStage));
    };
    const scheduleIdle = (first = false) => {
      window.clearTimeout(idleTimer);
      const pool = idlePool(taxiStage);
      if (upcoming.length < 2)
        upcoming.push(...shuffledRound(pool, upcoming[upcoming.length - 1] ?? last));
      warmNext();
      idleTimer = window.setTimeout(playIdle, idleDelay(first));
    };
    const playIdle = () => {
      const name = upcoming.shift();
      last = name;
      const drawn = FILMS[name];
      const t0 = Date.now();
      const go = () => {
        if (!drawn || !filmsWanted() || !motionAllowed() || loaded(drawn, taxiStage) || Date.now() - t0 > 6e3)
          play(name);
        else timers.current.push(window.setTimeout(go, 250));
      };
      go();
    };
    const play = (name) => {
      clear();
      window.clearTimeout(idleTimer);
      playing.current = true;
      const drawn = FILMS[name];
      const film = drawn && loaded(drawn, taxiStage) && motionAllowed() ? drawn : null;
      const def = film ?? SCENES[name];
      setScene(name);
      setTake((t) => t + 1);
      setBeat(def.beats[0]);
      setFilmed(film);
      const cues = sceneCues(name, Boolean(film));
      if (cues && claimAmbient(name === "morning"))
        soundtrack.current = playCues(cues, { ambient: true });
      def.beats.slice(1).forEach((b) => timers.current.push(window.setTimeout(() => setBeat(b), b.at)));
      timers.current.push(
        window.setTimeout(() => {
          playing.current = false;
          setScene(null);
          setBeat(null);
          setFilmed(null);
          scheduleIdle();
        }, def.length)
      );
    };
    const onReward = (e) => {
      const d = e.detail;
      play(
        d?.kind === "corrective" ? "splash" : d?.kind === "goal" || d?.kind === "streak" ? "parade" : "heist"
      );
    };
    window.addEventListener("driver-reward", onReward);
    const warmTimer = window.setTimeout(() => {
      settled = true;
      if (rewards) REWARDS.forEach((n) => warm(n, taxiStage));
      warmNext();
    }, 1500);
    if (morning && (/* @__PURE__ */ new Date()).getHours() < 12 && !sessionStorage.getItem("scene-morning")) {
      const film = FILMS.morning && filmsWanted() ? FILMS.morning : null;
      warm("morning", taxiStage);
      const t0 = Date.now();
      const begin = () => {
        if (!film || loaded(film, taxiStage) || Date.now() - t0 > 8e3) {
          sessionStorage.setItem("scene-morning", "1");
          play("morning");
        } else timers.current.push(window.setTimeout(begin, 150));
      };
      timers.current.push(window.setTimeout(begin, 600));
    } else scheduleIdle(true);
    return () => {
      window.removeEventListener("driver-reward", onReward);
      clear();
      window.clearTimeout(idleTimer);
      window.clearTimeout(warmTimer);
    };
  }, [morning, rewards, taxiStage]);
  const cur = beat ?? {
    mood: base.mood,
    prop: base.prop,
    taxi: base.taxi,
    driving: base.driving
  };
  const taxiMood = cur.taxi ?? base.taxi;
  const still = filmed?.clip && !filmed.travel;
  const taxiFilmed = filmed?.beats.some((b) => b.taxiFilm);
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(
    "div",
    {
      className: `movie-stage ${scene ? `scene-${scene}` : "scene-none"} ${still ? "ms-filmed" : ""} ${taxiFilmed ? "ms-taxi-filmed" : ""}`,
      children: [
        taxiMood && taxiClass && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: `ms-taxi ${taxiClass}`, onClick: () => playSound(TAXI_VOICE[taxiMood]), children: /* @__PURE__ */ jsxRuntimeExports.jsx(
          TaxiArt,
          {
            mood: taxiMood,
            driving: cur.driving ?? base.driving,
            film: cur.taxiFilm,
            className: "h-full w-full"
          }
        ) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: `ms-mascot ${mascotClass}`, onClick: () => playSound(MOOD_MUMBLE[cur.mood]), children: filmed?.clip && cur.film ? /* @__PURE__ */ jsxRuntimeExports.jsx(FrameStrip, { clip: filmed.clip, className: "ms-film" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(
          CaptainArt,
          {
            mood: cur.mood,
            prop: cur.prop ?? base.prop,
            reactive: false,
            className: "ms-mascot-art"
          }
        ) }),
        scene && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "ms-fx" }),
        cur.quip && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "ms-quip", children: cur.quip }, cur.quip)
      ]
    },
    take
  );
}
export {
  Card as C,
  MovieStage as M,
  REWARD_FILMS as R,
  CardContent as a,
  CaptainArt as b
};
