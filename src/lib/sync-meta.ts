import type { AppData } from "./store";

/**
 * Sync bookkeeping kept inside the existing `driver-app-v1` blob (and the
 * cloud jsonb), so no schema change is needed:
 * - every record carries `updatedAt` (ISO);
 * - deletions are kept as tombstones `{ id: deletedAt }` instead of vanishing,
 *   so a merge with an older copy cannot bring a deleted record back;
 * - settings and vehicle carry their own change stamp.
 * Tombstones live outside the record arrays so screens and calculations never
 * see deleted records.
 */
export type SyncMeta = {
  deleted: Record<string, string>;
  settingsUpdatedAt?: string;
  vehicleUpdatedAt?: string;
};

/** Stamp for data that predates sync metadata: older than any real change. */
export const EPOCH = "1970-01-01T00:00:00.000Z";
const TOMBSTONE_TTL_MS = 90 * 24 * 60 * 60 * 1000;

type Rec = { id: string; updatedAt?: string };
const COLLECTIONS = ["incomes", "expenses", "trips"] as const;

const stampOf = (x: { updatedAt?: string } | undefined) => x?.updatedAt ?? EPOCH;
const newer = (a: string, b: string) => (a >= b ? a : b);

/** Content of a record without its stamp, for change detection. */
function body(x: Rec) {
  const { updatedAt: _ignored, ...rest } = x;
  return JSON.stringify(rest);
}

function pruneTombstones(deleted: Record<string, string>, now: string) {
  const cutoff = new Date(new Date(now).getTime() - TOMBSTONE_TTL_MS).toISOString();
  const out: Record<string, string> = {};
  for (const [id, at] of Object.entries(deleted)) if (at >= cutoff) out[id] = at;
  return out;
}

/** Fills in missing metadata on data loaded from storage, the cloud or a backup. */
export function normalizeMeta(d: AppData): AppData {
  const withStamp = <T extends Rec>(list: T[] | undefined) =>
    (list ?? []).map((x) => (x.updatedAt ? x : { ...x, updatedAt: EPOCH }));
  return {
    ...d,
    incomes: withStamp(d.incomes),
    expenses: withStamp(d.expenses),
    trips: withStamp(d.trips),
    meta: { ...d.meta, deleted: { ...d.meta?.deleted } },
  };
}

/**
 * Compares the data before and after a local change and records what
 * happened: changed/new records and settings/vehicle get `now`, records that
 * disappeared get a tombstone, and a record that comes back (undo) clears its
 * tombstone.
 */
export function stampChanges(
  prev: AppData,
  next: AppData,
  now = new Date().toISOString(),
): AppData {
  const meta: SyncMeta = {
    ...(next.meta ?? prev.meta),
    deleted: { ...(next.meta ?? prev.meta)?.deleted },
  };
  const out = { ...next };
  for (const key of COLLECTIONS) {
    const before = new Map(((prev[key] ?? []) as Rec[]).map((x) => [x.id, x]));
    const after = (next[key] ?? []) as Rec[];
    const afterIds = new Set(after.map((x) => x.id));
    (out[key] as Rec[]) = after.map((x) => {
      const old = before.get(x.id);
      if (old && body(old) === body(x)) return { ...x, updatedAt: old.updatedAt ?? x.updatedAt };
      delete meta.deleted[x.id];
      return { ...x, updatedAt: now };
    });
    for (const id of before.keys()) if (!afterIds.has(id)) meta.deleted[id] = now;
  }
  if (JSON.stringify(prev.settings) !== JSON.stringify(next.settings)) meta.settingsUpdatedAt = now;
  if (JSON.stringify(prev.vehicle) !== JSON.stringify(next.vehicle)) meta.vehicleUpdatedAt = now;
  meta.deleted = pruneTombstones(meta.deleted, now);
  out.meta = meta;
  return out;
}

/**
 * Merges two copies of the data. For each record the newer `updatedAt` wins; a
 * tombstone wins over any copy that is not newer than the deletion. Settings
 * and vehicle are taken whole from the side changed last (cloud on a tie).
 */
export function mergeWithMeta(
  local: AppData,
  remote: AppData,
  now = new Date().toISOString(),
): AppData {
  const l = normalizeMeta(local);
  const r = normalizeMeta(remote);
  const deleted: Record<string, string> = { ...l.meta!.deleted };
  for (const [id, at] of Object.entries(r.meta!.deleted))
    deleted[id] = newer(deleted[id] ?? EPOCH, at);

  const mergeList = <T extends Rec>(a: T[], b: T[]) => {
    const map = new Map<string, T>();
    for (const x of [...a, ...b]) {
      const cur = map.get(x.id);
      if (!cur || stampOf(x) >= stampOf(cur)) map.set(x.id, x);
    }
    const kept: T[] = [];
    for (const x of map.values()) {
      const del = deleted[x.id];
      if (del && del >= stampOf(x)) continue;
      if (del) delete deleted[x.id];
      kept.push(x);
    }
    return kept;
  };

  const lSet = l.meta!.settingsUpdatedAt ?? EPOCH;
  const rSet = r.meta!.settingsUpdatedAt ?? EPOCH;
  const lVeh = l.meta!.vehicleUpdatedAt ?? EPOCH;
  const rVeh = r.meta!.vehicleUpdatedAt ?? EPOCH;

  return {
    incomes: mergeList(l.incomes, r.incomes),
    expenses: mergeList(l.expenses, r.expenses),
    trips: mergeList(l.trips, r.trips),
    settings: lSet > rSet ? { ...r.settings, ...l.settings } : { ...l.settings, ...r.settings },
    vehicle: lVeh > rVeh ? { ...r.vehicle, ...l.vehicle } : { ...l.vehicle, ...r.vehicle },
    meta: {
      deleted: pruneTombstones(deleted, now),
      settingsUpdatedAt: newer(lSet, rSet),
      vehicleUpdatedAt: newer(lVeh, rVeh),
    },
  };
}

export function sameContent(a: AppData, b: AppData) {
  return JSON.stringify(a) === JSON.stringify(b);
}
