import { PAGE_HEIGHT, PAGE_WIDTH } from "@/lib/report-doc";

/** Blank space kept at the top and bottom of every PDF page, in CSS px. */
const MARGIN = 26;
const PAPER = "#f3ead3";

/**
 * Renders the report page in a hidden frame and turns it into an A4 PDF. The
 * browser draws the Hebrew text, so it comes out right to left with its own
 * fonts; pages are cut between rows, never through one.
 */
export async function renderReportPdf(html: string): Promise<Blob> {
  const [{ default: html2canvas }, { jsPDF }] = await Promise.all([
    import("html2canvas-pro"),
    import("jspdf"),
  ]);

  const frame = document.createElement("iframe");
  frame.setAttribute("aria-hidden", "true");
  frame.style.cssText = `position:fixed;left:-10000px;top:0;width:${PAGE_WIDTH}px;height:${PAGE_HEIGHT}px;border:0;visibility:hidden`;
  document.body.appendChild(frame);
  try {
    await new Promise<void>((resolve) => {
      frame.onload = () => resolve();
      frame.srcdoc = html;
    });
    const doc = frame.contentDocument!;
    await doc.fonts?.ready;
    await Promise.all(
      [...doc.images].map((img) =>
        img.complete ? null : new Promise((r) => (img.onload = img.onerror = r)),
      ),
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
      windowHeight: height,
    });

    const box = (el: Element) => {
      const r = el.getBoundingClientRect();
      return { top: r.top, bottom: r.bottom };
    };
    const blocks = [...doc.querySelectorAll(".k")].map(box);
    // A heading stays on the page of its table's header and first row.
    for (const h of doc.querySelectorAll("section > h2")) {
      const next = h.parentElement!.querySelectorAll(".k");
      const last = next[Math.min(2, next.length - 1)];
      blocks.push({ top: box(h).top, bottom: box(last).bottom });
    }
    const cuts = pageCuts(blocks, height, PAGE_HEIGHT - MARGIN * 2);

    const pdf = new jsPDF({
      unit: "px",
      format: [PAGE_WIDTH, PAGE_HEIGHT],
      hotfixes: ["px_scaling"],
    });
    cuts.forEach(([from, to], n) => {
      if (n > 0) pdf.addPage([PAGE_WIDTH, PAGE_HEIGHT]);
      pdf.setFillColor(PAPER);
      pdf.rect(0, 0, PAGE_WIDTH, PAGE_HEIGHT, "F");
      const slice = document.createElement("canvas");
      slice.width = canvas.width;
      slice.height = Math.ceil((to - from) * scale);
      slice
        .getContext("2d")!
        .drawImage(
          canvas,
          0,
          from * scale,
          canvas.width,
          slice.height,
          0,
          0,
          canvas.width,
          slice.height,
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

/**
 * Splits [0, total) into pages of at most `room` px. A page ends after the
 * lowest block that still fits, so no block is cut, unless one block is taller
 * than a whole page.
 */
export function pageCuts(
  blocks: { top: number; bottom: number }[],
  total: number,
  room: number,
): [number, number][] {
  const pages: [number, number][] = [];
  let start = 0;
  while (start < total - 1) {
    const limit = start + room;
    if (limit >= total) {
      pages.push([start, total]);
      break;
    }
    // A cut at y is safe when no block spans across it.
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
