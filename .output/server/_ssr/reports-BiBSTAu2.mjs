import { r as reactExports, j as jsxRuntimeExports } from "../_libs/react.mjs";
import { L as Link } from "../_libs/tanstack__react-router.mjs";
import { u as useAppData, m as monthRange, a as filterByRange, v as categoryLabel, L as fmtDateShort, B as Button, f as fmt, b as fmtPrecise, t as todayISO, c as cn, N as netFromIncome, x as isNativeApp, O as effectiveFuelParams } from "./router-CcPEcE51.mjs";
import { u as useDays, s as sumDays, p as perKm } from "./index-RgmvL_P0.mjs";
import { t as toast } from "../_libs/sonner.mjs";
import { R as Root2, T as Trigger, P as Portal2, C as Content2, I as Item2, S as SubTrigger2, a as SubContent2, b as CheckboxItem2, c as ItemIndicator2, d as RadioItem2, L as Label2, e as Separator2 } from "../_libs/radix-ui__react-dropdown-menu.mjs";
import { P as PageHeader } from "./PageHeader-507zMUYd.mjs";
import { C as Card, a as CardContent } from "./MovieStage-0WygtrCr.mjs";
import { T as Tabs, a as TabsList, b as TabsTrigger } from "./tabs-DIauUNjD.mjs";
import { R as RecordsList } from "./RecordsList-CzyCqE5D.mjs";
import { z as Map$1, x as ChevronRight, l as ChevronLeft, B as LoaderCircle, D as Download, E as FileText, J as FileSpreadsheet, K as Clock, a as Check, O as Circle } from "../_libs/lucide-react.mjs";

import "../_libs/tanstack__router-core.mjs";
import "../_libs/tanstack__history.mjs";
import "../_libs/seroval.mjs";
import "../_libs/unenv.mjs";


import "../_libs/cookie-es.mjs";
import "../_libs/seroval-plugins.mjs";

