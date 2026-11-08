import { isNativeApp } from "./location";

type Bridge = { nativePromise?: (p: string, m: string, o?: unknown) => Promise<unknown> };

/** "light": a swipe or nav touch. "tap": a button that does something. */
export type HapticKind = "light" | "tap" | "success" | "warning";

const OFF_KEY = "driver-haptics-off";

/** Vibration is on unless the driver switched it off in settings. */
export function hapticsEnabled(): boolean {
  try {
    return localStorage.getItem(OFF_KEY) !== "1";
  } catch {
    return true;
  }
}

export function setHapticsEnabled(on: boolean) {
  try {
    if (on) localStorage.removeItem(OFF_KEY);
    else localStorage.setItem(OFF_KEY, "1");
  } catch {
    /* private mode: stays on for this visit */
  }
}

/** Short pulses for phones without the native plugin (Android Chrome). */
const WEB_PATTERN: Record<HapticKind, number | number[]> = {
  light: 8,
  tap: 15,
  success: [15, 60, 25],
  warning: [30, 50, 30],
};

/**
 * Short vibration for the feel of a touch. The installed app uses the native
 * Haptics plugin (already in the APK); a phone browser falls back to
 * navigator.vibrate, and anything else does nothing.
 */
export function haptic(kind: HapticKind) {
  if (typeof window === "undefined" || !hapticsEnabled()) return;
  if (isNativeApp()) {
    const cap = (window as unknown as { Capacitor?: Bridge }).Capacitor;
    const call =
      kind === "success"
        ? cap?.nativePromise?.("Haptics", "notification", { type: "SUCCESS" })
        : kind === "warning"
          ? cap?.nativePromise?.("Haptics", "notification", { type: "WARNING" })
          : cap?.nativePromise?.("Haptics", "impact", {
              style: kind === "light" ? "LIGHT" : "MEDIUM",
            });
    void call?.catch(() => {});
    return;
  }
  try {
    navigator.vibrate?.(WEB_PATTERN[kind]);
  } catch {
    /* not supported */
  }
}
