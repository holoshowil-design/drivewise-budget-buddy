import { supabase } from "@/integrations/supabase/client";
import type { AppData } from "./store";
import { mergeWithMeta } from "./sync-meta";

/**
 * Merge two blobs: per record the newer change wins, deletions are kept as
 * tombstones, and settings/vehicle come from the side changed last.
 */
export function mergeAppData(local: AppData, remote: AppData): AppData {
  return mergeWithMeta(local, remote);
}

/** Result of reading the cloud row. "error" must never be treated as "empty". */
export type CloudRead =
  { status: "ok"; data: AppData; version: string } | { status: "empty" } | { status: "error" };

/** Result of a conditional write. "conflict" = someone else wrote since we read. */
export type CloudWrite =
  { status: "ok"; version: string } | { status: "conflict" } | { status: "error" };

export async function fetchCloudData(userId: string): Promise<CloudRead> {
  const { data, error } = await supabase
    .from("app_state")
    .select("data, updated_at")
    .eq("user_id", userId)
    .maybeSingle();
  if (error) return { status: "error" };
  if (!data) return { status: "empty" };
  return { status: "ok", data: (data.data ?? {}) as AppData, version: data.updated_at };
}

/**
 * Writes only if the row still has the `updated_at` we last read
 * (`expectedVersion`), or inserts when we last saw no row (`null`).
 */
export async function writeCloudData(
  userId: string,
  data: AppData,
  expectedVersion: string | null,
): Promise<CloudWrite> {
  const updated_at = new Date().toISOString();
  if (expectedVersion === null) {
    const { data: row, error } = await supabase
      .from("app_state")
      .insert({ user_id: userId, data: data as never, updated_at })
      .select("updated_at")
      .maybeSingle();
    if (error) return error.code === "23505" ? { status: "conflict" } : { status: "error" };
    return { status: "ok", version: row?.updated_at ?? updated_at };
  }
  const { data: rows, error } = await supabase
    .from("app_state")
    .update({ data: data as never, updated_at })
    .eq("user_id", userId)
    .eq("updated_at", expectedVersion)
    .select("updated_at");
  if (error) return { status: "error" };
  if (!rows || rows.length === 0) return { status: "conflict" };
  return { status: "ok", version: rows[0].updated_at };
}
