import { r as reactExports, j as jsxRuntimeExports } from "../_libs/react.mjs";
import { I as Input } from "./label-BSJvlS_H.mjs";
import { c as cn } from "./router-DjatMlVs.mjs";
function parseNumber(text) {
  if (typeof text === "number") return Number.isFinite(text) ? text : null;
  if (text == null) return null;
  let s = text.trim().replace(/[\s‏‎₪]/g, "");
  if (s === "") return null;
  if (s.includes(".") && s.includes(",")) s = s.replace(/,/g, "");
  else if (/^-?\d{1,3}(,\d{3})+$/.test(s)) s = s.replace(/,/g, "");
  else s = s.replace(",", ".");
  if (!/^-?(\d+\.?\d*|\.\d+)$/.test(s)) return null;
  const n = Number(s);
  return Number.isFinite(n) ? n : null;
}
function numberOr(text, fallback) {
  return parseNumber(text) ?? fallback;
}
function sanitizeNumberInput(text) {
  return text.replace(/[^\d.,-]/g, "");
}
const NumberField = reactExports.forwardRef(function NumberField2({ value, onValueChange, error, className, id, ...rest }, ref) {
  const errorId = id ? `${id}-error` : void 0;
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      Input,
      {
        ref,
        id,
        inputMode: "decimal",
        autoComplete: "off",
        value,
        onChange: (e) => onValueChange(sanitizeNumberInput(e.target.value)),
        "aria-invalid": error ? true : void 0,
        "aria-describedby": error ? errorId : void 0,
        className: cn(error && "border-destructive focus-visible:ring-destructive", className),
        ...rest
      }
    ),
    error && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { id: errorId, className: "text-[11px] font-medium text-destructive", role: "alert", children: error })
  ] });
});
function checkNumber(text, rule) {
  const empty = text.trim() === "";
  if (empty) return rule.required ? "שדה חובה" : void 0;
  const n = parseNumber(text);
  if (n === null) return "מספר לא תקין";
  if (rule.positive && n <= 0) return "צריך להיות גדול מאפס";
  if (rule.min !== void 0 && n < rule.min) return `מינימום ${rule.min}`;
  if (rule.max !== void 0 && n > rule.max) return `מקסימום ${rule.max}`;
  return void 0;
}
function checkDate(text) {
  if (!text) return "צריך לבחור תאריך";
  return /^\d{4}-\d{2}-\d{2}$/.test(text) ? void 0 : "תאריך לא תקין";
}
const clean = (e) => Object.fromEntries(Object.entries(e).filter(([, v]) => v));
function validateIncome(f) {
  return clean({
    date: checkDate(f.date),
    amount: checkNumber(f.amount, { required: true, positive: true }),
    commissionPct: checkNumber(f.commissionPct, { min: 0, max: 100 }),
    tip: checkNumber(f.tip ?? "", { min: 0 }),
    hours: checkNumber(f.hours ?? "", { min: 0, max: 24 }),
    km: checkNumber(f.km ?? "", { min: 0, max: 2e3 })
  });
}
function validateExpense(f) {
  return clean({
    date: checkDate(f.date),
    amount: checkNumber(f.amount, { required: true, positive: true })
  });
}
export {
  NumberField as N,
  validateExpense as a,
  checkDate as b,
  checkNumber as c,
  numberOr as n,
  parseNumber as p,
  validateIncome as v
};
