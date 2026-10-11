import { describe, expect, it } from "vitest";
import { applyRestore, parseBackup, planRestore } from "@/lib/backup";
import { appData, expense, income, trip } from "@/test/fixtures";

describe("backup restore", () => {
  it("rejects files that are not a Driver backup", () => {
    expect(parseBackup({ hello: 1 })).toBeNull();
    expect(
      parseBackup({ incomes: [{ id: "x", date: "yesterday", amount: 5 }], expenses: [] }),
    ).toBeNull();
  });

  it("includes trips and counts only records that are missing here", () => {
    const here = appData({ incomes: [income({ id: "a" })] });
    const file = parseBackup(
      JSON.parse(
        JSON.stringify(
          appData({
            incomes: [income({ id: "a" }), income({ id: "b" })],
            expenses: [expense({ id: "e" })],
            trips: [trip({ id: "t" })],
          }),
        ),
      ),
    )!;
    expect(planRestore(here, file)).toEqual({ incomes: 1, expenses: 1, trips: 1, total: 3 });
    const restored = applyRestore(here, file);
    expect(restored.trips.map((x) => x.id)).toEqual(["t"]);
    expect(restored.incomes.map((x) => x.id)).toEqual(["a", "b"]);
  });

  it("does not overwrite an existing record with the backup's copy", () => {
    const here = appData({ incomes: [income({ id: "a", amount: 300 })] });
    const file = parseBackup(appData({ incomes: [income({ id: "a", amount: 1 })] }))!;
    expect(applyRestore(here, file).incomes[0].amount).toBe(300);
  });

  it("accepts old backups without trips", () => {
    const b = parseBackup({ incomes: [], expenses: [], settings: {} });
    expect(b?.trips).toEqual([]);
  });
});
