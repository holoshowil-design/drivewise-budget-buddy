import { r as reactExports, j as jsxRuntimeExports } from "../_libs/react.mjs";
import { d as useNavigate } from "../_libs/tanstack__react-router.mjs";
import { t as toast } from "../_libs/sonner.mjs";
import { P as PageHeader } from "./PageHeader-C60dZNKN.mjs";
import { C as Card, a as CardContent } from "./MovieStage-BBwosCG9.mjs";
import { x as isNativeApp, y as takeAppNonce, T as TAB_NONCE_KEY, z as forgetTabSession, D as appReturnLink, B as Button } from "./router-DjatMlVs.mjs";
import "../_libs/react-dom.mjs";

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
function AppLoginPage() {
  const [state, setState] = reactExports.useState({
    kind: "working"
  });
  const navigate = useNavigate();
  const ran = reactExports.useRef(false);
  reactExports.useEffect(() => {
    if (ran.current) return;
    ran.current = true;
    if (isNativeApp()) void receiveInApp();
    else void runInTab();
    async function receiveInApp() {
      const hash = new URLSearchParams(window.location.hash.slice(1));
      window.history.replaceState(null, "", "/app-login");
      const t = hash.get("t");
      const r = hash.get("r");
      if (!t || !r || !takeAppNonce(hash.get("n"))) {
        setState({
          kind: "error",
          message: "ההתחברות לא הושלמה. נסו שוב מדף החשבון."
        });
        return;
      }
      const supabase = await getSupabase();
      const {
        error
      } = await supabase.auth.setSession({
        access_token: t,
        refresh_token: r
      });
      if (error) {
        setState({
          kind: "error",
          message: "ההתחברות לא הושלמה. נסו שוב מדף החשבון."
        });
        return;
      }
      toast.success("התחברת בהצלחה");
      navigate({
        to: "/",
        replace: true
      });
    }
    async function runInTab() {
      const params = new URLSearchParams(window.location.search);
      const start = params.get("n");
      if (start) {
        try {
          sessionStorage.setItem(TAB_NONCE_KEY, start);
        } catch {
          setState({
            kind: "error",
            message: "הדפדפן חוסם שמירה. נסו שוב."
          });
          return;
        }
        const hint = params.get("h");
        const {
          lovable
        } = await import("./index-Dfu6c2g4.mjs");
        const result = await lovable.auth.signInWithOAuth("google", {
          redirect_uri: `${window.location.origin}/app-login`,
          ...hint ? {
            extraParams: {
              login_hint: hint
            }
          } : {}
        });
        if (result.error) setState({
          kind: "error",
          message: "לא הצלחתי להתחבר עם גוגל."
        });
        return;
      }
      let nonce = null;
      try {
        nonce = sessionStorage.getItem(TAB_NONCE_KEY);
      } catch {
      }
      if (!nonce) {
        setState({
          kind: "error",
          message: "פתחו את ההתחברות מתוך האפליקציה."
        });
        return;
      }
      const supabase = await getSupabase();
      const {
        data
      } = await supabase.auth.getSession();
      const session = data.session;
      if (!session) {
        setState({
          kind: "error",
          message: "ההתחברות עם גוגל לא הושלמה. חזרו לאפליקציה ונסו שוב."
        });
        return;
      }
      supabase.auth.stopAutoRefresh();
      forgetTabSession();
      try {
        sessionStorage.removeItem(TAB_NONCE_KEY);
      } catch {
      }
      const link = appReturnLink(session.access_token, session.refresh_token, nonce);
      setState({
        kind: "back",
        link
      });
      window.location.href = link;
    }
  }, [navigate]);
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mx-auto max-w-xl", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(PageHeader, { title: "התחברות", subtitle: "התחברות עם Google לאפליקציה" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "px-4", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { className: "space-y-3 p-4 text-center", children: [
      state.kind === "working" && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm", children: "רגע, מתחבר…" }),
      state.kind === "back" && /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm", children: "התחברת. חוזרים לאפליקציה." }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { asChild: true, className: "w-full", children: /* @__PURE__ */ jsxRuntimeExports.jsx("a", { href: state.link, children: "חזרה לאפליקציה" }) })
      ] }),
      state.kind === "error" && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-destructive", children: state.message })
    ] }) }) })
  ] });
}
export {
  AppLoginPage as component
};
