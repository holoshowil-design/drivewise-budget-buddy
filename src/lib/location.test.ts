import { afterEach, describe, expect, it, vi } from "vitest";
import { hasBackgroundTracking, watchLocation, watchNative, type Fix } from "@/lib/location";

type Cb = (data?: unknown, error?: { message?: string; code?: string }) => void;

/** Stand-in for the bridge the Capacitor Android shell injects. */
function fakeBridge() {
  const calls: { method: string; options?: unknown }[] = [];
  let startCb: Cb | undefined;
  const b = {
    isNativePlatform: () => true,
    Plugins: { BackgroundGeolocation: {} },
    nativePromise: vi.fn(async (_p: string, method: string, options?: unknown) => {
      calls.push({ method, options });
    }),
    nativeCallback: vi.fn((_p: string, method: string, options: unknown, cb: Cb) => {
      calls.push({ method, options });
      startCb = cb;
    }),
  };
  return {
    b,
    calls,
    emit: (data?: unknown, error?: { code?: string; message?: string }) => startCb?.(data, error),
  };
}

const flush = () => new Promise((r) => setTimeout(r, 0));

afterEach(() => {
  delete (globalThis as Record<string, unknown>).window;
});

describe("location adapter — installed app", () => {
  it("stops any leftover session, then starts with the trip notification", async () => {
    const { b, calls } = fakeBridge();
    watchNative(
      b,
      () => {},
      () => {},
      { title: "נסיעה פעילה", message: "מודד" },
    );
    await flush();
    expect(calls.map((c) => c.method)).toEqual(["stop", "start"]);
    expect(calls[1].options).toMatchObject({
      backgroundTitle: "נסיעה פעילה",
      requestPermissions: true,
    });
  });

  it("maps plugin locations to fixes (speed m/s → km/h)", async () => {
    const { b, emit } = fakeBridge();
    const fixes: Fix[] = [];
    watchNative(
      b,
      (f) => fixes.push(f),
      () => {},
      { title: "t", message: "m" },
    );
    await flush();
    emit({ latitude: 32.08, longitude: 34.78, accuracy: 6, speed: 10, time: 1000 });
    expect(fixes[0]).toEqual({ lat: 32.08, lon: 34.78, accuracy: 6, speedKmh: 36, time: 1000 });
  });

  it("reports a denied permission", async () => {
    const { b, emit } = fakeBridge();
    const onError = vi.fn();
    watchNative(b, () => {}, onError, { title: "t", message: "m" });
    await flush();
    emit(undefined, { code: "NOT_AUTHORIZED", message: "denied" });
    expect(onError).toHaveBeenCalledWith({ kind: "denied", message: "denied" });
  });

  it("stopping before the start went out never starts tracking", async () => {
    const { b, calls } = fakeBridge();
    const stop = watchNative(
      b,
      () => {},
      () => {},
      { title: "t", message: "m" },
    );
    stop();
    await flush();
    expect(calls.map((c) => c.method)).toEqual(["stop", "stop"]);
  });

  it("uses the plugin only when background tracking is asked for", () => {
    const { b } = fakeBridge();
    Object.assign(globalThis, { window: { Capacitor: b } });
    expect(hasBackgroundTracking()).toBe(true);
    watchLocation(
      () => {},
      () => {},
      { background: { title: "t", message: "m" } },
    );
    expect(b.nativePromise).toHaveBeenCalled();
  });
});

describe("location adapter — browser", () => {
  it("no background tracking without the native shell", () => {
    Object.assign(globalThis, { window: {} });
    expect(hasBackgroundTracking()).toBe(false);
  });
});
