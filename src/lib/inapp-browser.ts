/**
 * An in-app browser that does not share logins with Chrome.
 *
 * In the installed Android app (drivewise-native, Capacitor) a page opens in a WebView
 * window inside the app, through the @capgo/capacitor-inappbrowser plugin. That is the app's
 * own WebView, so cookies are not shared with Chrome: every site starts clean and a login
 * stays inside the app. The plugin is reached through the Capacitor bridge the app injects
 * (window.Capacitor), like the GPS plugin, so there is no npm dependency here.
 *
 * In a plain browser there is no such window (sites like X refuse to be shown inside
 * another page), so the page opens in a new tab.
 *
 * Inside the installed app, a page is never handed to another browser app: an app build
 * without the plugin asks to be updated instead. (Capacitor sends any link to another host
 * to the system browser, which would open Chrome, share its logins, and need a browser
 * installed at all.)
 *
 * Private mode: every window starts and ends clean (cookies are wiped), searches go to
 * DuckDuckGo, and "do not track" is sent. It does not hide the IP address; that needs a VPN.
 */

type Bridge = {
  isNativePlatform?: () => boolean;
  Plugins?: Record<string, unknown>;
  nativePromise?: (plugin: string, method: string, options?: unknown) => Promise<unknown>;
};

/** The plugin's id: the maintained package's, then the older package's (an older app build). */
const PLUGIN_IDS = ["CapgoInAppBrowser", "InAppBrowser"] as const;

function bridge(): Bridge | null {
  if (typeof window === "undefined") return null;
  return ((window as unknown as { Capacitor?: Bridge }).Capacitor ?? null) as Bridge | null;
}

function pluginId(): string | null {
  const b = bridge();
  if (!b?.isNativePlatform?.() || !b.nativePromise) return null;
  return PLUGIN_IDS.find((id) => b.Plugins?.[id]) ?? null;
}

/** True when the installed app has the in-app browser plugin. */
export function hasInAppBrowser(): boolean {
  return pluginId() !== null;
}

/** True inside the installed app (Capacitor native shell), with or without the plugin. */
export function isNativeApp(): boolean {
  return Boolean(bridge()?.isNativePlatform?.());
}

/**
 * How a page would open here: "inapp" in the app's own window; "needs-update" in an installed
 * app that was built without the plugin; "tab" in a plain browser.
 */
export function browserMode(): "inapp" | "needs-update" | "tab" {
  if (hasInAppBrowser()) return "inapp";
  return isNativeApp() ? "needs-update" : "tab";
}

/** Pages offered with one tap. */
export const START_PAGES = [
  { name: "X", url: "https://x.com" },
  { name: "DuckDuckGo", url: "https://duckduckgo.com" },
] as const;

const SEARCH = {
  google: "https://www.google.com/search?q=",
  duckduckgo: "https://duckduckgo.com/?q=",
} as const;

/**
 * What to open for text typed in the address field: a web address as it is (https:// added
 * when missing), anything else as a search (Google, or DuckDuckGo in private mode). Only http
 * and https are ever opened; other schemes (javascript:, file:, intent:) give null.
 */
export function normalizeAddress(
  text: string,
  search: keyof typeof SEARCH = "google",
): string | null {
  const t = text.trim();
  if (!t) return null;
  if (/^[a-z][a-z0-9+.-]*:\/\//i.test(t) || /^(javascript|data|file|intent|mailto|tel):/i.test(t)) {
    try {
      const url = new URL(t);
      return url.protocol === "http:" || url.protocol === "https:" ? url.href : null;
    } catch {
      return null;
    }
  }
  if (!/\s/.test(t) && /^[^\s/]+\.[^\s/.]{2,}(?:[/?#:].*)?$/.test(t)) {
    try {
      return new URL(`https://${t}`).href;
    } catch {
      /* not an address after all: search for it */
    }
  }
  return `${SEARCH[search]}${encodeURIComponent(t)}`;
}

/**
 * The options the plugin's openWebView takes: a toolbar with back, forward and reload. In private
 * mode the first request also says "do not track" and "global privacy control".
 */
export function webViewOptions(url: string, privateMode = false) {
  return {
    url,
    toolbarType: "navigation",
    showReloadButton: true,
    // Pull down to refresh: works even when the toolbar button seems to do nothing.
    enableReloadGesture: true,
    visibleTitle: true,
    // Links that ask for a new window, and links to the X app, stay in this window.
    openBlankTargetInWebView: true,
    preventDeeplink: true,
    ...(privateMode ? { headers: { DNT: "1", "Sec-GPC": "1" } } : {}),
  };
}

// Private mode wipes the cookies when the window closes; the plugin tells us through closeEvent.
let privateSession = false;
let closeWatchedFor: string | null = null;

function wipeWhenClosed(id: string) {
  if (closeWatchedFor === id) return;
  const plugin = bridge()?.Plugins?.[id] as
    { addListener?: (event: string, callback: () => void) => unknown } | undefined;
  try {
    plugin?.addListener?.("closeEvent", () => {
      if (privateSession) void clearBrowserLogins();
    });
    closeWatchedFor = id;
  } catch {
    /* the cookies are still wiped at the next opening */
  }
}

/**
 * Opens a page: in the app's own browser window when the installed app has one; in a new tab
 * on the web; never in another browser app (an installed app without the plugin gives
 * "needs-update"). "failed" for an address that is not http(s) or when the window did not open.
 */
export async function openInBrowser(
  address: string,
  options: { privateMode?: boolean } = {},
): Promise<"inapp" | "tab" | "needs-update" | "failed"> {
  const privateMode = Boolean(options.privateMode);
  const url = normalizeAddress(address, privateMode ? "duckduckgo" : "google");
  if (!url) return "failed";
  const id = pluginId();
  if (id) {
    try {
      privateSession = privateMode;
      if (privateMode) {
        await clearBrowserLogins(); // start clean
        wipeWhenClosed(id); // and end clean
      }
      await bridge()!.nativePromise!(id, "openWebView", webViewOptions(url, privateMode));
      return "inapp";
    } catch {
      return "failed";
    }
  }
  if (isNativeApp()) return "needs-update";
  // noopener makes window.open return null even when it worked, so it can't be checked.
  window.open(url, "_blank", "noopener,noreferrer");
  return "tab";
}

/** Signs out of every site in the app's browser (its cookies). False outside the installed app. */
export async function clearBrowserLogins(): Promise<boolean> {
  const id = pluginId();
  if (!id) return false;
  try {
    await bridge()!.nativePromise!(id, "clearAllCookies", {});
    return true;
  } catch {
    return false;
  }
}

const PRIVATE_KEY = "driver-browser-private-v1";

/** The private-mode switch, remembered on this device only. */
export function readPrivateMode(): boolean {
  try {
    return localStorage.getItem(PRIVATE_KEY) === "1";
  } catch {
    return false;
  }
}

export function writePrivateMode(on: boolean) {
  try {
    localStorage.setItem(PRIVATE_KEY, on ? "1" : "0");
  } catch {
    /* the switch still works until the page is closed */
  }
}
