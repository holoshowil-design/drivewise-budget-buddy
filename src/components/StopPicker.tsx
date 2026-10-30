import { Pause } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { STOP_REASONS, type StopReason } from "@/lib/trip-stops";

/** Big buttons for the reason of a stop inside a trip (usable while parked, one tap). */
export function StopPicker({
  sinceLabel,
  onPick,
  onClose,
}: {
  /** "since 14:05" when the stop starts back when the car stopped. */
  sinceLabel?: string;
  onPick: (reason: StopReason) => void;
  onClose: () => void;
}) {
  return (
    <div
      className="fixed inset-0 z-[75] flex items-end justify-center bg-black/70 p-4 pb-10 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-label="סיבת העצירה"
      onClick={onClose}
    >
      <Card className="w-full max-w-md border-2" onClick={(e) => e.stopPropagation()}>
        <CardContent className="p-5 text-center">
          <Pause className="mx-auto h-9 w-9 text-primary" />
          <h2 className="mt-1 text-xl font-extrabold">למה עצרת?</h2>
          <p className="mt-1 text-xs text-muted-foreground">
            הזמן ממשיך להיספר בנסיעה{sinceLabel ? ` ${sinceLabel}` : ""}, ונרשם לפי הסיבה. כשתמשיך
            לנסוע העצירה תיסגר לבד.
          </p>
          <div className="mt-4 grid grid-cols-2 gap-2">
            {STOP_REASONS.map((r) => (
              <Button
                key={r.id}
                variant={r.id === "wait" ? "default" : "secondary"}
                className="h-14 text-base font-bold"
                onClick={() => onPick(r.id)}
              >
                {r.label}
              </Button>
            ))}
            <Button variant="ghost" className="h-14" onClick={onClose}>
              חזרה
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
