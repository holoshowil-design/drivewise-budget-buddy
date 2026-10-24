import { createMiddleware } from "@tanstack/react-start";

/**
 * Same as `attachSupabaseAuth` in src/integrations/supabase/auth-attacher.ts (the browser adds
 * the signed-in user's token to server-function calls), but the Supabase client is imported only
 * when such a call is made. A static import put the whole client into the first download of every
 * page; the app's own cloud sync already loads it after the first paint.
 */
export const attachSupabaseAuthLazy = createMiddleware({ type: "function" }).client(
  async ({ next }) => {
    const { supabase } = await import("@/integrations/supabase/client");
    const { data } = await supabase.auth.getSession();
    const token = data.session?.access_token;
    return next({
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
  },
);
