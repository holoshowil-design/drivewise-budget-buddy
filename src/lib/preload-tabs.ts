import type { AnyRouter } from "@tanstack/react-router";

const saveData = () =>
  (navigator as Navigator & { connection?: { saveData?: boolean } }).connection?.saveData === true;

/**
 * Once the first screen is up and the phone is idle, fetch the code of the other tabs (and the
 * reports donut), one after another, so the first tap on a tab does not wait for the network.
 * Skipped when the phone saves data: then each tab still loads on its first tap, as before.
 */
export function preloadTabs(router: AnyRouter, paths: string[]) {
  if (typeof window === "undefined" || saveData()) return () => {};
  // Older Android WebViews may lack requestIdleCallback.
  const hasIdle = "requestIdleCallback" in window;
  let cancelled = false;
  let handle = 0;
  const idle = (cb: () => void) => {
    handle = hasIdle
      ? window.requestIdleCallback(cb, { timeout: 4000 })
      : window.setTimeout(cb, 1200);
  };
  const queue: (() => Promise<unknown>)[] = [
    ...paths.map((to) => () => router.preloadRoute({ to } as never)),
    () => import("@/components/ExpensePie"),
  ];
  const next = () => {
    const job = queue.shift();
    if (cancelled || !job) return;
    job()
      .catch(() => undefined)
      .finally(() => idle(next));
  };
  // Let the first screen finish its own loading before starting.
  const start = window.setTimeout(() => idle(next), 2500);
  return () => {
    cancelled = true;
    window.clearTimeout(start);
    if (hasIdle) window.cancelIdleCallback(handle);
    else window.clearTimeout(handle);
  };
}
