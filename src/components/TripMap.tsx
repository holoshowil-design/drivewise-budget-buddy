import { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import type { PathPoint } from "@/lib/trip-path";
import type { Trip } from "@/lib/store";

export type MapTrip = { id: string; kind?: Trip["kind"]; path: PathPoint[] };
export type MapPlace = { name: string; lat: number; lon: number; count: number };

/** Israel, for when there is nothing to draw yet. */
const ISRAEL: L.LatLngExpression = [31.6, 34.95];
const MAX_LABELS = 10;

const cssVar = (name: string, fallback: string) =>
  getComputedStyle(document.documentElement).getPropertyValue(name).trim() || fallback;

/**
 * The trips drawn as inked lines on a paper-toned street map (OpenStreetMap tiles,
 * free, no key). Client only: the page mounts it after hydration.
 */
export default function TripMap({ trips, places }: { trips: MapTrip[]; places: MapPlace[] }) {
  const box = useRef<HTMLDivElement>(null);
  const map = useRef<L.Map | null>(null);
  const layer = useRef<L.LayerGroup | null>(null);

  useEffect(() => {
    if (!box.current) return;
    const still = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const m = L.map(box.current, {
      center: ISRAEL,
      zoom: 7,
      zoomControl: true,
      attributionControl: true,
      zoomAnimation: !still,
      fadeAnimation: !still,
      markerZoomAnimation: !still,
    });
    L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
      maxZoom: 18,
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    }).addTo(m);
    m.attributionControl.setPrefix(false);
    map.current = m;
    layer.current = L.layerGroup().addTo(m);
    return () => {
      m.remove();
      map.current = null;
      layer.current = null;
    };
  }, []);

  useEffect(() => {
    const m = map.current;
    const g = layer.current;
    if (!m || !g) return;
    g.clearLayers();
    const ink = cssVar("--ink", "#231f1c");
    const primary = cssVar("--primary", "#2c7041");
    const mustard = cssVar("--mustard", "#f2b630");
    const paper = cssVar("--paper", "#f3ead3");
    const all: L.LatLngTuple[] = [];

    // Between drives first, so the work trips are inked over them.
    const ordered = [...trips].sort(
      (a, b) => Number(a.kind !== "between") - Number(b.kind !== "between"),
    );
    for (const t of ordered) {
      const line = t.path as L.LatLngTuple[];
      all.push(...line);
      if (t.kind === "between") {
        L.polyline(line, {
          color: ink,
          weight: 2.5,
          opacity: 0.6,
          dashArray: "6 7",
          lineCap: "round",
        }).addTo(g);
        continue;
      }
      L.polyline(line, {
        color: ink,
        weight: 7,
        opacity: 0.9,
        lineCap: "round",
        lineJoin: "round",
      }).addTo(g);
      L.polyline(line, {
        color: primary,
        weight: 4,
        opacity: 1,
        lineCap: "round",
        lineJoin: "round",
      }).addTo(g);
      L.circleMarker(line[0], {
        radius: 4,
        color: ink,
        weight: 2,
        fillColor: paper,
        fillOpacity: 1,
      }).addTo(g);
      L.circleMarker(line[line.length - 1], {
        radius: 5,
        color: ink,
        weight: 2,
        fillColor: mustard,
        fillOpacity: 1,
      }).addTo(g);
    }

    for (const p of places.slice(0, MAX_LABELS)) {
      L.marker([p.lat, p.lon], {
        interactive: false,
        keyboard: false,
        icon: L.divIcon({
          className: "map-place",
          html: `<span>${p.name}${p.count > 1 ? ` <b>×${p.count}</b>` : ""}</span>`,
          iconSize: undefined,
        }),
      }).addTo(g);
    }

    if (all.length)
      m.fitBounds(L.latLngBounds(all), { padding: [28, 28], maxZoom: 14, animate: false });
    else m.setView(ISRAEL, 7, { animate: false });
  }, [trips, places]);

  return <div ref={box} className="trip-map" role="img" aria-label="מפת הנסיעות" />;
}
