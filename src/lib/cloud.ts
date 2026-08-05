import { supabase } from "@/integrations/supabase/client";
import type { AppData } from "./store";

/** Merge two blobs: records are unioned by id, settings/vehicle prefer the remote copy. */
export function mergeAppData(local: AppData, remote: AppData): AppData {
  const byId = <T extends { id: string }>(a: T[], b: T[]) => {
    const map = new Map<string, T>();
    [...a, ...b].forEach((x) => map.set(x.id, x));
    return [...map.values()];
  };
  return {
    incomes: byId(local.incomes ?? [], remote.incomes ?? []),
    expenses: byId(local.expenses ?? [], remote.expenses ?? []),
    vehicle: { ...local.vehicle, ...remote.vehicle },
    settings: { ...local.settings, ...remote.settings },
  };
}

export async function fetchCloudData(userId: string): Promise<AppData | null> {
  const { data, error } = await supabase
    .from("app_state")
    .select("data")
    .eq("user_id", userId)
    .maybeSingle();
  if (error || !data) return null;
  return (data.data ?? null) as AppData | null;
}

export async function pushCloudData(userId: string, data: AppData) {
  const { error } = await supabase
    .from("app_state")
    .upsert(
      { user_id: userId, data: data as never, updated_at: new Date().toISOString() },
      { onConflict: "user_id" },
    );
  if (error) throw error;
}
