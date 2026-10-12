import { useEffect, useRef, useState } from "react";
import type { MascotMood, MascotProp } from "@/components/DriverMascot";
import type { TaxiMood } from "@/components/CaricatureTaxi";
import { CaptainArt, TaxiArt } from "@/components/CharacterArt";

export type StageBase = { mood: MascotMood; prop?: MascotProp; taxi?: TaxiMood; driving?: boolean };
type Beat = { at: number; mood: MascotMood; prop?: MascotProp; taxi?: TaxiMood; driving?: boolean; quip?: string };
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

export function MovieStage({ base, mascotClass, taxiClass, morning = false }: { base: StageBase; mascotClass: string; taxiClass?: string; morning?: boolean }) {
  const [scene, setScene] = useState<SceneName | null>(null);
  const [beat, setBeat] = useState<Beat | null>(null);
  const [take, setTake] = useState(0);
  const timers = useRef<number[]>([]);
  const playing = useRef(false);

  useEffect(() => {
    const still = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (still) return;
    const clear = () => { timers.current.forEach((t) => window.clearTimeout(t)); timers.current = []; };
    let idleTimer: number | undefined;
    const scheduleIdle = () => {
      window.clearTimeout(idleTimer);
      idleTimer = window.setTimeout(() => play(IDLE[Math.floor(Math.random() * IDLE.length)]), 16000 + Math.random() * 12000);
    };
    const play = (name: SceneName) => {
      clear();
      playing.current = true;
      const def = SCENES[name];
      setScene(name); setTake((t) => t + 1); setBeat(def.beats[0]);
      def.beats.slice(1).forEach((b) => timers.current.push(window.setTimeout(() => setBeat(b), b.at)));
      timers.current.push(window.setTimeout(() => { playing.current = false; setScene(null); setBeat(null); scheduleIdle(); }, def.length));
    };
    const onReward = (e: Event) => {
      const d = (e as CustomEvent<{ kind?: string }>).detail;
      play(d?.kind === "corrective" ? "splash" : d?.kind === "goal" || d?.kind === "streak" ? "parade" : "heist");
    };
    window.addEventListener("driver-reward", onReward);
    if (morning && new Date().getHours() < 12 && !sessionStorage.getItem("scene-morning")) {
      sessionStorage.setItem("scene-morning", "1");
      timers.current.push(window.setTimeout(() => play("morning"), 600));
    } else scheduleIdle();
    return () => { window.removeEventListener("driver-reward", onReward); clear(); window.clearTimeout(idleTimer); };
  }, [morning]);

  const cur = beat ?? { at: 0, mood: base.mood, prop: base.prop, taxi: base.taxi, driving: base.driving };
  const taxiMood = cur.taxi ?? base.taxi;
  return (
    <div className={`movie-stage ${scene ? `scene-${scene}` : "scene-none"}`} key={take}>
      {taxiMood && taxiClass && (
        <span className={`ms-taxi ${taxiClass}`}><TaxiArt mood={taxiMood} driving={cur.driving ?? base.driving} className="h-full w-full" /></span>
      )}
      <span className={`ms-mascot ${mascotClass}`}><CaptainArt mood={cur.mood} prop={cur.prop ?? base.prop} reactive={false} className="ms-mascot-art" /></span>
      {scene && <span className="ms-fx" />}
      {cur.quip && <span key={cur.quip} className="ms-quip">{cur.quip}</span>}
    </div>
  );
}
