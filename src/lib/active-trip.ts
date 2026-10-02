/** Shared state for the currently running GPS trip (kept in localStorage). */
export const ACTIVE_KEY = "driver-active-trip";
export const ACTIVE_EVENT = "driver-active-trip-changed";

export type ActiveTrip = {
  startedAt: number; // epoch ms
  date: string;
  time: string;
  km: number;
  waitSeconds?: number;
  lastMoveAt?: number; // epoch ms of last real movement
  waitSnoozeUntil?: number; // don't ask about waiting before this time
  last?: { lat: number; lon: number; t: number };
};

export function readActive(): ActiveTrip | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(ACTIVE_KEY);
    return raw ? (JSON.parse(raw) as ActiveTrip) : null;
  } catch {
    return null;
  }
}

export function writeActive(t: ActiveTrip | null) {
  if (typeof window === "undefined") return;
  if (t) localStorage.setItem(ACTIVE_KEY, JSON.stringify(t));
  else localStorage.removeItem(ACTIVE_KEY);
  window.dispatchEvent(new Event(ACTIVE_EVENT));
}

/** Great-circle distance between two coordinates, in kilometers. */
export function haversine(a: { lat: number; lon: number }, b: { lat: number; lon: number }) {
  const R = 6371;
  const dLat = ((b.lat - a.lat) * Math.PI) / 180;
  const dLon = ((b.lon - a.lon) * Math.PI) / 180;
  const la1 = (a.lat * Math.PI) / 180;
  const la2 = (b.lat * Math.PI) / 180;
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(la1) * Math.cos(la2) * Math.sin(dLon / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}

/** Shows a system notification when the app tab is hidden (best effort). */
export function notifyIfHidden(title: string, body: string) {
  if (typeof document === "undefined" || typeof Notification === "undefined") return;
  if (document.visibilityState === "visible") return;
  if (Notification.permission !== "granted") return;
  try {
    new Notification(title, { body, icon: "/icon-192.png", tag: "driver-trip" });
  } catch {
    /* some mobile browsers only allow notifications through a service worker */
  }
}

export function requestNotifyPermission() {
  if (typeof Notification === "undefined") return;
  if (Notification.permission === "default") Notification.requestPermission().catch(() => {});
}
