import { commissionChoices } from "@/lib/commission";
import { numberOr } from "@/lib/number";

/** One-tap commission percentages under the commission field; the current one is marked. */
export function CommissionChips({
  value,
  defaultPct,
  onPick,
}: {
  value: string;
  defaultPct: number;
  onPick: (pct: string) => void;
}) {
  const current = numberOr(value, Number.NaN);
  return (
    <div className="flex flex-wrap gap-1.5">
      {commissionChoices(defaultPct).map((pct) => {
        const on = current === pct;
        return (
          <button
            key={pct}
            type="button"
            aria-pressed={on}
            onClick={() => onPick(String(pct))}
            className={`num rounded-full border px-2.5 py-1 text-xs font-semibold transition-colors ${
              on
                ? "border-primary bg-primary/10 text-primary"
                : "border-border bg-muted/50 text-foreground active:bg-muted"
            }`}
          >
            {pct}%
          </button>
        );
      })}
    </div>
  );
}
