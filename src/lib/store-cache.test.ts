import { afterEach, describe, expect, it } from "vitest";
import { load, save } from "@/lib/store";
import { daysOf } from "@/lib/calc";
import { appData, income, installBrowser } from "@/test/fixtures";

let uninstall: (() => void) | undefined;
afterEach(() => {
  uninstall?.();
  uninstall = undefined;
});

describe("shared parsed data", () => {
  it("parses the stored text once and hands every reader the same object", () => {
    uninstall = installBrowser(appData({ incomes: [income({ id: "a" })] }));
    const first = load();
    expect(load()).toBe(first);
    expect(daysOf(load())).toBe(daysOf(first));
  });

  it("reads again after a change", () => {
    uninstall = installBrowser(appData({ incomes: [income({ id: "a" })] }));
    const before = load();
    save({ ...before, incomes: [...before.incomes, income({ id: "b" })] });
    const after = load();
    expect(after).not.toBe(before);
    expect(after.incomes.map((i) => i.id)).toEqual(["a", "b"]);
    expect(before.incomes).toHaveLength(1);
  });
});
