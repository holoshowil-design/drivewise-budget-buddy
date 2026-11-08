import { j as jsxRuntimeExports } from "../_libs/react.mjs";
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
  INK_GRID as I,
  INK_TICK as a,
  INK_TOOLTIP as b,
  InkBar as c,
  InkKey as d,
  inkPatterns as i
};
