import { describe, expect, it } from "vitest";
import { effectiveFuelParams, type Settings, type Vehicle } from "@/lib/store";

const vehicle = { consumption: 15 } as Vehicle;
const settings = (fuelPriceHistory: Settings["fuelPriceHistory"]) =>
  ({ fuelPrice: 9, fuelPriceHistory }) as Settings;

describe("effectiveFuelParams with a cached history", () => {
  it("gives the same answer every time for the same history", () => {
    const s = settings([
      { date: "2026-10-10", time: "08:00", price: 7.5, consumption: 15 },
      { date: "2026-01-01", time: "00:00", price: 7, consumption: 14 },
    ]);
    for (let i = 0; i < 3; i++) {
      expect(effectiveFuelParams("2026-10-11", vehicle, s).price).toBe(7.5);
      expect(effectiveFuelParams("2026-05-01", vehicle, s).price).toBe(7);
    }
  });

  it("follows a new history after a price change", () => {
    const before = [{ date: "2026-01-01", time: "00:00", price: 7, consumption: 14 }];
    expect(effectiveFuelParams("2026-10-14", vehicle, settings(before), "12:00").price).toBe(7);
    const after = [...before, { date: "2026-10-14", time: "09:00", price: 8, consumption: 14 }];
    expect(effectiveFuelParams("2026-10-14", vehicle, settings(after), "12:00").price).toBe(8);
    expect(effectiveFuelParams("2026-10-14", vehicle, settings(after), "08:00").price).toBe(7);
  });

  it("uses the earliest entry before the first change", () => {
    const s = settings([{ date: "2026-06-01", time: "00:00", price: 7.2, consumption: 14 }]);
    expect(effectiveFuelParams("2026-01-01", vehicle, s)).toMatchObject({
      price: 7.2,
      since: "2026-06-01 00:00",
    });
  });
});
