import { useMemo } from "react";
import { commonAmounts } from "@/lib/common-amounts";
import { useAppData } from "@/lib/store";

/** One-tap chips with the amounts the driver gets most often; tapping sets the amount. */
export function CommonAmounts({ onPick }: { onPick: (amount: string) => void }) {
  const { data } = useAppData();
  const amounts = useMemo(() => commonAmounts(data.incomes), [data.incomes]);
  if (amounts.length === 0) return null;
  return (
    <div className="flex flex-wrap items-center gap-1.5">
      <span className="text-xs text-muted-foreground">נפוצים:</span>
      {amounts.map((amount) => (
        <button
          key={amount}
          type="button"
          onClick={() => onPick(String(amount))}
          className="num rounded-full border border-primary/30 bg-primary/5 px-3 py-1 text-sm font-semibold text-primary active:bg-primary/15"
        >
          {amount.toLocaleString("he-IL")}
        </button>
      ))}
    </div>
  );
}
