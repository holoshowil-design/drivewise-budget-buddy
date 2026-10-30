import { createFileRoute, Link } from "@tanstack/react-router";
import { Map as MapIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageHeader, PageStage } from "@/components/PageHeader";
import { TripTracker } from "@/components/TripTracker";

type TripSearch = { action?: string; mode?: string };

export const Route = createFileRoute("/trip")({
  validateSearch: (search: Record<string, unknown>): TripSearch => ({
    action: typeof search.action === "string" ? search.action : undefined,
    mode: typeof search.mode === "string" ? search.mode : undefined,
  }),
  head: () => ({
    meta: [
      { title: "דרייבר - מעקב נסיעה" },
      { name: "description", content: "מעקב GPS חי לנסיעות עבודה: ק״מ, זמן ועלות דלק משוערת." },
      { property: "og:title", content: "דרייבר - מעקב נסיעה" },
      {
        property: "og:description",
        content: "מעקב GPS חי לנסיעות עבודה: ק״מ, זמן ועלות דלק משוערת.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: TripPage,
});

function TripPage() {
  const { action, mode } = Route.useSearch();

  return (
    <div className="mx-auto max-w-xl">
      <PageHeader
        title="נסיעת עבודה"
        subtitle="מדידת ק״מ וזמן בזמן אמת"
        action={
          <Button asChild size="sm" variant="outline">
            <Link to="/map">
              <MapIcon className="ml-1 h-4 w-4" />
              מפה
            </Link>
          </Button>
        }
      />
      <div className="px-4">
        {/* The start/end button comes first; the scene follows it at full size. */}
        <TripTracker
          autoStart={action === "start_trip"}
          driveMode={mode === "drive"}
          stage={
            <PageStage
              scene={{
                mood: "excited",
                prop: "wheel",
                line: "חגורות! טורבו מתניע 🏁",
                taxi: "zoom",
                driving: true,
                backdrop: "road",
                rewards: true,
              }}
            />
          }
        />
      </div>
    </div>
  );
}
