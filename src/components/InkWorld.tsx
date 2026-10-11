import { useEffect, useState } from "react";

/** Global ink stage: shared boil filter + hand-drawn city backdrop behind every page. Visual only. */
export function InkWorld() {
  const [still, setStill] = useState(true);
  useEffect(() => setStill(window.matchMedia("(prefers-reduced-motion: reduce)").matches), []);
  return (
    <>
      <svg width="0" height="0" style={{ position: "absolute" }} aria-hidden="true" focusable="false">
        <defs>
          <filter id="ink-boil" x="-5%" y="-5%" width="110%" height="110%">
            <feTurbulence type="fractalNoise" baseFrequency="0.035" numOctaves="2" seed="1">
              {!still && <animate attributeName="seed" values="1;5;9;3" dur="0.42s" repeatCount="indefinite" calcMode="discrete" />}
            </feTurbulence>
            <feDisplacementMap in="SourceGraphic" scale="2.6" />
          </filter>
        </defs>
      </svg>
      <div className="ink-world" aria-hidden="true">
        <svg className="ink-skyline" viewBox="0 0 800 220" preserveAspectRatio="xMidYMax slice">
          <g className="ink-sky-far">
            <path d="M0 220 V150 h40 V110 h30 v40 h20 V90 l20 -20 l20 20 v60 h30 V120 h40 v100 Z" />
            <path d="M220 220 V130 h50 V80 h10 V60 h10 v20 h10 v50 h40 V100 l30 -30 v150 Z" />
            <path d="M420 220 V140 h30 V100 h40 v40 h20 V70 h20 v-20 h6 v20 h20 v150 Z" />
            <path d="M600 220 V120 h40 V90 l30 -20 l30 20 v40 h30 V140 h70 v80 Z" />
          </g>
          <g className="ink-sky-windows">
            <path d="M50 120 h8 M50 132 h8 M100 100 h6 M100 114 h6 M240 140 h8 M290 90 h6 M290 104 h6 M440 150 h8 M470 110 h6 M530 80 h6 M530 96 h6 M620 130 h8 M660 100 h6" />
          </g>
          <path className="ink-road" d="M0 214 Q200 206 400 212 T800 210" />
        </svg>
        <span className="ink-splat ink-splat-1" />
        <span className="ink-splat ink-splat-2" />
        <span className="ink-splat ink-splat-3" />
        <svg className="ink-sun" viewBox="0 0 100 100"><circle cx="50" cy="50" r="22" /><path d="M50 10 v12 M50 78 v12 M10 50 h12 M78 50 h12 M22 22 l8 8 M70 70 l8 8 M78 22 l-8 8 M22 78 l8 -8" /></svg>
      </div>
    </>
  );
}

/** Comic speech bubble with an inked tail. */
export function ComicBubble({ children, side = "start", tone = "default", className = "" }: { children: React.ReactNode; side?: "start" | "end"; tone?: "default" | "warn" | "win"; className?: string }) {
  return <div className={`comic-bubble comic-bubble-${side} comic-bubble-${tone} ${className}`}>{children}</div>;
}
