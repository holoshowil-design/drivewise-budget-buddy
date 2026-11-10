import { useEffect } from "react";
import { startStageTilt } from "@/lib/anim/tilt";
import { skyPhase, sunPosition } from "@/lib/sky";

/** Marks the page with the light outside (`data-sky` on <html>); the painted stages read it in CSS. */
export function SkyClock() {
  useEffect(() => {
    const root = document.documentElement;
    const update = () => {
      const now = new Date();
      root.dataset.sky = skyPhase(now);
      // Where the drawn sun stands in the stage sky (StageSky).
      const sun = sunPosition(now);
      root.style.setProperty("--sun-x", `${sun.x}%`);
      root.style.setProperty("--sun-y", `${sun.y}%`);
    };
    update();
    const timer = window.setInterval(update, 5 * 60 * 1000);
    document.addEventListener("visibilitychange", update);
    return () => {
      window.clearInterval(timer);
      document.removeEventListener("visibilitychange", update);
    };
  }, []);
  // The same sky layer leans with the phone (multiplane depth).
  useEffect(() => startStageTilt(), []);
  return null;
}
