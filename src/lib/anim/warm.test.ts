import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { Clip } from "./clips";

const fetches = vi.hoisted(() => ({
  wanted: true,
  started: [] as string[],
  finish: new Map<string, (ok: boolean) => void>(),
}));

vi.mock("./motion", () => ({ filmsWanted: () => fetches.wanted }));
vi.mock("./clips", () => ({
  loadClip: (clip: Clip) =>
    new Promise<boolean>((resolve) => {
      fetches.started.push(clip.src);
      fetches.finish.set(clip.src, resolve);
    }),
}));

const clip = (name: string) => ({ src: `/anim/${name}.webp` }) as Clip;
const [a, b, c] = ["a", "b", "c"].map(clip);

/** A fresh queue for every test: the module keeps one line of fetches for the whole page. */
async function load() {
  vi.resetModules();
  return (await import("./warm")).warmClips;
}
const settle = () => vi.advanceTimersByTimeAsync(0);

beforeEach(() => {
  vi.useFakeTimers();
  fetches.wanted = true;
  fetches.started.length = 0;
  fetches.finish.clear();
});
afterEach(() => vi.useRealTimers());

describe("warmClips", () => {
  it("fetches one strip at a time, in the order asked", async () => {
    const warmClips = await load();
    void warmClips([a, b, c]);
    await settle();
    expect(fetches.started).toEqual([a.src]);
    fetches.finish.get(a.src)!(true);
    await settle();
    expect(fetches.started).toEqual([a.src, b.src]);
    fetches.finish.get(b.src)!(true);
    await settle();
    expect(fetches.started).toEqual([a.src, b.src, c.src]);
  });

  it("keeps later calls behind earlier ones", async () => {
    const warmClips = await load();
    void warmClips([a]);
    void warmClips([b]);
    await settle();
    expect(fetches.started).toEqual([a.src]);
    fetches.finish.get(a.src)!(true);
    await settle();
    expect(fetches.started).toEqual([a.src, b.src]);
  });

  it("resolves true once every strip is ready, false if one failed", async () => {
    const warmClips = await load();
    const ok = warmClips([a, b]);
    await settle();
    fetches.finish.get(a.src)!(true);
    await settle();
    fetches.finish.get(b.src)!(true);
    await expect(ok).resolves.toBe(true);

    const bad = warmClips([c]);
    await settle();
    fetches.finish.get(c.src)!(false);
    await expect(bad).resolves.toBe(false);
  });

  it("lets a stalled strip go after 15 s, so the next one still starts", async () => {
    const warmClips = await load();
    const done = warmClips([a, b]);
    await settle();
    expect(fetches.started).toEqual([a.src]);
    await vi.advanceTimersByTimeAsync(14_999);
    expect(fetches.started).toEqual([a.src]);
    await vi.advanceTimersByTimeAsync(1);
    expect(fetches.started).toEqual([a.src, b.src]);
    fetches.finish.get(b.src)!(true);
    await expect(done).resolves.toBe(false);
  });

  it("fetches nothing when films aren't wanted (reduced motion, data saver)", async () => {
    const warmClips = await load();
    fetches.wanted = false;
    await expect(warmClips([a, b])).resolves.toBe(false);
    await settle();
    expect(fetches.started).toEqual([]);
  });
});
