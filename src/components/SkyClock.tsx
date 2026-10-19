import { useEffect } from "react";
import { skyPhase } from "@/lib/sky";

/** Marks the page with the light outside (`data-sky` on <html>); the painted stages read it in CSS. */
export function SkyClock() {
  useEffect(() => {
    const root = document.documentElement;
    const update = () => {
      root.dataset.sky = skyPhase(new Date());
    };
    update();
    const timer = window.setInterval(update, 5 * 60 * 1000);
    document.addEventListener("visibilitychange", update);
    return () => {
      window.clearInterval(timer);
      document.removeEventListener("visibilitychange", update);
    };
  }, []);
  return null;
}
