import { describe, expect, it } from "vitest";
import { fmtDurationWords } from "./duration";

describe("fmtDurationWords", () => {
  it("writes minutes in words, not as a clock", () => {
    expect(fmtDurationWords(1500)).toBe("25 דק׳");
    expect(fmtDurationWords(89)).toBe("1 דק׳");
  });
  it("hours with padded minutes", () => {
    expect(fmtDurationWords(3900)).toBe("1 ש׳ 05 דק׳");
    expect(fmtDurationWords(7200)).toBe("2 ש׳");
    expect(fmtDurationWords(3599)).toBe("1 ש׳");
  });
  it("seconds under a minute, never negative", () => {
    expect(fmtDurationWords(42)).toBe("42 שנ׳");
    expect(fmtDurationWords(-5)).toBe("0 שנ׳");
  });
});
