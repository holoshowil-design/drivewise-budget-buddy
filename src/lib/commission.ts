/** The commission most rides switch to, one tap away from the default. */
export const QUICK_COMMISSION_PCT = 10;

/**
 * Commission percentages offered as one-tap chips: the default from the settings first,
 * then 10% and 0% (a private ride with no app), each once.
 */
export function commissionChoices(defaultPct: number): number[] {
  return [...new Set([defaultPct, QUICK_COMMISSION_PCT, 0])].filter(
    (p) => Number.isFinite(p) && p >= 0 && p <= 100,
  );
}
