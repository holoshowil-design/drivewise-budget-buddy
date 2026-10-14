import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useAuthUser } from "@/hooks/use-auth";

const getSupabase = () => import("@/integrations/supabase/client").then((m) => m.supabase);
import { PageHeader } from "@/components/PageHeader";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { CloudCheck } from "lucide-react";
import { loadLastAccount, type LastAccount } from "@/lib/last-account";
import { authErrorMessage } from "@/lib/auth-messages";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "התחברות - דרייבר" },
      { name: "description", content: "התחבר כדי לשמור את ההכנסות וההוצאות שלך בענן." },
      { property: "og:title", content: "התחברות - דרייבר" },
      { property: "og:description", content: "התחבר כדי לשמור את ההכנסות וההוצאות שלך בענן." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: AuthPage,
});

function AuthPage() {
  const { user, loading } = useAuthUser();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [mode, setMode] = useState<"signin" | "signup" | "reset">("signin");
  /** Opened from a password-reset email: show the "new password" form. */
  const [recovery, setRecovery] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [last, setLast] = useState<LastAccount | null>(null);

  useEffect(() => {
    const l = loadLastAccount();
    setLast(l);
    if (l?.email && l.provider !== "google") setEmail(l.email);
  }, []);

  useEffect(() => {
    if (typeof window !== "undefined" && window.location.hash.includes("type=recovery"))
      setRecovery(true);
    let unsubscribe: (() => void) | undefined;
    void getSupabase().then((supabase) => {
      const { data: sub } = supabase.auth.onAuthStateChange((event) => {
        if (event === "PASSWORD_RECOVERY") setRecovery(true);
      });
      unsubscribe = () => sub.subscription.unsubscribe();
    });
    return () => unsubscribe?.();
  }, []);

  useEffect(() => {
    if (!loading && user && !recovery) navigate({ to: "/" });
  }, [loading, user, recovery, navigate]);

  const saveNewPassword = async () => {
    setBusy(true);
    const supabase = await getSupabase();
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    setBusy(false);
    if (error) return void toast.error(authErrorMessage(error.message));
    toast.success("הסיסמה עודכנה. אפשר להתחבר איתה גם באפליקציה.");
    setRecovery(false);
    navigate({ to: "/" });
  };

  const submit = async () => {
    setBusy(true);
    const supabase = await getSupabase();
    try {
      if (mode === "reset") {
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: `${window.location.origin}/auth`,
        });
        if (error) throw error;
        toast.success("אם יש חשבון עם המייל הזה, נשלח אליו קישור לסיסמה חדשה. בדוק גם בספאם.", {
          duration: 10000,
        });
        setMode("signin");
      } else if (mode === "signup") {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: { emailRedirectTo: window.location.origin },
        });
        if (error) throw error;
        // An existing account gets no email and no error (the server hides it):
        // it comes back with no identities.
        if (data.user && (data.user.identities?.length ?? 0) === 0) {
          toast.error(
            "כבר יש חשבון עם המייל הזה, ולכן לא נשלח מייל. אם נכנסת עם Google: היכנס בדפדפן ← הגדרות ← 'סיסמה לכניסה מהאפליקציה'. אחרת לחץ 'שכחתי סיסמה'.",
            { duration: 15000 },
          );
          setMode("signin");
          return;
        }
        toast.success("נשלח אליך מייל אישור. אשר אותו כדי להיכנס (בדוק גם בספאם).", {
          duration: 10000,
        });
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        toast.success("התחברת בהצלחה");
      }
    } catch (e) {
      toast.error(authErrorMessage(e instanceof Error ? e.message : undefined), {
        duration: 10000,
      });
    } finally {
      setBusy(false);
    }
  };

  const google = async () => {
    const { lovable } = await import("@/integrations/lovable/index");
    const result = await lovable.auth.signInWithOAuth("google", {
      redirect_uri: window.location.origin,
      ...(last?.provider === "google" && last.email
        ? { extraParams: { login_hint: last.email } }
        : {}),
    });
    if (result.error) {
      toast.error("לא הצלחתי להתחבר עם גוגל");
      return;
    }
  };

  return (
    <div className="mx-auto max-w-xl">
      <PageHeader title="חשבון" subtitle="שמירה בענן — הנתונים לא ילכו לאיבוד" />
      <div className="px-4 space-y-4">
        {recovery && (
          <Card>
            <CardContent className="p-4 space-y-3">
              <h3 className="font-semibold">סיסמה חדשה</h3>
              <div className="space-y-1.5">
                <Label htmlFor="new-password" className="text-xs text-muted-foreground">
                  סיסמה חדשה (לפחות 6 תווים)
                </Label>
                <Input
                  id="new-password"
                  type="password"
                  dir="ltr"
                  autoComplete="new-password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                />
              </div>
              <Button
                className="w-full"
                disabled={busy || newPassword.length < 6}
                onClick={saveNewPassword}
              >
                שמור סיסמה
              </Button>
            </CardContent>
          </Card>
        )}
        <Card>
          <CardContent className="p-4 space-y-3">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <CloudCheck className="h-4 w-4 text-primary" />
              אחרי התחברות כל הנתונים שכבר הזנת בטלפון הזה יעלו אוטומטית לענן.
            </div>

            {last && (
              <div className="flex items-center gap-3 rounded-xl border bg-muted/40 p-3">
                {last.avatar ? (
                  <img
                    src={last.avatar}
                    alt={last.name || "תמונת פרופיל"}
                    className="h-10 w-10 rounded-full object-cover"
                  />
                ) : (
                  <span className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-sm font-bold text-primary">
                    {(last.name || last.email).slice(0, 1).toUpperCase()}
                  </span>
                )}
                <div className="min-w-0 flex-1">
                  <div className="text-xs text-muted-foreground">התחברת כאן לאחרונה עם</div>
                  {last.name && <div className="truncate text-sm font-semibold">{last.name}</div>}
                  <div dir="ltr" className="truncate text-right text-xs text-muted-foreground">
                    {last.email}
                  </div>
                </div>
              </div>
            )}

            <Button variant="outline" className="w-full" onClick={google}>
              {last?.provider === "google" ? `המשך כ־${last.email}` : "המשך עם Google"}
            </Button>

            <div className="text-center text-xs text-muted-foreground">או</div>

            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">אימייל</Label>
              <Input
                type="email"
                dir="ltr"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              {mode !== "reset" && <Label className="text-xs text-muted-foreground">סיסמה</Label>}
              {mode !== "reset" && (
                <Input
                  type="password"
                  dir="ltr"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              )}
            </div>
            <Button
              className="w-full"
              disabled={busy || !email || (mode !== "reset" && !password)}
              onClick={submit}
            >
              {mode === "signin" ? "התחבר" : mode === "signup" ? "הרשמה" : "שלח קישור לסיסמה חדשה"}
            </Button>
            <button
              className="w-full text-xs text-muted-foreground underline"
              onClick={() => setMode(mode === "signin" ? "signup" : "signin")}
            >
              {mode === "signin" ? "אין לי חשבון — הרשמה" : "יש לי חשבון — התחברות"}
            </button>
            {mode === "signin" && (
              <button
                className="w-full text-xs text-muted-foreground underline"
                onClick={() => setMode("reset")}
              >
                שכחתי סיסמה
              </button>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
