import { useEffect, useRef, useState } from "react";
import type { MascotMood, MascotProp } from "@/components/DriverMascot";
import type { TaxiMood } from "@/components/CaricatureTaxi";
import { CaptainArt, TaxiArt } from "@/components/CharacterArt";
import { FrameStrip } from "@/components/anim/FrameStrip";
import { clipReady } from "@/lib/anim/clips";
import { FILMS, clipsOf, type Beat, type Film, type SceneName } from "@/lib/anim/films";
import { idleDelay, shuffledRound } from "@/lib/anim/idle";
import { filmsWanted, motionAllowed } from "@/lib/anim/motion";
import { warmClips } from "@/lib/anim/warm";
import { claimAmbient, playCues, playSound, type CueHandle } from "@/lib/sound";
import { MOOD_MUMBLE, TAXI_VOICE, sceneCues } from "@/lib/sound/cues";

export type StageBase = { mood: MascotMood; prop?: MascotProp; taxi?: TaxiMood; driving?: boolean };

/** Multi-beat micro-films. CSS choreographs travel per scene; beats swap drawn poses. */
const SCENES: Record<SceneName, { length: number; beats: Beat[] }> = {
  morning: { length: 9000, beats: [
    { at: 0, mood: "sleepy", prop: "coffee", taxi: "zoom", driving: true },
    { at: 2200, mood: "sleepy", prop: "coffee", taxi: "tired", quip: "אהההה... ☕" },
    { at: 4600, mood: "shock", prop: "coffee", taxi: "shock", quip: "הקפה!!" },
    { at: 5600, mood: "grumble", prop: "none", taxi: "happy", quip: "#@!" },
    { at: 7200, mood: "smirk", prop: "none", taxi: "honk", quip: "יאללה, לעבודה" },
  ] },
  heist: { length: 8200, beats: [
    { at: 0, mood: "smirk", prop: "none", taxi: "happy", quip: "ששש..." },
    { at: 1800, mood: "shock", prop: "cash", taxi: "shock", quip: "!?" },
    { at: 2600, mood: "excited", prop: "cash", taxi: "zoom", quip: "שלי!" },
    { at: 3600, mood: "victory", prop: "cash", taxi: "honk", quip: "בּוּם! 💰" },
    { at: 6800, mood: "smirk", prop: "cash", taxi: "happy" },
  ] },
  splash: { length: 7600, beats: [
    { at: 0, mood: "smirk", prop: "pump", taxi: "happy", quip: "רק מתדלק..." },
    { at: 1500, mood: "shock", prop: "pump", taxi: "shock", quip: "גְּלוּק!" },
    { at: 2600, mood: "grumble", prop: "none", taxi: "cough", quip: "#@!" },
    { at: 3800, mood: "pain", prop: "none", taxi: "shock", quip: "אאוץ' הרגל!" },
    { at: 6000, mood: "grumble", prop: "none", taxi: "tired", quip: "נחזיר את זה" },
  ] },
  parade: { length: 10000, beats: [
    { at: 0, mood: "excited", prop: "cash", taxi: "zoom", quip: "יעד!!" },
    { at: 1400, mood: "victory", prop: "cash", taxi: "honk", driving: true, quip: "מצעד ניצחון 🏆" },
    { at: 8200, mood: "victory", prop: "none", taxi: "happy", driving: false },
  ] },
  wipe: { length: 7000, beats: [
    { at: 0, mood: "smirk", prop: "rag", taxi: "happy" },
    { at: 1600, mood: "smirk", prop: "rag", taxi: "zoom", quip: "מבריקה כמו חדשה ✨" },
    { at: 5400, mood: "excited", prop: "none", taxi: "honk" },
  ] },
  count: { length: 6400, beats: [
    { at: 0, mood: "smirk", prop: "cash", quip: "אחד..." },
    { at: 1500, mood: "smirk", prop: "cash", quip: "שניים..." },
    { at: 3000, mood: "excited", prop: "cash", quip: "שלוש! 🤑" },
  ] },
  phone: { length: 7000, beats: [
    { at: 0, mood: "shock", prop: "phone", quip: "טררר!" },
    { at: 1200, mood: "smirk", prop: "phone", quip: "כן? איסוף? בדרך!" },
    { at: 4600, mood: "excited", prop: "phone", taxi: "zoom" },
  ] },
  snooze: { length: 8000, beats: [
    { at: 0, mood: "sleepy", prop: "none", taxi: "tired" },
    { at: 3600, mood: "sleepy", prop: "none", taxi: "tired" },
    { at: 4400, mood: "shock", prop: "none", taxi: "honk", quip: "מה? מי? נסיעה!" },
    { at: 6200, mood: "smirk", prop: "none", taxi: "happy" },
  ] },
  drive: { length: 6000, beats: [
    { at: 0, mood: "smirk", prop: "none", taxi: "zoom", driving: true, quip: "סיבוב חימום 🏁" },
    { at: 4200, mood: "excited", prop: "none", taxi: "honk", quip: "איזו מכונה! 😍" },
  ] },
  brake: { length: 7500, beats: [
    { at: 0, mood: "smirk", prop: "none", taxi: "zoom", driving: true, quip: "סיבוב קטן..." },
    { at: 2300, mood: "smirk", prop: "none", taxi: "shock" },
    { at: 3300, mood: "shock", prop: "none", taxi: "cough", quip: "אוי!" },
    { at: 5600, mood: "smirk", prop: "none", taxi: "tired", quip: "זקנה, אבל שלי 🧡" },
  ] },
};
const IDLE: SceneName[] = ["wipe", "count", "phone", "snooze", "drive", "brake"];
/** Turbo's own scenes, only on stages he stands on. */
const TAXI_ONLY: SceneName[] = ["drive", "brake"];

