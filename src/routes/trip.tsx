import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/PageHeader";
import { TripTracker } from "@/components/TripTracker";

type TripSearch = { action?: string };

export const Route = createFileRoute("/trip")({
  validateSearch: (search: Record<string, unknown>): TripSearch => ({
    action: typeof search.action === "string" ? search.action : undefined,
  }),
  head: () => ({
    meta: [
      { title: "דרייבר - מעקב נסיעה" },
      { name: "description", content: "מעקב GPS חי לנסיעות עבודה: ק״מ, זמן ועלות דלק משוערת." },
      { property: "og:title", content: "דרייבר - מעקב נסיעה" },
      { property: "og:description", content: "מעקב GPS חי לנסיעות עבודה: ק״מ, זמן ועלות דלק משוערת." },
    ],
  }),
  component: TripPage,
});

function TripPage() {
  const { action } = Route.useSearch();

  return (
    <div className="mx-auto max-w-xl">
      <PageHeader title="נסיעת עבודה" subtitle="מדידת ק״מ וזמן בזמן אמת" />
      <div className="px-4">
        <TripTracker autoStart={action === "start_trip"} />
      </div>
    </div>
  );
}
