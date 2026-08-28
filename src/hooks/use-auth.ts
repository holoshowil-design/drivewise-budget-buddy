import { useEffect, useState } from "react";
import type { User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { load, save, setSyncUser, type AppData } from "@/lib/store";

export function useAuthUser() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setUser(data.session?.user ?? null);
      setLoading(false);
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_e, session) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  return { user, loading };
}

/** Mount once at the root: keeps the local data and the cloud copy in sync. */
export function useCloudSync() {
  useEffect(() => {
    let cancelled = false;

    const sync = async (userId: string | null) => {
      setSyncUser(userId);
      if (!userId) return;
      const { fetchCloudData, pushCloudData, mergeAppData } = await import("@/lib/cloud");
      const local = load();
      const remote = await fetchCloudData(userId);
      if (cancelled) return;
      const merged: AppData = remote ? mergeAppData(local, remote) : local;
      save(merged);
      try {
        await pushCloudData(userId, merged);
      } catch {
        /* retried on next change */
      }
    };

    supabase.auth.getSession().then(({ data }) => void sync(data.session?.user?.id ?? null));
    const { data: sub } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "TOKEN_REFRESHED") return;
      void sync(session?.user?.id ?? null);
    });

    return () => {
      cancelled = true;
      sub.subscription.unsubscribe();
    };
  }, []);
}
