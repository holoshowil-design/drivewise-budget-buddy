import { motionAllowed } from "@/lib/anim/motion";

/**
 * Depth on the painted stages, like a multiplane camera: tilting the phone slides the sky
 * one way and the cast the other, so the scene gets near and far. Writes `--tilt-x` and
 * `--tilt-y` (-1..1) on <html>; the CSS in styles.css moves each layer by its own amount.
 *
 * The resting angle is whatever the driver holds the phone at: a slow average is the zero
 * point, and only the lean away from it counts. Nothing moves while driving, in the
 * background, or with reduced motion (motionAllowed), and nothing runs with no stage on screen.
 */
const RANGE_DEG = 14; // a lean of this much is the full slide
const EASE = 0.12; // how fast the layers catch up with the phone, per frame
const REST_EASE = 0.004; // how fast the resting angle follows a new way of holding

/** The lean away from the resting angle, as -1..1. */
export function leanOf(angle: number, rest: number, range = RANGE_DEG): number {
  return Math.max(-1, Math.min(1, (angle - rest) / range));
}

export function startStageTilt(): () => void {
  if (typeof window === "undefined" || !("DeviceOrientationEvent" in window)) return () => {};
  const root = document.documentElement;
  let rest: { x: number; y: number } | null = null;
  let target = { x: 0, y: 0 };
  const shown = { x: 0, y: 0 };
  let frame = 0;

  const paint = () => {
    frame = 0;
    shown.x += (target.x - shown.x) * EASE;
    shown.y += (target.y - shown.y) * EASE;
    root.style.setProperty("--tilt-x", shown.x.toFixed(3));
    root.style.setProperty("--tilt-y", shown.y.toFixed(3));
    if (Math.abs(target.x - shown.x) + Math.abs(target.y - shown.y) > 0.004) {
      frame = requestAnimationFrame(paint);
    }
  };

  const onTilt = (e: DeviceOrientationEvent) => {
    if (e.gamma == null || e.beta == null) return;
    if (!document.querySelector(".stage-bg") || !motionAllowed()) {
      target = { x: 0, y: 0 };
      rest = null;
    } else {
      rest ??= { x: e.gamma, y: e.beta };
      rest.x += (e.gamma - rest.x) * REST_EASE;
      rest.y += (e.beta - rest.y) * REST_EASE;
      target = { x: leanOf(e.gamma, rest.x), y: leanOf(e.beta, rest.y) };
    }
    if (!frame) frame = requestAnimationFrame(paint);
  };

  window.addEventListener("deviceorientation", onTilt, { passive: true });
  return () => {
    window.removeEventListener("deviceorientation", onTilt);
    if (frame) cancelAnimationFrame(frame);
    root.style.removeProperty("--tilt-x");
    root.style.removeProperty("--tilt-y");
  };
}
