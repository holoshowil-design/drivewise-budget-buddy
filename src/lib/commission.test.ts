import { describe, expect, it } from "vitest";
import { commissionChoices } from "./commission";

describe("commissionChoices", () => {
  it("offers the default, then 10% and 0%", () => {
    expect(commissionChoices(12)).toEqual([12, 10, 0]);
    expect(commissionChoices(25)).toEqual([25, 10, 0]);
  });

  it("lists each percentage once", () => {
    expect(commissionChoices(10)).toEqual([10, 0]);
    expect(commissionChoices(0)).toEqual([0, 10]);
  });

  it("drops a default outside 0-100", () => {
    expect(commissionChoices(Number.NaN)).toEqual([10, 0]);
    expect(commissionChoices(120)).toEqual([10, 0]);
  });
});

describe("default settings", () => {
  it("start with a 12% commission", async () => {
    const { load } = await import("./store");
    expect(load().settings.defaultCommissionPct).toBe(12);
  });
});
