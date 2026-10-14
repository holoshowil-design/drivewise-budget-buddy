import { describe, expect, it } from "vitest";
import { dayLabel, groupByDay } from "./day-groups";

describe("groupByDay", () => {
  it("keeps the order of dates and of rows within a day", () => {
    const rows = [
      { id: "a", date: "2026-10-14" },
      { id: "b", date: "2026-10-14" },
      { id: "c", date: "2026-10-13" },
      { id: "d", date: "2026-10-14" },
    ];
    expect(groupByDay(rows, (r) => r.date)).toEqual([
      { date: "2026-10-14", rows: [rows[0], rows[1], rows[3]] },
      { date: "2026-10-13", rows: [rows[2]] },
    ]);
  });

  it("returns nothing for no rows", () => {
    expect(groupByDay([], () => "x")).toEqual([]);
  });
});

describe("dayLabel", () => {
  it("names today and yesterday", () => {
    expect(dayLabel("2026-10-14", "2026-10-14")).toBe("היום");
    expect(dayLabel("2026-10-13", "2026-10-14")).toBe("אתמול");
  });

  it("knows yesterday across a month and a year", () => {
    expect(dayLabel("2026-09-30", "2026-10-01")).toBe("אתמול");
    expect(dayLabel("2025-12-31", "2026-01-01")).toBe("אתמול");
  });

  it("shows the date for older days", () => {
    const label = dayLabel("2026-10-10", "2026-10-14");
    expect(label).not.toBe("היום");
    expect(label).toContain("10");
  });
});
