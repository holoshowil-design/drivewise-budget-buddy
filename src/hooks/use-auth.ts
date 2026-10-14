import { useEffect, useState } from "react";
import type { User } from "@supabase/supabase-js";
import type { SyncEngine } from "@/lib/sync";

const getSupabase = () => import("@/integrations/supabase/client").then((m) => m.supabase);

export function useAuthUser() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let unsubscribe: (() => void) | undefined;
    let cancelled = false;
    void getSupabase().then((supabase) => {
      if (cancelled) return;
      supabase.auth.getSession().then(({ data }) => {
        setUser(data.session?.user ?? null);
        setLoading(false);
      });
      const { data: sub } = supabase.auth.onAuthStateChange((_e, session) => {
        setUser(session?.user ?? null);
        setLoading(false);
      });
      unsubscribe = () => sub.subscription.unsubscribe();
    });
    return () => {
      cancelled = true;
      unsubscribe?.();
    };
  }, []);

  return { user, loading };
}

/** Mount once at the root: keeps the local data and the cloud copy in sync. */
export function useCloudSync() {
  useEffect(() => {
    let cancelled = false;
    let engine: SyncEngine | null = null;
    let pendingUser: string | null | undefined;

    const setUser = (id: string | null) => {
      if (engine) engine.setUser(id);
      else pendingUser = id;
    };
    const onLocalChange = () => engine?.notifyLocalChange();
    const onOnline = () => engine?.flush();
    const onVisibility = () => {
      if (!engine) return;
      // Leaving: push pending changes now. Returning: pick up other devices' changes.
      if (document.visibilityState === "hidden") engine.flush();
      else void engine.syncNow();
    };

    void import("@/lib/sync-client").then(({ getSyncEngine }) => {
      if (cancelled) return;
      engine = getSyncEngine();
      if (pendingUser !== undefined) engine.setUser(pendingUser);
    });

    window.addEventListener("driver-data-local-change", onLocalChange);
    window.addEventListener("online", onOnline);
    window.addEventListener("pagehide", onOnline);
    document.addEventListener("visibilitychange", onVisibility);

    let unsubscribe: (() => void) | undefined;
    void getSupabase().then((supabase) => {
      if (cancelled) return;
      supabase.auth.getSession().then(({ data }) => setUser(data.session?.user?.id ?? null));
      const { data: sub } = supabase.auth.onAuthStateChange((event, session) => {
        if (event === "TOKEN_REFRESHED") return;
        setUser(session?.user?.id ?? null);
      });
      unsubscribe = () => sub.subscription.unsubscribe();
    });

    return () => {
      cancelled = true;
      unsubscribe?.();
      window.removeEventListener("driver-data-local-change", onLocalChange);
      window.removeEventListener("online", onOnline);
      window.removeEventListener("pagehide", onOnline);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, []);
}
