import { describe, expect, it } from "vitest";
import { FILMS } from "@/lib/anim/films";
import {
  AMBIENT_GAP_MS,
  AMBIENT_IDLE_MS,
  FILM_SCENE_CUES,
  MOOD_MUMBLE,
  REWARD_CUES,
  SCENE_CUES,
  SOUND_NAMES,
  TAXI_VOICE,
  ambientAllowed,
  canPlay,
  sceneCues,
  type Cue,
} from "./cues";
import { TAKES } from "./takes";
import { SOUNDS } from "./voices";

const known = new Set<string>(SOUND_NAMES);

function checkTrack(cues: readonly Cue[], longest: number) {
  expect(cues.length).toBeGreaterThan(0);
  for (const cue of cues) {
    expect(known.has(cue.sound)).toBe(true);
    expect(cue.at).toBeGreaterThanOrEqual(0);
    expect(cue.at).toBeLessThan(longest);
    if (cue.volume !== undefined) expect(cue.volume).toBeGreaterThan(0);
  }
  const times = cues.map((c) => c.at);
  expect(times).toEqual([...times].sort((a, b) => a - b));
}

describe("sound registry", () => {
  it("gives every named sound one voice: synthesized, or the Captain's recorded takes", () => {
    const voiced = [...Object.keys(SOUNDS), ...Object.keys(TAKES)].sort();
    expect(voiced).toEqual([...SOUND_NAMES].sort());
    for (const voice of Object.values(SOUNDS)) expect(typeof voice).toBe("function");
  });

  it("gives every reward a short soundtrack", () => {
    for (const cues of Object.values(REWARD_CUES)) checkTrack(cues, 2000);
  });

  it("keeps scene soundtracks inside the films (the longest is 10 seconds)", () => {
    for (const cues of Object.values(SCENE_CUES)) checkTrack(cues, 10_000);
  });

  it("keeps the drawn films' soundtracks inside the films they follow", () => {
    for (const [name, cues] of Object.entries(FILM_SCENE_CUES)) {
      const film = FILMS[name as keyof typeof FILMS];
      expect(film).toBeDefined();
      checkTrack(cues, film!.length);
    }
  });

  it("voices only the films it has a soundtrack for", () => {
    expect(sceneCues("morning")).toBe(SCENE_CUES.morning);
    expect(sceneCues("heist")).toBeUndefined();
    expect(sceneCues("parade")).toBeUndefined();
  });

  it("follows the drawings when a scene plays as a drawn film", () => {
    expect(sceneCues("morning", true)).toBe(FILM_SCENE_CUES.morning);
    expect(sceneCues("snooze", true)).toBe(FILM_SCENE_CUES.snooze);
    // Turbo's laps travel the same either way; rewards voice their own films
    expect(sceneCues("brake", true)).toBe(SCENE_CUES.brake);
    expect(sceneCues("heist", true)).toBeUndefined();
    expect(sceneCues("parade", true)).toBeUndefined();
    expect(sceneCues("splash", true)).toBeUndefined();
  });

  it("has a voice for every mood of the Captain and of Turbo", () => {
    for (const s of [...Object.values(MOOD_MUMBLE), ...Object.values(TAXI_VOICE)])
      expect(known.has(s)).toBe(true);
  });
});

describe("when sound may play", () => {
  const on = { enabled: true, running: true, hidden: false, driving: false };

  it("plays when switched on, unlocked and on screen", () => {
    expect(canPlay(on)).toBe(true);
  });

  it("is silent when switched off, before the first touch, in the background, or while driving", () => {
    expect(canPlay({ ...on, enabled: false })).toBe(false);
    expect(canPlay({ ...on, running: false })).toBe(false);
    expect(canPlay({ ...on, hidden: true })).toBe(false);
    expect(canPlay({ ...on, driving: true })).toBe(false);
  });

  describe("idle films", () => {
    const now = 1_000_000;
    const base = {
      now,
      lastGesture: now - 5_000,
      lastAmbient: now - AMBIENT_GAP_MS,
      tripActive: false,
    };

    it("may have sound while someone is using the app and the last one was long enough ago", () => {
      expect(ambientAllowed(base)).toBe(true);
    });

    it("stay quiet too soon after the last voiced film", () => {
      expect(ambientAllowed({ ...base, lastAmbient: now - AMBIENT_GAP_MS + 1 })).toBe(false);
    });

    it("stay quiet when nobody has touched the app for a while", () => {
      expect(ambientAllowed({ ...base, lastGesture: now - AMBIENT_IDLE_MS - 1 })).toBe(false);
    });

    it("stay quiet during a trip, even the morning film", () => {
      expect(ambientAllowed({ ...base, tripActive: true })).toBe(false);
      expect(ambientAllowed({ ...base, tripActive: true, force: true })).toBe(false);
    });

    it("let the morning film through regardless of the gap", () => {
      expect(ambientAllowed({ ...base, lastGesture: 0, lastAmbient: now, force: true })).toBe(true);
    });
  });
});
