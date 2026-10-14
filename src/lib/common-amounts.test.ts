import { describe, expect, it } from "vitest";
import { commonAmounts } from "./common-amounts";

const inc = (amount: number, date: string, time = "10:00") => ({ amount, date, time });

describe("commonAmounts", () => {
  it("orders by how often an amount came up", () => {
    const list = [
      inc(50, "2026-10-01"),
      inc(40, "2026-10-02"),
      inc(50, "2026-10-03"),
      inc(40, "2026-10-04"),
      inc(50, "2026-10-05"),
      inc(80, "2026-10-06"),
      inc(80, "2026-10-07"),
    ];
    expect(commonAmounts(list)).toEqual([50, 80, 40]);
  });

  it("never offers a one-off amount", () => {
    expect(commonAmounts([inc(37, "2026-10-01"), inc(50, "2026-10-02")])).toEqual([]);
  });

  it("keeps the limit", () => {
    const list = [10, 20, 30, 40, 50].flatMap((a) => [inc(a, "2026-10-01"), inc(a, "2026-10-02")]);
    expect(commonAmounts(list, 3)).toHaveLength(3);
  });

  it("ignores zero and negative amounts", () => {
    expect(commonAmounts([inc(0, "2026-10-01"), inc(0, "2026-10-02")])).toEqual([]);
  });
});
