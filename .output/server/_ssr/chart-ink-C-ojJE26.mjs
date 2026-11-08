import { r as reactExports, j as jsxRuntimeExports } from "../_libs/react.mjs";
const played = /* @__PURE__ */ new Set();
const reducedMotion = () => typeof window !== "undefined" && (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ?? false);
function useChartIntro(key) {
  const [animate] = reactExports.useState(() => {
    if (reducedMotion() || played.has(key)) return false;
    played.add(key);
    return true;
  });
  return animate;
}
const sizes = /* @__PURE__ */ new Map();
function ChartBox({
  id,
  children
}) {
  const ref = reactExports.useRef(null);
  const [size, setSize] = reactExports.useState(() => sizes.get(id) ?? null);
  reactExports.useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const ro = new ResizeObserver(([entry]) => {
      const width = Math.round(entry.contentRect.width);
      const height = Math.round(entry.contentRect.height);
      if (!width || !height) return;
      sizes.set(id, { width, height });
      setSize(
        (prev) => prev && prev.width === width && prev.height === height ? prev : { width, height }
      );
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, [id]);
  return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { ref, className: "relative h-full w-full", children: size && reactExports.cloneElement(children, size) });
}
const INK_TOOLTIP = {
  background: "var(--card)",
  border: "var(--line) solid var(--ink)",
  borderRadius: "10px 12px 9px 11px / 11px 9px 12px 10px",
  boxShadow: "3px 3px 0 var(--paper-shade)",
  color: "var(--ink)",
  fontSize: 12,
  fontWeight: 700,
  direction: "rtl"
};
const INK_GRID = { stroke: "var(--ink)", strokeOpacity: 0.18, strokeDasharray: "2 6" };
const INK_TICK = { fill: "var(--ink)", fillOpacity: 0.65, fontSize: 10, fontWeight: 700 };
function inkPatterns() {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("defs", { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs(
      "pattern",
      {
        id: "ink-hatch",
        width: "5",
        height: "5",
        patternUnits: "userSpaceOnUse",
        patternTransform: "rotate(-45)",
        children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("rect", { width: "5", height: "5", fill: "var(--green-tint)" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "line",
            {
              x1: "0",
              y1: "0",
              x2: "0",
              y2: "5",
              stroke: "var(--primary)",
              strokeOpacity: "0.45",
              strokeWidth: "1.6"
            }
          )
        ]
      }
    ),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(
      "pattern",
      {
        id: "ink-hatch-loss",
        width: "5",
        height: "5",
        patternUnits: "userSpaceOnUse",
        patternTransform: "rotate(-45)",
        children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("rect", { width: "5", height: "5", fill: "var(--vermilion-tint)" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "line",
            {
              x1: "0",
              y1: "0",
              x2: "0",
              y2: "5",
              stroke: "var(--vermilion)",
              strokeOpacity: "0.5",
              strokeWidth: "1.6"
            }
          )
        ]
      }
    )
  ] });
}
function InkBar({ x = 0, y = 0, width = 0, height = 0, fill }) {
  const top = height < 0 ? y + height : y;
  const h = Math.abs(height);
  if (!width || !h) return null;
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("g", { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("rect", { x: x + 1.5, y: top + 1.5, width, height: h, rx: 2, fill }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      "rect",
      {
        x,
        y: top,
        width,
        height: h,
        rx: 2,
        fill: "none",
        stroke: "var(--ink)",
        strokeWidth: 1.2
      }
    )
  ] });
}
function InkKey({
  fill,
  label,
  line = false
}) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "flex items-center gap-1.5", children: [
    line ? /* @__PURE__ */ jsxRuntimeExports.jsxs("svg", { width: "16", height: "8", "aria-hidden": "true", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("line", { x1: "1", y1: "4", x2: "15", y2: "4", stroke: "var(--ink)", strokeWidth: "1.6" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("circle", { cx: "8", cy: "4", r: "2.6", fill, stroke: "var(--ink)", strokeWidth: "1" })
    ] }) : /* @__PURE__ */ jsxRuntimeExports.jsx(
      "span",
      {
        className: "h-2.5 w-2.5 rounded-[2px] border border-[color:var(--ink)]",
        style: { background: fill }
      }
    ),
    label
  ] });
}
export {
  ChartBox as C,
  INK_TOOLTIP as I,
  INK_GRID as a,
  INK_TICK as b,
  InkBar as c,
  InkKey as d,
  inkPatterns as i,
  useChartIntro as u
};
