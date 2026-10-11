import { afterEach, describe, expect, it, vi } from "vitest";
import { load } from "@/lib/store";
import { appData, appDataApi, income, installBrowser, trip, visible } from "@/test/fixtures";

vi.mock("@/integrations/supabase/client", () => ({ supabase: {} }));

const { mergeAppData } = await import("@/lib/cloud");

let uninstall: (() => void) | undefined;
afterEach(() => {
  uninstall?.();
  uninstall = undefined;
});

describe("sync merge", () => {
  it("unions records from both sides by id", () => {
    const a = income({ id: "a" });
    const b = income({ id: "b" });
    const t = trip({ id: "t" });
    const merged = mergeAppData(appData({ incomes: [a] }), appData({ incomes: [b], trips: [t] }));
    expect(merged.incomes.map((x) => x.id).sort()).toEqual(["a", "b"]);
    expect(merged.trips.map((x) => x.id)).toEqual(["t"]);
  });

  it("keeps a single copy of a record present on both sides", () => {
    const a = income({ id: "a" });
    const merged = mergeAppData(appData({ incomes: [a] }), appData({ incomes: [a] }));
    expect(merged.incomes).toHaveLength(1);
  });

  it("a record deleted on this device does not come back from the cloud (review bug 1)", () => {
    const a = income({ id: "a" });
    const cloud = appData({ incomes: [a] });
    uninstall = installBrowser(cloud);
    appDataApi().removeIncome("a");
    const merged = mergeAppData(load(), cloud);
    expect(visible(merged.incomes).map((x) => x.id)).not.toContain("a");
  });
});

describe("sync merge with metadata", () => {
  const at = (iso: string) => `2026-10-${iso}T10:00:00.000Z`;

  it("a deletion on another device reaches this one", () => {
    const a = income({ id: "a", updatedAt: at("01") });
    const local = appData({ incomes: [a] });
    const remote = appData({ meta: { deleted: { a: at("02") } } });
    expect(mergeAppData(local, remote).incomes).toHaveLength(0);
  });

  it("an edit made after the deletion wins (undo on another device)", () => {
    const a = income({ id: "a", updatedAt: at("03") });
    const merged = mergeAppData(
      appData({ incomes: [a] }),
      appData({ meta: { deleted: { a: at("02") } } }),
    );
    expect(merged.incomes.map((x) => x.id)).toEqual(["a"]);
    expect(merged.meta?.deleted.a).toBeUndefined();
  });

  it("the newer copy of a record wins on either side", () => {
    const older = income({ id: "a", amount: 100, updatedAt: at("01") });
    const newer = income({ id: "a", amount: 250, updatedAt: at("02") });
    expect(
      mergeAppData(appData({ incomes: [newer] }), appData({ incomes: [older] })).incomes[0].amount,
    ).toBe(250);
    expect(
      mergeAppData(appData({ incomes: [older] }), appData({ incomes: [newer] })).incomes[0].amount,
    ).toBe(250);
  });

  it("settings changed later on this device are not overwritten by the cloud", () => {
    const local = appData({ meta: { deleted: {}, settingsUpdatedAt: at("05") } });
    local.settings = { ...local.settings, dailyGoal: 800 };
    const remote = appData({ meta: { deleted: {}, settingsUpdatedAt: at("01") } });
    expect(mergeAppData(local, remote).settings.dailyGoal).toBe(800);
  });

  it("without stamps on either side the cloud settings win (old behaviour)", () => {
    const local = appData();
    local.settings = { ...local.settings, dailyGoal: 800 };
    expect(mergeAppData(local, appData()).settings.dailyGoal).toBe(500);
  });

  it("'delete all' on this device removes the records from the cloud copy too", () => {
    const a = income({ id: "a" });
    const t = trip({ id: "t" });
    const cloud = appData({ incomes: [a], trips: [t] });
    uninstall = installBrowser(cloud);
    appDataApi().update((d) => ({ ...d, incomes: [], expenses: [], trips: [] }));
    const merged = mergeAppData(cloud, load());
    expect(merged.incomes).toHaveLength(0);
    expect(merged.trips).toHaveLength(0);
  });

  it("old data without stamps loads unchanged, with initial stamps", () => {
    const legacy = appData({ incomes: [income({ id: "a", amount: 321 })] });
    uninstall = installBrowser(legacy);
    const d = load();
    expect(d.incomes[0]).toMatchObject({
      id: "a",
      amount: 321,
      updatedAt: "1970-01-01T00:00:00.000Z",
    });
    expect(d.meta?.deleted).toEqual({});
  });

  it("tombstones older than 90 days are dropped", () => {
    const merged = mergeAppData(
      appData(),
      appData({ meta: { deleted: { old: "2020-01-01T00:00:00.000Z" } } }),
    );
    expect(merged.meta?.deleted.old).toBeUndefined();
  });
});

describe("upgrade safety net", () => {
  it("keeps a copy of the old data before the first save in the new format", () => {
    const legacy = appData({ incomes: [income({ id: "a" })] });
    uninstall = installBrowser(legacy);
    appDataApi().removeIncome("a");
    expect(JSON.parse(localStorage.getItem("driver-app-v1-pre-sync-backup")!).incomes[0].id).toBe(
      "a",
    );
  });
});
