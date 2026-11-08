import { j as jsxRuntimeExports } from "../_libs/react.mjs";
import { f as fmt } from "./router-DjatMlVs.mjs";
import { b as INK_TOOLTIP } from "./chart-ink-mCe4iIqM.mjs";
import "../_libs/sonner.mjs";
import "../_libs/react-dom.mjs";
import { R as ResponsiveContainer, g as PieChart, h as Pie, i as Cell, T as Tooltip, j as Legend } from "../_libs/recharts.mjs";

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
import "../_libs/lodash.mjs";
import "../_libs/react-smooth.mjs";
import "../_libs/prop-types.mjs";
import "../_libs/fast-equals.mjs";
import "../_libs/tiny-invariant.mjs";
import "../_libs/react-is.mjs";
import "../_libs/d3-shape.mjs";
import "../_libs/d3-path.mjs";
import "../_libs/victory-vendor.mjs";
import "../_libs/d3-scale.mjs";
import "../_libs/internmap.mjs";
import "../_libs/d3-array.mjs";
import "../_libs/d3-time-format.mjs";
import "../_libs/d3-time.mjs";
import "../_libs/d3-interpolate.mjs";
import "../_libs/d3-color.mjs";
import "../_libs/d3-format.mjs";
import "../_libs/recharts-scale.mjs";
import "../_libs/decimal.js-light.mjs";
import "../_libs/eventemitter3.mjs";
const colors = [
  "var(--mustard)",
  "var(--vermilion)",
  "var(--primary)",
  "var(--slate)",
  "var(--mustard-tint)",
  "var(--vermilion-tint)",
  "var(--green-tint)",
  "var(--slate-tint)"
];
function ExpensePie({
  data,
  currency
}) {
  return /* @__PURE__ */ jsxRuntimeExports.jsx(ResponsiveContainer, { width: "100%", height: "100%", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(PieChart, { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      Pie,
      {
        data,
        dataKey: "value",
        nameKey: "name",
        innerRadius: 45,
        outerRadius: 80,
        paddingAngle: 3,
        children: data.map((_, i) => /* @__PURE__ */ jsxRuntimeExports.jsx(Cell, { fill: colors[i % colors.length], stroke: "var(--ink)", strokeWidth: 1.4 }, i))
      }
    ),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Tooltip, { contentStyle: INK_TOOLTIP, formatter: (v) => fmt(v, currency) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      Legend,
      {
        iconType: "square",
        iconSize: 9,
        wrapperStyle: { fontSize: 11, fontWeight: 600 },
        formatter: (name) => /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: { color: "var(--ink)", marginInline: "0.3rem 0.6rem" }, children: name })
      }
    )
  ] }) });
}
export {
  ExpensePie as default
};