/** Reward films are fetched once the page settles, on stages where rewards fire; an idle film once its scene is among the next two. */
const REWARDS: SceneName[] = ["heist", "parade"];
/** The strips a scene needs on this stage: Turbo's only when he stands on it. */
const needed = (f: Film, taxi: boolean) => clipsOf(f).filter((c) => taxi || c === f.clip);
const warm = (name: SceneName, taxi: boolean) => { const f = FILMS[name]; if (f) void warmClips(needed(f, taxi)); };
const loaded = (f: Film, taxi: boolean) => needed(f, taxi).every(clipReady);

export function MovieStage({ base, mascotClass, taxiClass, morning = false, rewards = false }: { base: StageBase; mascotClass: string; taxiClass?: string; morning?: boolean; rewards?: boolean }) {
  const [scene, setScene] = useState<SceneName | null>(null);
  const [beat, setBeat] = useState<Beat | null>(null);
  const [take, setTake] = useState(0);
  const [filmed, setFilmed] = useState<Film | null>(null);
  const timers = useRef<number[]>([]);
  const playing = useRef(false);
  const soundtrack = useRef<CueHandle | null>(null);
  const taxiStage = Boolean(base.taxi && taxiClass);

  useEffect(() => {
    const still = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (still) return;
    const clear = () => {
      timers.current.forEach((t) => window.clearTimeout(t));
      timers.current = [];
      soundtrack.current?.stop();
      soundtrack.current = null;
    };
    let idleTimer: number | undefined;
    let settled = false;
    let last: SceneName | undefined;
    const upcoming: SceneName[] = []; // the idle scenes, in the order they will play
    const warmNext = () => { if (settled) upcoming.slice(0, 2).forEach((n) => warm(n, taxiStage)); };
    const scheduleIdle = (first = false) => {
      window.clearTimeout(idleTimer);
      const pool = taxiStage ? IDLE : IDLE.filter((n) => !TAXI_ONLY.includes(n));
      if (upcoming.length < 2) upcoming.push(...shuffledRound(pool, upcoming[upcoming.length - 1] ?? last));
      warmNext();
      idleTimer = window.setTimeout(playIdle, idleDelay(first));
    };
    // an idle scene whose film is still on its way waits a few seconds for it before the drawn-pose scene stands in
    const playIdle = () => {
      const name = upcoming.shift()!;
      last = name;
      const drawn = FILMS[name];
      const t0 = Date.now();
      const go = () => { if (!drawn || !filmsWanted() || !motionAllowed() || loaded(drawn, taxiStage) || Date.now() - t0 > 6000) play(name); else timers.current.push(window.setTimeout(go, 250)); };
      go();
    };
    const play = (name: SceneName) => {
      // a reward takes over from whatever was coming next
      clear(); window.clearTimeout(idleTimer);
      playing.current = true;
      const drawn = FILMS[name];
      const film = drawn && loaded(drawn, taxiStage) && motionAllowed() ? drawn : null;
      const def = film ?? SCENES[name];
      setScene(name); setTake((t) => t + 1); setBeat(def.beats[0]); setFilmed(film);
      // reward films are voiced by the reward itself; idle films only now and then
      const cues = sceneCues(name, Boolean(film));
      if (cues && claimAmbient(name === "morning")) soundtrack.current = playCues(cues, { ambient: true });
      def.beats.slice(1).forEach((b) => timers.current.push(window.setTimeout(() => setBeat(b), b.at)));
      timers.current.push(window.setTimeout(() => { playing.current = false; setScene(null); setBeat(null); setFilmed(null); scheduleIdle(); }, def.length));
    };
    const onReward = (e: Event) => {
      const d = (e as CustomEvent<{ kind?: string }>).detail;
      play(d?.kind === "corrective" ? "splash" : d?.kind === "goal" || d?.kind === "streak" ? "parade" : "heist");
    };
    window.addEventListener("driver-reward", onReward);
    // fetch the films once the page has settled, so the next reward or idle scene can play one
    const warmTimer = window.setTimeout(() => { settled = true; if (rewards) REWARDS.forEach((n) => warm(n, taxiStage)); warmNext(); }, 1500);
    if (morning && new Date().getHours() < 12 && !sessionStorage.getItem("scene-morning")) {
      // the morning films get until 8 s to arrive; after that the drawn-pose scene plays.
      // It counts as seen once it starts, so a remount before then doesn't lose it.
      const film = FILMS.morning && filmsWanted() ? FILMS.morning : null;
      warm("morning", taxiStage);
      const t0 = Date.now();
      const begin = () => { if (!film || loaded(film, taxiStage) || Date.now() - t0 > 8000) { sessionStorage.setItem("scene-morning", "1"); play("morning"); } else timers.current.push(window.setTimeout(begin, 150)); };
      timers.current.push(window.setTimeout(begin, 600));
    } else scheduleIdle(true);
    return () => { window.removeEventListener("driver-reward", onReward); clear(); window.clearTimeout(idleTimer); window.clearTimeout(warmTimer); };
  }, [morning, rewards, taxiStage]);

  const cur = beat ?? { at: 0, mood: base.mood, prop: base.prop, taxi: base.taxi, driving: base.driving };
  const taxiMood = cur.taxi ?? base.taxi;
  // the Captain's film stands still unless the scene travels; Turbo's films come with travel of their own
  const still = filmed?.clip && !filmed.travel;
  const taxiFilmed = filmed?.beats.some((b) => b.taxiFilm);
  return (
    <div className={`movie-stage ${scene ? `scene-${scene}` : "scene-none"} ${still ? "ms-filmed" : ""} ${taxiFilmed ? "ms-taxi-filmed" : ""}`} key={take}>
      {taxiMood && taxiClass && (
        <span className={`ms-taxi ${taxiClass}`} onClick={() => playSound(TAXI_VOICE[taxiMood])}><TaxiArt mood={taxiMood} driving={cur.driving ?? base.driving} film={cur.taxiFilm} className="h-full w-full" /></span>
      )}
      <span className={`ms-mascot ${mascotClass}`} onClick={() => playSound(MOOD_MUMBLE[cur.mood])}>
        {filmed?.clip && cur.film ? <FrameStrip clip={filmed.clip} className="ms-film" /> : <CaptainArt mood={cur.mood} prop={cur.prop ?? base.prop} reactive={false} className="ms-mascot-art" />}
      </span>
      {scene && <span className="ms-fx" />}
      {cur.quip && <span key={cur.quip} className="ms-quip">{cur.quip}</span>}
    </div>
  );
}
