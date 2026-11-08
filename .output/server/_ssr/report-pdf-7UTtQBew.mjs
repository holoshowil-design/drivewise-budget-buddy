import { P as PAGE_WIDTH, a as PAGE_HEIGHT } from "./reports-BiBSTAu2.mjs";
import "../_libs/react.mjs";
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
import "./router-CcPEcE51.mjs";
import "../_libs/clsx.mjs";
import "../_libs/tailwind-merge.mjs";
import "../_libs/radix-ui__react-slot.mjs";
import "../_libs/radix-ui__react-compose-refs.mjs";
import "../_libs/class-variance-authority.mjs";
import "../_libs/lucide-react.mjs";
import "./index-RgmvL_P0.mjs";
import "../_libs/radix-ui__react-dropdown-menu.mjs";
import "../_libs/radix-ui__primitive.mjs";
import "../_libs/radix-ui__react-context.mjs";
import "../_libs/@radix-ui/react-use-controllable-state+[...].mjs";
import "../_libs/@radix-ui/react-use-layout-effect+[...].mjs";
import "../_libs/@radix-ui/react-use-effect-event+[...].mjs";
import "../_libs/radix-ui__react-primitive.mjs";
import "../_libs/radix-ui__react-menu.mjs";
import "../_libs/radix-ui__react-collection.mjs";
import "../_libs/radix-ui__react-direction.mjs";
import "../_libs/@radix-ui/react-dismissable-layer+[...].mjs";
import "../_libs/@radix-ui/react-use-callback-ref+[...].mjs";
import "../_libs/radix-ui__react-focus-guards.mjs";
import "../_libs/radix-ui__react-focus-scope.mjs";
import "../_libs/radix-ui__react-popper.mjs";
import "../_libs/floating-ui__react-dom.mjs";
import "../_libs/floating-ui__dom.mjs";
import "../_libs/floating-ui__core.mjs";
import "../_libs/floating-ui__utils.mjs";
import "../_libs/radix-ui__react-use-size.mjs";
import "../_libs/radix-ui__react-portal.mjs";
import "../_libs/radix-ui__react-presence.mjs";
import "../_libs/radix-ui__react-roving-focus.mjs";
import "../_libs/radix-ui__react-id.mjs";
import "../_libs/@radix-ui/react-use-is-hydrated+[...].mjs";
import "../_libs/aria-hidden.mjs";
import "../_libs/react-remove-scroll.mjs";
import "../_libs/tslib.mjs";
import "../_libs/react-remove-scroll-bar.mjs";
import "../_libs/react-style-singleton.mjs";
import "../_libs/get-nonce.mjs";
import "../_libs/use-sidecar.mjs";
import "../_libs/use-callback-ref.mjs";
import "./PageHeader-507zMUYd.mjs";
import "./MovieStage-0WygtrCr.mjs";
import "./tabs-DIauUNjD.mjs";
import "../_libs/radix-ui__react-tabs.mjs";
import "./RecordsList-CzyCqE5D.mjs";
import "./label-Bywo-lhz.mjs";
import "../_libs/radix-ui__react-label.mjs";
import "./select-Cz6O0-QX.mjs";
import "../_libs/radix-ui__react-select.mjs";
import "../_libs/radix-ui__number.mjs";
import "../_libs/radix-ui__react-use-previous.mjs";
import "../_libs/@radix-ui/react-visually-hidden+[...].mjs";
import "./day-groups-ZcaNk8yr.mjs";
import "../_libs/radix-ui__react-dialog.mjs";
import "./validate-BG-MbmZ3.mjs";
const MARGIN = 26;
const PAPER = "#f3ead3";
async function renderReportPdf(html) {
  const [{ default: html2canvas }, { jsPDF }] = await Promise.all([
    import("../_libs/html2canvas-pro.mjs"),
    import("../_libs/jspdf.mjs")
  ]);
  const frame = document.createElement("iframe");
  frame.setAttribute("aria-hidden", "true");
  frame.style.cssText = `position:fixed;left:-10000px;top:0;width:${PAGE_WIDTH}px;height:${PAGE_HEIGHT}px;border:0;visibility:hidden`;
  document.body.appendChild(frame);
  try {
    await new Promise((resolve) => {
      frame.onload = () => resolve();
      frame.srcdoc = html;
    });
    const doc = frame.contentDocument;
    await doc.fonts?.ready;
    await Promise.all(
      [...doc.images].map(
        (img) => img.complete ? null : new Promise((r) => img.onload = img.onerror = r)
      )
    );
    const body = doc.body;
    const height = body.scrollHeight;
    frame.style.height = `${height}px`;
    const scale = 2;
    const canvas = await html2canvas(body, {
      scale,
      backgroundColor: PAPER,
      width: PAGE_WIDTH,
      height,
      windowWidth: PAGE_WIDTH,
      windowHeight: height
    });
    const box = (el) => {
      const r = el.getBoundingClientRect();
      return { top: r.top, bottom: r.bottom };
    };
    const blocks = [...doc.querySelectorAll(".k")].map(box);
    for (const h of doc.querySelectorAll("section > h2")) {
      const next = h.parentElement.querySelectorAll(".k");
      const last = next[Math.min(2, next.length - 1)];
      blocks.push({ top: box(h).top, bottom: box(last).bottom });
    }
    const cuts = pageCuts(blocks, height, PAGE_HEIGHT - MARGIN * 2);
    const pdf = new jsPDF({
      unit: "px",
      format: [PAGE_WIDTH, PAGE_HEIGHT],
      hotfixes: ["px_scaling"]
    });
    cuts.forEach(([from, to], n) => {
      if (n > 0) pdf.addPage([PAGE_WIDTH, PAGE_HEIGHT]);
      pdf.setFillColor(PAPER);
      pdf.rect(0, 0, PAGE_WIDTH, PAGE_HEIGHT, "F");
      const slice = document.createElement("canvas");
      slice.width = canvas.width;
      slice.height = Math.ceil((to - from) * scale);
      slice.getContext("2d").drawImage(
        canvas,
        0,
        from * scale,
        canvas.width,
        slice.height,
        0,
        0,
        canvas.width,
        slice.height
      );
      const jpeg = slice.toDataURL("image/jpeg", 0.85);
      pdf.addImage(jpeg, "JPEG", 0, MARGIN, PAGE_WIDTH, to - from);
      pdf.setFontSize(9);
      pdf.setTextColor("#5c5249");
      pdf.text(`${n + 1} / ${cuts.length}`, PAGE_WIDTH / 2, PAGE_HEIGHT - 10, { align: "center" });
    });
    return pdf.output("blob");
  } finally {
    frame.remove();
  }
}
function pageCuts(blocks, total, room) {
  const pages = [];
  let start = 0;
  while (start < total - 1) {
    const limit = start + room;
    if (limit >= total) {
      pages.push([start, total]);
      break;
    }
    let cut = limit;
    for (let y = Math.floor(limit); y > start + room / 3; y--) {
      if (!blocks.some((b) => b.top < y && b.bottom > y)) {
        cut = y;
        break;
      }
    }
    pages.push([start, cut]);
    start = cut;
  }
  return pages;
}
export {
  pageCuts,
  renderReportPdf
};
