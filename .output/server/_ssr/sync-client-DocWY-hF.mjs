import { r as reactExports } from "../_libs/react.mjs";
import { ay as mergeWithMeta, az as sameContent, aA as load, aB as save } from "./router-DjatMlVs.mjs";
import "../_libs/sonner.mjs";
import "../_libs/react-dom.mjs";

import "../_libs/tanstack__react-router.mjs";
import "../_libs/tanstack__router-core.mjs";
import "../_libs/tanstack__history.mjs";
import "../_libs/seroval.mjs";
import "../_libs/unenv.mjs";


import "../_libs/cookie-es.mjs";
import "../_libs/seroval-plugins.mjs";

import "../_libs/isbot.mjs";
import "../_libs/clsx.mjs";
import "../_libs/tailwind-merge.mjs";
import "../_libs/radix-ui__react-slot.mjs";
import "../_libs/radix-ui__react-compose-refs.mjs";
import "../_libs/class-variance-authority.mjs";
import "../_libs/lucide-react.mjs";
const getSupabase = () => import("./client-y8DRiWCN.mjs").then((m) => m.supabase);
async function fetchCloudData(userId) {
  const supabase = await getSupabase();
  const { data, error } = await supabase.from("app_state").select("data, updated_at").eq("user_id", userId).maybeSingle();
  if (error) return { status: "error" };
  if (!data) return { status: "empty" };
  return { status: "ok", data: data.data ?? {}, version: data.updated_at };
}
async function writeCloudData(userId, data, expectedVersion) {
  const supabase = await getSupabase();
  const updated_at = (/* @__PURE__ */ new Date()).toISOString();
  if (expectedVersion === null) {
    const { data: row, error: error2 } = await supabase.from("app_state").insert({ user_id: userId, data, updated_at }).select("updated_at").maybeSingle();
    if (error2) return error2.code === "23505" ? { status: "conflict" } : { status: "error" };
    return { status: "ok", version: row?.updated_at ?? updated_at };
  }
  const { data: rows, error } = await supabase.from("app_state").update({ data, updated_at }).eq("user_id", userId).eq("updated_at", expectedVersion).select("updated_at");
  if (error) return { status: "error" };
  if (!rows || rows.length === 0) return { status: "conflict" };
  return { status: "ok", version: rows[0].updated_at };
}
const MAX_ROUNDS = 4;
const RETRY_DELAYS_MS = [5e3, 15e3, 6e4];
function createSyncEngine(backend, io) {
  let userId = null;
  let version;
  let dirty = false;
  let running = null;
  let pushTimer;
  let retryTimer;
  let retryCount = 0;
  let state = { status: "off" };
  const listeners = /* @__PURE__ */ new Set();
  const setState = (next) => {
    state = next;
    listeners.forEach((l) => l());
  };
  const clearTimers = () => {
    if (pushTimer) clearTimeout(pushTimer);
    if (retryTimer) clearTimeout(retryTimer);
    pushTimer = retryTimer = void 0;
  };
  const scheduleRetry = () => {
    if (retryTimer || !userId) return;
    const delay = RETRY_DELAYS_MS[Math.min(retryCount, RETRY_DELAYS_MS.length - 1)];
    retryCount++;
    retryTimer = setTimeout(() => {
      retryTimer = void 0;
      void syncNow();
    }, delay);
  };
  async function run(uid) {
    setState({ ...state, status: "syncing" });
    for (let round = 0; round < MAX_ROUNDS; round++) {
      dirty = false;
      if (version === void 0) {
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
        version = void 0;
        continue;
      }
      if (res.status === "error") return fail();
      version = res.version;
      if (dirty) continue;
      retryCount = 0;
      setState({ status: "synced", lastSyncedAt: Date.now() });
      return "synced";
    }
    version = void 0;
    return fail();
  }
  function fail() {
    setState({ ...state, status: "pending" });
    scheduleRetry();
    return "pending";
  }
  function syncNow() {
    if (!userId) return Promise.resolve("off");
    if (running) {
      dirty = true;
      return running;
    }
    if (pushTimer) clearTimeout(pushTimer);
    pushTimer = void 0;
    const uid = userId;
    running = run(uid).finally(() => {
      running = null;
    });
    return running;
  }
  return {
    getState: () => state,
    subscribe(listener) {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
    /** Sign-in / sign-out / account switch. */
    setUser(id) {
      if (id === userId) return;
      clearTimers();
      userId = id;
      version = void 0;
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
    }
  };
}
let engine = null;
function getSyncEngine() {
  engine ??= createSyncEngine(
    { read: fetchCloudData, write: writeCloudData },
    { load, save: (d) => save(d, { fromCloud: true }) }
  );
  return engine;
}
const OFF = { status: "off" };
function useSyncState() {
  return reactExports.useSyncExternalStore(
    (cb) => getSyncEngine().subscribe(cb),
    () => getSyncEngine().getState(),
    () => OFF
  );
}
export {
  getSyncEngine,
  useSyncState
};
