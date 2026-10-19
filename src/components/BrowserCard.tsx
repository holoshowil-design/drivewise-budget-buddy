import { useEffect, useState, type FormEvent } from "react";
import { Globe } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { ACTIVE_EVENT, isDrivingNow, readActive } from "@/lib/active-trip";
import {
  START_PAGES,
  browserMode,
  clearBrowserLogins,
  normalizeAddress,
  openInBrowser,
  readPrivateMode,
  writePrivateMode,
} from "@/lib/inapp-browser";

/** True while the driver is driving: a work trip is on, or the car is moving between trips. */
function useDriving() {
  const [driving, setDriving] = useState(false);
  useEffect(() => {
    const check = () => setDriving(isDrivingNow(readActive()));
    check();
    // A between-trips drive counts only while the car moves, which changes with time alone.
    const timer = window.setInterval(check, 5000);
    window.addEventListener(ACTIVE_EVENT, check);
    window.addEventListener("storage", check);
    return () => {
      window.clearInterval(timer);
      window.removeEventListener(ACTIVE_EVENT, check);
      window.removeEventListener("storage", check);
    };
  }, []);
  return driving;
}

/**
 * The browser: X with one tap and an address or search box. In the installed app it opens in
 * a window inside the app that does not share logins with Chrome; on the web, in a new tab.
 * Closed while driving.
 */
export function BrowserCard() {
  const driving = useDriving();
  const [text, setText] = useState("");
  // Known only in the browser, after the first render (the bridge is not there on the server).
  const [mode, setMode] = useState<"inapp" | "needs-update" | "tab">("tab");
  useEffect(() => setMode(browserMode()), []);
  const inApp = mode === "inapp";
  const [privateMode, setPrivateMode] = useState(false);
  useEffect(() => setPrivateMode(readPrivateMode()), []);
  const togglePrivate = (on: boolean) => {
    setPrivateMode(on);
    writePrivateMode(on);
  };

  const open = async (address: string) => {
    // Read it again at the tap: the card may not have caught up with a trip that just started.
    if (isDrivingNow(readActive())) return;
    const result = await openInBrowser(address, { privateMode });
    if (result === "needs-update")
      toast.error("האפליקציה המותקנת ישנה. התקן את הגרסה החדשה כדי לפתוח דפים בתוכה.");
    else if (result === "failed") toast.error("לא הצלחנו לפתוח את הדפדפן");
  };

  const submit = (event: FormEvent) => {
    event.preventDefault();
    if (!normalizeAddress(text, privateMode ? "duckduckgo" : "google")) return;
    void open(text);
    setText("");
  };

  const clear = async () => {
    if (await clearBrowserLogins()) toast.success("ההתחברויות בדפדפן נמחקו");
    else toast.error("לא הצלחנו למחוק את ההתחברויות");
  };

  return (
    <Card>
      <CardContent className="space-y-3 p-4">
        <div>
          <h3 className="flex items-center gap-1.5 text-sm font-semibold">
            <Globe className="h-4 w-4 text-primary" /> דפדפן
          </h3>
          <p className="text-xs text-muted-foreground">
            {mode === "inapp"
              ? "נפתח בתוך האפליקציה, נפרד מכרום: ההתחברויות שלך בכרום לא משותפות."
              : mode === "needs-update"
                ? "האפליקציה המותקנת ישנה ואין בה דפדפן פנימי. התקן את הגרסה החדשה (בהתקנה מעל הקיימת הנתונים נשמרים)."
                : "באתר נפתח בלשונית חדשה. הדפדפן הפנימי פועל באפליקציה המותקנת."}
          </p>
        </div>

        {driving ? (
          <p className="rounded-xl bg-warning/10 p-3 text-center text-sm font-medium" role="status">
            הדפדפן סגור בזמן נסיעה.
          </p>
        ) : (
          <>
            <div className="flex flex-wrap gap-2">
              {START_PAGES.map((page) => (
                <Button
                  key={page.url}
                  className="h-12 flex-1 text-sm font-bold"
                  onClick={() => void open(page.url)}
                >
                  פתח את {page.name}
                </Button>
              ))}
            </div>
            <form onSubmit={submit} className="flex gap-2">
              <Input
                dir="ltr"
                inputMode="url"
                autoCapitalize="none"
                autoCorrect="off"
                enterKeyHint="go"
                placeholder="כתובת או חיפוש"
                aria-label="כתובת או חיפוש"
                value={text}
                onChange={(e) => setText(e.target.value)}
              />
              <Button
                type="submit"
                variant="secondary"
                disabled={!normalizeAddress(text, privateMode ? "duckduckgo" : "google")}
              >
                פתח
              </Button>
            </form>
          </>
        )}

        <div className="flex items-start justify-between gap-3 rounded-xl bg-muted/50 p-3">
          <div className="min-w-0">
            <Label htmlFor="browser-private" className="text-sm font-semibold">
              מצב פרטי
            </Label>
            <p className="text-xs leading-relaxed text-muted-foreground">
              כל פתיחה וסגירה מתחילות נקי: עוגיות והתחברויות נמחקות, החיפוש ב-DuckDuckGo ונשלחת בקשת
              &quot;אל תעקוב&quot;. זה לא מסתיר את כתובת ה-IP שלך. לזה צריך VPN בטלפון, והדפדפן
              הפנימי יעבוד דרכו.
            </p>
          </div>
          <Switch id="browser-private" checked={privateMode} onCheckedChange={togglePrivate} />
        </div>

        {inApp && (
          <button
            type="button"
            onClick={() => void clear()}
            className="text-xs text-muted-foreground underline"
          >
            נקה התחברויות בדפדפן
          </button>
        )}
      </CardContent>
    </Card>
  );
}
