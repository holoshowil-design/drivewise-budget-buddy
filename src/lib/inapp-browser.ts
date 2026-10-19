/**
 * An in-app browser that does not share logins with Chrome.
 *
 * In the installed Android app (drivewise-native, Capacitor) a page opens in a WebView
 * window inside the app, through the @capgo/inappbrowser plugin. That is the app's own
 * WebView, so cookies are not shared with Chrome: every site starts clean and a login stays
 * inside the app. The plugin is reached through the Capacitor bridge the app injects
 * (window.Capacitor), like the GPS plugin, so there is no npm dependency here.
 *
 * In a plain browser there is no such window (sites like X refuse to be shown inside
 * another page), so the page opens in a new tab.
 */

type Bridge = {
  isNativePlatform?: () => boolean;
  Plugins?: Record<string, unknown>;
  nativePromise?: (plugin: string, method: string, options?: unknown) => Promise<unknown>;
};

const PLUGIN = "InAppBrowser";

function bridge(): Bridge | null {
  if (typeof window === "undefined") return null;
  return ((window as unknown as { Capacitor?: Bridge }).Capacitor ?? null) as Bridge | null;
}

/** True when the installed app has the in-app browser plugin. */
export function hasInAppBrowser(): boolean {
  const b = bridge();
  return Boolean(b?.isNativePlatform?.() && b.Plugins?.[PLUGIN] && b.nativePromise);
}

/** Pages offered with one tap. */
export const START_PAGES = [{ name: "X", url: "https://x.com" }] as const;

const SEARCH = "https://www.google.com/search?q=";

/**
 * What to open for text typed in the address field: a web address as it is (https:// added
 * when missing), anything else as a search. Only http and https are ever opened; other
 * schemes (javascript:, file:, intent:) give null.
 */
export function normalizeAddress(text: string): string | null {
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
  return `${SEARCH}${encodeURIComponent(t)}`;
}

/** The options the plugin's openWebView takes: a toolbar with back, forward and reload. */
export function webViewOptions(url: string) {
  return {
    url,
    toolbarType: "navigation",
    showReloadButton: true,
    visibleTitle: true,
    // Links that ask for a new window, and links to the X app, stay in this window.
    openBlankTargetInWebView: true,
    preventDeeplink: true,
  };
}

/**
 * Opens a page: in the app's own browser window when the installed app has one, else in a
 * new tab. Resolves "failed" for an address that is not http(s) or when the window did not open.
 */
export async function openInBrowser(address: string): Promise<"inapp" | "tab" | "failed"> {
  const url = normalizeAddress(address);
  if (!url) return "failed";
  if (hasInAppBrowser()) {
    try {
      await bridge()!.nativePromise!(PLUGIN, "openWebView", webViewOptions(url));
      return "inapp";
    } catch {
      return "failed";
    }
  }
  // noopener makes window.open return null even when it worked, so it can't be checked.
  window.open(url, "_blank", "noopener,noreferrer");
  return "tab";
}

/** Signs out of every site in the app's browser (its cookies). False outside the installed app. */
export async function clearBrowserLogins(): Promise<boolean> {
  if (!hasInAppBrowser()) return false;
  try {
    await bridge()!.nativePromise!(PLUGIN, "clearAllCookies", {});
    return true;
  } catch {
    return false;
  }
}
