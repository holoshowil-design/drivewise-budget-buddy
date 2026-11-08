import { useState } from "react";

const played = new Set<string>();

const reducedMotion = () =>
  typeof window !== "undefined" &&
  (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ?? false);

/**
 * Whether a chart may run its draw-in animation: only the first time it shows in this session,
 * and never with reduced motion. Coming back to a tab then shows the chart at once, without a
 * second of per-frame redraws while the new page is still settling.
 */
export function useChartIntro(key: string) {
  const [animate] = useState(() => {
    if (reducedMotion() || played.has(key)) return false;
    played.add(key);
    return true;
  });
  return animate;
}

/** For tests. */
export function resetChartIntros() {
  played.clear();
}
