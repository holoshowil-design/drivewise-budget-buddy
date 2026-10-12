import { useEffect, useRef, useState } from "react";
import type { MascotMood, MascotProp } from "@/components/DriverMascot";
import type { TaxiMood } from "@/components/CaricatureTaxi";
import { CaptainArt, TaxiArt } from "@/components/CharacterArt";
import { FrameStrip } from "@/components/anim/FrameStrip";
import { HEIST, clipReady, loadClip, type Clip } from "@/lib/anim/clips";
import { filmsWanted, motionAllowed } from "@/lib/anim/motion";
import { claimAmbient, playCues, playSound, type CueHandle } from "@/lib/sound";
import { MOOD_MUMBLE, TAXI_VOICE, sceneCues } from "@/lib/sound/cues";

export type StageBase = { mood: MascotMood; prop?: MascotProp; taxi?: TaxiMood; driving?: boolean };
type Beat = { at: number; mood: MascotMood; prop?: MascotProp; taxi?: TaxiMood; driving?: boolean; quip?: string; film?: boolean };
type SceneName = "morning" | "heist" | "splash" | "parade" | "wipe" | "count" | "phone" | "snooze";

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
};
const IDLE: SceneName[] = ["wipe", "count", "phone", "snooze"];

/**
 * Scenes that also exist as drawn films. A film plays while its beats say `film`, the quips
 * follow the drawing, and the drawn-pose scene above stays the fallback (film not loaded yet,
 * driving, phone saving data).
 */
const FILMS: Partial<Record<SceneName, { clip: Clip; length: number; beats: Beat[] }>> = {
  heist: { clip: HEIST, length: 8200, beats: [
    { at: 0, mood: "smirk", taxi: "happy", film: true, quip: "ששש..." },
    { at: 2000, mood: "shock", taxi: "shock", film: true, quip: "!?" },
    { at: 2670, mood: "excited", taxi: "zoom", film: true, quip: "שלי!" },
    { at: 3420, mood: "victory", taxi: "honk", film: true, quip: "בּוּם! 💰" },
    { at: 6800, mood: "smirk", prop: "cash", taxi: "happy" },
  ] },
};

export function MovieStage({ base, mascotClass, taxiClass, morning = false }: { base: StageBase; mascotClass: string; taxiClass?: string; morning?: boolean }) {
  const [scene, setScene] = useState<SceneName | null>(null);
  const [beat, setBeat] = useState<Beat | null>(null);
  const [take, setTake] = useState(0);
  const [film, setFilm] = useState<Clip | null>(null);
  const timers = useRef<number[]>([]);
  const playing = useRef(false);
  const soundtrack = useRef<CueHandle | null>(null);

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
    const scheduleIdle = () => {
      window.clearTimeout(idleTimer);
      idleTimer = window.setTimeout(() => play(IDLE[Math.floor(Math.random() * IDLE.length)]), 16000 + Math.random() * 12000);
    };
    const play = (name: SceneName) => {
      clear();
      playing.current = true;
      const drawn = FILMS[name];
      const filmed = drawn && clipReady(drawn.clip) && motionAllowed() ? drawn : null;
      const def = filmed ?? SCENES[name];
      setScene(name); setTake((t) => t + 1); setBeat(def.beats[0]); setFilm(filmed?.clip ?? null);
      // reward films are voiced by the reward itself; idle films only now and then
      const cues = sceneCues(name);
      if (cues && claimAmbient(name === "morning")) soundtrack.current = playCues(cues, { ambient: true });
      def.beats.slice(1).forEach((b) => timers.current.push(window.setTimeout(() => setBeat(b), b.at)));
      timers.current.push(window.setTimeout(() => { playing.current = false; setScene(null); setBeat(null); setFilm(null); scheduleIdle(); }, def.length));
    };
    const onReward = (e: Event) => {
      const d = (e as CustomEvent<{ kind?: string }>).detail;
      play(d?.kind === "corrective" ? "splash" : d?.kind === "goal" || d?.kind === "streak" ? "parade" : "heist");
    };
    window.addEventListener("driver-reward", onReward);
    // fetch the films once the page has settled, so the next reward can play one
    const warm = window.setTimeout(() => {
      if (filmsWanted()) Object.values(FILMS).forEach((f) => void loadClip(f.clip));
    }, 2500);
    if (morning && new Date().getHours() < 12 && !sessionStorage.getItem("scene-morning")) {
      sessionStorage.setItem("scene-morning", "1");
      timers.current.push(window.setTimeout(() => play("morning"), 600));
    } else scheduleIdle();
    return () => { window.removeEventListener("driver-reward", onReward); clear(); window.clearTimeout(idleTimer); window.clearTimeout(warm); };
  }, [morning]);

  const cur = beat ?? { at: 0, mood: base.mood, prop: base.prop, taxi: base.taxi, driving: base.driving };
  const taxiMood = cur.taxi ?? base.taxi;
  return (
    <div className={`movie-stage ${scene ? `scene-${scene}` : "scene-none"} ${film ? "ms-filmed" : ""}`} key={take}>
      {taxiMood && taxiClass && (
        <span className={`ms-taxi ${taxiClass}`} onClick={() => playSound(TAXI_VOICE[taxiMood])}><TaxiArt mood={taxiMood} driving={cur.driving ?? base.driving} className="h-full w-full" /></span>
      )}
      <span className={`ms-mascot ${mascotClass}`} onClick={() => playSound(MOOD_MUMBLE[cur.mood])}>
        {film && cur.film ? <FrameStrip clip={film} className="ms-film" /> : <CaptainArt mood={cur.mood} prop={cur.prop ?? base.prop} reactive={false} className="ms-mascot-art" />}
      </span>
      {scene && <span className="ms-fx" />}
      {cur.quip && <span key={cur.quip} className="ms-quip">{cur.quip}</span>}
    </div>
  );
}
