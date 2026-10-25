import { describe, expect, it } from "vitest";
import { FILMS } from "./films";
import { idlePool } from "./stage-pool";

describe("idlePool", () => {
  it("gives a stage with Turbo all six idle scenes", () => {
    expect([...idlePool(true)].sort()).toEqual([
      "brake",
      "count",
      "drive",
      "phone",
      "snooze",
      "wipe",
    ]);
  });

  it("keeps the scenes about the taxi off a stage without him", () => {
    const pool = idlePool(false);
    expect([...pool].sort()).toEqual(["count", "phone"]);
    for (const name of ["wipe", "snooze", "drive", "brake"] as const)
      expect(pool).not.toContain(name);
  });

  it("only names scenes that exist as films", () => {
    for (const name of idlePool(true)) expect(FILMS[name], name).toBeDefined();
  });
});
