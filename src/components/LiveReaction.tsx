import { useEffect, useRef, useState } from "react";
import type { MascotMood, MascotProp } from "@/components/DriverMascot";
import { CaptainArt } from "@/components/CharacterArt";
import { REWARD_FILMS } from "@/lib/anim/reward-films";
import { ComicBubble } from "@/components/InkWorld";
import { playSound } from "@/lib/sound";
import { MOOD_MUMBLE } from "@/lib/sound/cues";

type Kind = "income" | "expense" | "fuel";

function read(kind: Kind, amount: number): { mood: MascotMood; prop: MascotProp; line: string; tone: "default" | "warn" | "win"; word?: string } {
  if (kind === "income") {
    if (amount <= 0) return { mood: "sleepy", prop: "coffee", line: "נו, כמה עשינו? ☕", tone: "default" };
    if (amount < 60) return { mood: "smirk", prop: "cash", line: "כל שקל נספר 😏", tone: "default" };
    if (amount < 180) return { mood: "excited", prop: "cash", line: "יפה! זה כבר משהו 💸", tone: "win", word: "צ׳ינג!" };
    return { mood: "victory", prop: "cash", line: "וואו! נסיעת זהב 🤑", tone: "win", word: "בּוּם!" };
  }
  if (kind === "fuel") {
    if (amount <= 0) return { mood: "smirk", prop: "pump", line: "כמה עלה התדלוק?", tone: "default" };
    return { mood: "grumble", prop: "pump", line: amount > 250 ? "אוּף... הדלק שותה הכל ⛽" : "נרשם. נחזיר את זה בנסיעה הבאה", tone: "warn", word: amount > 250 ? "גְּלוּק!" : undefined };
  }
  if (amount <= 0) return { mood: "smirk", prop: "none", line: "מה נכנס להוצאות?", tone: "default" };
  return { mood: "grumble", prop: "none", line: amount > 200 ? "כבד! שומרים על הכיס 😤" : "קטן, נעבור את זה", tone: "warn" };
}

const BACKDROP: Record<Kind, string> = { income: "street", expense: "garage", fuel: "road" };

/** Character reacts live while the driver types an amount — pure presentation. */
export function LiveReaction({ kind, amount }: { kind: Kind; amount: number }) {
  const state = read(kind, amount);
  const [pop, setPop] = useState(0);
  const prev = useRef(state.line);
  useEffect(() => {
    if (prev.current !== state.line) { prev.current = state.line; setPop((p) => p + 1); }
  }, [state.line]);
  // he mumbles when his mood changes, once the typing settles
  const said = useRef(state.mood);
  useEffect(() => {
    if (said.current === state.mood) return;
    const t = window.setTimeout(() => { said.current = state.mood; playSound(MOOD_MUMBLE[state.mood]); }, 350);
    return () => window.clearTimeout(t);
  }, [state.mood]);
  return (
    <div className={`live-reaction stage-bg stage-${BACKDROP[kind]} live-reaction-${state.tone}`} aria-hidden="true">
      <CaptainArt mood={state.mood} prop={state.prop} films={REWARD_FILMS[kind]} className="live-reaction-mascot" />
      <ComicBubble key={pop} side="start" tone={state.tone} className="live-reaction-bubble">{state.line}</ComicBubble>
      {state.word && <span key={`w-${pop}`} className="comic-word">{state.word}</span>}
    </div>
  );
}
