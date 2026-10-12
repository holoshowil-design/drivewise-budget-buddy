import { describe, expect, it } from "vitest";
import { LINES, MAX_BUBBLE, fill, pickLine, type LineEvent } from "@/lib/humor/lines";
import { BOIL_FPS, FPS, bubbleMs, cellAt, framesToMs, timeline } from "@/lib/anim/timing";

const sample = { amount: "₪1,250", name: "אַרי", km: "123.4", n: "12" };
const events: LineEvent[] = [
  "morning",
  "income",
  "incomeBig",
  "fuel",
  "breakEven",
  "goal",
  "streak",
  "weakDay",
  "tripStart",
  "tripEnd",
  "expense",
  "late",
  "personal",
];

describe("dialogue library", () => {
  it("every event has at least one line", () => {
    for (const e of events)
      expect(
        LINES.some((l) => l.event === e),
        e,
      ).toBe(true);
  });

  it("ids are unique", () => {
    expect(new Set(LINES.map((l) => l.id)).size).toBe(LINES.length);
  });

  it(`every bubble fits in ${MAX_BUBBLE} characters with realistic values`, () => {
    for (const l of LINES)
      for (const s of l.say) {
        const text = fill(s.text, sample)!;
        expect([...text].length, `${l.id}: ${text}`).toBeLessThanOrEqual(MAX_BUBBLE);
      }
  });

  it("has no emoji", () => {
    for (const l of LINES)
      for (const s of l.say) expect(s.text, l.id).not.toMatch(/\p{Extended_Pictographic}/u);
  });

  it("fill reports a missing value instead of printing an empty hole", () => {
    expect(fill("{amount}. מעולה", {})).toBeNull();
    expect(fill("{amount}. מעולה", { amount: "₪90" })).toBe("₪90. מעולה");
  });

  it("skips lines whose values are missing", () => {
    expect(pickLine("personal", {}, [])).toBeNull();
    const r = pickLine("income", {}, [], () => 0)!;
    expect(r.line.id).not.toBe("income-empire");
  });

  it("never repeats a line before the event's cycle is used up", () => {
    const n = LINES.filter((l) => l.event === "income").length;
    let seen: string[] = [];
    const shown: string[] = [];
    for (let i = 0; i < n; i++) {
      const r = pickLine("income", sample, seen, () => 0.5)!;
      shown.push(r.line.id);
      seen = r.seen;
    }
    expect(new Set(shown).size).toBe(n);
    const again = pickLine("income", sample, seen, () => 0.5)!;
    expect(again.seen.filter((id) => id.startsWith("income-")).length).toBe(1);
  });

  it("keeps other events' history when one event starts over", () => {
    const r = pickLine("late", sample, ["late-lights", "goal-legend"])!;
    expect(r.seen).toContain("goal-legend");
  });
});

describe("animation timing", () => {
  it("runs on twos with a slower line boil", () => {
    expect(FPS).toBe(12);
    expect(BOIL_FPS).toBe(8);
    expect(framesToMs(6)).toBe(500);
  });

  it("maps time to the drawing on screen, holding the last one", () => {
    const { starts, frames, ms } = timeline([
      { cell: 0, hold: 3 },
      { cell: 1 },
      { cell: 2, hold: 6 },
    ]);
    expect(starts).toEqual([0, 3, 4]);
    expect(frames).toBe(10);
    expect(ms).toBe(833);
    expect(cellAt(starts, 0)).toBe(0);
    expect(cellAt(starts, 249)).toBe(0);
    expect(cellAt(starts, 250)).toBe(1);
    expect(cellAt(starts, 340)).toBe(2);
    expect(cellAt(starts, 99999)).toBe(2);
  });

  it("keeps bubbles readable but short", () => {
    expect(bubbleMs("")).toBe(250);
    expect(bubbleMs("רשמתי.")).toBe(250 + 6 * 60);
    expect(bubbleMs("א".repeat(100))).toBe(2500);
  });
});
