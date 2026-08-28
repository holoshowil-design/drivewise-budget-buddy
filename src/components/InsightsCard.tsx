import { buildInsights } from "@/lib/insights";
import { Card, CardContent } from "@/components/ui/card";
import { Lightbulb, TrendingUp, AlertTriangle, Info, CircleAlert } from "lucide-react";
import type { AppData } from "@/lib/store";

const toneStyles = {
  good: { cls: "bg-success/10 text-success", Icon: TrendingUp },
  warn: { cls: "bg-warning/10 text-warning", Icon: AlertTriangle },
  bad: { cls: "bg-destructive/10 text-destructive", Icon: CircleAlert },
  info: { cls: "bg-primary/10 text-primary", Icon: Info },
} as const;

export function InsightsCard({ data }: { data: AppData }) {
  const insights = buildInsights(data);
  if (insights.length === 0) return null;

  return (
    <Card>
      <CardContent className="p-4">
        <h3 className="mb-3 flex items-center gap-1.5 text-sm font-semibold">
          <Lightbulb className="h-4 w-4 text-primary" /> תובנות חכמות
        </h3>
        <div className="space-y-2.5">
          {insights.map((i) => {
            const { cls, Icon } = toneStyles[i.tone];
            return (
              <div key={i.id} className="flex items-start gap-2.5">
                <span className={`mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full ${cls}`}>
                  <Icon className="h-3.5 w-3.5" />
                </span>
                <div className="min-w-0">
                  <div className="text-sm font-medium leading-snug">{i.title}</div>
                  <div className="text-xs text-muted-foreground">{i.detail}</div>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
