import { parseNumber } from "./number";

export type FieldErrors = Partial<Record<string, string>>;

type Rule = { required?: boolean; min?: number; max?: number; positive?: boolean; label?: string };

/** Checks one numeric text field. Returns a Hebrew message or undefined. */
export function checkNumber(text: string, rule: Rule): string | undefined {
  const empty = text.trim() === "";
  if (empty) return rule.required ? "שדה חובה" : undefined;
  const n = parseNumber(text);
  if (n === null) return "מספר לא תקין";
  if (rule.positive && n <= 0) return "צריך להיות גדול מאפס";
  if (rule.min !== undefined && n < rule.min) return `מינימום ${rule.min}`;
  if (rule.max !== undefined && n > rule.max) return `מקסימום ${rule.max}`;
  return undefined;
}

export function checkDate(text: string): string | undefined {
  if (!text) return "צריך לבחור תאריך";
  return /^\d{4}-\d{2}-\d{2}$/.test(text) ? undefined : "תאריך לא תקין";
}

const clean = (e: FieldErrors) =>
  Object.fromEntries(Object.entries(e).filter(([, v]) => v)) as FieldErrors;

export function validateIncome(f: {
  date: string;
  amount: string;
  commissionPct: string;
  tip?: string;
  hours?: string;
  km?: string;
}): FieldErrors {
  return clean({
    date: checkDate(f.date),
    amount: checkNumber(f.amount, { required: true, positive: true }),
    commissionPct: checkNumber(f.commissionPct, { min: 0, max: 100 }),
    tip: checkNumber(f.tip ?? "", { min: 0 }),
    hours: checkNumber(f.hours ?? "", { min: 0, max: 24 }),
    km: checkNumber(f.km ?? "", { min: 0, max: 2000 }),
  });
}

export function validateExpense(f: { date: string; amount: string }): FieldErrors {
  return clean({
    date: checkDate(f.date),
    amount: checkNumber(f.amount, { required: true, positive: true }),
  });
}
