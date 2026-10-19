import { afterEach, describe, expect, it, vi } from "vitest";
import {
  START_PAGES,
  browserMode,
  clearBrowserLogins,
  hasInAppBrowser,
  isNativeApp,
  normalizeAddress,
  openInBrowser,
  webViewOptions,
} from "@/lib/inapp-browser";

function installBridge(over: Record<string, unknown> = {}) {
  const calls: { plugin: string; method: string; options?: unknown }[] = [];
  const capacitor = {
    isNativePlatform: () => true,
    Plugins: { InAppBrowser: {} },
    nativePromise: vi.fn(async (plugin: string, method: string, options?: unknown) => {
      calls.push({ plugin, method, options });
    }),
    ...over,
  };
  const open = vi.fn();
  vi.stubGlobal("window", { Capacitor: capacitor, open });
  return { calls, capacitor, open };
}

// The tests run without a DOM, so `window` exists only where a test stubs it.
afterEach(() => vi.unstubAllGlobals());

describe("normalizeAddress", () => {
  it("keeps a web address and adds https:// when it is missing", () => {
    expect(normalizeAddress("https://x.com/home")).toBe("https://x.com/home");
    expect(normalizeAddress("http://example.com")).toBe("http://example.com/");
    expect(normalizeAddress("x.com")).toBe("https://x.com/");
    expect(normalizeAddress("  ynet.co.il/news?a=1 ")).toBe("https://ynet.co.il/news?a=1");
  });

  it("searches for anything that is not an address", () => {
    expect(normalizeAddress("מזג אוויר")).toBe(
      `https://www.google.com/search?q=${encodeURIComponent("מזג אוויר")}`,
    );
    expect(normalizeAddress("ynet חדשות")).toContain("google.com/search?q=");
    expect(normalizeAddress("חדשות")).toContain("google.com/search?q=");
  });

  it("never opens a scheme other than http and https", () => {
    for (const bad of [
      "javascript:alert(1)",
      "JAVASCRIPT:alert(1)",
      "file:///etc/passwd",
      "intent://scan/#Intent;scheme=zxing;end",
      "mailto:a@b.co",
      "data:text/html,<b>x</b>",
      "ftp://example.com",
    ])
      expect(normalizeAddress(bad)).toBeNull();
  });

  it("gives null for nothing", () => {
    expect(normalizeAddress("")).toBeNull();
    expect(normalizeAddress("   ")).toBeNull();
  });
});

describe("the in-app browser in the installed app", () => {
  it("is available only with the native bridge and the plugin", () => {
    expect(hasInAppBrowser()).toBe(false);
    installBridge();
    expect(hasInAppBrowser()).toBe(true);
  });

  it("is not available when the app has no such plugin", () => {
    installBridge({ Plugins: {} });
    expect(hasInAppBrowser()).toBe(false);
  });

  it("opens the page in the app's own window, with a navigation toolbar", async () => {
    const { calls } = installBridge();
    expect(await openInBrowser("x.com")).toBe("inapp");
    expect(calls).toEqual([
      { plugin: "InAppBrowser", method: "openWebView", options: webViewOptions("https://x.com/") },
    ]);
    expect(webViewOptions("https://x.com/")).toMatchObject({
      toolbarType: "navigation",
      showReloadButton: true,
      openBlankTargetInWebView: true,
      preventDeeplink: true,
    });
  });

  it("reports a failure instead of opening a tab when the plugin throws", async () => {
    const { open } = installBridge({
      nativePromise: vi.fn(async () => {
        throw new Error("boom");
      }),
    });
    expect(await openInBrowser("x.com")).toBe("failed");
    expect(open).not.toHaveBeenCalled();
  });

  it("clears the logins through the plugin", async () => {
    const { calls } = installBridge();
    expect(await clearBrowserLogins()).toBe(true);
    expect(calls).toEqual([{ plugin: "InAppBrowser", method: "clearAllCookies", options: {} }]);
  });
});

describe("an installed app built without the plugin", () => {
  it("is told apart from the web and from an app with the plugin", () => {
    expect(browserMode()).toBe("tab");
    installBridge();
    expect(browserMode()).toBe("inapp");
    installBridge({ Plugins: {} });
    expect(isNativeApp()).toBe(true);
    expect(browserMode()).toBe("needs-update");
  });

  it("never hands the page to another browser app", async () => {
    const { open, calls } = installBridge({ Plugins: {} });
    expect(await openInBrowser("https://x.com")).toBe("needs-update");
    expect(open).not.toHaveBeenCalled();
    expect(calls).toEqual([]);
  });
});

