import type { SyncState } from "./sync";

/** Short Hebrew status for the account chip. */
export function syncLabel(s: SyncState, now = Date.now()): string {
  if (s.status === "syncing") return "מסנכרן…";
  if (s.status === "pending") return "ממתין לסנכרון";
  if (s.status === "off" || !s.lastSyncedAt) return "מתחבר…";
  const min = Math.floor((now - s.lastSyncedAt) / 60_000);
  if (min < 1) return "נשמר עכשיו";
  if (min < 60) return `נשמר לפני ${min} דק׳`;
  const h = Math.floor(min / 60);
  return h < 24 ? `נשמר לפני ${h} שע׳` : "נשמר לפני יותר מיום";
}
