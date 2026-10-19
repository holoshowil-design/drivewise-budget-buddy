import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Legend } from "recharts";
import { fmt } from "@/lib/store";
import { INK_TOOLTIP } from "@/components/chart-ink";

// the paper-world paints: strong ones first, their tints after
const colors = [
  "var(--mustard)",
  "var(--vermilion)",
  "var(--primary)",
  "var(--slate)",
  "var(--mustard-tint)",
  "var(--vermilion-tint)",
  "var(--green-tint)",
  "var(--slate-tint)",
];

/** Expense breakdown donut (loaded lazily with recharts). */
export default function ExpensePie({
  data,
  currency,
}: {
  data: { name: string; value: number }[];
  currency: string;
}) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <PieChart>
        <Pie
          data={data}
          dataKey="value"
          nameKey="name"
          innerRadius={45}
          outerRadius={80}
          paddingAngle={3}
        >
          {data.map((_, i) => (
            <Cell key={i} fill={colors[i % colors.length]} stroke="var(--ink)" strokeWidth={1.4} />
          ))}
        </Pie>
        <Tooltip contentStyle={INK_TOOLTIP} formatter={(v: number) => fmt(v, currency)} />
        <Legend
          iconType="square"
          iconSize={9}
          wrapperStyle={{ fontSize: 11, fontWeight: 600 }}
          formatter={(name: string) => (
            <span style={{ color: "var(--ink)", marginInline: "0.3rem 0.6rem" }}>{name}</span>
          )}
        />
      </PieChart>
    </ResponsiveContainer>
  );
}
