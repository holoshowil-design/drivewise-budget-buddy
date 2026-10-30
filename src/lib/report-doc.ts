import type { DayCalc, Totals } from "@/lib/calc";
import { categoryLabel, netFromIncome, type Expense, type Income, type Trip } from "@/lib/store";

/** Width of the report page in CSS px; A4 is 210 x 297 mm. */
export const PAGE_WIDTH = 794;
export const PAGE_HEIGHT = Math.round((PAGE_WIDTH * 297) / 210);

export type ReportInput = {
  title: string;
  period: string;
  currency: string;
  totals: Totals;
  days: DayCalc[];
  incomes: Income[];
  expenses: Expense[];
  trips: Trip[];
  vehicle?: string;
  /** Absolute URL of the captain picture for the header. */
  art?: string;
  now?: Date;
};

const esc = (s: unknown) =>
  String(s ?? "").replace(
    /[&<>"']/g,
    (ch) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[ch]!,
  );

const num = (n: number, digits = 0) =>
  n.toLocaleString("he-IL", { minimumFractionDigits: digits, maximumFractionDigits: digits });

const shortDate = (iso: string) => {
  const [y, m, d] = iso.split("-").map(Number);
  return `${d}.${m}.${String(y).slice(2)}`;
};

/**
 * The report as a standalone RTL HTML page, PAGE_WIDTH wide. Blocks that must
 * not be split between PDF pages carry the class "k".
 */
export function buildReportHtml(r: ReportInput): string {
  const c = r.currency;
  const money = (n: number, digits = 0) => {
    const v = num(Math.abs(n), digits);
    return `<bdi>${n < 0 ? "-" : ""}${v} ${esc(c)}</bdi>`;
  };
  const t = r.totals;
  const perKm = t.km > 0 ? t.net / t.km : null;
  const perHour = t.hours > 0 ? t.net / t.hours : null;
  const margin = t.incomeNet > 0 ? Math.round((t.net / t.incomeNet) * 100) : null;

  const kpis: [string, string, string?][] = [
    ["רווח נקי", money(t.net), t.net < 0 ? "neg" : "pos"],
    ["הכנסה נטו", money(t.incomeNet)],
    ["הוצאות", money(t.costs)],
    ["ימי עבודה", num(t.daysWorked)],
    ["שעות עבודה", num(t.hours, 1)],
    ['ק"מ', num(t.km, 1)],
    ['רווח לק"מ', perKm == null ? "—" : money(perKm, 2)],
    ["רווח לשעה", perHour == null ? "—" : money(perHour)],
    ["אחוז רווחיות", margin == null ? "—" : `${margin}%`],
  ];

  const byPlatform = new Map<string, { count: number; gross: number; net: number; tips: number }>();
  for (const i of r.incomes) {
    const p = byPlatform.get(i.platform) ?? { count: 0, gross: 0, net: 0, tips: 0 };
    p.count += 1;
    p.gross += i.amount;
    p.tips += i.tip || 0;
    p.net += netFromIncome(i);
    byPlatform.set(i.platform, p);
  }

  const byCategory = new Map<string, number>();
  for (const e of r.expenses) {
    if (e.category === "fuel") continue; // fuel is charged by km, below
    const k = categoryLabel(e.category);
    byCategory.set(k, (byCategory.get(k) ?? 0) + e.amount);
  }
  if (t.fuelEstimated > 0) byCategory.set("דלק לפי ק״מ", t.fuelEstimated);
  const cats = [...byCategory.entries()].sort((a, b) => b[1] - a[1]);
  const catMax = Math.max(1, ...cats.map(([, v]) => v));

  const workTrips = r.trips.filter((x) => !x.kind || x.kind === "work");
  const activeDays = r.days.filter((d) => d.incomes.length || d.expenses.length || d.km > 0);

  /** `numeric` lists the columns that hold numbers (aligned left, left to right). */
  const table = (head: string[], rows: string[][], numeric: number[] = []) => {
    const cls = (i: number) => (numeric.includes(i) ? ' class="n"' : "");
    return rows.length
      ? `<table><thead class="k"><tr>${head.map((h, i) => `<th${cls(i)}>${h}</th>`).join("")}</tr></thead><tbody>${rows
          .map(
            (row) =>
              `<tr class="k">${row.map((cell, i) => `<td${cls(i)}>${cell}</td>`).join("")}</tr>`,
          )
          .join("")}</tbody></table>`
      : `<p class="empty k">אין רשומות בתקופה הזו.</p>`;
  };

  const section = (title: string, body: string) =>
    `<section><h2 class="k">${title}</h2>${body}</section>`;

  const now = r.now ?? new Date();
  const made = `${now.toLocaleDateString("he-IL")} ${now.toLocaleTimeString("he-IL", { hour: "2-digit", minute: "2-digit" })}`;

  return `<!doctype html>
<html lang="he" dir="rtl"><head><meta charset="utf-8">
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Secular+One&family=Rubik:wght@400;500;700&display=swap">
<style>
*{box-sizing:border-box;margin:0;padding:0}
html,body{background:#f3ead3}
body{width:${PAGE_WIDTH}px;padding:28px 34px 20px;color:#231f1c;font:400 13px/1.45 Rubik,Arial,sans-serif}
h1,h2,.big{font-family:"Secular One",Rubik,sans-serif;font-weight:400}
header{display:flex;align-items:center;gap:18px;background:#2c7041;color:#fbf6e8;border:3px solid #231f1c;border-radius:18px;padding:18px 22px;box-shadow:5px 5px 0 #231f1c}
header img{width:96px;height:96px;object-fit:contain;flex:none;background:#fbf6e8;border:3px solid #231f1c;border-radius:50%}
header h1{font-size:34px;line-height:1.1}
header .sub{font-size:16px;margin-top:4px}
header .meta{font-size:11.5px;opacity:.85;margin-top:6px}
.kpis{display:grid;grid-template-columns:repeat(3,1fr);gap:12px;margin:24px 0 6px}
.kpi{background:#fbf6e8;border:2.5px solid #231f1c;border-radius:14px;padding:10px 14px;box-shadow:3px 3px 0 #231f1c}
.kpi .l{font-size:12px;color:#5c5249}
.kpi .big{font-size:24px;line-height:1.25;margin-top:2px}
.kpi.pos .big{color:#2c7041}.kpi.neg .big{color:#b8381f}
.kpi.main{background:#e7f0df}
section{margin-top:22px}
h2{font-size:21px;margin-bottom:8px;padding-bottom:4px;border-bottom:3px solid #231f1c}
table{width:100%;border-collapse:separate;border-spacing:0;background:#fbf6e8;border:2px solid #231f1c;border-radius:12px;overflow:hidden}
th{background:#231f1c;color:#f3ead3;font-weight:500;font-size:12px;text-align:right;padding:7px 10px}
td{padding:6px 10px;border-top:1px solid #d9ccb0;font-size:12.5px;text-align:right;vertical-align:top}
tbody tr:nth-child(even) td{background:#f5ecd8}
td.n,th.n{text-align:left;white-space:nowrap}
td.neg{color:#b8381f}td.pos{color:#2c7041}
.note{color:#5c5249;font-size:11.5px}
tr.total td{font-weight:700;background:#e7f0df!important;border-top:2px solid #231f1c}
.bar{display:flex;align-items:center;gap:10px;margin:6px 0}
.bar .name{width:130px;flex:none}
.bar .track{flex:1;height:14px;background:#fbf6e8;border:2px solid #231f1c;border-radius:8px;overflow:hidden}
.bar .fill{height:100%;background:#d8a23a}
.bar .v{width:90px;flex:none;text-align:left;direction:ltr}
.empty{color:#5c5249;padding:8px 2px}
footer{margin-top:26px;text-align:center;font-size:11px;color:#5c5249}
</style></head><body>
<header class="k">
${r.art ? `<img src="${esc(r.art)}" alt="">` : ""}
<div><h1>${esc(r.title)}</h1><div class="sub">${esc(r.period)}</div>
<div class="meta">הופק ב-${esc(made)}${r.vehicle ? ` · ${esc(r.vehicle)}` : ""}</div></div>
</header>
<div class="kpis">${kpis
    .map(
      ([l, v, cls], i) =>
        `<div class="kpi k ${cls ?? ""} ${i === 0 ? "main" : ""}"><div class="l">${l}</div><div class="big">${v}</div></div>`,
    )
    .join("")}</div>
${section(
  "הכנסות לפי פלטפורמה",
  table(
    ["פלטפורמה", "נסיעות", "ברוטו", "טיפים", "נטו"],
    [...byPlatform.entries()]
      .sort((a, b) => b[1].net - a[1].net)
      .map(([name, p]) => [esc(name), num(p.count), money(p.gross), money(p.tips), money(p.net)]),
    [1, 2, 3, 4],
  ) +
    (byPlatform.size
      ? `<table class="k" style="margin-top:8px"><tbody><tr class="total"><td>סה"כ ברוטו ${money(t.gross)}</td><td>עמלות ${money(t.commission)}</td><td>נטו ${money(t.incomeNet)}</td></tr></tbody></table>`
      : ""),
)}
${section(
  "לאן הלך הכסף",
  cats.length
    ? cats
        .map(
          ([name, v]) =>
            `<div class="bar k"><span class="name">${esc(name)}</span><span class="track"><span class="fill" style="display:block;width:${Math.max(2, Math.round((v / catMax) * 100))}%"></span></span><span class="v">${money(v)}</span></div>`,
        )
        .join("")
    : `<p class="empty k">אין הוצאות בתקופה הזו.</p>`,
)}
${section(
  "פירוט לפי ימים",
  table(
    ["תאריך", "הכנסה נטו", "הוצאות", "רווח", 'ק"מ', "שעות"],
    activeDays.map((d) => [
      shortDate(d.date),
      money(d.incomeNet),
      money(d.costs),
      `<b class="${d.net < 0 ? "neg" : "pos"}">${money(d.net)}</b>`,
      num(d.km, 1),
      num(d.hours, 1),
    ]),
    [1, 2, 3, 4, 5],
  ),
)}
${section(
  "הכנסות",
  table(
    ["תאריך", "פלטפורמה", "ברוטו", "עמלה", "נטו", "הערה"],
    r.incomes.map((i) => [
      `${shortDate(i.date)}${i.time ? ` <span class="note">${esc(i.time)}</span>` : ""}`,
      esc(i.platform),
      money(i.amount),
      `${num(i.commissionPct)}%`,
      money(netFromIncome(i)),
      `<span class="note">${esc(i.note)}</span>`,
    ]),
    [2, 3, 4],
  ),
)}
${section(
  "הוצאות",
  table(
    ["תאריך", "קטגוריה", "סכום", "הערה"],
    r.expenses.map((e) => [
      shortDate(e.date),
      esc(categoryLabel(e.category)),
      money(e.amount),
      `<span class="note">${esc(e.category === "fuel" ? `${e.note ?? ""} (תדלוק בפועל, להשוואה)`.trim() : e.note)}</span>`,
    ]),
    [2],
  ),
)}
${section(
  "נסיעות GPS",
  table(
    ["תאריך", "שעה", 'ק"מ', "משך"],
    workTrips.map((x) => [
      shortDate(x.date),
      esc(x.time ?? ""),
      num(x.km, 1),
      `${Math.round(x.seconds / 60)} דק׳`,
    ]),
    [2],
  ),
)}
<footer class="k">הופק באפליקציית דרייבר · הדלק מחושב לפי הק"מ שנסעת ומחיר הדלק באותו יום</footer>
</body></html>`;
}
