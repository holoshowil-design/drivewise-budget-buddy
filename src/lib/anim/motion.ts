import { readActive } from "@/lib/active-trip";

const reducedMotion = () =>
  window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ?? false;

/**
 * Whether a drawn film may play right now. Never while driving (an active GPS trip or the
 * drive screen), never in the background, and never when the system asks for reduced motion.
 */
export function motionAllowed() {
  if (typeof window === "undefined" || reducedMotion()) return false;
  if (document.visibilityState === "hidden") return false;
  if (document.querySelector(".drive-hud")) return false;
  return !readActive();
}

/**
 * Whether to fetch the films at all: not when the system asks for reduced motion or the
 * phone saves data. Fetching during a trip is fine (nothing moves), so the film is ready
 * for the reward when the trip ends.
 */
export function filmsWanted() {
  if (typeof window === "undefined" || reducedMotion()) return false;
  const connection = (navigator as Navigator & { connection?: { saveData?: boolean } }).connection;
  return !connection?.saveData;
}
