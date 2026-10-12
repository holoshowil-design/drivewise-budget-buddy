import { describe, expect, it } from "vitest";
import { TAXI_BRAKE, TAXI_DRIVE, clipMs, type Clip } from "./clips";
import { FILMS, clipsOf, type Beat, type Film } from "./films";

/** Each stretch of beats that shows one film, from the beat it starts on to the next change. */
function runs(film: Film, shows: (b: Beat) => Clip | undefined) {
  const out: { clip: Clip; from: number; to: number }[] = [];
  let open: (typeof out)[number] | undefined;
  for (const b of film.beats) {
    const clip = shows(b);
    if (open && clip !== open.clip) {
      open.to = b.at;
      open = undefined;
    }
    if (clip && !open) out.push((open = { clip, from: b.at, to: film.length }));
  }
  return out;
}

describe.each(Object.entries(FILMS) as [string, Film][])("the %s scene", (_, film) => {
  const captain = runs(film, (b) => (b.film ? film.clip : undefined));
  const turbo = runs(film, (b) => b.taxiFilm);

  it("starts at once and keeps its beats in order, inside the scene", () => {
    const times = film.beats.map((b) => b.at);
    expect(times[0]).toBe(0);
    expect(times).toEqual([...new Set(times)].sort((a, b) => a - b));
    expect(Math.max(...times)).toBeLessThan(film.length);
  });

  it("plays the Captain's film once, from the start, when the scene has one", () => {
    expect(film.beats.some((b) => b.film)).toBe(Boolean(film.clip));
    expect(captain.map((r) => r.from)).toEqual(film.clip ? [0] : []);
  });

  it("never cuts a drawn film short", () => {
    for (const run of [...captain, ...turbo])
      if (!run.clip.loop) expect(run.to - run.from).toBeGreaterThanOrEqual(clipMs(run.clip));
  });
});

describe("Turbo's films", () => {
  it("has a warm-up lap and a lap that ends in a hard stop", () => {
    expect(FILMS.drive && clipsOf(FILMS.drive)).toEqual([TAXI_DRIVE]);
    expect(FILMS.brake && clipsOf(FILMS.brake)).toEqual([TAXI_DRIVE, TAXI_BRAKE]);
  });

  it("brakes into the morning, so the Captain's coffee goes flying", () => {
    const morning = FILMS.morning!;
    expect(clipsOf(morning)).toEqual([morning.clip, TAXI_DRIVE, TAXI_BRAKE]);
    const brake = morning.beats.find((b) => b.taxiFilm === TAXI_BRAKE)!;
    const spill = morning.beats.find((b) => b.quip === "הקפה!!")!;
    expect(brake.at).toBeLessThan(spill.at);
  });
});