import "../_libs/react-dom.mjs";
import "../_libs/isbot.mjs";
import "../_libs/clsx.mjs";
import "../_libs/tailwind-merge.mjs";
import "../_libs/radix-ui__react-slot.mjs";
import "../_libs/radix-ui__react-compose-refs.mjs";
import "../_libs/class-variance-authority.mjs";
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
import "../_libs/radix-ui__react-tabs.mjs";
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
const DropdownMenu = Root2;
const DropdownMenuTrigger = Trigger;
const DropdownMenuSubTrigger = reactExports.forwardRef(({ className, inset, children, ...props }, ref) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
  SubTrigger2,
  {
    ref,
    className: cn(
      "flex cursor-default select-none items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-none focus:bg-accent data-[state=open]:bg-accent [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
      inset && "pl-8",
      className
    ),
    ...props,
    children: [
      children,
      /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronRight, { className: "ml-auto" })
    ]
  }
));
DropdownMenuSubTrigger.displayName = SubTrigger2.displayName;
const DropdownMenuSubContent = reactExports.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsxRuntimeExports.jsx(
  SubContent2,
  {
    ref,
    className: cn(
      "z-50 min-w-[8rem] overflow-hidden rounded-md border bg-popover p-1 text-popover-foreground shadow-lg data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 origin-(--radix-dropdown-menu-content-transform-origin)",
      className
    ),
    ...props
  }
));
DropdownMenuSubContent.displayName = SubContent2.displayName;
const DropdownMenuContent = reactExports.forwardRef(({ className, sideOffset = 4, ...props }, ref) => /* @__PURE__ */ jsxRuntimeExports.jsx(Portal2, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(
  Content2,
  {
    ref,
    sideOffset,
    className: cn(
      "z-50 max-h-[var(--radix-dropdown-menu-content-available-height)] min-w-[8rem] overflow-y-auto overflow-x-hidden rounded-md border bg-popover p-1 text-popover-foreground shadow-md",
      "data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 origin-(--radix-dropdown-menu-content-transform-origin)",
      className
    ),
    ...props
  }
) }));
DropdownMenuContent.displayName = Content2.displayName;
const DropdownMenuItem = reactExports.forwardRef(({ className, inset, ...props }, ref) => /* @__PURE__ */ jsxRuntimeExports.jsx(
  Item2,
  {
    ref,
    className: cn(
      "relative flex cursor-default select-none items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-none transition-colors focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50 [&>svg]:size-4 [&>svg]:shrink-0",
      inset && "pl-8",
      className
    ),
    ...props
  }
));
DropdownMenuItem.displayName = Item2.displayName;
const DropdownMenuCheckboxItem = reactExports.forwardRef(({ className, children, checked, ...props }, ref) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
  CheckboxItem2,
  {
    ref,
    className: cn(
      "relative flex cursor-default select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none transition-colors focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
      className
    ),
    checked,
    ...props,
    children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "absolute left-2 flex h-3.5 w-3.5 items-center justify-center", children: /* @__PURE__ */ jsxRuntimeExports.jsx(ItemIndicator2, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(Check, { className: "h-4 w-4" }) }) }),
      children
    ]
  }
));
DropdownMenuCheckboxItem.displayName = CheckboxItem2.displayName;
const DropdownMenuRadioItem = reactExports.forwardRef(({ className, children, ...props }, ref) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
  RadioItem2,
  {
    ref,
    className: cn(
      "relative flex cursor-default select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none transition-colors focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
      className
    ),
    ...props,
    children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "absolute left-2 flex h-3.5 w-3.5 items-center justify-center", children: /* @__PURE__ */ jsxRuntimeExports.jsx(ItemIndicator2, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(Circle, { className: "h-2 w-2 fill-current" }) }) }),
      children
    ]
  }
));
DropdownMenuRadioItem.displayName = RadioItem2.displayName;
const DropdownMenuLabel = reactExports.forwardRef(({ className, inset, ...props }, ref) => /* @__PURE__ */ jsxRuntimeExports.jsx(
  Label2,
  {
    ref,
    className: cn("px-2 py-1.5 text-sm font-semibold", inset && "pl-8", className),
    ...props
  }
));
DropdownMenuLabel.displayName = Label2.displayName;
const DropdownMenuSeparator = reactExports.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsxRuntimeExports.jsx(
  Separator2,
  {
    ref,
    className: cn("-mx-1 my-1 h-px bg-muted", className),
    ...props
  }
));
DropdownMenuSeparator.displayName = Separator2.displayName;
function csvCell(v) {
  const s = v == null ? "" : String(v);
  return /[",\r\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}
const row = (cells) => cells.map(csvCell).join(",");
const money = (n) => n.toFixed(2);
function fuelFor(km, date, time, data) {
  if (km <= 0) return 0;
  const p = effectiveFuelParams(date, data.vehicle, data.settings, time);
  return km / (p.consumption > 0 ? p.consumption : 1) * p.price;
}
function buildReportCsv(data, r) {
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
      "הערה"
    ])
  ];
  for (const i of r.incomes) {
    const km = i.tripId ? 0 : i.km || 0;
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
        i.note
      ])
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
        e.category === "fuel" ? `${e.note ?? ""} (תדלוק בפועל, להשוואה)`.trim() : e.note
      ])
    );
  }
  for (const t of r.trips) {
    lines.push(
      row([
        t.kind === "between" ? "בין נסיעות" : "נסיעה",
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
        t.note
      ])
    );
  }
  return lines.join("\r\n");
}
function exportCsv(name, csv) {
  return exportFile(new File(["\uFEFF" + csv], name, { type: "text/csv" }), csv);
}
async function exportFile(file, copyFallback) {
  if (!isNativeApp()) {
    const url = URL.createObjectURL(file);
    const a = document.createElement("a");
    a.href = url;
    a.download = file.name;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 3e4);
    return "downloaded";
  }
  const saved = await shareNativeFile(file);
  if (saved) return saved;
  if (navigator.canShare?.({ files: [file] })) {
    try {
      await navigator.share({ files: [file], title: file.name });
      return "shared";
    } catch (e) {
      if (e.name === "AbortError") return "shared";
    }
  }
  if (copyFallback == null) return "failed";
  return await copyText(copyFallback) ? "copied" : "failed";
}
async function shareNativeFile(file) {
  const cap = window.Capacitor;
  if (!cap?.nativePromise || !cap.Plugins?.Filesystem || !cap.Plugins?.Share) return null;
  try {
    const { uri } = await cap.nativePromise("Filesystem", "writeFile", {
      path: file.name,
      data: await toBase64(file),
      directory: "CACHE"
    });
    await cap.nativePromise("Share", "share", { title: file.name, files: [uri] });
    return "shared";
  } catch (e) {
    if (/cancel/i.test(String(e?.message ?? e))) return "shared";
    return null;
  }
}
function toBase64(blob) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result).split(",")[1] ?? "");
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(blob);
  });
}
async function copyText(text) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    const area = document.createElement("textarea");
    area.value = text;
    area.setAttribute("readonly", "");
    area.style.position = "fixed";
    area.style.opacity = "0";
    document.body.appendChild(area);
    area.select();
    const ok = document.execCommand("copy");
    area.remove();
    return ok;
  }
}
const PAGE_WIDTH = 794;
const PAGE_HEIGHT = Math.round(PAGE_WIDTH * 297 / 210);
const esc = (s) => String(s ?? "").replace(
  /[&<>"']/g,
  (ch) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[ch]
);
const num = (n, digits = 0) => n.toLocaleString("he-IL", { minimumFractionDigits: digits, maximumFractionDigits: digits });
const shortDate = (iso) => {
  const [y, m, d] = iso.split("-").map(Number);
  return `${d}.${m}.${String(y).slice(2)}`;
};
function buildReportHtml(r) {
  const c = r.currency;
  const money2 = (n, digits = 0) => {
    const v = num(Math.abs(n), digits);
    return `<bdi>${n < 0 ? "-" : ""}${v} ${esc(c)}</bdi>`;
  };
  const t = r.totals;
  const perKm2 = t.km > 0 ? t.net / t.km : null;
  const perHour = t.hours > 0 ? t.net / t.hours : null;
  const margin = t.incomeNet > 0 ? Math.round(t.net / t.incomeNet * 100) : null;
  const kpis = [
    ["רווח נקי", money2(t.net), t.net < 0 ? "neg" : "pos"],
    ["הכנסה נטו", money2(t.incomeNet)],
    ["הוצאות", money2(t.costs)],
    ["ימי עבודה", num(t.daysWorked)],
    ["שעות עבודה", num(t.hours, 1)],
    ['ק"מ', num(t.km, 1)],
    ['רווח לק"מ', perKm2 == null ? "—" : money2(perKm2, 2)],
    ["רווח לשעה", perHour == null ? "—" : money2(perHour)],
    ["אחוז רווחיות", margin == null ? "—" : `${margin}%`]
  ];
  const byPlatform = /* @__PURE__ */ new Map();
  for (const i of r.incomes) {
    const p = byPlatform.get(i.platform) ?? { count: 0, gross: 0, net: 0, tips: 0 };
    p.count += 1;
    p.gross += i.amount;
    p.tips += i.tip || 0;
    p.net += netFromIncome(i);
    byPlatform.set(i.platform, p);
  }
  const byCategory = /* @__PURE__ */ new Map();
  for (const e of r.expenses) {
    if (e.category === "fuel") continue;
    const k = categoryLabel(e.category);
    byCategory.set(k, (byCategory.get(k) ?? 0) + e.amount);
  }
  if (t.fuelEstimated > 0) byCategory.set("דלק לפי ק״מ", t.fuelEstimated);
  const cats = [...byCategory.entries()].sort((a, b) => b[1] - a[1]);
  const catMax = Math.max(1, ...cats.map(([, v]) => v));
  const workTrips = r.trips.filter((x) => !x.kind || x.kind === "work");
  const activeDays = r.days.filter((d) => d.incomes.length || d.expenses.length || d.km > 0);
  const table = (head, rows, numeric = []) => {
    const cls = (i) => numeric.includes(i) ? ' class="n"' : "";
    return rows.length ? `<table><thead class="k"><tr>${head.map((h, i) => `<th${cls(i)}>${h}</th>`).join("")}</tr></thead><tbody>${rows.map(
      (row2) => `<tr class="k">${row2.map((cell, i) => `<td${cls(i)}>${cell}</td>`).join("")}</tr>`
    ).join("")}</tbody></table>` : `<p class="empty k">אין רשומות בתקופה הזו.</p>`;
  };
  const section = (title, body) => `<section><h2 class="k">${title}</h2>${body}</section>`;
  const now = r.now ?? /* @__PURE__ */ new Date();
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
<div class="kpis">${kpis.map(
    ([l, v, cls], i) => `<div class="kpi k ${cls ?? ""} ${i === 0 ? "main" : ""}"><div class="l">${l}</div><div class="big">${v}</div></div>`
  ).join("")}</div>
${section(
    "הכנסות לפי פלטפורמה",
    table(
      ["פלטפורמה", "נסיעות", "ברוטו", "טיפים", "נטו"],
      [...byPlatform.entries()].sort((a, b) => b[1].net - a[1].net).map(([name, p]) => [esc(name), num(p.count), money2(p.gross), money2(p.tips), money2(p.net)]),
      [1, 2, 3, 4]
    ) + (byPlatform.size ? `<table class="k" style="margin-top:8px"><tbody><tr class="total"><td>סה"כ ברוטו ${money2(t.gross)}</td><td>עמלות ${money2(t.commission)}</td><td>נטו ${money2(t.incomeNet)}</td></tr></tbody></table>` : "")
  )}
${section(
    "לאן הלך הכסף",
    cats.length ? cats.map(
      ([name, v]) => `<div class="bar k"><span class="name">${esc(name)}</span><span class="track"><span class="fill" style="display:block;width:${Math.max(2, Math.round(v / catMax * 100))}%"></span></span><span class="v">${money2(v)}</span></div>`
    ).join("") : `<p class="empty k">אין הוצאות בתקופה הזו.</p>`
  )}
${section(
    "פירוט לפי ימים",
    table(
      ["תאריך", "הכנסה נטו", "הוצאות", "רווח", 'ק"מ', "שעות"],
      activeDays.map((d) => [
        shortDate(d.date),
        money2(d.incomeNet),
        money2(d.costs),
        `<b class="${d.net < 0 ? "neg" : "pos"}">${money2(d.net)}</b>`,
        num(d.km, 1),
        num(d.hours, 1)
      ]),
      [1, 2, 3, 4, 5]
    )
  )}
${section(
    "הכנסות",
    table(
      ["תאריך", "פלטפורמה", "ברוטו", "עמלה", "נטו", "הערה"],
      r.incomes.map((i) => [
        `${shortDate(i.date)}${i.time ? ` <span class="note">${esc(i.time)}</span>` : ""}`,
        esc(i.platform),
        money2(i.amount),
        `${num(i.commissionPct)}%`,
        money2(netFromIncome(i)),
        `<span class="note">${esc(i.note)}</span>`
      ]),
      [2, 3, 4]
    )
  )}
${section(
    "הוצאות",
    table(
      ["תאריך", "קטגוריה", "סכום", "הערה"],
      r.expenses.map((e) => [
        shortDate(e.date),
        esc(categoryLabel(e.category)),
        money2(e.amount),
        `<span class="note">${esc(e.category === "fuel" ? `${e.note ?? ""} (תדלוק בפועל, להשוואה)`.trim() : e.note)}</span>`
      ]),
      [2]
    )
  )}
${section(
    "נסיעות GPS",
    table(
      ["תאריך", "שעה", 'ק"מ', "משך"],
      workTrips.map((x) => [
        shortDate(x.date),
        esc(x.time ?? ""),
        num(x.km, 1),
        `${Math.round(x.seconds / 60)} דק׳`
      ]),
      [2]
    )
  )}
<footer class="k">הופק באפליקציית דרייבר · הדלק מחושב לפי הק"מ שנסעת ומחיר הדלק באותו יום</footer>
</body></html>`;
}
function ReportExportMenu({ data, from, to, report }) {
  const [busy, setBusy] = reactExports.useState(false);
  const name = `driver-report-${from}-to-${to}`;
  const pdf = async () => {
    setBusy(true);
    try {
      const v = data.vehicle;
      const html = buildReportHtml({
        ...report,
        title: "דוח רווחיות",
        currency: data.settings.currency,
        vehicle: [v.make, v.model, v.year].filter(Boolean).join(" ") || void 0,
        art: new URL("/characters/captain-proud.webp", window.location.origin).href
      });
      const { renderReportPdf } = await import("./report-pdf-7UTtQBew.mjs");
      const blob = await renderReportPdf(html);
      const result = await exportFile(new File([blob], `${name}.pdf`, { type: "application/pdf" }));
      if (result === "failed") toast("כדי לשמור PDF באפליקציה צריך את הגרסה החדשה שלה.");
    } catch {
      toast("לא הצלחנו להכין את הדוח. נסה שוב.");
    } finally {
      setBusy(false);
    }
  };
  const csv = async () => {
    const result = await exportCsv(
      `${name}.csv`,
      buildReportCsv(data, {
        incomes: report.incomes,
        expenses: report.expenses,
        trips: report.trips
      })
    );
    if (result === "copied") toast("הדוח הועתק. אפשר להדביק אותו בגיליון, במייל או בוואטסאפ.");
    else if (result === "failed") toast("לא הצלחנו לייצא את הדוח מכאן. נסה מהדפדפן.");
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(DropdownMenu, { dir: "rtl", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(DropdownMenuTrigger, { asChild: true, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { size: "sm", variant: "outline", disabled: busy, children: [
      busy ? /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "ml-1 h-4 w-4 animate-spin" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(Download, { className: "ml-1 h-4 w-4" }),
      "ייצוא"
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(DropdownMenuContent, { align: "end", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DropdownMenuItem, { onSelect: () => void pdf(), children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(FileText, { className: "ml-2 h-4 w-4" }),
        "דוח PDF מעוצב"
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DropdownMenuItem, { onSelect: () => void csv(), children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(FileSpreadsheet, { className: "ml-2 h-4 w-4" }),
        "קובץ לגיליון (CSV)"
      ] })
    ] })
  ] });
}
const BLOCKS = [
  { from: 6, label: "06–10" },
  { from: 10, label: "10–14" },
  { from: 14, label: "14–18" },
  { from: 18, label: "18–22" },
  { from: 22, label: "22–02" },
  { from: 2, label: "02–06" }
];
const WEEKDAYS = ["א׳", "ב׳", "ג׳", "ד׳", "ה׳", "ו׳", "ש׳"];
const WINDOW_DAYS = 90;
const MIN_DAYS = 2;
function blockOf(hour) {
  if (hour >= 22 || hour < 2) return 4;
  if (hour < 6) return 5;
  return Math.floor((hour - 6) / 4);
}
const weekdayOf = (date) => {
  const [y, m, d] = date.split("-").map(Number);
  return new Date(y, m - 1, d).getDay();
};
function bestHours(data, today) {
  const [y, m, d] = today.split("-").map(Number);
  const from = new Date(y, m - 1, d - (WINDOW_DAYS - 1));
  const since = `${from.getFullYear()}-${String(from.getMonth() + 1).padStart(2, "0")}-${String(from.getDate()).padStart(2, "0")}`;
  const tripTime = new Map((data.trips ?? []).map((t) => [t.id, t.time]));
  const cells = /* @__PURE__ */ new Map();
  for (const income of data.incomes) {
    if (income.date < since || income.date > today) continue;
    const time = income.tripId && tripTime.get(income.tripId) || income.time;
    const hour = time ? Number(time.slice(0, 2)) : NaN;
    if (!Number.isFinite(hour)) continue;
    const key = `${weekdayOf(income.date)}:${blockOf(hour)}`;
    let cell = cells.get(key);
    if (!cell) cells.set(key, cell = { total: 0, dates: /* @__PURE__ */ new Set() });
    cell.total += netFromIncome(income);
    cell.dates.add(income.date);
  }
  const slots = [...cells].map(([key, c]) => {
    const [weekday, block] = key.split(":").map(Number);
    return { weekday, block, total: c.total, days: c.dates.size, avg: c.total / c.dates.size };
  });
  const best = slots.filter((s) => s.days >= MIN_DAYS).sort((a, b) => b.avg - a.avg)[0] ?? null;
  return { slots, best };
}
const STEPS = [18, 36, 54, 72, 90];
const shade = (pct) => `color-mix(in oklab, var(--primary) ${pct}%, var(--card))`;
const hours = (label) => `⁦${label}⁩`;
const slotName = (weekday, block) => `יום ${WEEKDAYS[weekday]} ${hours(BLOCKS[block].label)}`;
function BestHoursCard({ data }) {
  const c = data.settings.currency;
  const { slots, best } = reactExports.useMemo(() => bestHours(data, todayISO()), [data]);
  const [picked, setPicked] = reactExports.useState(null);
  const byKey = new Map(slots.map((s) => [`${s.weekday}:${s.block}`, s]));
  const max = Math.max(0, ...slots.map((s) => s.avg));
  const stepOf = (s) => max > 0 ? STEPS[Math.min(STEPS.length - 1, Math.floor(s.avg / max * STEPS.length))] : 0;
  const pickedSlot = picked ? byKey.get(`${picked.weekday}:${picked.block}`) : void 0;
  const describe = (s) => `${slotName(s.weekday, s.block)}: ממוצע ${fmt(s.avg, c)} ליום עבודה (${s.days} ${s.days === 1 ? "יום" : "ימים"})`;
  return /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { className: "space-y-3 p-4", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("h3", { className: "flex items-center gap-1.5 text-sm font-semibold", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Clock, { className: "h-4 w-4 text-primary" }),
        " מתי הכי משתלם לעבוד"
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-muted-foreground", children: [
        "ממוצע נטו ליום עבודה בכל משבצת · ",
        WINDOW_DAYS,
        " הימים האחרונים"
      ] })
    ] }),
    slots.length < 3 ? /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground", children: "אחרי עוד כמה ימי עבודה תופיע כאן מפה של השעות המשתלמות." }) : /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
      best && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-xl bg-primary/10 px-3 py-2 text-sm", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-muted-foreground", children: "הכי משתלם: " }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("strong", { className: "num", children: [
          slotName(best.weekday, best.block),
          " · ",
          fmt(best.avg, c)
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(
        "div",
        {
          className: "grid gap-[2px] text-center text-[10px]",
          style: { gridTemplateColumns: `1.6rem repeat(${BLOCKS.length}, minmax(0, 1fr))` },
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", {}),
            BLOCKS.map((b) => /* @__PURE__ */ jsxRuntimeExports.jsx("span", { dir: "ltr", className: "num pb-0.5 text-muted-foreground", children: b.label }, b.label)),
            WEEKDAYS.map((day, weekday) => /* @__PURE__ */ jsxRuntimeExports.jsx(
              Row,
              {
                day,
                weekday,
                byKey,
                best,
                picked,
                stepOf,
                describe,
                onPick: setPicked
              },
              day
            ))
          ]
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between gap-2 text-[10px] text-muted-foreground", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "flex items-center gap-1", "aria-hidden": "true", children: [
          "פחות",
          STEPS.map((p) => /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "h-2.5 w-4 rounded-sm", style: { background: shade(p) } }, p)),
          "יותר"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "★ הכי משתלם" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "num min-h-[1.25rem] text-xs font-medium", "aria-live": "polite", children: picked ? pickedSlot ? describe(pickedSlot) : `${slotName(picked.weekday, picked.block)}: לא עבדת במשבצת הזו` : "לחץ על משבצת כדי לראות את הסכום" })
    ] })
  ] }) });
}
function Row({
  day,
  weekday,
  byKey,
  best,
  picked,
  stepOf,
  describe,
  onPick
}) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "flex items-center justify-center font-semibold text-muted-foreground", children: day }),
    BLOCKS.map((_, block) => {
      const slot = byKey.get(`${weekday}:${block}`);
      const isBest = best?.weekday === weekday && best.block === block;
      const isPicked = picked?.weekday === weekday && picked.block === block;
      return /* @__PURE__ */ jsxRuntimeExports.jsx(
        "button",
        {
          type: "button",
          onClick: () => onPick({ weekday, block }),
          "aria-label": slot ? describe(slot) : `${slotName(weekday, block)}: אין נתונים`,
          "aria-pressed": isPicked,
          className: `flex h-7 items-center justify-center rounded text-[11px] font-bold ${slot ? "" : "border border-dashed border-border"} ${isPicked ? "outline outline-2 outline-offset-1 outline-foreground" : ""}`,
          style: slot ? { background: shade(stepOf(slot)) } : void 0,
          children: isBest && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: stepOf(slot) >= 54 ? "text-primary-foreground" : "text-foreground", children: "★" })
        },
        block
      );
    })
  ] });
}
const ExpensePie = reactExports.lazy(() => import("./ExpensePie-wqMfRxps.mjs"));
function isoToday() {
  const d = /* @__PURE__ */ new Date();
  return new Date(d.getTime() - d.getTimezoneOffset() * 6e4).toISOString().slice(0, 10);
}
function Reports() {
  const {
    data,
    ready
  } = useAppData();
  const days = useDays(data);
  const [range, setRange] = reactExports.useState("month");
  const [monthsBack, setMonthsBack] = reactExports.useState(0);
  const {
    from,
    to
  } = reactExports.useMemo(() => {
    const now = /* @__PURE__ */ new Date();
    const iso = (d) => new Date(d.getTime() - d.getTimezoneOffset() * 6e4).toISOString().slice(0, 10);
    if (range === "today") return {
      from: isoToday(),
      to: isoToday()
    };
    if (range === "week") {
      const d = /* @__PURE__ */ new Date();
      d.setDate(d.getDate() - 6);
      return {
        from: iso(d),
        to: isoToday()
      };
    }
    if (range === "month") return monthRange(now.getFullYear(), now.getMonth() - monthsBack);
    return {
      from: "0000-01-01",
      to: "9999-12-31"
    };
  }, [range, monthsBack]);
  if (!ready) return null;
  const c = data.settings.currency;
  const incomes = filterByRange(data.incomes, from, to);
  const expenses = filterByRange(data.expenses, from, to);
  const trips = filterByRange(data.trips ?? [], from, to);
  const totals = sumDays(days, from, to);
  const incomeTotal = totals.incomeNet;
  const expenseTotal = totals.costs;
  const net = totals.net;
  const daysWorked = totals.daysWorked;
  const totalHours = totals.hours;
  const netPerKm = perKm(totals);
  const grossTotal = totals.gross;
  const commissionTotal = totals.commission;
  const profitabilityPct = incomeTotal > 0 ? Math.round(net / incomeTotal * 100) : 0;
  const byCategory = /* @__PURE__ */ new Map();
  for (const e of expenses) {
    if (e.category === "fuel") continue;
    byCategory.set(e.category, (byCategory.get(e.category) || 0) + e.amount);
  }
  const fuelCharged = totals.fuelEstimated;
  if (fuelCharged > 0) byCategory.set("fuel", fuelCharged);
  const pieData = Array.from(byCategory.entries()).map(([k, v]) => ({
    name: categoryLabel(k),
    value: Math.round(v)
  }));
  const period = range === "all" ? "כל הרשומות" : `${fmtDateShort(from)} – ${fmtDateShort(to)}`;
  const reportDays = [...days.values()].filter((d) => d.date >= from && d.date <= to).sort((a, b) => a.date.localeCompare(b.date));
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mx-auto max-w-xl", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(PageHeader, { title: "דוחות", subtitle: period, action: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { asChild: true, size: "sm", variant: "outline", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Link, { to: "/map", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Map$1, { className: "h-4 w-4 ml-1" }),
        "מפה"
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(ReportExportMenu, { data, from, to, report: {
        period,
        totals,
        days: reportDays,
        incomes,
        expenses,
        trips
      } })
    ] }), scene: {
      mood: "smirk",
      prop: "chart",
      line: "בוא נראה לאן הלך כל שקל"
    } }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "px-4 space-y-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Tabs, { dir: "rtl", value: range, onValueChange: (v) => setRange(v), children: /* @__PURE__ */ jsxRuntimeExports.jsxs(TabsList, { className: "grid grid-cols-4 w-full", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(TabsTrigger, { value: "today", children: "היום" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TabsTrigger, { value: "week", children: "שבוע" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TabsTrigger, { value: "month", children: "חודש" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TabsTrigger, { value: "all", children: "הכל" })
      ] }) }),
      range === "month" && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between rounded-xl border bg-card px-2 py-1", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "ghost", size: "icon", "aria-label": "החודש הקודם", onClick: () => setMonthsBack((m) => m + 1), children: /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronRight, { className: "h-4 w-4" }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-sm font-semibold", children: (/* @__PURE__ */ new Date(`${from}T12:00:00`)).toLocaleDateString("he-IL", {
          month: "long",
          year: "numeric"
        }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "ghost", size: "icon", "aria-label": "החודש הבא", disabled: monthsBack === 0, onClick: () => setMonthsBack((m) => Math.max(0, m - 1)), children: /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronLeft, { className: "h-4 w-4" }) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "premium-stat col-span-2", style: {
          minHeight: 0
        }, "data-fill": "green", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs font-semibold text-muted-foreground", children: "רווח נקי" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: `num font-display mt-1 text-4xl font-bold tracking-tight ${net < 0 ? "text-destructive" : "text-primary"}`, children: fmt(net, c) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "num mt-1.5 text-xs font-medium text-muted-foreground", children: [
            "רווחיות ",
            profitabilityPct,
            "% · ",
            daysWorked,
            " ימי עבודה ·",
            " ",
            fmt(daysWorked ? Math.round(net / daysWorked) : 0, c),
            " ליום"
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "premium-stat", style: {
          minHeight: 0,
          padding: "0.875rem"
        }, "data-fill": "slate", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[11px] text-muted-foreground", children: "הכנסות (נטו)" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "num mt-0.5 text-xl font-bold tracking-tight text-success", children: fmt(incomeTotal, c) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "premium-stat", style: {
          minHeight: 0,
          padding: "0.875rem"
        }, "data-fill": "vermilion", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[11px] text-muted-foreground", children: "הוצאות" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "num mt-0.5 text-xl font-bold tracking-tight text-destructive", children: fmt(expenseTotal, c) })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { className: "p-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "mb-2 text-sm font-semibold", children: "פירוט" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("dl", { className: "num divide-y divide-border text-sm", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Line, { label: "ממוצע לשעה", value: fmt(totalHours ? Math.round(net / totalHours) : 0, c) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Line, { label: "ממוצע לק״מ", value: netPerKm === null ? "—" : fmtPrecise(netPerKm, c) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Line, { label: "ק״מ", value: Math.round(totals.km).toLocaleString("he-IL") }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Line, { label: "ברוטו לפני עמלה", value: fmt(grossTotal, c) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Line, { label: "עמלות חברה", value: fmt(commissionTotal, c), bad: true }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Line, { label: "דלק משוער (לפי ק״מ)", value: fmt(totals.fuelEstimated, c), bad: true })
        ] })
      ] }) }),
      pieData.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { className: "p-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "text-sm font-semibold mb-3", children: "פירוט הוצאות לפי קטגוריה" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-56", children: /* @__PURE__ */ jsxRuntimeExports.jsx(reactExports.Suspense, { fallback: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-full animate-pulse rounded-xl bg-muted/40" }), children: /* @__PURE__ */ jsxRuntimeExports.jsx(ExpensePie, { data: [...pieData], currency: c }) }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-3 space-y-1.5", children: pieData.sort((a, b) => b.value - a.value).map((p) => {
          const pct = expenseTotal > 0 ? Math.round(p.value / expenseTotal * 100) : 0;
          return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between text-sm", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: p.name }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-muted-foreground", children: [
              fmt(p.value, c),
              " · ",
              pct,
              "%"
            ] })
          ] }, p.name);
        }) })
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(BestHoursCard, { data }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("h3", { className: "mb-2 px-1 text-sm font-semibold", children: [
          "רשומות בטווח (",
          incomes.length + expenses.length,
          ")"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(RecordsList, { incomes, expenses })
      ] })
    ] })
  ] });
}
function Line({
  label,
  value,
  bad
}) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between gap-3 py-2", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("dt", { className: "text-muted-foreground", children: label }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("dd", { className: `font-bold ${bad ? "text-destructive" : "text-foreground"}`, children: value })
  ] });
}
const reports = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  component: Reports
}, Symbol.toStringTag, { value: "Module" }));
export {
  PAGE_WIDTH as P,
  PAGE_HEIGHT as a,
  reports as r
};
