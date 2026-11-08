import { r as reactExports, j as jsxRuntimeExports } from "../_libs/react.mjs";
import { d as useNavigate } from "../_libs/tanstack__react-router.mjs";
import { i as useAuthUser, B as Button, x as isNativeApp, E as appCanReceiveLogin, F as startAppGoogleLogin } from "./router-DjatMlVs.mjs";
import { P as PageHeader } from "./PageHeader-C60dZNKN.mjs";
import { C as Card, a as CardContent } from "./MovieStage-BBwosCG9.mjs";
import { L as Label, I as Input } from "./label-BSJvlS_H.mjs";
import { t as toast } from "../_libs/sonner.mjs";
import { l as loadLastAccount } from "./last-account-KZyt_Mli.mjs";
import { a as authErrorMessage } from "./auth-messages-DgpJVAGF.mjs";
import "../_libs/react-dom.mjs";
import { e as CloudCheck } from "../_libs/lucide-react.mjs";

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
import "../_libs/radix-ui__react-label.mjs";
import "../_libs/radix-ui__react-primitive.mjs";
const getSupabase = () => import("./client-y8DRiWCN.mjs").then((m) => m.supabase);
function AuthPage() {
  const {
    user,
    loading
  } = useAuthUser();
  const navigate = useNavigate();
  const [email, setEmail] = reactExports.useState("");
  const [password, setPassword] = reactExports.useState("");
  const [mode, setMode] = reactExports.useState("signin");
  const [recovery, setRecovery] = reactExports.useState(false);
  const [newPassword, setNewPassword] = reactExports.useState("");
  const [busy, setBusy] = reactExports.useState(false);
  const [last, setLast] = reactExports.useState(null);
  reactExports.useEffect(() => {
    const l = loadLastAccount();
    setLast(l);
    if (l?.email && l.provider !== "google") setEmail(l.email);
  }, []);
  reactExports.useEffect(() => {
    if (typeof window !== "undefined" && window.location.hash.includes("type=recovery")) setRecovery(true);
    let unsubscribe;
    void getSupabase().then((supabase) => {
      const {
        data: sub
      } = supabase.auth.onAuthStateChange((event) => {
        if (event === "PASSWORD_RECOVERY") setRecovery(true);
      });
      unsubscribe = () => sub.subscription.unsubscribe();
    });
    return () => unsubscribe?.();
  }, []);
  reactExports.useEffect(() => {
    if (!loading && user && !recovery) navigate({
      to: "/"
    });
  }, [loading, user, recovery, navigate]);
  const saveNewPassword = async () => {
    setBusy(true);
    const supabase = await getSupabase();
    const {
      error
    } = await supabase.auth.updateUser({
      password: newPassword
    });
    setBusy(false);
    if (error) return void toast.error(authErrorMessage(error.message));
    toast.success("הסיסמה עודכנה. אפשר להתחבר איתה גם באפליקציה.");
    setRecovery(false);
    navigate({
      to: "/"
    });
  };
  const submit = async () => {
    setBusy(true);
    const supabase = await getSupabase();
    try {
      if (mode === "reset") {
        const {
          error
        } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: `${window.location.origin}/auth`
        });
        if (error) throw error;
        toast.success("אם יש חשבון עם המייל הזה, נשלח אליו קישור לסיסמה חדשה. בדוק גם בספאם.", {
          duration: 1e4
        });
        setMode("signin");
      } else if (mode === "signup") {
        const {
          data,
          error
        } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: window.location.origin
          }
        });
        if (error) throw error;
        if (data.user && (data.user.identities?.length ?? 0) === 0) {
          toast.error("כבר יש חשבון עם המייל הזה, ולכן לא נשלח מייל. אם נכנסת עם Google: היכנס בדפדפן ← הגדרות ← 'סיסמה לכניסה מהאפליקציה'. אחרת לחץ 'שכחתי סיסמה'.", {
            duration: 15e3
          });
          setMode("signin");
          return;
        }
        toast.success("נשלח אליך מייל אישור. אשר אותו כדי להיכנס (בדוק גם בספאם).", {
          duration: 1e4
        });
      } else {
        const {
          error
        } = await supabase.auth.signInWithPassword({
          email,
          password
        });
        if (error) throw error;
        toast.success("התחברת בהצלחה");
      }
    } catch (e) {
      toast.error(authErrorMessage(e instanceof Error ? e.message : void 0), {
        duration: 1e4
      });
    } finally {
      setBusy(false);
    }
  };
  const google = async () => {
    if (isNativeApp()) {
      const hint = last?.provider === "google" ? last.email : void 0;
      if (!appCanReceiveLogin() || !await startAppGoogleLogin(hint)) {
        toast.error("כדי להתחבר עם Google צריך להתקין את הגרסה החדשה של האפליקציה. בינתיים: אימייל וסיסמה.", {
          duration: 1e4
        });
      }
      return;
    }
    const {
      lovable
    } = await import("./index-Dfu6c2g4.mjs");
    const result = await lovable.auth.signInWithOAuth("google", {
      redirect_uri: window.location.origin,
      ...last?.provider === "google" && last.email ? {
        extraParams: {
          login_hint: last.email
        }
      } : {}
    });
    if (result.error) {
      toast.error("לא הצלחתי להתחבר עם גוגל");
      return;
    }
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mx-auto max-w-xl", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(PageHeader, { title: "חשבון", subtitle: "שמירה בענן — הנתונים לא ילכו לאיבוד" }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "px-4 space-y-4", children: [
      recovery && /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { className: "p-4 space-y-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "font-semibold", children: "סיסמה חדשה" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "new-password", className: "text-xs text-muted-foreground", children: "סיסמה חדשה (לפחות 6 תווים)" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { id: "new-password", type: "password", dir: "ltr", autoComplete: "new-password", value: newPassword, onChange: (e) => setNewPassword(e.target.value) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { className: "w-full", disabled: busy || newPassword.length < 6, onClick: saveNewPassword, children: "שמור סיסמה" })
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { className: "p-4 space-y-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 text-sm text-muted-foreground", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(CloudCheck, { className: "h-4 w-4 text-primary" }),
          "אחרי התחברות כל הנתונים שכבר הזנת בטלפון הזה יעלו אוטומטית לענן."
        ] }),
        last && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3 rounded-xl border bg-muted/40 p-3", children: [
          last.avatar ? /* @__PURE__ */ jsxRuntimeExports.jsx("img", { src: last.avatar, alt: last.name || "תמונת פרופיל", className: "h-10 w-10 rounded-full object-cover" }) : /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-sm font-bold text-primary", children: (last.name || last.email).slice(0, 1).toUpperCase() }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-w-0 flex-1", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs text-muted-foreground", children: "התחברת כאן לאחרונה עם" }),
            last.name && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "truncate text-sm font-semibold", children: last.name }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { dir: "ltr", className: "truncate text-right text-xs text-muted-foreground", children: last.email })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", className: "w-full", onClick: google, children: last?.provider === "google" ? `המשך כ־${last.email}` : "המשך עם Google" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-center text-xs text-muted-foreground", children: "או" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-xs text-muted-foreground", children: "אימייל" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "email", dir: "ltr", value: email, onChange: (e) => setEmail(e.target.value) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
          mode !== "reset" && /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-xs text-muted-foreground", children: "סיסמה" }),
          mode !== "reset" && /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "password", dir: "ltr", value: password, onChange: (e) => setPassword(e.target.value) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { className: "w-full", disabled: busy || !email || mode !== "reset" && !password, onClick: submit, children: mode === "signin" ? "התחבר" : mode === "signup" ? "הרשמה" : "שלח קישור לסיסמה חדשה" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("button", { className: "w-full text-xs text-muted-foreground underline", onClick: () => setMode(mode === "signin" ? "signup" : "signin"), children: mode === "signin" ? "אין לי חשבון — הרשמה" : "יש לי חשבון — התחברות" }),
        mode === "signin" && /* @__PURE__ */ jsxRuntimeExports.jsx("button", { className: "w-full text-xs text-muted-foreground underline", onClick: () => setMode("reset"), children: "שכחתי סיסמה" })
      ] }) })
    ] })
  ] });
}
export {
  AuthPage as component
};
