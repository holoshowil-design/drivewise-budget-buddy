import { describe, expect, it } from "vitest";
import { FRAME_MS, cellAt, sequence, timeline } from "./timing";

describe("film timing", () => {
  it("lays cells end to end, holds included", () => {
    const { starts, frames, ms } = timeline([
      { cell: 0, hold: 3 },
      { cell: 1 },
      { cell: 2, hold: 2 },
    ]);
    expect(starts).toEqual([0, 3, 4]);
    expect(frames).toBe(6);
    expect(ms).toBe(500);
  });

  it("shows each cell for its frames and keeps the last one after the end", () => {
    const { starts } = timeline([{ cell: 0, hold: 3 }, { cell: 1 }, { cell: 2, hold: 2 }]);
    expect(cellAt(starts, 0)).toBe(0);
    expect(cellAt(starts, 3 * FRAME_MS - 1)).toBe(0);
    expect(cellAt(starts, 3 * FRAME_MS)).toBe(1);
    expect(cellAt(starts, 4 * FRAME_MS + 1)).toBe(2);
    expect(cellAt(starts, 60_000)).toBe(2);
    expect(cellAt(starts, -50)).toBe(0);
  });

  it("builds a plain run of cells with the given holds", () => {
    expect(sequence(4, { 0: 6, 2: 2 })).toEqual([
      { cell: 0, hold: 6 },
      { cell: 1 },
      { cell: 2, hold: 2 },
      { cell: 3 },
    ]);
    expect(timeline(sequence(4, { 0: 6, 2: 2 })).frames).toBe(10);
  });
});
