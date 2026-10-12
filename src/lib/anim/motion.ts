import { readActive } from "@/lib/active-trip";

/** User setting from stage 6: full scenes, short reactions only, or nothing. */
export type AnimationLevel = "full" | "min" | "off";

/**
 * Whether a scene may play right now. Never while driving (an active GPS trip),
 * never in the background, and never when the system asks for reduced motion.
 */
export function motionAllowed(level: AnimationLevel = "full") {
  if (typeof window === "undefined" || level === "off") return false;
  if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) return false;
  if (document.visibilityState === "hidden") return false;
  return !readActive();
}
