import { j as jsxRuntimeExports } from "../_libs/react.mjs";
import { C as ComicBubble } from "./router-CcPEcE51.mjs";
import { M as MovieStage } from "./MovieStage-0WygtrCr.mjs";
function PageHeader({
  title,
  subtitle,
  action,
  scene
}) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("header", { className: "px-4 pb-3 pt-[calc(1.5rem+env(safe-area-inset-top,0px))]", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-end justify-between gap-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-w-0", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "ink-title text-[2rem] font-extrabold leading-tight", children: title }),
        subtitle && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-1 text-sm font-semibold text-muted-foreground", children: subtitle })
      ] }),
      action && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "shrink-0", children: action })
    ] }),
    scene && /* @__PURE__ */ jsxRuntimeExports.jsx(PageStage, { scene })
  ] });
}
function PageStage({ scene }) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: `page-stage stage-bg stage-${scene.backdrop ?? "street"}`, "aria-hidden": "true", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      MovieStage,
      {
        base: { mood: scene.mood, prop: scene.prop, taxi: scene.taxi, driving: scene.driving },
        mascotClass: "page-stage-mascot",
        taxiClass: "page-stage-taxi",
        rewards: scene.rewards
      }
    ),
    /* @__PURE__ */ jsxRuntimeExports.jsx(ComicBubble, { side: "start", className: "page-stage-bubble", children: scene.line })
  ] });
}
export {
  PageHeader as P,
  PageStage as a
};
