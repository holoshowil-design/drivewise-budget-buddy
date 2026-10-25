import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { ACTIVE_KEY } from "@/lib/active-trip";
import { startBetween } from "@/lib/between-trip";
import { installBrowser } from "@/test/fixtures";
import { motionAllowed } from "./motion";

let uninstall: () => void;
let hud = false;

beforeEach(() => {
  uninstall = installBrowser();
  hud = false;
  Object.assign(globalThis, {
    document: { visibilityState: "visible", querySelector: () => (hud ? {} : null) },
  });
});
afterEach(() => {
  uninstall();
  delete (globalThis as Record<string, unknown>).document;
});

const setActive = (trip: object | null) =>
  trip
    ? localStorage.setItem(ACTIVE_KEY, JSON.stringify(trip))
    : localStorage.removeItem(ACTIVE_KEY);

describe("motionAllowed", () => {
  it("lets a film play with no trip running", () => {
    expect(motionAllowed()).toBe(true);
  });

  it("keeps films off during a work trip and on the drive screen", () => {
    setActive({ startedAt: Date.now(), date: "2026-10-25", time: "10:00", km: 0 });
    expect(motionAllowed()).toBe(false);
    setActive(null);
    hud = true;
    expect(motionAllowed()).toBe(false);
  });

  it("lets the reward film play right after a trip is saved, though a between measurement has started", () => {
    setActive(startBetween(Date.now(), "2026-10-25", "10:30"));
    expect(motionAllowed()).toBe(true);
  });

  it("keeps films off while a between measurement sees the car move", () => {
    setActive({ ...startBetween(Date.now(), "2026-10-25", "10:30"), km: 0.3 });
    expect(motionAllowed()).toBe(false);
  });
});
