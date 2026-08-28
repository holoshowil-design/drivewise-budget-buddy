import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable/index";
import { useAuthUser } from "@/hooks/use-auth";
import { PageHeader } from "@/components/PageHeader";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { CloudCheck } from "lucide-react";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "התחברות - דרייבר" },
      { name: "description", content: "התחבר כדי לשמור את ההכנסות וההוצאות שלך בענן." },
      { property: "og:title", content: "התחברות - דרייבר" },
      { property: "og:description", content: "התחבר כדי לשמור את ההכנסות וההוצאות שלך בענן." },
    ],
  }),
  component: AuthPage,
});

function AuthPage() {
  const { user, loading } = useAuthUser();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!loading && user) navigate({ to: "/" });
  }, [loading, user, navigate]);

  const submit = async () => {
    setBusy(true);
    try {
      if (mode === "signup") {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: { emailRedirectTo: window.location.origin },
        });
        if (error) throw error;
        toast.success("נשלח אליך מייל אישור. אשר אותו כדי להיכנס.");
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        toast.success("התחברת בהצלחה");
      }
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "שגיאה בהתחברות");
    } finally {
      setBusy(false);
    }
  };

  const google = async () => {
    const result = await lovable.auth.signInWithOAuth("google", {
      redirect_uri: window.location.origin,
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
        <Card>
          <CardContent className="p-4 space-y-3">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <CloudCheck className="h-4 w-4 text-primary" />
              אחרי התחברות כל הנתונים שכבר הזנת בטלפון הזה יעלו אוטומטית לענן.
            </div>

            <Button variant="outline" className="w-full" onClick={google}>
              המשך עם Google
            </Button>

            <div className="text-center text-xs text-muted-foreground">או</div>

            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">אימייל</Label>
              <Input type="email" dir="ltr" value={email} onChange={(e) => setEmail(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">סיסמה</Label>
              <Input type="password" dir="ltr" value={password} onChange={(e) => setPassword(e.target.value)} />
            </div>
            <Button className="w-full" disabled={busy || !email || !password} onClick={submit}>
              {mode === "signin" ? "התחבר" : "הרשמה"}
            </Button>
            <button
              className="w-full text-xs text-muted-foreground underline"
              onClick={() => setMode(mode === "signin" ? "signup" : "signin")}
            >
              {mode === "signin" ? "אין לי חשבון — הרשמה" : "יש לי חשבון — התחברות"}
            </button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
