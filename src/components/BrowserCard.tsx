import { useEffect, useState, type FormEvent } from "react";
import { Globe } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ACTIVE_EVENT, isDrivingNow, readActive } from "@/lib/active-trip";
import {
  START_PAGES,
  clearBrowserLogins,
  hasInAppBrowser,
  normalizeAddress,
  openInBrowser,
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
  const [inApp, setInApp] = useState(false);
  useEffect(() => setInApp(hasInAppBrowser()), []);

  const open = async (address: string) => {
    // Read it again at the tap: the card may not have caught up with a trip that just started.
    if (isDrivingNow(readActive())) return;
    if ((await openInBrowser(address)) === "failed") toast.error("לא הצלחנו לפתוח את הדפדפן");
  };

  const submit = (event: FormEvent) => {
    event.preventDefault();
    if (!normalizeAddress(text)) return;
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
            {inApp
              ? "נפתח בתוך האפליקציה, נפרד מכרום: ההתחברויות שלך בכרום לא משותפות."
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
                  className="h-12 flex-1 text-base font-bold"
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
              <Button type="submit" variant="secondary" disabled={!normalizeAddress(text)}>
                פתח
              </Button>
            </form>
          </>
        )}

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
