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

  it.fails(
    "a record deleted on this device does not come back from the cloud (review bug 1)",
    () => {
      const a = income({ id: "a" });
      const cloud = appData({ incomes: [a] });
      uninstall = installBrowser(cloud);
      appDataApi().removeIncome("a");
      const merged = mergeAppData(load(), cloud);
      expect(visible(merged.incomes).map((x) => x.id)).not.toContain("a");
    },
  );
});
