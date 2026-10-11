import { isNativeApp } from "./location";

type Bridge = { nativePromise?: (p: string, m: string, o?: unknown) => Promise<unknown> };

/**
 * Short vibration in the installed app (save, goal reached). In the browser
 * it does nothing, so the web app behaves as before.
 */
export function haptic(kind: "tap" | "success") {
  if (!isNativeApp()) return;
  const cap = (window as unknown as { Capacitor?: Bridge }).Capacitor;
  const call =
    kind === "success"
      ? cap?.nativePromise?.("Haptics", "notification", { type: "SUCCESS" })
      : cap?.nativePromise?.("Haptics", "impact", { style: "MEDIUM" });
  void call?.catch(() => {});
}
