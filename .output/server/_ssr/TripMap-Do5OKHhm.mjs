import { r as reactExports, j as jsxRuntimeExports } from "../_libs/react.mjs";
import { L } from "../_libs/leaflet.mjs";
import { I as splitGaps } from "./router-DhZGCYXD.mjs";
import "../_libs/sonner.mjs";
import "../_libs/react-dom.mjs";

import "../_libs/tanstack__react-router.mjs";
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
import "../_libs/lucide-react.mjs";
const ISRAEL = [31.6, 34.95];
const MAX_LABELS = 10;
const cssVar = (name, fallback) => getComputedStyle(document.documentElement).getPropertyValue(name).trim() || fallback;
function TripMap({ trips, places }) {
  const box = reactExports.useRef(null);
  const map = reactExports.useRef(null);
  const layer = reactExports.useRef(null);
  reactExports.useEffect(() => {
    if (!box.current) return;
    const still = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const m = L.map(box.current, {
      center: ISRAEL,
      zoom: 7,
      zoomControl: true,
      attributionControl: true,
      zoomAnimation: !still,
      fadeAnimation: !still,
      markerZoomAnimation: !still
    });
    L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
      maxZoom: 18,
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
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
  reactExports.useEffect(() => {
    const m = map.current;
    const g = layer.current;
    if (!m || !g) return;
    g.clearLayers();
    const ink = cssVar("--ink", "#231f1c");
    const primary = cssVar("--primary", "#2c7041");
    const mustard = cssVar("--mustard", "#f2b630");
    const paper = cssVar("--paper", "#f3ead3");
    const all = [];
    const ordered = [...trips].sort(
      (a, b) => Number(a.kind !== "between") - Number(b.kind !== "between")
    );
    for (const t of ordered) {
      const line = t.path;
      all.push(...line);
      if (t.kind === "between") {
        L.polyline(line, {
          color: ink,
          weight: 2.5,
          opacity: 0.6,
          dashArray: "6 7",
          lineCap: "round"
        }).addTo(g);
        continue;
      }
      for (const part of splitGaps(t.path)) {
        const seg = part.line;
        if (part.gap) {
          L.polyline(seg, {
            color: ink,
            weight: 2,
            opacity: 0.55,
            dashArray: "2 6",
            lineCap: "round"
          }).addTo(g);
          continue;
        }
        L.polyline(seg, {
          color: ink,
          weight: 7,
          opacity: 0.9,
          lineCap: "round",
          lineJoin: "round"
        }).addTo(g);
        L.polyline(seg, {
          color: primary,
          weight: 4,
          opacity: 1,
          lineCap: "round",
          lineJoin: "round"
        }).addTo(g);
      }
      L.circleMarker(line[0], {
        radius: 4,
        color: ink,
        weight: 2,
        fillColor: paper,
        fillOpacity: 1
      }).addTo(g);
      L.circleMarker(line[line.length - 1], {
        radius: 5,
        color: ink,
        weight: 2,
        fillColor: mustard,
        fillOpacity: 1
      }).addTo(g);
    }
    for (const p of places.slice(0, MAX_LABELS)) {
      L.marker([p.lat, p.lon], {
        interactive: false,
        keyboard: false,
        icon: L.divIcon({
          className: "map-place",
          html: `<span>${p.name}${p.count > 1 ? ` <b>×${p.count}</b>` : ""}</span>`,
          iconSize: void 0
        })
      }).addTo(g);
    }
    if (all.length)
      m.fitBounds(L.latLngBounds(all), { padding: [28, 28], maxZoom: 14, animate: false });
    else m.setView(ISRAEL, 7, { animate: false });
  }, [trips, places]);
  return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { ref: box, className: "trip-map", role: "img", "aria-label": "מפת הנסיעות" });
}
export {
  TripMap as default
};
