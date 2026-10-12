import { readFileSync, statSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { HEIST, clipMs, filmBox, type Clip } from "./clips";
import { timeline } from "./timing";

const file = (clip: Clip) => join(process.cwd(), "public", clip.src);

/** Canvas size from a WebP file's extended header. */
function webpSize(path: string) {
  const b = readFileSync(path);
  expect(b.toString("latin1", 0, 4)).toBe("RIFF");
  expect(b.toString("latin1", 8, 16)).toBe("WEBPVP8X");
  return { width: b.readUIntLE(24, 3) + 1, height: b.readUIntLE(27, 3) + 1 };
}

describe("the heist film", () => {
  it("plays four seconds and every drawing in the strip once, in order", () => {
    expect(timeline(HEIST.cells).frames).toBe(48);
    expect(clipMs(HEIST)).toBe(4000);
    expect(HEIST.cells.map((c) => c.cell)).toEqual(Array.from({ length: 38 }, (_, i) => i));
    expect(HEIST.cells.length).toBeLessThanOrEqual(HEIST.columns * HEIST.rows);
  });

  it("ships a strip whose grid matches the cells, small enough to fetch on a phone", () => {
    expect(webpSize(file(HEIST))).toEqual({
      width: HEIST.columns * HEIST.width,
      height: HEIST.rows * HEIST.height,
    });
    expect(statSync(file(HEIST)).size).toBeLessThan(400_000);
  });

  it("stands the Captain exactly where his still pose stands", () => {
    const box = filmBox(HEIST);
    const pct = (s: string) => parseFloat(s) / 100;
    const [left, top, right, bottom] = HEIST.body;
    // in heights of the mascot box, measured up from its bottom edge
    const tall = pct(box.height);
    const stripTop = pct(box.bottom) + tall;
    const bodyTop = stripTop - (top / HEIST.height) * tall;
    const bodyBottom = stripTop - (bottom / HEIST.height) * tall;
    expect(bodyBottom).toBeCloseTo(0, 4);
    expect(bodyTop).toBeCloseTo(1, 4);
    // centred: the strip's left edge sits half a box over, pulled back by the body's centre
    expect(-pct(box.translate.split(" ")[0])).toBeCloseTo((left + right) / 2 / HEIST.width, 4);
    expect(box.left).toBe("50%");
  });
});
