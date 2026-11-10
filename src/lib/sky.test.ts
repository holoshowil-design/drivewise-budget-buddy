import { describe, expect, it } from "vitest";
import { skyPhase, sunPosition, sunTimes } from "./sky";

const at = (iso: string) => new Date(iso);

describe("sunTimes", () => {
  it("follows the seasons in Tel Aviv", () => {
    const winter = sunTimes(at("2026-12-21T12:00:00"));
    const summer = sunTimes(at("2026-06-21T12:00:00"));
    expect(winter.sunset).toBeCloseTo(16.67, 1);
    expect(summer.sunset).toBeCloseTo(19.83, 1);
    expect(summer.sunrise).toBeLessThan(winter.sunrise);
  });
});

describe("skyPhase", () => {
  it("is night around midnight and before dawn", () => {
    expect(skyPhase(at("2026-10-19T23:55:00"))).toBe("night");
    expect(skyPhase(at("2026-10-19T00:30:00"))).toBe("night");
    expect(skyPhase(at("2026-10-19T04:30:00"))).toBe("night");
  });

  it("is dawn in the early morning", () => {
    expect(skyPhase(at("2026-10-19T06:30:00"))).toBe("dawn");
  });

  it("is day at noon", () => {
    expect(skyPhase(at("2026-10-19T12:00:00"))).toBe("day");
    expect(skyPhase(at("2026-06-21T18:00:00"))).toBe("day");
  });

  it("is dusk around sunset, which comes later in summer", () => {
    expect(skyPhase(at("2026-10-19T17:15:00"))).toBe("dusk");
    expect(skyPhase(at("2026-06-21T19:30:00"))).toBe("dusk");
    expect(skyPhase(at("2026-12-21T19:30:00"))).toBe("night");
  });
});

describe("sunPosition", () => {
  const at = (h: number, m = 0) => sunPosition(new Date(2026, 5, 21, h, m));
  it("rises on one side, peaks at midday, sets on the other", () => {
    const morning = at(6, 30);
    const noon = at(12, 40);
    const evening = at(19, 30);
    expect(morning.x).toBeLessThan(noon.x);
    expect(noon.x).toBeLessThan(evening.x);
    expect(noon.y).toBeLessThan(morning.y);
    expect(noon.y).toBeLessThan(evening.y);
  });
  it("stays inside the sky at night", () => {
    expect(at(2)).toEqual({ x: 8, y: 24 });
    expect(at(23)).toEqual({ x: 58, y: 24 });
  });
});
