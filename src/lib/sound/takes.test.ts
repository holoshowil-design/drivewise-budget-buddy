import { existsSync, statSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { SOUND_NAMES } from "./cues";
import { TAKES, chooseTake, takeUrl } from "./takes";

const takes = Object.values(TAKES).flat();
const file = (take: string) => join(process.cwd(), "public", takeUrl(take));

describe("the Captain's recorded voice", () => {
  it("only records sounds the app knows", () => {
    for (const name of Object.keys(TAKES)) expect(SOUND_NAMES).toContain(name);
  });

  it("ships every take, small enough to fetch on a phone", () => {
    let total = 0;
    for (const take of takes) {
      expect(existsSync(file(take)), take).toBe(true);
      total += statSync(file(take)).size;
    }
    expect(total).toBeLessThan(400_000);
  });

  it("never plays the same take twice in a row when there is a choice", () => {
    const pool = ["a", "b", "c"];
    let last: string | undefined;
    for (let i = 0; i < 100; i++) {
      const next = chooseTake(pool, last, () => (i * 0.37) % 1);
      expect(next).not.toBe(last);
      last = next;
    }
  });

  it("repeats a sound's only take, and has nothing before any take has loaded", () => {
    expect(chooseTake(["only"], "only")).toBe("only");
    expect(chooseTake([], undefined)).toBeUndefined();
  });
});
