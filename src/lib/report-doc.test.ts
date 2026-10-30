import { describe, expect, it } from "vitest";
import { buildReportHtml } from "./report-doc";
import { pageCuts } from "./report-pdf";

const totals = {
  gross: 1000,
  commission: 150,
  incomeNet: 850,
  fuelEstimated: 120,
  fuelActual: 0,
  otherExpenses: 30,
  costs: 150,
  net: 700,
  km: 200,
  betweenKm: 0,
  betweenSeconds: 0,
  hours: 10,
  daysWorked: 2,
  tripCount: 0,
  recordCount: 2,
};

describe("buildReportHtml", () => {
  it("escapes notes and shows the totals", () => {
    const html = buildReportHtml({
      title: "דוח",
      period: "אוקטובר",
      currency: "₪",
      totals,
      days: [],
      incomes: [
        {
          id: "1",
          date: "2026-10-01",
          amount: 1000,
          platform: "Gett",
          commissionPct: 15,
          tip: 0,
          hours: 10,
          km: 0,
          note: "<script>x</script>",
        },
      ],
      expenses: [],
      trips: [],
    });
    expect(html).not.toContain("<script>x");
    expect(html).toContain("&lt;script&gt;x");
    expect(html).toContain("700 ₪");
    expect(html).toContain("82%"); // 700 / 850
  });
});

describe("pageCuts", () => {
  it("cuts between blocks, never through one", () => {
    const blocks = [
      { top: 0, bottom: 90 },
      { top: 90, bottom: 180 },
      { top: 180, bottom: 270 },
    ];
    expect(pageCuts(blocks, 270, 200)).toEqual([
      [0, 180],
      [180, 270],
    ]);
  });

  it("cuts a block taller than a page at the page size", () => {
    expect(pageCuts([{ top: 0, bottom: 500 }], 500, 200)).toEqual([
      [0, 200],
      [200, 400],
      [400, 500],
    ]);
  });
});
