import type { AppData } from "./store";
import type { CloudRead, CloudWrite } from "./cloud";
import { mergeWithMeta, sameContent } from "./sync-meta";

export type SyncStatus = "off" | "syncing" | "synced" | "pending";
export type SyncState = { status: SyncStatus; lastSyncedAt?: number };

export type SyncBackend = {
  read(userId: string): Promise<CloudRead>;
  write(userId: string, data: AppData, expectedVersion: string | null): Promise<CloudWrite>;
};

export type LocalIO = {
  load(): AppData;
  /** Persist data that came from the cloud (must not trigger another push). */
  save(data: AppData): void;
};

const MAX_ROUNDS = 4;
const RETRY_DELAYS_MS = [5_000, 15_000, 60_000];

/**
 * Keeps the local copy and the single cloud row in sync without ever
 * overwriting the cloud blindly:
 * - a failed read is never mistaken for "no cloud data", so nothing is pushed;
 * - writes are conditional on the cloud `updated_at` we last saw; if someone
 *   else wrote in between, we read again, merge, and retry;
 * - failures leave the state "pending" and retry later / when back online.
 */
export function createSyncEngine(backend: SyncBackend, io: LocalIO) {
  let userId: string | null = null;
  /** Cloud `updated_at` we last saw. `undefined` = unknown, `null` = no row. */
  let version: string | null | undefined;
  let dirty = false;
  let running: Promise<SyncStatus> | null = null;
  let pushTimer: ReturnType<typeof setTimeout> | undefined;
  let retryTimer: ReturnType<typeof setTimeout> | undefined;
  let retryCount = 0;
  let state: SyncState = { status: "off" };
  const listeners = new Set<() => void>();

  const setState = (next: SyncState) => {
    state = next;
    listeners.forEach((l) => l());
  };

  const clearTimers = () => {
    if (pushTimer) clearTimeout(pushTimer);
    if (retryTimer) clearTimeout(retryTimer);
    pushTimer = retryTimer = undefined;
  };

  const scheduleRetry = () => {
    if (retryTimer || !userId) return;
    const delay = RETRY_DELAYS_MS[Math.min(retryCount, RETRY_DELAYS_MS.length - 1)];
    retryCount++;
    retryTimer = setTimeout(() => {
      retryTimer = undefined;
      void syncNow();
    }, delay);
  };

  async function run(uid: string): Promise<SyncStatus> {
    setState({ ...state, status: "syncing" });
    for (let round = 0; round < MAX_ROUNDS; round++) {
      dirty = false;
      if (version === undefined) {
        const remote = await backend.read(uid);
        if (uid !== userId) return "off";
        if (remote.status === "error") return fail();
        if (remote.status === "ok") {
          const local = io.load();
          const merged = mergeWithMeta(local, remote.data);
          if (!sameContent(merged, local)) io.save(merged);
          version = remote.version;
        } else {
          version = null;
        }
      }
      const res = await backend.write(uid, io.load(), version);
      if (uid !== userId) return "off";
      if (res.status === "conflict") {
        version = undefined;
        continue;
      }
      if (res.status === "error") return fail();
      version = res.version;
      if (dirty) continue;
      retryCount = 0;
      setState({ status: "synced", lastSyncedAt: Date.now() });
      return "synced";
    }
    version = undefined;
    return fail();
  }

  function fail(): SyncStatus {
    setState({ ...state, status: "pending" });
    scheduleRetry();
    return "pending";
  }

  /** Reads, merges and writes now. Concurrent calls coalesce into one more round. */
  function syncNow(): Promise<SyncStatus> {
    if (!userId) return Promise.resolve("off");
    if (running) {
      dirty = true;
      return running;
    }
    if (pushTimer) clearTimeout(pushTimer);
    pushTimer = undefined;
    const uid = userId;
    running = run(uid).finally(() => {
      running = null;
    });
    return running;
  }

  return {
    getState: () => state,
    subscribe(listener: () => void) {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
    /** Sign-in / sign-out / account switch. */
    setUser(id: string | null) {
      if (id === userId) return;
      clearTimers();
      userId = id;
      version = undefined;
      retryCount = 0;
      if (!id) {
        setState({ status: "off" });
        return;
      }
      void syncNow();
    },
    syncNow,
    /** A local change happened: push shortly (debounced). */
    notifyLocalChange(delayMs = 600) {
      if (!userId) return;
      if (running) dirty = true;
      setState({ ...state, status: "pending" });
      if (pushTimer) clearTimeout(pushTimer);
      pushTimer = setTimeout(() => void syncNow(), delayMs);
    },
    /** App going to background / back online: push pending changes right away. */
    flush() {
      if (!userId) return;
      if (pushTimer || retryTimer || state.status === "pending") {
        clearTimers();
        void syncNow();
      }
    },
  };
}

export type SyncEngine = ReturnType<typeof createSyncEngine>;
