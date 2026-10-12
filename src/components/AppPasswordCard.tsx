import { useState } from "react";
import { KeyRound } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { authErrorMessage } from "@/lib/auth-messages";

/**
 * Sets (or changes) a password for the signed-in account, so it can sign in
 * with email + password in the installed app — Google sign-in does not work
 * inside the app, and this needs no email at all.
 */
export function AppPasswordCard({ email }: { email: string }) {
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);

  const mismatch = confirm.length > 0 && confirm !== password;
  const tooShort = password.length > 0 && password.length < 6;

  const save = async () => {
    if (tooShort || mismatch || !password) return;
    setBusy(true);
    const { error } = await supabase.auth.updateUser({ password });
    setBusy(false);
    if (error) {
      toast.error(authErrorMessage(error.message));
      return;
    }
    setPassword("");
    setConfirm("");
    setDone(true);
    toast.success("הסיסמה נשמרה");
  };

  return (
    <div className="space-y-2 rounded-xl border p-3">
      <div className="flex items-center gap-1.5 text-sm font-semibold">
        <KeyRound className="h-4 w-4 text-primary" /> סיסמה לכניסה מהאפליקציה
      </div>
      {done ? (
        <p className="text-xs text-muted-foreground">
          מעכשיו אפשר להתחבר באפליקציה המותקנת עם{" "}
          <span dir="ltr" className="font-semibold text-foreground">
            {email}
          </span>{" "}
          והסיסמה שבחרת.
        </p>
      ) : (
        <>
          <p className="text-xs text-muted-foreground">
            באפליקציה המותקנת אין התחברות עם Google. הגדר כאן סיסמה, ושם התחבר עם המייל הזה והסיסמה.
            לא צריך מייל אישור.
          </p>
          <div className="space-y-1.5">
            <Label htmlFor="app-password" className="text-xs text-muted-foreground">
              סיסמה (לפחות 6 תווים)
            </Label>
            <Input
              id="app-password"
              type="password"
              dir="ltr"
              autoComplete="new-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            {tooShort && <p className="text-[11px] font-medium text-destructive">לפחות 6 תווים</p>}
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="app-password-confirm" className="text-xs text-muted-foreground">
              שוב, לאימות
            </Label>
            <Input
              id="app-password-confirm"
              type="password"
              dir="ltr"
              autoComplete="new-password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
            />
            {mismatch && (
              <p className="text-[11px] font-medium text-destructive">הסיסמאות לא זהות</p>
            )}
          </div>
          <Button
            className="w-full"
            variant="outline"
            disabled={busy || !password || tooShort || mismatch || confirm !== password}
            onClick={save}
          >
            {busy ? "שומר..." : "שמור סיסמה"}
          </Button>
        </>
      )}
    </div>
  );
}
