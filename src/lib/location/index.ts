/**
 * One way to watch the device location, wherever the app runs:
 * - in the browser (and for foreground-only use): navigator.geolocation;
 * - in the installed Android app (drivewise-native, Capacitor) with
 *   `background`: the @capgo/background-geolocation plugin, which keeps
 *   tracking with the screen locked behind a persistent notification.
 *
 * The native app loads this site, so the plugin is reached through the
 * Capacitor bridge it injects (window.Capacitor) — no npm dependency here.
 */

export type Fix = {
  lat: number;
  lon: number;
  accuracy: number; // meters
  speedKmh: number | null;
  time: number; // epoch ms
};

export type LocationError = { kind: "denied" | "unavailable"; message: string };

export type WatchOptions = {
  /** Keep tracking in the background (native app only; ignored in the browser). */
  background?: { title: string; message: string };
  /** Browser only: accept a cached fix this old (ms). */
  maximumAge?: number;
  timeout?: number;
};

type Bridge = {
  isNativePlatform?: () => boolean;
  Plugins?: Record<string, unknown>;
  nativeCallback?: (
    plugin: string,
    method: string,
    options: unknown,
    callback: (data?: unknown, error?: { message?: string; code?: string }) => void,
  ) => unknown;
  nativePromise?: (plugin: string, method: string, options?: unknown) => Promise<unknown>;
};

const PLUGIN = "BackgroundGeolocation";

function bridge(): Bridge | null {
  if (typeof window === "undefined") return null;
  return ((window as unknown as { Capacitor?: Bridge }).Capacitor ?? null) as Bridge | null;
}

/** True inside the installed app (Capacitor native shell). */
export function isNativeApp(): boolean {
  return Boolean(bridge()?.isNativePlatform?.());
}

/** True when background tracking is available (native app with the GPS plugin). */
export function hasBackgroundTracking(): boolean {
  const b = bridge();
  return Boolean(
    b?.isNativePlatform?.() && b.Plugins?.[PLUGIN] && b.nativeCallback && b.nativePromise,
  );
}

/** Starts watching. Returns a function that stops it. */
export function watchLocation(
  onFix: (fix: Fix) => void,
  onError: (error: LocationError) => void,
  options: WatchOptions = {},
): () => void {
  if (options.background && hasBackgroundTracking())
    return watchNative(bridge()!, onFix, onError, options.background);
  return watchBrowser(onFix, onError, options);
}

function watchBrowser(
  onFix: (fix: Fix) => void,
  onError: (error: LocationError) => void,
  options: WatchOptions,
): () => void {
  if (typeof navigator === "undefined" || !navigator.geolocation) {
    onError({ kind: "unavailable", message: "no-geolocation" });
    return () => {};
  }
  const id = navigator.geolocation.watchPosition(
    (pos) =>
      onFix({
        lat: pos.coords.latitude,
        lon: pos.coords.longitude,
        accuracy: pos.coords.accuracy ?? 999,
        speedKmh: pos.coords.speed != null ? pos.coords.speed * 3.6 : null,
        time: pos.timestamp,
      }),
    (err) =>
      onError({
        kind: err.code === err.PERMISSION_DENIED ? "denied" : "unavailable",
        message: err.message,
      }),
    {
      enableHighAccuracy: true,
      maximumAge: options.maximumAge ?? 0,
      timeout: options.timeout ?? 20000,
    },
  );
  return () => navigator.geolocation.clearWatch(id);
}

type NativeLocation = {
  latitude: number;
  longitude: number;
  accuracy: number | null;
  speed: number | null; // m/s
  time: number | null;
};

/**
 * The plugin runs one tracking session for the whole app. The newest watch owns it,
 * so an older watch that stops late (the drive detector handing over to the trip)
 * does not stop the session the new one started.
 */
let nativeOwner = 0;

/** Exported for tests. */
export function watchNative(
  b: Bridge,
  onFix: (fix: Fix) => void,
  onError: (error: LocationError) => void,
  notification: { title: string; message: string },
): () => void {
  let stopped = false;
  const me = ++nativeOwner;
  // The plugin runs one tracking session: stop a leftover one (e.g. after a
  // reload) before starting, and only then start.
  const ready = b.nativePromise!(PLUGIN, "stop").catch(() => undefined);
  void ready.then(() => {
    if (stopped) return;
    b.nativeCallback!(
      PLUGIN,
      "start",
      {
        backgroundTitle: notification.title,
        backgroundMessage: notification.message,
        requestPermissions: true,
        stale: false,
        distanceFilter: 5,
      },
      (data, error) => {
        if (stopped) return;
        if (error) {
          onError({
            kind: error.code === "NOT_AUTHORIZED" ? "denied" : "unavailable",
            message: error.message ?? "",
          });
          return;
        }
        const loc = data as NativeLocation | undefined;
        if (!loc || typeof loc.latitude !== "number") return;
        onFix({
          lat: loc.latitude,
          lon: loc.longitude,
          accuracy: loc.accuracy ?? 999,
          speedKmh: loc.speed != null ? loc.speed * 3.6 : null,
          time: loc.time ?? Date.now(),
        });
      },
    );
  });
  return () => {
    if (stopped) return;
    stopped = true;
    void ready.then(() => {
      if (nativeOwner === me) return b.nativePromise!(PLUGIN, "stop").catch(() => undefined);
    });
  };
}
