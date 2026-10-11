import { useSyncExternalStore } from "react";
import { fetchCloudData, writeCloudData } from "./cloud";
import { load, save } from "./store";
import { createSyncEngine, type SyncEngine, type SyncState } from "./sync";

let engine: SyncEngine | null = null;

/** The app-wide sync engine, wired to Supabase and localStorage. */
export function getSyncEngine() {
  engine ??= createSyncEngine(
    { read: fetchCloudData, write: writeCloudData },
    { load, save: (d) => save(d, { fromCloud: true }) },
  );
  return engine;
}

const OFF: SyncState = { status: "off" };

/** Live sync status for the UI ("נשמר לפני 2 דק׳" / "ממתין לסנכרון"). */
export function useSyncState(): SyncState {
  return useSyncExternalStore(
    (cb) => getSyncEngine().subscribe(cb),
    () => getSyncEngine().getState(),
    () => OFF,
  );
}
