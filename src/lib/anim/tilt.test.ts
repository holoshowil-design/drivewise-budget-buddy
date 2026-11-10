import { describe, expect, it } from "vitest";
import { leanOf } from "./tilt";

describe("leanOf", () => {
  it("is zero at the resting angle, whatever that angle is", () => {
    expect(leanOf(37, 37)).toBe(0);
  });
  it("grows with the lean and stops at the full slide", () => {
    expect(leanOf(7, 0)).toBeCloseTo(0.5);
    expect(leanOf(-7, 0)).toBeCloseTo(-0.5);
    expect(leanOf(60, 10)).toBe(1);
    expect(leanOf(-60, 10)).toBe(-1);
  });
});
