import { r as reactExports, j as jsxRuntimeExports } from "../_libs/react.mjs";
import { f as fmtDurationWords } from "./duration-BNQpD9Px.mjs";
import { u as useRouter } from "../_libs/tanstack__react-router.mjs";
import { u as useAppData, m as monthRange, a as filterByRange, G as isPrivateTrip, H as routedTrips, I as splitGaps, J as routeStops, K as placeCounts, L as fmtDateShort, B as Button } from "./router-CcPEcE51.mjs";
import { P as PageHeader } from "./PageHeader-507zMUYd.mjs";
import { C as Card, a as CardContent } from "./MovieStage-0WygtrCr.mjs";
import { T as Tabs, a as TabsList, b as TabsTrigger } from "./tabs-DIauUNjD.mjs";
import "../_libs/sonner.mjs";
import "../_libs/react-dom.mjs";
import { y as ArrowRight, x as ChevronRight, l as ChevronLeft } from "../_libs/lucide-react.mjs";

import "../_libs/tanstack__router-core.mjs";
import "../_libs/tanstack__history.mjs";
import "../_libs/seroval.mjs";
import "../_libs/unenv.mjs";


import "../_libs/cookie-es.mjs";
import "../_libs/seroval-plugins.mjs";

import "../_libs/isbot.mjs";
import "../_libs/clsx.mjs";
import "../_libs/tailwind-merge.mjs";
import "../_libs/radix-ui__react-slot.mjs";
import "../_libs/radix-ui__react-compose-refs.mjs";
import "../_libs/class-variance-authority.mjs";
import "../_libs/radix-ui__react-tabs.mjs";
import "../_libs/radix-ui__primitive.mjs";
import "../_libs/radix-ui__react-context.mjs";
import "../_libs/radix-ui__react-roving-focus.mjs";
import "../_libs/radix-ui__react-collection.mjs";
import "../_libs/radix-ui__react-id.mjs";
import "../_libs/@radix-ui/react-use-layout-effect+[...].mjs";
import "../_libs/radix-ui__react-primitive.mjs";
import "../_libs/@radix-ui/react-use-callback-ref+[...].mjs";
import "../_libs/@radix-ui/react-use-controllable-state+[...].mjs";
import "../_libs/@radix-ui/react-use-effect-event+[...].mjs";
import "../_libs/radix-ui__react-direction.mjs";
import "../_libs/@radix-ui/react-use-is-hydrated+[...].mjs";
import "../_libs/radix-ui__react-presence.mjs";
const TripMap = reactExports.lazy(() => import("./TripMap-BYEYV0_X.mjs"));
const MAX_STOPS = 14;
const iso = (d) => new Date(d.getTime() - d.getTimezoneOffset() * 6e4).toISOString().slice(0, 10);
function weekRange(back) {
  const d = /* @__PURE__ */ new Date();
  d.setDate(d.getDate() - d.getDay() - back * 7);
  const end = new Date(d);
  end.setDate(d.getDate() + 6);
  return {
    from: iso(d),
    to: iso(end)
  };
}
function TripsMapPage() {
  const {
    data,
    ready
  } = useAppData();
  const [range, setRange] = reactExports.useState("week");
  const [back, setBack] = reactExports.useState(0);
  const [mounted, setMounted] = reactExports.useState(false);
  const router = useRouter();
  const goBack = () => {
    if (window.history.length > 1) router.history.back();
    else void router.navigate({
      to: "/reports"
    });
  };
  reactExports.useEffect(() => setMounted(true), []);
  const {
    from,
    to
  } = reactExports.useMemo(() => {
    if (range === "week") return weekRange(back);
    const now = /* @__PURE__ */ new Date();
    return monthRange(now.getFullYear(), now.getMonth() - back);
  }, [range, back]);
  const inRange = reactExports.useMemo(() => filterByRange(data.trips ?? [], from, to).filter((t) => !isPrivateTrip(t)), [data.trips, from, to]);
  const drawn = reactExports.useMemo(() => routedTrips(inRange), [inRange]);
  const work = reactExports.useMemo(() => drawn.filter((t) => t.kind !== "between"), [drawn]);
  const gapped = reactExports.useMemo(() => work.filter((t) => splitGaps(t.path).some((p) => p.gap)).length, [work]);
  const stops = reactExports.useMemo(() => routeStops(work), [work]);
  const places = reactExports.useMemo(() => placeCounts(work), [work]);
  const missing = inRange.filter((t) => !t.path || t.path.length < 2).length;
  if (!ready) return null;
  const km = drawn.reduce((s, t) => s + (t.km || 0), 0);
  const seconds = drawn.reduce((s, t) => s + (t.seconds || 0), 0);
  const shown = stops.length > MAX_STOPS ? [...stops.slice(0, MAX_STOPS), "…"] : stops;
  const label = range === "month" ? (/* @__PURE__ */ new Date(`${from}T12:00:00`)).toLocaleDateString("he-IL", {
    month: "long",
    year: "numeric"
  }) : `${fmtDateShort(from)} – ${fmtDateShort(to)}`;
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mx-auto max-w-xl", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(PageHeader, { title: "מפת הנסיעות", subtitle: "לאן נסעת, מצויר על המפה", action: /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { size: "sm", variant: "outline", onClick: goBack, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(ArrowRight, { className: "ml-1 h-4 w-4" }),
      "חזרה"
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4 px-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Tabs, { dir: "rtl", value: range, onValueChange: (v) => {
        setRange(v);
        setBack(0);
      }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(TabsList, { className: "grid w-full grid-cols-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(TabsTrigger, { value: "week", children: "שבוע" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TabsTrigger, { value: "month", children: "חודש" })
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between rounded-xl border bg-card px-2 py-1", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "ghost", size: "icon", "aria-label": range === "week" ? "השבוע הקודם" : "החודש הקודם", onClick: () => setBack((b) => b + 1), children: /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronRight, { className: "h-4 w-4" }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-sm font-semibold", children: label }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "ghost", size: "icon", "aria-label": range === "week" ? "השבוע הבא" : "החודש הבא", disabled: back === 0, onClick: () => setBack((b) => Math.max(0, b - 1)), children: /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronLeft, { className: "h-4 w-4" }) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { className: "ink-card overflow-hidden", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "trip-map-frame", children: [
          mounted ? /* @__PURE__ */ jsxRuntimeExports.jsx(reactExports.Suspense, { fallback: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "trip-map" }), children: /* @__PURE__ */ jsxRuntimeExports.jsx(TripMap, { trips: drawn, places }) }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "trip-map" }),
          drawn.length === 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "trip-map-empty", children: "עוד אין כאן מסלולים. מעכשיו כל נסיעה שנמדדת ב-GPS תצויר על המפה." })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { className: "space-y-3 p-4", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap gap-x-4 gap-y-1 text-sm font-semibold", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
              work.length,
              " נסיעות עבודה"
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
              Math.round(km).toLocaleString("he-IL"),
              " ק״מ"
            ] }),
            seconds > 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: fmtDurationWords(seconds) })
          ] }),
          shown.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-sm leading-relaxed", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-muted-foreground", children: "המסלול: " }),
            shown.join(" ← ")
          ] }),
          places.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex flex-wrap gap-1.5", children: places.slice(0, 8).map((p) => /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "rounded-full border bg-background px-2.5 py-0.5 text-xs", children: [
            p.name,
            " · ",
            p.count
          ] }, p.name)) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "inline-flex items-center gap-1.5", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("i", { className: "map-key map-key-work" }),
              " נסיעת עבודה"
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "inline-flex items-center gap-1.5", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("i", { className: "map-key map-key-between" }),
              " בין נסיעות"
            ] }),
            gapped > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "inline-flex items-center gap-1.5", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("i", { className: "map-key map-key-gap" }),
              " קטע בלי GPS"
            ] })
          ] }),
          gapped > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-muted-foreground", children: [
            gapped === 1 ? "בנסיעה אחת" : `ב-${gapped} נסיעות`,
            ' הטלפון לא שלח מיקום בחלק מהדרך, ולכן הקטע הזה מצויר בקו ישר מנוקד. זה קורה כשהמסך כבוי והטלפון עוצר את האפליקציה: כדאי לאשר לה מיקום "כל הזמן" ולבטל לה את חיסכון הסוללה.'
          ] }),
          missing > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-muted-foreground", children: [
            missing === 1 ? "נסיעה אחת" : `${missing} נסיעות`,
            " בתקופה בלי מסלול (מלפני שהמפה נוספה, או בלי GPS)."
          ] })
        ] })
      ] })
    ] })
  ] });
}
export {
  TripsMapPage as component
};
