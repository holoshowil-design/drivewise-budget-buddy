import { describe, expect, it } from "vitest";
import { HEIST, PARADE, SPLASH } from "./clips";
import { REWARD_FILMS, filmsToWarm } from "./reward-films";

describe("REWARD_FILMS", () => {
  it("plays the money films on the income form, never the fuel nozzle", () => {
    const { income } = REWARD_FILMS;
    expect(income.income).toBe(HEIST);
    expect(income.trip).toBe(HEIST);
    expect(income["break-even"]).toBe(HEIST);
    expect(income.goal).toBe(PARADE);
    expect(income.streak).toBe(PARADE);
    expect(Object.values(income)).not.toContain(SPLASH);
  });

  it("plays the fuel nozzle on the fuel form, and only there", () => {
    expect(REWARD_FILMS.fuel).toEqual({ corrective: SPLASH });
    expect(Object.values(REWARD_FILMS.expense)).toEqual([]);
  });

  it("gives an expense (insurance, parking, food...) no film at all", () => {
    expect(REWARD_FILMS.expense.corrective).toBeUndefined();
  });
});

describe("filmsToWarm", () => {
  it("lists each strip once, the likeliest first", () => {
    expect(filmsToWarm(REWARD_FILMS.income)).toEqual([HEIST, PARADE]);
  });

  it("fetches only the nozzle for a fuel stop, and nothing for an expense", () => {
    expect(filmsToWarm(REWARD_FILMS.fuel)).toEqual([SPLASH]);
    expect(filmsToWarm(REWARD_FILMS.expense)).toEqual([]);
  });
});
