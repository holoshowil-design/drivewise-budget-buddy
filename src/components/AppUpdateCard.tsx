import { useEffect, useState } from "react";
import { RefreshCw, Download } from "lucide-react";
import { toast } from "sonner";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { isNativeApp } from "@/lib/location";

type Bridge = {
  Plugins?: Record<string, unknown>;
  nativePromise?: (plugin: string, method: string, options?: unknown) => Promise<unknown>;
};

type CheckResult = {
  versionCode: number;
  versionName: string;
  available: boolean;
  latestName?: string;
};

function bridge(): Bridge | null {
  const cap = (window as unknown as { Capacitor?: Bridge }).Capacitor;
  return cap?.nativePromise && cap.Plugins?.AppUpdate ? cap : null;
}

/**
 * Updates the Android app from inside it (AppUpdate plugin in drivewise-native).
 * Shown only in the installed app. Builds from before the plugin get a short
 * note that one manual install is still needed.
 */
export function AppUpdateCard() {
  const [native, setNative] = useState(false);
  const [supported, setSupported] = useState(false);
  const [version, setVersion] = useState("");
  const [latest, setLatest] = useState<string | null>(null);
  const [busy, setBusy] = useState<"check" | "install" | null>(null);

  useEffect(() => {
    if (!isNativeApp()) return;
    setNative(true);
    const cap = bridge();
    if (!cap) return;
    setSupported(true);
    cap.nativePromise!("AppUpdate", "info")
      .then((r) => setVersion((r as CheckResult).versionName))
      .catch(() => {});
  }, []);

  if (!native) return null;

  const check = async () => {
    const cap = bridge();
    if (!cap) return;
    setBusy("check");
    try {
      const r = (await cap.nativePromise!("AppUpdate", "check")) as CheckResult;
      setVersion(r.versionName);
      if (r.available) {
        setLatest(r.latestName || "חדשה");
      } else {
        setLatest(null);
        toast.success("יש לך את הגרסה האחרונה 👍");
      }
    } catch {
      toast.error("לא הצלחתי לבדוק עדכון. בדקו שיש אינטרנט ונסו שוב.");
    } finally {
      setBusy(null);
    }
  };

  const install = async () => {
    const cap = bridge();
    if (!cap) return;
    setBusy("install");
    try {
      const r = (await cap.nativePromise!("AppUpdate", "install")) as { status: string };
      if (r.status === "needs-permission") {
        toast.message("אשרו ל״דרייבר״ להתקין אפליקציות וחזרו. ההתקנה תמשיך לבד.");
      } else if (r.status === "up-to-date") {
        setLatest(null);
        toast.success("יש לך את הגרסה האחרונה 👍");
      } else {
        toast.message("לחצו ״עדכן״ במסך שנפתח. הנתונים נשמרים.");
      }
    } catch {
      toast.error("ההורדה נכשלה. נסו שוב בעוד רגע.");
    } finally {
      setBusy(null);
    }
  };

  return (
    <Card>
      <CardContent className="p-4 space-y-3">
        <h3 className="font-semibold">עדכון האפליקציה</h3>
        {supported ? (
          <>
            <p className="text-xs text-muted-foreground">
              {version ? `גרסה מותקנת: ${version}. ` : ""}
              עדכון מתקין את הגרסה החדשה מעל הקיימת, והנתונים נשמרים.
            </p>
            {latest ? (
              <Button onClick={install} disabled={busy !== null} className="w-full">
                <Download className="h-4 w-4 ml-1" />
                {busy === "install" ? "מוריד…" : `עדכן לגרסה ${latest}`}
              </Button>
            ) : (
              <Button variant="outline" onClick={check} disabled={busy !== null} className="w-full">
                <RefreshCw className={`h-4 w-4 ml-1 ${busy === "check" ? "animate-spin" : ""}`} />
                {busy === "check" ? "בודק…" : "בדוק עדכון"}
              </Button>
            )}
          </>
        ) : (
          <p className="text-xs text-muted-foreground">
            הגרסה שמותקנת אצלך עוד לא יודעת להתעדכן לבד. צריך להתקין פעם אחת את הגרסה החדשה
            מ-GitHub, ומשם העדכונים יגיעו מכאן.
          </p>
        )}
      </CardContent>
    </Card>
  );
}
