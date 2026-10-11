import {
  categoryLabel,
  effectiveFuelParams,
  netFromIncome,
  type AppData,
  type Expense,
  type Income,
  type Trip,
} from "./store";

/** RFC 4180 quoting: wrap in quotes when needed and double inner quotes. */
export function csvCell(v: string | number | null | undefined): string {
  const s = v == null ? "" : String(v);
  return /[",\r\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

const row = (cells: (string | number | null | undefined)[]) => cells.map(csvCell).join(",");
const money = (n: number) => n.toFixed(2);

function fuelFor(km: number, date: string, time: string | undefined, data: AppData) {
  if (km <= 0) return 0;
  const p = effectiveFuelParams(date, data.vehicle, data.settings, time);
  return (km / (p.consumption > 0 ? p.consumption : 1)) * p.price;
}

/**
 * Report rows for incomes, expenses and GPS trips, with the estimated fuel of
 * every driven distance (the fuel that the profit calculation charges).
 */
export function buildReportCsv(
  data: AppData,
  r: { incomes: Income[]; expenses: Expense[]; trips: Trip[] },
): string {
  const lines = [
    row([
      "סוג",
      "תאריך",
      "שעה",
      "קטגוריה/פלטפורמה",
      "סכום ברוטו",
      "עמלה%",
      "תשר",
      "נטו",
      "ק״מ",
      "דקות",
      "שעות",
      "דלק משוער",
      "הערה",
    ]),
  ];
  for (const i of r.incomes) {
    const km = i.tripId ? 0 : i.km || 0; // linked incomes: the km are on the trip row
    lines.push(
      row([
        "הכנסה",
        i.date,
        i.time,
        i.platform,
        i.amount,
        i.commissionPct,
        i.tip || 0,
        money(netFromIncome(i)),
        km,
        "",
        i.hours || 0,
        money(fuelFor(km, i.date, i.time, data)),
        i.note,
      ]),
    );
  }
  for (const e of r.expenses) {
    lines.push(
      row([
        "הוצאה",
        e.date,
        e.time,
        categoryLabel(e.category),
        e.amount,
        "",
        "",
        money(-e.amount),
        "",
        "",
        "",
        "",
        e.category === "fuel" ? `${e.note ?? ""} (תדלוק בפועל, להשוואה)`.trim() : e.note,
      ]),
    );
  }
  for (const t of r.trips) {
    lines.push(
      row([
        "נסיעה",
        t.date,
        t.time,
        "GPS",
        "",
        "",
        "",
        "",
        t.km.toFixed(2),
        Math.round(t.seconds / 60),
        "",
        money(fuelFor(t.km, t.date, t.time, data)),
        t.note,
      ]),
    );
  }
  return lines.join("\r\n");
}
