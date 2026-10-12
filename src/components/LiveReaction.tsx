import { useEffect, useRef, useState } from "react";
import type { MascotMood, MascotProp } from "@/components/DriverMascot";
import { CaptainArt } from "@/components/CharacterArt";
import { ComicBubble } from "@/components/InkWorld";

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

/** Character reacts live while the driver types an amount — pure presentation. */
export function LiveReaction({ kind, amount }: { kind: Kind; amount: number }) {
  const state = read(kind, amount);
  const [pop, setPop] = useState(0);
  const prev = useRef(state.line);
  useEffect(() => {
    if (prev.current !== state.line) { prev.current = state.line; setPop((p) => p + 1); }
  }, [state.line]);
  return (
    <div className={`live-reaction live-reaction-${state.tone}`} aria-hidden="true">
      <CaptainArt mood={state.mood} prop={state.prop} className="live-reaction-mascot" />
      <ComicBubble key={pop} tone={state.tone} className="live-reaction-bubble">{state.line}</ComicBubble>
      {state.word && <span key={`w-${pop}`} className="comic-word">{state.word}</span>}
    </div>
  );
}
