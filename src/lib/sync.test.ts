import { describe, expect, it, vi } from "vitest";
import { createSyncEngine, type SyncBackend } from "@/lib/sync";
import type { CloudRead, CloudWrite } from "@/lib/cloud";
import type { AppData } from "@/lib/store";
import { appData, income } from "@/test/fixtures";

/** In-memory stand-in for the Supabase row, with switchable failures. */
function fakeCloud(initial: AppData | null) {
  let row = initial ? { data: initial, version: "v0" } : null;
  let n = 0;
  const cloud = {
    failReads: false,
    failWrites: false,
    writes: 0,
    get data() {
      return row?.data ?? null;
    },
    /** Another device writes directly. */
    externalWrite(d: AppData) {
      row = { data: d, version: `ext${++n}` };
    },
    backend: {
      read: async (): Promise<CloudRead> => {
        if (cloud.failReads) return { status: "error" };
        return row
          ? { status: "ok", data: structuredClone(row.data), version: row.version }
          : { status: "empty" };
      },
      write: async (_u: string, d: AppData, expected: string | null): Promise<CloudWrite> => {
        if (cloud.failWrites) return { status: "error" };
        if ((row?.version ?? null) !== expected) return { status: "conflict" };
        cloud.writes++;
        row = { data: structuredClone(d), version: `v${++n}` };
        return { status: "ok", version: row.version };
      },
    } satisfies SyncBackend,
  };
  return cloud;
}

function localStore(initial: AppData) {
  let d = initial;
  return { load: () => d, save: (x: AppData) => void (d = x), set: (x: AppData) => void (d = x) };
}

describe("sync engine", () => {
  it("a failed read never overwrites the cloud", async () => {
    const cloud = fakeCloud(appData({ incomes: [income({ id: "cloud" })] }));
    cloud.failReads = true;
    const local = localStore(appData()); // empty phone
    const engine = createSyncEngine(cloud.backend, local);
    engine.setUser("u");
    expect(await engine.syncNow()).toBe("pending");
    expect(cloud.writes).toBe(0);
    expect(cloud.data?.incomes.map((x) => x.id)).toEqual(["cloud"]);
    engine.setUser(null);
  });

  it("a failed write leaves the cloud as it was and reports pending", async () => {
    const cloud = fakeCloud(appData({ incomes: [income({ id: "cloud" })] }));
    const local = localStore(appData({ incomes: [income({ id: "phone" })] }));
    const engine = createSyncEngine(cloud.backend, local);
    cloud.failWrites = true;
    engine.setUser("u");
    expect(await engine.syncNow()).toBe("pending");
    expect(engine.getState().status).toBe("pending");
    expect(cloud.data?.incomes.map((x) => x.id)).toEqual(["cloud"]);
    // Network back: the change goes through, merged.
    cloud.failWrites = false;
    expect(await engine.syncNow()).toBe("synced");
    expect(cloud.data?.incomes.map((x) => x.id).sort()).toEqual(["cloud", "phone"]);
    engine.setUser(null);
  });

  it("first sync merges cloud and phone, and saves the merge locally", async () => {
    const cloud = fakeCloud(appData({ incomes: [income({ id: "cloud" })] }));
    const local = localStore(appData({ incomes: [income({ id: "phone" })] }));
    const engine = createSyncEngine(cloud.backend, local);
    engine.setUser("u");
    await engine.syncNow();
    expect(
      local
        .load()
        .incomes.map((x) => x.id)
        .sort(),
    ).toEqual(["cloud", "phone"]);
    expect(cloud.data?.incomes.map((x) => x.id).sort()).toEqual(["cloud", "phone"]);
    engine.setUser(null);
  });

  it("a write from another device in between is merged, not overwritten", async () => {
    const cloud = fakeCloud(null);
    const local = localStore(appData({ incomes: [income({ id: "phone" })] }));
    const engine = createSyncEngine(cloud.backend, local);
    engine.setUser("u");
    await engine.syncNow();
    cloud.externalWrite(appData({ incomes: [income({ id: "phone" }), income({ id: "laptop" })] }));
    local.set(appData({ incomes: [...local.load().incomes, income({ id: "phone2" })] }));
    expect(await engine.syncNow()).toBe("synced");
    expect(cloud.data?.incomes.map((x) => x.id).sort()).toEqual(["laptop", "phone", "phone2"]);
    engine.setUser(null);
  });

  it("an empty cloud row is created from the phone", async () => {
    const cloud = fakeCloud(null);
    const engine = createSyncEngine(
      cloud.backend,
      localStore(appData({ incomes: [income({ id: "p" })] })),
    );
    engine.setUser("u");
    expect(await engine.syncNow()).toBe("synced");
    expect(cloud.data?.incomes.map((x) => x.id)).toEqual(["p"]);
    engine.setUser(null);
  });

  it("local changes are pushed after the debounce", async () => {
    vi.useFakeTimers();
    try {
      const cloud = fakeCloud(null);
      const local = localStore(appData());
      const engine = createSyncEngine(cloud.backend, local);
      engine.setUser("u");
      await vi.runAllTimersAsync();
      local.set(appData({ incomes: [income({ id: "new" })] }));
      engine.notifyLocalChange();
      expect(engine.getState().status).toBe("pending");
      await vi.advanceTimersByTimeAsync(700);
      expect(cloud.data?.incomes.map((x) => x.id)).toEqual(["new"]);
      expect(engine.getState().status).toBe("synced");
      engine.setUser(null);
    } finally {
      vi.useRealTimers();
    }
  });
});
