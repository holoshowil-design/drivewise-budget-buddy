import { describe, expect, it } from "vitest";
import { bannerLine } from "./sky-banner";

const money = (n: number) => `${Math.round(n)} ₪`;
const week = (nets: number[]) =>
  nets.map((net, i) => ({ date: `2026-11-${String(4 + i).padStart(2, "0")}`, net }));

describe("bannerLine", () => {
  it("says nothing when there is nothing good to say", () => {
    expect(bannerLine(week([0, 0, 0, 0, 0, 0, 0]), { current: 0, best: 0 }, money, 0)).toBeNull();
    expect(
      bannerLine(week([-20, 0, -5, 0, 0, 0, 0]), { current: 1, best: 4 }, money, 3),
    ).toBeNull();
  });

  it("names the best day of the week by its weekday", () => {
    // 2026-11-06 is a Friday.
    const line = bannerLine(week([100, 200, 592, 0, 0, 0, 50]), { current: 0, best: 0 }, money, 0);
    expect(line).toBe("שיא השבוע: 592 ₪ ביום שישי");
  });

  it("celebrates a record broken today", () => {
    const line = bannerLine(week([100, 200, 300, 0, 0, 0, 450]), { current: 0, best: 0 }, money, 0);
    expect(line).toBe("שיא השבוע נשבר היום: 450 ₪");
  });

  it("rotates between the facts that hold, by the seed", () => {
    const days = week([100, 200, 300, 0, 0, 0, 50]);
    const streak = { current: 5, best: 5 };
    expect(bannerLine(days, streak, money, 1)).toBe("650 ₪ בשבעה ימים");
    expect(bannerLine(days, streak, money, 2)).toBe("5 ימי עבודה ברצף, שיא אישי");
    expect(bannerLine(days, { current: 4, best: 9 }, money, 2)).toBe("4 ימי עבודה ברצף");
  });
});
