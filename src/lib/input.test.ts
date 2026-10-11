import { describe, expect, it } from "vitest";
import { parseNumber, sanitizeNumberInput } from "@/lib/number";
import { validateIncome } from "@/lib/validate";
import { classifyStep, looksForgotten, movementThresholdKm } from "@/lib/gps";

describe("typing numbers", () => {
  it("accepts a decimal point and a decimal comma", () => {
    expect(parseNumber("7.45")).toBe(7.45);
    expect(parseNumber("7,45")).toBe(7.45);
    expect(parseNumber("7,4")).toBe(7.4);
    expect(parseNumber(" 12 ")).toBe(12);
  });

  it("reads a comma before three digits as thousands", () => {
    expect(parseNumber("1,200")).toBe(1200);
    expect(parseNumber("12,345,678")).toBe(12345678);
    expect(parseNumber("1,234.5")).toBe(1234.5);
  });

  it("returns null instead of a silent partial value", () => {
    expect(parseNumber("")).toBeNull();
    expect(parseNumber("abc")).toBeNull();
    expect(parseNumber("7.4.1")).toBeNull();
  });

  it("keeps half-typed text while typing", () => {
    expect(sanitizeNumberInput("7.")).toBe("7.");
    expect(sanitizeNumberInput("7,4₪")).toBe("7,4");
  });
});

describe("income validation", () => {
  const ok = { date: "2026-10-11", amount: "100", commissionPct: "25", hours: "3" };

  it("passes a normal income", () => {
    expect(validateIncome(ok)).toEqual({});
  });

  it("requires a date and a positive amount", () => {
    expect(validateIncome({ ...ok, date: "" }).date).toBeTruthy();
    expect(validateIncome({ ...ok, amount: "0" }).amount).toBeTruthy();
    expect(validateIncome({ ...ok, amount: "" }).amount).toBeTruthy();
  });

  it("keeps commission within 0–100 and hours within 0–24", () => {
    expect(validateIncome({ ...ok, commissionPct: "120" }).commissionPct).toBeTruthy();
    expect(validateIncome({ ...ok, commissionPct: "-1" }).commissionPct).toBeTruthy();
    expect(validateIncome({ ...ok, hours: "25" }).hours).toBeTruthy();
    expect(validateIncome({ ...ok, hours: "7,5" })).toEqual({});
  });
});

describe("GPS movement", () => {
  it("the threshold grows with GPS inaccuracy", () => {
    expect(movementThresholdKm(5, 5)).toBeCloseTo(0.008);
    expect(movementThresholdKm(50, 20)).toBeCloseTo(0.05);
  });

  it("40 m of jitter with 50 m accuracy is standing, not driving", () => {
    expect(classifyStep(0.04, 10, 50, 50)).toBe("stay");
  });

  it("real movement with good accuracy counts", () => {
    expect(classifyStep(0.2, 15, 8, 8)).toBe("move");
  });

  it("impossible jumps are ignored", () => {
    expect(classifyStep(5, 10, 8, 8)).toBe("jump");
  });

  it("asks 'forgot to end?' only after a long stop, and respects the snooze", () => {
    const now = Date.parse("2026-10-11T12:00:00Z");
    expect(looksForgotten({ startedAt: now - 3600_000, lastMoveAt: now - 10 * 60_000 }, now)).toBe(
      false,
    );
    expect(looksForgotten({ startedAt: now - 3600_000, lastMoveAt: now - 50 * 60_000 }, now)).toBe(
      true,
    );
    expect(
      looksForgotten(
        { startedAt: now - 3600_000, lastMoveAt: now - 50 * 60_000, forgotSnoozeUntil: now + 1 },
        now,
      ),
    ).toBe(false);
  });
});
