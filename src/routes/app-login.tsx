import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { PageHeader } from "@/components/PageHeader";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { isNativeApp } from "@/lib/location";
import { TAB_NONCE_KEY, appReturnLink, forgetTabSession, takeAppNonce } from "@/lib/app-login";

/**
 * Google sign-in hand-off for the installed app (see src/lib/app-login.ts).
 * In Chrome: runs the Google sign-in, then sends the session back to the app.
 * In the app: receives it and signs the app in.
 */
export const Route = createFileRoute("/app-login")({
  head: () => ({
    meta: [{ title: "התחברות לאפליקציה - דרייבר" }, { name: "robots", content: "noindex" }],
  }),
  component: AppLoginPage,
});

type State =
  { kind: "working" } | { kind: "back"; link: string } | { kind: "error"; message: string };

const getSupabase = () => import("@/integrations/supabase/client").then((m) => m.supabase);

function AppLoginPage() {
  const [state, setState] = useState<State>({ kind: "working" });
  const navigate = useNavigate();
  const ran = useRef(false);

  useEffect(() => {
    if (ran.current) return;
    ran.current = true;
    if (isNativeApp()) void receiveInApp();
    else void runInTab();

    async function receiveInApp() {
      const hash = new URLSearchParams(window.location.hash.slice(1));
      // Drop the tokens from the address right away.
      window.history.replaceState(null, "", "/app-login");
      const t = hash.get("t");
      const r = hash.get("r");
      if (!t || !r || !takeAppNonce(hash.get("n"))) {
        setState({ kind: "error", message: "ההתחברות לא הושלמה. נסו שוב מדף החשבון." });
        return;
      }
      const supabase = await getSupabase();
      const { error } = await supabase.auth.setSession({ access_token: t, refresh_token: r });
      if (error) {
        setState({ kind: "error", message: "ההתחברות לא הושלמה. נסו שוב מדף החשבון." });
        return;
      }
      toast.success("התחברת בהצלחה");
      navigate({ to: "/", replace: true });
    }

    async function runInTab() {
      const params = new URLSearchParams(window.location.search);
      const start = params.get("n");
      if (start) {
        // Opened by the app: remember its code in this tab and go to Google.
        try {
          sessionStorage.setItem(TAB_NONCE_KEY, start);
        } catch {
          setState({ kind: "error", message: "הדפדפן חוסם שמירה. נסו שוב." });
          return;
        }
        const hint = params.get("h");
        const { lovable } = await import("@/integrations/lovable/index");
        const result = await lovable.auth.signInWithOAuth("google", {
          redirect_uri: `${window.location.origin}/app-login`,
          ...(hint ? { extraParams: { login_hint: hint } } : {}),
        });
        if (result.error) setState({ kind: "error", message: "לא הצלחתי להתחבר עם גוגל." });
        return;
      }

      // Back from Google: hand the session to the app.
      let nonce: string | null = null;
      try {
        nonce = sessionStorage.getItem(TAB_NONCE_KEY);
      } catch {
        /* storage unavailable */
      }
      if (!nonce) {
        setState({ kind: "error", message: "פתחו את ההתחברות מתוך האפליקציה." });
        return;
      }
      const supabase = await getSupabase();
      const { data } = await supabase.auth.getSession();
      const session = data.session;
      if (!session) {
        setState({
          kind: "error",
          message: "ההתחברות עם גוגל לא הושלמה. חזרו לאפליקציה ונסו שוב.",
        });
        return;
      }
      supabase.auth.stopAutoRefresh();
      forgetTabSession();
      try {
        sessionStorage.removeItem(TAB_NONCE_KEY);
      } catch {
        /* storage unavailable */
      }
      const link = appReturnLink(session.access_token, session.refresh_token, nonce);
      setState({ kind: "back", link });
      // Chrome may need a tap to open the app; the button below covers that.
      window.location.href = link;
    }
  }, [navigate]);

  return (
    <div className="mx-auto max-w-xl">
      <PageHeader title="התחברות" subtitle="התחברות עם Google לאפליקציה" />
      <div className="px-4">
        <Card>
          <CardContent className="space-y-3 p-4 text-center">
            {state.kind === "working" && <p className="text-sm">רגע, מתחבר…</p>}
            {state.kind === "back" && (
              <>
                <p className="text-sm">התחברת. חוזרים לאפליקציה.</p>
                <Button asChild className="w-full">
                  <a href={state.link}>חזרה לאפליקציה</a>
                </Button>
              </>
            )}
            {state.kind === "error" && <p className="text-sm text-destructive">{state.message}</p>}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
