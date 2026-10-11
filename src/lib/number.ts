/**
 * Parses a number typed by hand. Accepts "7.4" and "7,4" (decimal comma), and a
 * comma before exactly three digits as a thousands separator ("1,200").
 * Returns null for empty or invalid text — never a silent partial value.
 */
export function parseNumber(text: string | number | null | undefined): number | null {
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

/** parseNumber with a fallback for optional fields left empty. */
export function numberOr(text: string | null | undefined, fallback: number): number {
  return parseNumber(text) ?? fallback;
}

/** Characters allowed while typing a number (keeps the raw text otherwise). */
export function sanitizeNumberInput(text: string): string {
  return text.replace(/[^\d.,-]/g, "");
}
