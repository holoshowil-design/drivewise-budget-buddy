import { RecordsList } from "@/components/RecordsList";
import { todayISO, useAppData } from "@/lib/store";

type Kind = "income" | "expense" | "fuel";

const titles: Record<Kind, string> = {
  income: "הכנסות",
  expense: "הוצאות",
  fuel: "תדלוקים",
};

/**
 * The records already saved for the form's date, right under the form, so a wrong entry
 * can be fixed or deleted on the spot instead of hunting for it in the calendar.
 */
export function DayRecords({ date, kind }: { date: string; kind: Kind }) {
  const { data } = useAppData();
  const incomes = kind === "income" ? data.incomes.filter((i) => i.date === date) : [];
  const expenses =
    kind === "income"
      ? []
      : data.expenses.filter(
          (e) => e.date === date && (kind === "fuel") === (e.category === "fuel"),
        );
  if (incomes.length + expenses.length === 0) return null;
  const day =
    date === todayISO()
      ? "היום"
      : new Date(date).toLocaleDateString("he-IL", { day: "numeric", month: "short" });
  return (
    <section className="space-y-2 pt-1">
      <h3 className="px-1 text-sm font-semibold text-muted-foreground">
        {titles[kind]} · {day}
      </h3>
      <RecordsList incomes={incomes} expenses={expenses} />
    </section>
  );
}
