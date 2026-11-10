import { useEffect, useRef, useState } from "react";
import { CloudOff, CloudUpload } from "lucide-react";
import { useOnline } from "@/lib/offline";

/**
 * A small inked chip at the top while there is no signal: "אין קליטה · הכל נשמר בטלפון".
 * When the signal comes back it says so for a moment (the cloud sync pushes by itself).
 */
export function OfflineChip() {
  const online = useOnline();
  const [back, setBack] = useState(false);
  const wasOffline = useRef(false);

  useEffect(() => {
    if (!online) {
      wasOffline.current = true;
      setBack(false);
      return;
    }
    if (!wasOffline.current) return;
    wasOffline.current = false;
    setBack(true);
    const t = window.setTimeout(() => setBack(false), 2800);
    return () => window.clearTimeout(t);
  }, [online]);

  if (online && !back) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      className="pointer-events-none fixed inset-x-0 top-0 z-[61] flex justify-center px-3 pt-[calc(0.4rem+env(safe-area-inset-top,0px))]"
    >
      <div
        className={`flex items-center gap-1.5 rounded-full border-2 border-foreground px-3 py-1 text-xs font-bold shadow-[2px_2px_0_var(--foreground)] ${
          online ? "bg-success text-success-foreground" : "bg-card text-foreground"
        }`}
      >
        {online ? (
          <>
            <CloudUpload className="h-3.5 w-3.5" aria-hidden="true" />
            חזרה קליטה · מעדכן בענן
          </>
        ) : (
          <>
            <CloudOff className="h-3.5 w-3.5" aria-hidden="true" />
            אין קליטה · הכל נשמר בטלפון
          </>
        )}
      </div>
    </div>
  );
}
