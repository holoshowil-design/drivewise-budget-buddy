import { useEffect, useState } from "react";
import { Download as DownloadIcon } from "lucide-react";
import { FoldCard } from "@/components/FoldCard";
import { RefreshCw, Download } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { isNativeApp } from "@/lib/location";
import { canSelfUpdate, checkForUpdate, installUpdate, installedVersion } from "@/lib/app-update";

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
    if (!canSelfUpdate()) return;
    setSupported(true);
    void installedVersion().then((v) => v && setVersion(v));
  }, []);

  if (!native) return null;

  const check = async () => {
    setBusy("check");
    const r = await checkForUpdate();
    setBusy(null);
    if (!r) {
      toast.error("לא הצלחתי לבדוק עדכון. בדקו שיש אינטרנט ונסו שוב.");
      return;
    }
    setVersion(r.versionName);
    if (r.available) {
      setLatest(r.latestName || "חדשה");
    } else {
      setLatest(null);
      toast.success("יש לך את הגרסה האחרונה");
    }
  };

  const install = async () => {
    setBusy("install");
    const started = await installUpdate();
    setBusy(null);
    if (!started) setLatest(null);
  };

  return (
    <FoldCard
      title="עדכון האפליקציה"
      icon={DownloadIcon}
      hint={version ? `גרסה ${version}` : undefined}
    >
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
          הגרסה שמותקנת אצלך עוד לא יודעת להתעדכן לבד. צריך להתקין פעם אחת את הגרסה החדשה מ-GitHub,
          ומשם העדכונים יגיעו מכאן.
        </p>
      )}
    </FoldCard>
  );
}
