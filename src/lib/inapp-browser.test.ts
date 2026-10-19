import { afterEach, describe, expect, it, vi } from "vitest";
import {
  clearBrowserLogins,
  hasInAppBrowser,
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
