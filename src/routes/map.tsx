import { createFileRoute } from "@tanstack/react-router";
import { lazy, Suspense, useEffect, useMemo, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import {
  useAppData,
  filterByRange,
  fmtDateShort,
  fmtDuration,
  isPrivateTrip,
  monthRange,
} from "@/lib/store";
import { placeCounts, routedTrips, routeStops } from "@/lib/trip-path";
import { PageHeader } from "@/components/PageHeader";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";

// Leaflet touches the window when it loads, so the map is fetched in the browser only.
const TripMap = lazy(() => import("@/components/TripMap"));

type Range = "week" | "month";
/** A long chain of places is cut, so the summary stays one short paragraph. */
const MAX_STOPS = 14;

export const Route = createFileRoute("/map")({
  head: () => ({
    meta: [
      { title: "מפת הנסיעות - דרייבר" },
      { name: "description", content: "כל הנסיעות של השבוע או החודש, מצוירות על המפה." },
      { property: "og:title", content: "מפת הנסיעות - דרייבר" },
      { property: "og:description", content: "כל הנסיעות של השבוע או החודש, מצוירות על המפה." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: TripsMapPage,
});

const iso = (d: Date) =>
  new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 10);

/** Sunday to Saturday, `back` weeks ago. */
function weekRange(back: number) {
  const d = new Date();
  d.setDate(d.getDate() - d.getDay() - back * 7);
  const end = new Date(d);
  end.setDate(d.getDate() + 6);
  return { from: iso(d), to: iso(end) };
}

function TripsMapPage() {
  const { data, ready } = useAppData();
  const [range, setRange] = useState<Range>("week");
  const [back, setBack] = useState(0);
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const { from, to } = useMemo(() => {
    if (range === "week") return weekRange(back);
    const now = new Date();
    return monthRange(now.getFullYear(), now.getMonth() - back);
  }, [range, back]);

  // Private drives stay off the work map.
  const inRange = useMemo(
    () => filterByRange(data.trips ?? [], from, to).filter((t) => !isPrivateTrip(t)),
    [data.trips, from, to],
  );
  const drawn = useMemo(() => routedTrips(inRange), [inRange]);
  const work = useMemo(() => drawn.filter((t) => t.kind !== "between"), [drawn]);
  const stops = useMemo(() => routeStops(work), [work]);
  const places = useMemo(() => placeCounts(work), [work]);
  const missing = inRange.filter((t) => !t.path || t.path.length < 2).length;

  if (!ready) return null;

  const km = drawn.reduce((s, t) => s + (t.km || 0), 0);
  const seconds = drawn.reduce((s, t) => s + (t.seconds || 0), 0);
  const shown = stops.length > MAX_STOPS ? [...stops.slice(0, MAX_STOPS), "…"] : stops;
  const label =
    range === "month"
      ? new Date(`${from}T12:00:00`).toLocaleDateString("he-IL", { month: "long", year: "numeric" })
      : `${fmtDateShort(from)} – ${fmtDateShort(to)}`;

  return (
    <div className="mx-auto max-w-xl">
      <PageHeader title="מפת הנסיעות" subtitle="לאן נסעת, מצויר על המפה" />

      <div className="space-y-4 px-4">
        <Tabs
          dir="rtl"
          value={range}
          onValueChange={(v) => {
            setRange(v as Range);
            setBack(0);
          }}
        >
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="week">שבוע</TabsTrigger>
            <TabsTrigger value="month">חודש</TabsTrigger>
          </TabsList>
        </Tabs>

        <div className="flex items-center justify-between rounded-xl border bg-card px-2 py-1">
          <Button
            variant="ghost"
            size="icon"
            aria-label={range === "week" ? "השבוע הקודם" : "החודש הקודם"}
            onClick={() => setBack((b) => b + 1)}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
          <span className="text-sm font-semibold">{label}</span>
          <Button
            variant="ghost"
            size="icon"
            aria-label={range === "week" ? "השבוע הבא" : "החודש הבא"}
            disabled={back === 0}
            onClick={() => setBack((b) => Math.max(0, b - 1))}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
        </div>

        <Card className="ink-card overflow-hidden">
          <div className="trip-map-frame">
            {mounted ? (
              <Suspense fallback={<div className="trip-map" />}>
                <TripMap trips={drawn} places={places} />
              </Suspense>
            ) : (
              <div className="trip-map" />
            )}
            {drawn.length === 0 && (
              <p className="trip-map-empty">
                עוד אין כאן מסלולים. מעכשיו כל נסיעה שנמדדת ב-GPS תצויר על המפה.
              </p>
            )}
          </div>
          <CardContent className="space-y-3 p-4">
            <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm font-semibold">
              <span>{work.length} נסיעות עבודה</span>
              <span>{Math.round(km).toLocaleString("he-IL")} ק״מ</span>
              {seconds > 0 && <span>{fmtDuration(seconds)}</span>}
            </div>
            {shown.length > 0 && (
              <p className="text-sm leading-relaxed">
                <span className="text-muted-foreground">המסלול: </span>
                {shown.join(" ← ")}
              </p>
            )}
            {places.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {places.slice(0, 8).map((p) => (
                  <span
                    key={p.name}
                    className="rounded-full border bg-background px-2.5 py-0.5 text-xs"
                  >
                    {p.name} · {p.count}
                  </span>
                ))}
              </div>
            )}
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
              <span className="inline-flex items-center gap-1.5">
                <i className="map-key map-key-work" /> נסיעת עבודה
              </span>
              <span className="inline-flex items-center gap-1.5">
                <i className="map-key map-key-between" /> בין נסיעות
              </span>
            </div>
            {missing > 0 && (
              <p className="text-xs text-muted-foreground">
                {missing === 1 ? "נסיעה אחת" : `${missing} נסיעות`} בתקופה בלי מסלול (מלפני שהמפה
                נוספה, או בלי GPS).
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