describe("the browser without the installed app", () => {
  it("opens a new tab, with no access to this page", async () => {
    const open = vi.fn();
    vi.stubGlobal("window", { open });
    expect(await openInBrowser("https://x.com")).toBe("tab");
    expect(open).toHaveBeenCalledWith("https://x.com/", "_blank", "noopener,noreferrer");
  });

  it("opens nothing for an address that is not http(s)", async () => {
    const open = vi.fn();
    vi.stubGlobal("window", { open });
    expect(await openInBrowser("javascript:alert(1)")).toBe("failed");
    expect(open).not.toHaveBeenCalled();
  });

  it("has no logins to clear", async () => {
    expect(await clearBrowserLogins()).toBe(false);
  });
});

describe("the plugin's two ids", () => {
  it("is found under the maintained package's id and the older one", async () => {
    installBridge({ Plugins: { CapgoInAppBrowser: {} } });
    expect(hasInAppBrowser()).toBe(true);
    const { calls } = installBridge({ Plugins: { CapgoInAppBrowser: {} } });
    await openInBrowser("x.com");
    expect(calls[0]).toMatchObject({ plugin: "CapgoInAppBrowser", method: "openWebView" });
    const old = installBridge({ Plugins: { InAppBrowser: {} } });
    await openInBrowser("x.com");
    expect(old.calls[0]).toMatchObject({ plugin: "InAppBrowser", method: "openWebView" });
  });
});

describe("pages and search", () => {
  it("offers X and DuckDuckGo with one tap", () => {
    expect(START_PAGES.map((p) => p.url)).toEqual(["https://x.com", "https://duckduckgo.com"]);
  });

  it("searches Google, or DuckDuckGo when asked", () => {
    expect(normalizeAddress("מזג אוויר")).toContain("https://www.google.com/search?q=");
    expect(normalizeAddress("מזג אוויר", "duckduckgo")).toContain("https://duckduckgo.com/?q=");
    // a web address is never turned into a search
    expect(normalizeAddress("ynet.co.il", "duckduckgo")).toBe("https://ynet.co.il/");
  });
});

describe("private mode", () => {
  /** A bridge whose plugin records its close listeners. */
  function privateBridge() {
    const listeners: Record<string, () => void> = {};
    const bridge = installBridge({
      Plugins: {
        CapgoInAppBrowser: {
          addListener: vi.fn((event: string, cb: () => void) => {
            listeners[event] = cb;
          }),
        },
      },
    });
    return { ...bridge, listeners };
  }

  it("starts clean, searches DuckDuckGo and says do-not-track", async () => {
    vi.resetModules();
    const { openInBrowser: open } = await import("@/lib/inapp-browser");
    const { calls } = privateBridge();
    expect(await open("מזג אוויר", { privateMode: true })).toBe("inapp");
    expect(calls.map((c) => c.method)).toEqual(["clearAllCookies", "openWebView"]);
    expect(calls[1].options).toMatchObject({
      url: expect.stringContaining("https://duckduckgo.com/?q="),
      headers: { DNT: "1", "Sec-GPC": "1" },
    });
  });

  it("wipes the cookies again when the window closes, and watches for that once", async () => {
    vi.resetModules();
    const { openInBrowser: open } = await import("@/lib/inapp-browser");
    const { calls, listeners, capacitor } = privateBridge();
    await open("x.com", { privateMode: true });
    await open("x.com", { privateMode: true });
    const plugin = capacitor.Plugins.CapgoInAppBrowser as { addListener: ReturnType<typeof vi.fn> };
    expect(plugin.addListener).toHaveBeenCalledTimes(1);
    calls.length = 0;
    listeners.closeEvent();
    await Promise.resolve();
    expect(calls.map((c) => c.method)).toEqual(["clearAllCookies"]);
  });

  it("leaves the logins alone in a normal window, before and after", async () => {
    vi.resetModules();
    const { openInBrowser: open } = await import("@/lib/inapp-browser");
    const { calls, listeners } = privateBridge();
    await open("https://x.com");
    expect(calls.map((c) => c.method)).toEqual(["openWebView"]);
    expect(calls[0].options).not.toHaveProperty("headers");
    expect(listeners.closeEvent).toBeUndefined();
  });

  it("does not wipe on a close that follows a normal window", async () => {
    vi.resetModules();
    const { openInBrowser: open } = await import("@/lib/inapp-browser");
    const { calls, listeners } = privateBridge();
    await open("x.com", { privateMode: true });
    await open("x.com"); // the next window is a normal one
    calls.length = 0;
    listeners.closeEvent();
    await Promise.resolve();
    expect(calls).toEqual([]);
  });
});
