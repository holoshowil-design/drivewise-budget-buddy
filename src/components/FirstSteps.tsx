import { Link } from "@tanstack/react-router";
import { ChevronLeft, Navigation, Plus, Settings2, type LucideIcon } from "lucide-react";

type Step = { icon: LucideIcon; title: string; hint: string; to: "/settings" | "/trip" | "/add" };

const STEPS: Step[] = [
  {
    icon: Settings2,
    title: "יעד יומי ורכב",
    hint: "כמה רוצים להרוויח ביום, וכמה הרכב צורך",
    to: "/settings",
  },
  {
    icon: Navigation,
    title: "נסיעה ראשונה",
    hint: "מחליקים למעלה, והק״מ והזמן נמדדים לבד",
    to: "/trip",
  },
  { icon: Plus, title: "הכנסה ראשונה", hint: "סכום אחד, שלוש שניות, וזהו", to: "/add" },
];

/**
 * A brand-new driver has no records: instead of a wall of zeros, empty charts and a red
 * "behind the pace" line, show three steps. The charts appear with the first record.
 */
export function FirstSteps() {
  return (
    <section className="premium-panel space-y-3" aria-labelledby="first-steps-title">
      <div>
        <h2 id="first-steps-title" className="font-display text-lg font-bold">
          ברוכים הבאים לדרייבר
        </h2>
        <p className="text-xs text-muted-foreground">
          שלושה צעדים קטנים, ואז הקפטן כבר סופר כל שקל.
        </p>
      </div>
      <ol className="space-y-2">
        {STEPS.map((s, i) => (
          <li key={s.to}>
            <Link
              to={s.to}
              className="pressable flex items-center gap-3 rounded-xl border border-border bg-background/60 p-3"
            >
              <span className="section-title-icon" aria-hidden="true">
                <s.icon />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-sm font-semibold">
                  <span className="num text-muted-foreground">{i + 1}. </span>
                  {s.title}
                </span>
                <span className="block text-xs text-muted-foreground">{s.hint}</span>
              </span>
              <ChevronLeft className="h-4 w-4 shrink-0 text-muted-foreground" aria-hidden="true" />
            </Link>
          </li>
        ))}
      </ol>
    </section>
  );
}
