import { useSyncExternalStore } from "react";

/**
 * Offline support: registers public/sw.js, which keeps the app's own files so the app opens
 * and works with no signal. The data is already in the phone; sync pushes when back online.
 *
 * Not registered in development or inside Lovable's editor preview, where a saved copy would
 * hide fresh edits. `localStorage["driver-sw-test"] = "1"` turns it on locally for testing.
 */
export function registerOfflineWorker() {
  if (typeof window === "undefined" || !("serviceWorker" in navigator)) return;
  if (!shouldRegister()) return;
  const start = () => {
    navigator.serviceWorker
      .register("/sw.js", { scope: "/" })
      .then(() => navigator.serviceWorker.ready)
      .then((reg) => {
        // Keep what this visit already loaded (scripts, styles, pictures, fonts).
        const urls = performance
          .getEntriesByType("resource")
          .map((e) => e.name)
          .filter((u) => /\/assets\/|fonts\.g|\/anim\/|\/characters\/|\/backdrops\//.test(u));
        reg.active?.postMessage({ type: "keep", urls });
      })
      .catch(() => {
        // No offline copy this time; the app works as before.
      });
  };
  // After the first screen settles, so it never competes with it.
  if (document.readyState === "complete") setTimeout(start, 3000);
  else window.addEventListener("load", () => setTimeout(start, 3000), { once: true });
}

function shouldRegister(): boolean {
  try {
    if (localStorage.getItem("driver-sw-test") === "1") return true;
  } catch {
    // Storage blocked: decide by the address alone.
  }
  if (import.meta.env.DEV) return false;
  if (window.self !== window.top) return false; // Lovable's editor preview frame
  const host = window.location.hostname;
  if (host === "localhost" || host === "127.0.0.1") return false;
  return !/lovableproject\.com$|^id-preview--/.test(host);
}

function subscribe(cb: () => void) {
  window.addEventListener("online", cb);
  window.addEventListener("offline", cb);
  return () => {
    window.removeEventListener("online", cb);
    window.removeEventListener("offline", cb);
  };
}

/** Live "is there signal" for the UI. */
export function useOnline(): boolean {
  return useSyncExternalStore(
    subscribe,
    () => navigator.onLine,
    () => true,
  );
}
