import { readFileSync, statSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import {
  COUNT,
  HEIST,
  MORNING,
  PARADE,
  PHONE,
  SNOOZE,
  SPLASH,
  TAXI_BRAKE,
  TAXI_DRIVE,
  WIPE,
  clipMs,
  filmBox,
  type Clip,
} from "./clips";
import { timeline } from "./timing";

const CAPTAIN: Record<string, Clip> = {
  HEIST,
  MORNING,
  SPLASH,
  PARADE,
  WIPE,
  COUNT,
  PHONE,
  SNOOZE,
};
const TURBO: Record<string, Clip> = { TAXI_DRIVE, TAXI_BRAKE };
const ALL = { ...CAPTAIN, ...TURBO };

const file = (clip: Clip) => join(process.cwd(), "public", clip.src);

/** A length from filmBox, as a fraction of the box. */
function part(s: string | undefined) {
  expect(s).toBeDefined();
  return parseFloat(s!) / 100;
}

/** Canvas size from a WebP file's extended header. */
function webpSize(path: string) {
  const b = readFileSync(path);
  expect(b.toString("latin1", 0, 4)).toBe("RIFF");
  expect(b.toString("latin1", 8, 16)).toBe("WEBPVP8X");
  return { width: b.readUIntLE(24, 3) + 1, height: b.readUIntLE(27, 3) + 1 };
}

describe("the heist film", () => {
  it("plays four seconds", () => {
    expect(timeline(HEIST.cells).frames).toBe(48);
    expect(clipMs(HEIST)).toBe(4000);
  });
});

describe.each(Object.entries(ALL))("the %s film", (_, clip) => {
  it("shows every drawing in its strip once, in order, with no empty row", () => {
    const count = clip.cells.length;
    expect(clip.cells.map((c) => c.cell)).toEqual(Array.from({ length: count }, (_, i) => i));
    expect(count).toBeLessThanOrEqual(clip.columns * clip.rows);
    expect(count).toBeGreaterThan(clip.columns * (clip.rows - 1));
  });

  it("ships a strip whose grid matches the cells, small enough to fetch on a phone", () => {
    expect(webpSize(file(clip))).toEqual({
      width: clip.columns * clip.width,
      height: clip.rows * clip.height,
    });
    expect(statSync(file(clip)).size).toBeLessThan(600_000);
  });

  it("starts from its still pose, inside the first cell", () => {
    const [left, top, right, bottom] = clip.body;
    expect(0 <= left && left < right && right <= clip.width).toBe(true);
    expect(0 <= top && top < bottom && bottom <= clip.height).toBe(true);
  });

  it("is short: a loop under a second, a scene under five", () => {
    expect(clipMs(clip)).toBeLessThan(clip.loop ? 1000 : 5000);
  });
});

it("keeps all the films together under 4.5 MB, fetched one scene at a time", () => {
  const total = Object.values(ALL).reduce((sum, clip) => sum + statSync(file(clip)).size, 0);
  expect(total).toBeLessThan(4_500_000);
});

describe("where a film stands", () => {
  it.each(Object.entries(CAPTAIN))(
    "stands %s's Captain exactly where his still pose stands",
    (_, clip) => {
      const box = filmBox(clip);
      const [left, top, right, bottom] = clip.body;
      // in heights of the mascot box, measured up from its bottom edge
      const tall = part(box.height);
      const stripTop = part(box.bottom) + tall;
      expect(stripTop - (bottom / clip.height) * tall).toBeCloseTo(0, 4);
      expect(stripTop - (top / clip.height) * tall).toBeCloseTo(1, 4);
      // centred: the strip's left edge sits half a box over, pulled back by the body's centre
      expect(-part(box.translate.split(" ")[0])).toBeCloseTo((left + right) / 2 / clip.width, 4);
      expect(box.left).toBe("50%");
    },
  );

  it.each(Object.entries(TURBO))(
    "lays %s across Turbo's box, wheels on its bottom edge",
    (_, clip) => {
      const box = filmBox(clip);
      const [left, , right, bottom] = clip.body;
      // in widths of the taxi box, from its left edge
      const wide = part(box.width);
      expect(part(box.left) + (left / clip.width) * wide).toBeCloseTo(0, 4);
      expect(part(box.left) + (right / clip.width) * wide).toBeCloseTo(1, 4);
      // the strip stands on the box's bottom edge, then drops by the room under the wheels
      expect(box.bottom).toBe("0%");
      expect(part(box.translate.split(" ")[1])).toBeCloseTo(
        (clip.height - bottom) / clip.height,
        4,
      );
    },
  );
});
