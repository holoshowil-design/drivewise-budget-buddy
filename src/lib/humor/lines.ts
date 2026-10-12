/**
 * Original dialogue for the Captain (ק) and Turbo (ט). Style guide and rules:
 * docs/visual-art-direction.md §9. No film quotes, no emoji, at most MAX_BUBBLE
 * characters per bubble, and no line repeats before every line of its event was shown.
 */
export type Speaker = "captain" | "turbo";

export type LineEvent =
  | "morning"
  | "income"
  | "incomeBig"
  | "fuel"
  | "breakEven"
  | "goal"
  | "streak"
  | "weakDay"
  | "tripStart"
  | "tripEnd"
  | "expense"
  | "late"
  | "personal";

export type Say = { who: Speaker; text: string };
export type Line = { id: string; event: LineEvent; say: Say[] };
export type LineVars = { amount?: string; name?: string; km?: string; n?: string };

export const MAX_BUBBLE = 40;

const C = (text: string): Say => ({ who: "captain", text });
const T = (text: string): Say => ({ who: "turbo", text });

export const LINES: Line[] = [
  {
    id: "morning-plan",
    event: "morning",
    say: [C("התוכנית: לנסוע, להרוויח. בלי מוסך."), T("מוסך?!")],
  },
  { id: "morning-coffee", event: "morning", say: [C("הקפה מוכן, טורבו מוכן. אני פחות.")] },
  { id: "income-empire", event: "income", say: [C("{amount}. ככה מתחילות אימפריות.")] },
  { id: "income-record", event: "income", say: [C("רשמתי. בכתב יד יפה, לפרוטוקול.")] },
  { id: "income-honk", event: "income", say: [T("צופר?"), C("...צופר.")] },
  { id: "income-big-real", event: "incomeBig", say: [C("{amount}. אמיתי. כמעט התרגשתי.")] },
  { id: "income-big-calm", event: "incomeBig", say: [C("שמרו על קור רוח. אני שומר."), T("צופר!")] },
  { id: "fuel-dessert", event: "fuel", say: [C("טורבו שתה {amount}. בלי קינוח.")] },
  { id: "fuel-longing", event: "fuel", say: [C("זה לא המחיר. זה הגעגוע.")] },
  { id: "break-even-almost", event: "breakEven", say: [C("מכאן כל קילומטר שלנו. כמעט כל.")] },
  { id: "break-even-dignity", event: "breakEven", say: [C("יש דרכים מכובדות יותר לעבור קו.")] },
  { id: "goal-thinking", event: "goal", say: [C("לא אומר 'אמרתי לכם'. רק חושב.")] },
  { id: "goal-legend", event: "goal", say: [T("עוד?"), C("מחר. היום אנחנו אגדה.")] },
  { id: "streak-character", event: "streak", say: [C("{n} ימים ברצף. זה כבר אופי.")] },
  { id: "weak-rematch", event: "weakDay", say: [C("היום הכביש ניצח. מחר משחק חוזר.")] },
  { id: "weak-umbrella", event: "weakDay", say: [C("תודה. לא היה צריך. כן היה צריך.")] },
  { id: "trip-start-where", event: "tripStart", say: [T("לאן?"), C("לאן שהכסף נוסע.")] },
  {
    id: "trip-end-credit",
    event: "tripEnd",
    say: [C("{km} ק״מ. טורבו מבקש קרדיט."), T("מגיע לי.")],
  },
  { id: "expense-invest", event: "expense", say: [C("זו לא הוצאה. זו השקעה שקטה.")] },
  { id: "late-lights", event: "late", say: [C("אפילו הרמזורים הלכו לישון.")] },
  { id: "personal-efficient", event: "personal", say: [C("{name}, אנחנו לא ממהרים. יעילים.")] },
  {
    id: "personal-brain",
    event: "personal",
    say: [C("{name} על ההגה. אני רק המוח."), T("ואני הגלגלים.")],
  },
];

/** Fills `{key}` placeholders. Returns null when a needed value is missing. */
export function fill(text: string, vars: LineVars): string | null {
  let missing = false;
  const out = text.replace(/\{(amount|name|km|n)\}/g, (_, k: keyof LineVars) => {
    const v = vars[k];
    if (v == null || v === "") missing = true;
    return v ?? "";
  });
  return missing ? null : out;
}

function render(line: Line, vars: LineVars): Say[] | null {
  const out: Say[] = [];
  for (const s of line.say) {
    const text = fill(s.text, vars);
    if (text == null) return null;
    out.push({ who: s.who, text });
  }
  return out;
}

/**
 * Picks the next line for an event. `seen` holds the ids already shown; when every
 * usable line of the event was seen, the cycle starts over for that event only.
 */
export function pickLine(
  event: LineEvent,
  vars: LineVars,
  seen: readonly string[],
  rand: () => number = Math.random,
) {
  const usable = LINES.filter((l) => l.event === event)
    .map((line) => ({ line, say: render(line, vars) }))
    .filter((x): x is { line: Line; say: Say[] } => x.say !== null);
  if (usable.length === 0) return null;
  const ids = new Set(usable.map((u) => u.line.id));
  let pool = usable.filter((u) => !seen.includes(u.line.id));
  let kept = [...seen];
  if (pool.length === 0) {
    pool = usable;
    kept = kept.filter((id) => !ids.has(id));
  }
  const chosen = pool[Math.min(pool.length - 1, Math.floor(rand() * pool.length))];
  return { line: chosen.line, say: chosen.say, seen: [...kept, chosen.line.id] };
}

const SEEN_KEY = "driver-humor-seen-v1";

/** pickLine with the seen-list kept in localStorage (UI state only, never synced). */
export function nextLine(event: LineEvent, vars: LineVars = {}) {
  let seen: string[] = [];
  try {
    seen = JSON.parse(localStorage.getItem(SEEN_KEY) ?? "[]");
  } catch {
    seen = [];
  }
  const res = pickLine(event, vars, Array.isArray(seen) ? seen : []);
  if (!res) return null;
  try {
    localStorage.setItem(SEEN_KEY, JSON.stringify(res.seen));
  } catch {
    // storage full or blocked: lines may repeat, nothing else breaks
  }
  return res.say;
}
