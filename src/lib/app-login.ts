import { isNativeApp } from "./location";

/**
 * Google sign-in for the installed Android app.
 *
 * Google refuses to sign in inside an app's WebView, so the app opens the
 * sign-in in a Chrome tab (Custom Tab). There the normal web sign-in runs and
 * ends on /app-login, which hands the session back to the app through the
 * app's own link (com.holoshow.drivewise://auth). The app then opens
 * /app-login#t=…&r=…&n=… inside itself, and that page signs the app in.
 *
 * The one-time code (n) is made by the app before the tab opens and must come
 * back unchanged, so a link made somewhere else can't sign the app into
 * another account.
 */

/** Set by the app (capacitor.config.ts appendUserAgent) once it can receive the link back. */
const RETURN_UA_TOKEN = "DriverAuthReturn/1";
export const APP_RETURN_SCHEME = "com.holoshow.drivewise";
/** In the app: the code waiting for the Chrome tab to come back. */
const APP_NONCE_KEY = "driver-app-login-nonce";
/** In Chrome: the app's code, kept across the Google redirects of this tab. */
export const TAB_NONCE_KEY = "driver-app-login-tab";

export function appCanReceiveLogin(): boolean {
  return isNativeApp() && navigator.userAgent.includes(RETURN_UA_TOKEN);
}

function makeNonce(): string {
  const bytes = crypto.getRandomValues(new Uint8Array(16));
  return [...bytes].map((b) => b.toString(16).padStart(2, "0")).join("");
}

type Bridge = { nativePromise?: (p: string, m: string, o?: unknown) => Promise<unknown> };

/** In the app: open Google sign-in in a Chrome tab. Returns false if it could not open. */
export async function startAppGoogleLogin(loginHint?: string): Promise<boolean> {
  const nonce = makeNonce();
  try {
    localStorage.setItem(APP_NONCE_KEY, nonce);
  } catch {
    return false;
  }
  const url = new URL("/app-login", window.location.origin);
  url.searchParams.set("n", nonce);
  if (loginHint) url.searchParams.set("h", loginHint);
  const cap = (window as unknown as { Capacitor?: Bridge }).Capacitor;
  try {
    await cap?.nativePromise?.("CapgoInAppBrowser", "open", { url: url.toString() });
    return Boolean(cap?.nativePromise);
  } catch {
    return false;
  }
}

/** In the app: take the one-time code if it matches, so it can't be used twice. */
export function takeAppNonce(n: string | null): boolean {
  try {
    const saved = localStorage.getItem(APP_NONCE_KEY);
    if (!saved || !n || saved !== n) return false;
    localStorage.removeItem(APP_NONCE_KEY);
    return true;
  } catch {
    return false;
  }
}

/** The link that brings the session back into the app. */
export function appReturnLink(accessToken: string, refreshToken: string, nonce: string): string {
  const q = new URLSearchParams({ t: accessToken, r: refreshToken, n: nonce });
  return `${APP_RETURN_SCHEME}://auth?${q.toString()}`;
}

/**
 * In Chrome, after the hand-off: forget the session in this tab without
 * signing out on the server (that would sign the app out too). Otherwise
 * Chrome would later refresh the same session and the server would treat the
 * app's copy as stolen.
 */
export function forgetTabSession() {
  try {
    for (const key of Object.keys(localStorage)) {
      if (key.startsWith("sb-") && key.endsWith("-auth-token")) localStorage.removeItem(key);
    }
  } catch {
    /* storage unavailable */
  }
}
