import { describe, expect, it } from "vitest";
import { IDLE_FIRST_MS, IDLE_GAP_MS, idleDelay, shuffledRound } from "./idle";

/** A small seeded generator, so the shuffles are the same on every run. */
function seeded(seed: number) {
  return () => {
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

describe("idleDelay", () => {
  it("runs from the start of its range to the end", () => {
    expect(idleDelay(true, () => 0)).toBe(IDLE_FIRST_MS[0]);
    expect(idleDelay(true, () => 1)).toBe(IDLE_FIRST_MS[1]);
    expect(idleDelay(false, () => 0)).toBe(IDLE_GAP_MS[0]);
    expect(idleDelay(false, () => 1)).toBe(IDLE_GAP_MS[1]);
  });

  it("brings the first scene sooner than any that follows", () => {
    expect(IDLE_FIRST_MS[1]).toBeLessThan(IDLE_GAP_MS[0]);
    expect(IDLE_FIRST_MS[1]).toBeLessThanOrEqual(10_000);
  });

  it("stays inside its range", () => {
    const random = seeded(7);
    for (let i = 0; i < 200; i++) {
      const first = idleDelay(true, random);
      const later = idleDelay(false, random);
      expect(first).toBeGreaterThanOrEqual(IDLE_FIRST_MS[0]);
      expect(first).toBeLessThanOrEqual(IDLE_FIRST_MS[1]);
      expect(later).toBeGreaterThanOrEqual(IDLE_GAP_MS[0]);
      expect(later).toBeLessThanOrEqual(IDLE_GAP_MS[1]);
    }
  });
});

describe("shuffledRound", () => {
  const pool = ["wipe", "count", "phone", "snooze", "drive", "brake"];

  it("plays every scene once", () => {
    const random = seeded(1);
    for (let i = 0; i < 50; i++)
      expect([...shuffledRound(pool, undefined, random)].sort()).toEqual([...pool].sort());
  });

  it("never starts with the scene that just played", () => {
    const random = seeded(2);
    for (const last of pool)
      for (let i = 0; i < 100; i++) expect(shuffledRound(pool, last, random)[0]).not.toBe(last);
  });

  it("is a real shuffle: different draws give different orders", () => {
    const random = seeded(3);
    const orders = new Set(
      Array.from({ length: 30 }, () => shuffledRound(pool, undefined, random).join()),
    );
    expect(orders.size).toBeGreaterThan(10);
  });

  it("leaves its pool alone", () => {
    const copy = [...pool];
    shuffledRound(pool, "wipe", seeded(4));
    expect(pool).toEqual(copy);
  });

  it("copes with a pool of one, and with an empty one", () => {
    expect(shuffledRound(["wipe"], "wipe")).toEqual(["wipe"]);
    expect(shuffledRound([], "wipe")).toEqual([]);
  });
});
